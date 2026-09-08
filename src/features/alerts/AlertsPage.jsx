import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { 
  BellRing, 
  AlertTriangle, 
  Clock, 
  Pill, 
  Plus
} from 'lucide-react';
import { formatDate, formatCurrency, getDaysUntilExpiry } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

export function AlertsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: medicines = [], loading: medsLoading } = useFirestoreQuery('medicines');
  const { data: batches = [], loading: batchesLoading } = useFirestoreQuery('batches');
  const { data: suppliers = [] } = useFirestoreQuery('suppliers');

  const [activeTab, setActiveTab] = useState('expiry');
  const [expiryWindowDays, setExpiryWindowDays] = useState(60);

  // 1. Compute Expiring Batches (< expiryWindowDays)
  const expiringBatches = batches
    .filter(b => {
      if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
      const days = getDaysUntilExpiry(b.expiryDate);
      return days <= expiryWindowDays;
    })
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  // 2. Compute Low Stock Medicines
  const lowStockMedicines = medicines
    .map(med => {
      const medBatches = batches.filter(b => b.medicineId === med.id && b.status === 'active');
      const totalStock = medBatches.reduce((acc, b) => acc + b.quantityRemaining, 0);
      const threshold = med.reorderThreshold || 15;
      return {
        ...med,
        currentStock: totalStock,
        threshold,
        shortfall: Math.max(0, threshold - totalStock),
        isLow: totalStock <= threshold,
        isOut: totalStock === 0
      };
    })
    .filter(med => med.isLow)
    .sort((a, b) => a.currentStock - b.currentStock);

  const expiryColumns = [
    {
      header: 'Medicine & Generic',
      render: (b) => {
        const med = medicines.find(m => m.id === b.medicineId);
        return (
          <div>
            <span className="font-bold text-txt block">{med?.name || 'Medicine'}</span>
            <span className="text-[11px] text-txt-muted">{med?.genericName}</span>
          </div>
        );
      }
    },
    {
      header: 'Batch Lot #',
      render: (b) => <span className="font-mono font-bold text-primary">{b.batchNumber}</span>
    },
    {
      header: 'Remaining Units',
      render: (b) => <strong className="text-txt">{b.quantityRemaining} units</strong>
    },
    {
      header: 'Expiry Date',
      render: (b) => {
        const days = getDaysUntilExpiry(b.expiryDate);
        return (
          <div>
            <span className="font-semibold block text-txt">{formatDate(b.expiryDate)}</span>
            <span className={`text-[10px] font-bold ${days <= 0 ? 'text-danger' : days <= 30 ? 'text-danger' : 'text-warning'}`}>
              {days <= 0 ? '⚠️ EXPIRED' : `⏳ ${days} days remaining`}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Supplier',
      render: (b) => {
        const sup = suppliers.find(s => s.id === b.supplierId);
        return <span className="text-xs text-txt-muted">{sup?.name || 'N/A'}</span>;
      }
    },
    {
      header: 'Urgency',
      align: 'center',
      render: (b) => {
        const days = getDaysUntilExpiry(b.expiryDate);
        return (
          <Badge variant={days <= 30 ? 'danger' : 'warning'} size="sm">
            {days <= 30 ? 'Critical' : 'Attention'}
          </Badge>
        );
      }
    }
  ];

  const lowStockColumns = [
    {
      header: 'Medicine Product',
      render: (med) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center font-bold">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-txt block">{med.name}</span>
            <span className="text-[11px] text-txt-muted">{med.genericName} • {med.dosageForm}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Current Available Stock',
      render: (med) => (
        <div>
          <span className={`font-black text-sm block ${med.isOut ? 'text-danger' : 'text-warning'}`}>
            {med.currentStock} units
          </span>
          <span className="text-[10px] text-txt-muted">
            {med.isOut ? '❌ Depleted' : '⚠️ Below Threshold'}
          </span>
        </div>
      )
    },
    {
      header: 'Configured Threshold',
      render: (med) => <span className="text-txt-muted">{med.threshold} units</span>
    },
    {
      header: 'Recommended Reorder',
      render: (med) => (
        <span className="font-bold text-primary">
          +{med.shortfall + 30} units
        </span>
      )
    },
    ...(isAdmin ? [{
      header: 'Action',
      align: 'right',
      render: (med) => (
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => navigate('/app/batches')}
        >
          Stock In
        </Button>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock & Expiry Surveillance"
        subtitle="Real-time early warning system for low stock and near-expiry medication batches"
      />

      <Tabs
        tabs={[
          { 
            id: 'expiry', 
            label: 'Near-Expiry Batches', 
            icon: Clock, 
            badge: expiringBatches.length > 0 ? expiringBatches.length : undefined 
          },
          { 
            id: 'low-stock', 
            label: 'Low Stock Deficits', 
            icon: AlertTriangle, 
            badge: lowStockMedicines.length > 0 ? lowStockMedicines.length : undefined 
          }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'expiry' ? (
        <div className="space-y-4">
          {/* Expiry Window Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-bdr shadow-card"
               style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <span className="text-xs font-bold text-txt">Configurable Expiry Horizon:</span>
            <div className="flex gap-2">
              {[30, 60, 90, 180].map(days => (
                <button
                  key={days}
                  onClick={() => setExpiryWindowDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${expiryWindowDays === days ? 'bg-primary text-white shadow-xs' : 'border border-bdr text-txt-muted hover:bg-bg-alt'}`}
                  style={expiryWindowDays !== days ? { backgroundColor: 'var(--color-bg-alt)' } : {}}
                >
                  &lt; {days} Days ({batches.filter(b => b.status === 'active' && getDaysUntilExpiry(b.expiryDate) <= days).length})
                </button>
              ))}
            </div>
          </div>

          <Table
            columns={expiryColumns}
            data={expiringBatches}
            loading={batchesLoading}
            emptyTitle="No batches expiring within this horizon"
            emptyDescription={`There are currently no active batches expiring in less than ${expiryWindowDays} days.`}
            emptyIcon={Clock}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Table
            columns={lowStockColumns}
            data={lowStockMedicines}
            loading={medsLoading}
            emptyTitle="All inventory stock levels are healthy"
            emptyDescription="No medicines are currently below their configured reorder thresholds."
            emptyIcon={AlertTriangle}
          />
        </div>
      )}
    </div>
  );
}
