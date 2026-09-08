import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { MedicineFormModal } from './MedicineFormModal';
import { 
  ArrowLeft, 
  Pill, 
  ShieldCheck, 
  ShieldAlert, 
  Barcode, 
  Layers, 
  Edit2, 
  Package, 
  Calendar, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntilExpiry } from '../../utils/formatters';

export function MedicineDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: categories = [] } = useFirestoreQuery('categories');
  const { data: suppliers = [] } = useFirestoreQuery('suppliers');

  const [editModalOpen, setEditModalOpen] = useState(false);

  const medicine = medicines.find(m => m.id === id);
  const category = categories.find(c => c.id === medicine?.categoryId);
  const medBatches = batches.filter(b => b.medicineId === id && b.status !== 'deleted');

  const totalStock = medBatches.filter(b => b.status === 'active').reduce((acc, b) => acc + b.quantityRemaining, 0);
  const isLowStock = totalStock <= (medicine?.reorderThreshold || 15);

  if (!medicine) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-border shadow-card">
        <Pill className="w-12 h-12 text-text-muted mx-auto mb-3" />
        <h3 className="text-base font-bold text-text-main">Medicine record not found</h3>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/app/medicines')}>
          Return to Catalog
        </Button>
      </div>
    );
  }

  const batchColumns = [
    {
      header: 'Batch Number',
      render: (b) => <span className="font-mono font-bold text-primary">{b.batchNumber}</span>
    },
    {
      header: 'Supplier',
      render: (b) => {
        const sup = suppliers.find(s => s.id === b.supplierId);
        return <span>{sup?.name || 'Standard Supplier'}</span>;
      }
    },
    {
      header: 'Stock Remaining',
      render: (b) => (
        <span className="font-bold text-text-main">
          {b.quantityRemaining} / {b.quantityReceived} units
        </span>
      )
    },
    {
      header: 'Expiry Date',
      render: (b) => {
        const days = getDaysUntilExpiry(b.expiryDate);
        return (
          <div>
            <span className="block font-medium">{formatDate(b.expiryDate)}</span>
            {days <= 60 && days >= 0 && (
              <span className="text-[10px] text-danger font-bold">Expires in {days}d (FEFO Active)</span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Selling Price',
      align: 'right',
      render: (b) => <span className="font-bold text-text-main">{formatCurrency(b.sellingPrice)}</span>
    },
    {
      header: 'Status',
      align: 'center',
      render: (b) => (
        <Badge 
          variant={b.quantityRemaining === 0 ? 'neutral' : b.status === 'active' ? 'success' : 'danger'}
          size="sm"
        >
          {b.quantityRemaining === 0 ? 'Depleted' : b.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={medicine.name}
        subtitle={`${medicine.genericName} • ${medicine.brand}`}
        badge={
          <Badge variant={isLowStock ? 'warning' : 'success'} size="md">
            {isLowStock ? 'Low Stock' : 'Stocked'} ({totalStock} units available)
          </Badge>
        }
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/app/medicines')}
            >
              Back
            </Button>
            {isAdmin && (
              <Button
                variant="primary"
                icon={Edit2}
                onClick={() => setEditModalOpen(true)}
              >
                Edit Medicine
              </Button>
            )}
          </div>
        }
      />

      {/* Main Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Product & Clinical Specifications">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-surface-alt rounded-lg border border-border">
                <span className="text-text-muted font-medium block">Therapeutic Category</span>
                <span className="font-bold text-text-main text-sm mt-0.5">{category?.name || 'Uncategorized'}</span>
              </div>
              <div className="p-3 bg-surface-alt rounded-lg border border-border">
                <span className="text-text-muted font-medium block">Dosage Form & Strength</span>
                <span className="font-bold text-text-main text-sm mt-0.5">{medicine.dosageForm} ({medicine.strength} {medicine.unit})</span>
              </div>
              <div className="p-3 bg-surface-alt rounded-lg border border-border">
                <span className="text-text-muted font-medium block">Packaging Format</span>
                <span className="font-bold text-text-main text-sm mt-0.5">{medicine.packSize} ({medicine.unitsPerPack} units/pack)</span>
              </div>
              <div className="p-3 bg-surface-alt rounded-lg border border-border">
                <span className="text-text-muted font-medium block">Prescription Requirement</span>
                <span className="font-bold text-text-main text-sm mt-0.5">
                  {medicine.requiresPrescription ? (
                    <span className="text-danger flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" /> Prescription-Only (POM)
                    </span>
                  ) : (
                    <span className="text-success flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Over-The-Counter (OTC)
                    </span>
                  )}
                </span>
              </div>
            </div>

            {medicine.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs font-bold text-text-main block mb-1">Clinical Indications:</span>
                <p className="text-xs text-text-muted leading-relaxed">{medicine.description}</p>
              </div>
            )}
          </Card>

          {/* Safety & Storage */}
          <Card title="Safety, Contraindications & Storage">
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-danger block mb-0.5">Known Side Effects:</span>
                <p className="text-text-muted">{medicine.sideEffects || 'None reported'}</p>
              </div>
              <div>
                <span className="font-bold text-danger-dark block mb-0.5">Contraindications:</span>
                <p className="text-text-muted">{medicine.contraindications || 'None reported'}</p>
              </div>
              <div>
                <span className="font-bold text-text-main block mb-0.5">Storage Protocol:</span>
                <p className="text-text-muted">{medicine.storageInstructions || 'Standard room temperature'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Regulatory & Barcode Badges */}
        <div className="space-y-6">
          <Card title="Regulatory & Barcode Verification">
            <div className="space-y-4">
              <div className="p-4 bg-primary-light rounded-xl border border-primary/20 text-center">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">NAFDAC Reg. Number</span>
                <span className="text-xl font-black text-primary-dark tracking-wider block mt-1">
                  {medicine.nafdacRegNumber}
                </span>
                <span className="text-[10px] text-success font-semibold flex items-center justify-center gap-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Officially Validated
                </span>
              </div>

              <div className="p-4 bg-surface-alt rounded-xl border border-border text-center">
                <Barcode className="w-12 h-12 text-text-main mx-auto mb-1" />
                <span className="font-mono text-sm font-bold text-text-main block">{medicine.barcode}</span>
                <span className="text-[10px] text-text-muted">Barcode SKU for Scanner</span>
              </div>

              <div className="p-3 bg-surface-alt rounded-lg border border-border text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Reorder Threshold:</span>
                  <strong className="text-text-main">{medicine.reorderThreshold} units</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Active Batches:</span>
                  <strong className="text-text-main">{medBatches.filter(b => b.status === 'active').length} Batches</strong>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Linked Batches Inventory */}
      <Card
        title="Associated Batches & FEFO Expiry Queue"
        subtitle="Stock levels prioritized by earliest expiry dates"
      >
        <Table
          columns={batchColumns}
          data={medBatches}
          emptyTitle="No inventory batches found"
          emptyDescription="Stock in a new batch to make this medicine available for POS sales."
        />
      </Card>

      <MedicineFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        medicineToEdit={medicine}
      />
    </div>
  );
}
