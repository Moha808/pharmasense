import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { BatchStockInModal } from './BatchStockInModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockMovementLog } from './StockMovementLog';
import { 
  Plus, 
  Layers, 
  SlidersHorizontal, 
  Clock, 
  History, 
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntilExpiry } from '../../utils/formatters';
import { isBatchExpired } from '../../utils/fefo';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

export function BatchListPage() {
  const { isAdmin } = useAuth();

  const { data: batches = [], loading: batchesLoading } = useFirestoreQuery('batches');
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: suppliers = [] } = useFirestoreQuery('suppliers');

  const [activeTab, setActiveTab] = useState('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState(null);

  // Compute expired batches count
  const expiredBatchesList = batches.filter(b => isBatchExpired(b.expiryDate) && Number(b.quantityRemaining) > 0);
  const totalExpiredUnits = expiredBatchesList.reduce((sum, b) => sum + (Number(b.quantityRemaining) || 0), 0);

  // Filter batches and sort by expiry date ASC (FEFO)
  const filteredBatches = batches
    .filter(b => {
      const med = medicines.find(m => m.id === b.medicineId);
      const matchesSearch = 
        b.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med?.genericName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMed = !selectedMedicine || b.medicineId === selectedMedicine;
      
      const isExpired = isBatchExpired(b.expiryDate) && Number(b.quantityRemaining) > 0;
      const isDepleted = Number(b.quantityRemaining) === 0 || b.status === 'depleted';
      const isValidActive = !isExpired && !isDepleted;

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = isValidActive;
      else if (statusFilter === 'expired') matchesStatus = isExpired;
      else if (statusFilter === 'depleted') matchesStatus = isDepleted;

      return matchesSearch && matchesMed && matchesStatus;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const handleOpenAdjustment = (batch) => {
    setSelectedBatchForAdjustment(batch);
    setAdjustModalOpen(true);
  };

  const columns = [
    {
      header: 'Batch / Lot #',
      render: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-primary block">{b.batchNumber}</span>
            <span className="text-[11px] text-txt-muted">Received: {formatDate(b.dateReceived)}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Medicine Product',
      render: (b) => {
        const med = medicines.find(m => m.id === b.medicineId);
        return (
          <div>
            <span className="font-bold text-txt block">{med?.name || 'Unknown'}</span>
            <span className="text-[11px] text-txt-muted">{med?.genericName}</span>
          </div>
        );
      }
    },
    {
      header: 'Supplier',
      render: (b) => {
        const sup = suppliers.find(s => s.id === b.supplierId);
        return <span className="text-xs text-txt">{sup?.name || 'N/A'}</span>;
      }
    },
    {
      header: 'Stock Levels',
      render: (b) => {
        const percent = Math.round((b.quantityRemaining / (b.quantityReceived || 1)) * 100);
        return (
          <div className="w-36">
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span className="text-txt">{b.quantityRemaining} left</span>
              <span className="text-txt-muted">of {b.quantityReceived}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
              <div 
                className={`h-full rounded-full ${percent < 20 ? 'bg-danger' : percent < 50 ? 'bg-warning' : 'bg-primary'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: 'Pricing (Cost / Sell)',
      align: 'right',
      render: (b) => (
        <div className="text-right">
          <span className="font-bold text-txt block">{formatCurrency(b.sellingPrice)}</span>
          <span className="text-[10px] text-txt-muted">Cost: {formatCurrency(b.costPrice)}</span>
        </div>
      )
    },
    {
      header: 'Expiry Date (FEFO)',
      render: (b) => {
        const expired = isBatchExpired(b.expiryDate);
        const days = getDaysUntilExpiry(b.expiryDate);
        return (
          <div>
            <span className={`font-semibold block ${expired ? 'text-danger' : 'text-txt'}`}>
              {formatDate(b.expiryDate)}
            </span>
            {expired ? (
              <span className="text-[10px] text-danger font-black flex items-center gap-1">
                <AlertOctagon className="w-3 h-3" />
                EXPIRED {days < 0 ? `(${Math.abs(days)}d ago)` : ''}
              </span>
            ) : days <= 60 ? (
              <span className="text-[10px] text-danger font-bold">Expires in {days}d</span>
            ) : (
              <span className="text-[10px] text-success font-medium">Valid ({days}d)</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Safety Status',
      align: 'center',
      render: (b) => {
        const expired = isBatchExpired(b.expiryDate) && Number(b.quantityRemaining) > 0;
        const depleted = Number(b.quantityRemaining) === 0 || b.status === 'depleted';

        if (expired) {
          return (
            <div className="flex flex-col items-center gap-0.5">
              <Badge variant="danger" size="sm" dot>
                EXPIRED
              </Badge>
              <span className="text-[9px] text-danger/80 font-medium">Sales Blocked</span>
            </div>
          );
        }

        if (depleted) {
          return <Badge variant="neutral" size="sm">Depleted</Badge>;
        }

        return <Badge variant="success" size="sm" dot>Active (Valid)</Badge>;
      }
    },
    ...(isAdmin ? [{
      header: 'Action',
      align: 'center',
      render: (b) => (
        <Button
          variant="secondary"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => handleOpenAdjustment(b)}
          title="Adjust inventory quantity or record disposal"
        >
          Adjust
        </Button>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batches & Stock Control"
        subtitle="FEFO-prioritized batch records and real-time inventory adjustments"
        actions={
          isAdmin && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => setStockInModalOpen(true)}
            >
              Stock In Batch
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          { id: 'inventory', label: 'Active Batches Inventory', icon: Layers },
          { id: 'movements', label: 'Stock Movement Audit History', icon: History }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'inventory' ? (
        <div className="space-y-4">
          {/* Quarantine Warning Banner for Expired Stock */}
          {expiredBatchesList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border border-danger/40 bg-danger/5 rounded-xl text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-danger/10 text-danger flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-danger text-sm">
                    Quarantine Notice: {expiredBatchesList.length} Expired Batch{expiredBatchesList.length > 1 ? 'es' : ''} ({totalExpiredUnits} Units Total)
                  </h4>
                  <p className="text-txt-muted mt-0.5">
                    These batches have passed their expiry date and are automatically blocked from being sold at POS. They remain recorded for audit compliance and disposal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStatusFilter(statusFilter === 'expired' ? '' : 'expired')}
                className="px-3 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger font-bold text-xs whitespace-nowrap transition-colors border border-danger/30"
              >
                {statusFilter === 'expired' ? 'Show All Batches' : 'Filter Expired Only'}
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-bdr shadow-card"
               style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search batch # or medicine name..."
            />
            <Select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
            >
              <option value="">All Medicines</option>
              {medicines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Batch Statuses</option>
              <option value="active">Active Batches</option>
              <option value="depleted">Depleted Batches</option>
              <option value="expired">Expired Batches</option>
            </Select>
          </div>

          <Table
            columns={columns}
            data={filteredBatches}
            loading={batchesLoading}
            emptyTitle="No batches found"
            emptyDescription="Stock in batches with expiry dates to activate FEFO automated dispensing."
            emptyIcon={Layers}
            emptyActionLabel={isAdmin ? "Stock In First Batch" : undefined}
            onEmptyAction={() => setStockInModalOpen(true)}
          />
        </div>
      ) : (
        <StockMovementLog />
      )}

      <BatchStockInModal
        isOpen={stockInModalOpen}
        onClose={() => setStockInModalOpen(false)}
      />

      <StockAdjustmentModal
        isOpen={adjustModalOpen}
        onClose={() => {
          setAdjustModalOpen(false);
          setSelectedBatchForAdjustment(null);
        }}
        batch={selectedBatchForAdjustment}
        medicine={medicines.find(m => m.id === selectedBatchForAdjustment?.medicineId)}
      />
    </div>
  );
}
