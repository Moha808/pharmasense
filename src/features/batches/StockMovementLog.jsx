import React from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { Activity, ArrowUpRight, ArrowDownRight, RefreshCw, Trash2 } from 'lucide-react';

export function StockMovementLog({ filterMedicineId = null }) {
  const { data: movements = [], loading: movLoading } = useFirestoreQuery('stockMovements');
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: users = [] } = useFirestoreQuery('users');

  const filtered = filterMedicineId 
    ? movements.filter(m => m.medicineId === filterMedicineId)
    : movements;

  const columns = [
    {
      header: 'Timestamp',
      render: (m) => <span className="text-text-muted">{formatDateTime(m.timestamp)}</span>
    },
    {
      header: 'Medicine & Batch',
      render: (m) => {
        const med = medicines.find(med => med.id === m.medicineId);
        const bat = batches.find(b => b.id === m.batchId);
        return (
          <div>
            <span className="font-bold text-text-main block">{med?.name || 'Medicine'}</span>
            <span className="text-[10px] text-text-muted font-mono">Lot: {bat?.batchNumber || m.batchId}</span>
          </div>
        );
      }
    },
    {
      header: 'Movement Type',
      align: 'center',
      render: (m) => {
        const typeVariants = {
          'stock-in': { variant: 'success', label: 'Stock In' },
          'sale': { variant: 'primary', label: 'POS Sale' },
          'adjustment': { variant: 'warning', label: 'Adjustment' },
          'return': { variant: 'purple', label: 'Return' },
          'expired-removal': { variant: 'danger', label: 'Expired Disposal' },
        };
        const conf = typeVariants[m.type] || { variant: 'neutral', label: m.type };
        return <Badge variant={conf.variant} size="sm">{conf.label}</Badge>;
      }
    },
    {
      header: 'Qty Change',
      align: 'center',
      render: (m) => {
        const isPositive = Number(m.quantityChange) > 0;
        return (
          <span className={`font-mono font-bold text-xs ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? `+${m.quantityChange}` : m.quantityChange} units
          </span>
        );
      }
    },
    {
      header: 'Reason / Reference',
      render: (m) => <span className="text-text-muted text-xs">{m.reason || '—'}</span>
    },
    {
      header: 'Performed By',
      render: (m) => {
        const user = users.find(u => u.uid === m.performedBy);
        return <span className="text-xs font-medium">{user?.fullName || m.performedBy}</span>;
      }
    }
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={filtered}
        loading={movLoading}
        emptyTitle="No stock movements recorded"
        emptyDescription="All stock changes, sales, and batch receipts will automatically appear here."
        emptyIcon={Activity}
        pageSize={8}
      />
    </div>
  );
}
