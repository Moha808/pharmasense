import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { SearchInput } from '../../components/common/SearchInput';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { MedicineFormModal } from './MedicineFormModal';
import { medicineService } from './medicineService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Pill, 
  ShieldCheck, 
  ShieldAlert, 
  Barcode 
} from 'lucide-react';
import toast from 'react-hot-toast';

export function MedicineListPage() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const { data: medicines = [], loading: medsLoading } = useFirestoreQuery('medicines');
  const { data: categories = [] } = useFirestoreQuery('categories');
  const { data: batches = [] } = useFirestoreQuery('batches');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [prescriptionFilter, setPrescriptionFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    const matchesSearch = 
      med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.nafdacRegNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.barcode?.includes(searchTerm);

    const matchesCategory = !selectedCategory || med.categoryId === selectedCategory;
    const matchesRx = 
      !prescriptionFilter || 
      (prescriptionFilter === 'rx' ? med.requiresPrescription : !med.requiresPrescription);

    return matchesSearch && matchesCategory && matchesRx;
  });

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await medicineService.deleteMedicine(deleteConfirm.id, user?.uid);
      toast.success(`Medicine "${deleteConfirm.name}" deleted`);
    } catch (err) {
      toast.error('Failed to delete medicine');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  const columns = [
    {
      header: 'Medicine & Generic Name',
      render: (med) => {
        const cat = categories.find(c => c.id === med.categoryId);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <span 
                onClick={() => navigate(`/app/medicines/${med.id}`)}
                className="font-bold text-txt hover:text-primary cursor-pointer block text-sm"
              >
                {med.name}
              </span>
              <span className="text-[11px] text-txt-muted">
                {med.genericName} • {cat?.name || 'Uncategorized'}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Dosage & Pack',
      render: (med) => (
        <div>
          <span className="font-semibold block text-txt">{med.dosageForm} ({med.strength} {med.unit})</span>
          <span className="text-[11px] text-txt-muted">{med.packSize}</span>
        </div>
      )
    },
    {
      header: 'NAFDAC & Barcode',
      render: (med) => (
        <div>
          <span className="font-mono text-xs font-bold text-primary block">{med.nafdacRegNumber}</span>
          <span className="text-[10px] text-txt-muted font-mono">{med.barcode}</span>
        </div>
      )
    },
    {
      header: 'Total Stock',
      render: (med) => {
        const medBatches = batches.filter(b => b.medicineId === med.id && b.status === 'active');
        const total = medBatches.reduce((acc, b) => acc + b.quantityRemaining, 0);
        const isLow = total <= (med.reorderThreshold || 15);

        return (
          <div>
            <span className={`font-black text-sm block ${isLow ? 'text-warning' : 'text-txt'}`}>
              {total} units
            </span>
            <span className="text-[10px] text-txt-muted">
              {medBatches.length} batch(es) • {isLow ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Rx Type',
      align: 'center',
      render: (med) => (
        <Badge variant={med.requiresPrescription ? 'danger' : 'success'} size="sm">
          {med.requiresPrescription ? 'POM (Rx)' : 'OTC'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (med) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => navigate(`/app/medicines/${med.id}`)}
            className="p-1.5 rounded-lg text-txt-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => { setMedicineToEdit(med); setModalOpen(true); }}
                className="p-1.5 rounded-lg text-txt-muted hover:text-primary hover:bg-primary/10 transition-colors"
                title="Edit Medicine"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm({ open: true, id: med.id, name: med.name })}
                className="p-1.5 rounded-lg text-txt-muted hover:text-danger hover:bg-danger/10 transition-colors"
                title="Delete Medicine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicines Catalog"
        subtitle="Manage pharmaceuticals with NAFDAC regulatory attributes and stock thresholds"
        actions={
          isAdmin && (
            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={() => { setMedicineToEdit(null); setModalOpen(true); }}
            >
              Add New Medicine
            </Button>
          )
        }
      />

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-xl border border-bdr shadow-card"
           style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="sm:col-span-2">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name, generic, NAFDAC number, or barcode..."
          />
        </div>

        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>

        <Select
          value={prescriptionFilter}
          onChange={(e) => setPrescriptionFilter(e.target.value)}
        >
          <option value="">All Rx Types</option>
          <option value="otc">OTC (Over-The-Counter)</option>
          <option value="rx">POM (Prescription Only)</option>
        </Select>
      </div>

      <Table
        columns={columns}
        data={filteredMedicines}
        loading={medsLoading}
        emptyTitle="No medicines found"
        emptyDescription="Try adjusting your filters or search terms, or register a new medicine."
        emptyIcon={Pill}
        emptyActionLabel={isAdmin ? "Register First Medicine" : undefined}
        onEmptyAction={() => { setMedicineToEdit(null); setModalOpen(true); }}
      />

      <MedicineFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        medicineToEdit={medicineToEdit}
      />

      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Medicine"
        message={`Permanently delete "${deleteConfirm.name}" from the catalog? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
