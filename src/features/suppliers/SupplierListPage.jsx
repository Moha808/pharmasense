import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { SupplierFormModal } from './SupplierFormModal';
import { supplierService } from './supplierService';
import { Plus, Edit2, Trash2, Truck, Phone, Mail, MapPin, Layers } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function SupplierListPage() {
  const { isAdmin, user } = useAuth();
  const { data: suppliers = [], loading: supLoading } = useFirestoreQuery('suppliers');
  const { data: batches = [] } = useFirestoreQuery('batches');

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.phone?.includes(searchTerm) ||
    sup.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await supplierService.deleteSupplier(deleteConfirm.id, user?.uid);
      toast.success(`Supplier "${deleteConfirm.name}" removed`);
    } catch (err) {
      toast.error('Failed to remove supplier');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  const columns = [
    {
      header: 'Supplier',
      render: (sup) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-txt block text-sm">{sup.name}</span>
            <span className="text-[11px] text-txt-muted flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {sup.address || 'Lagos, Nigeria'}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Contact Person',
      render: (sup) => <span className="text-sm font-medium text-txt">{sup.contactPerson}</span>
    },
    {
      header: 'Contact',
      render: (sup) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-txt-muted">
            <Phone className="w-3 h-3 text-primary" />
            <a href={`tel:${sup.phone}`} className="hover:text-primary hover:underline">{sup.phone}</a>
          </div>
          <div className="flex items-center gap-1.5 text-txt-muted">
            <Mail className="w-3 h-3 text-primary" />
            <a href={`mailto:${sup.email}`} className="hover:text-primary hover:underline">{sup.email}</a>
          </div>
        </div>
      )
    },
    {
      header: 'Batches',
      render: (sup) => {
        const count = batches.filter(b => b.supplierId === sup.id).length;
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-txt-muted px-2.5 py-1 rounded-full border border-bdr" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
            <Layers className="w-3.5 h-3.5 text-blue-500" /> {count} batch{count !== 1 ? 'es' : ''}
          </span>
        );
      }
    },
    {
      header: '',
      align: 'right',
      render: (sup) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => { setSupplierToEdit(sup); setModalOpen(true); }}
            className="p-1.5 rounded-lg text-txt-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteConfirm({ open: true, id: sup.id, name: sup.name })}
            className="p-1.5 rounded-lg text-txt-muted hover:text-danger hover:bg-danger/10 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmaceutical Suppliers"
        subtitle="Manage licensed drug manufacturers, importers, and verified distributors"
        actions={isAdmin && (
          <Button variant="primary" size="md" icon={Plus} onClick={() => { setSupplierToEdit(null); setModalOpen(true); }}>
            Register Supplier
          </Button>
        )}
      />

      <div className="flex items-center gap-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by company name, contact, phone, or email..."
          className="w-full max-w-md"
        />
      </div>

      <Table
        columns={columns}
        data={filteredSuppliers}
        loading={supLoading}
        emptyTitle="No suppliers registered"
        emptyDescription="Add verified pharmaceutical suppliers to link batches during stock-in."
        emptyIcon={Truck}
        emptyActionLabel={isAdmin ? "Register First Supplier" : undefined}
        onEmptyAction={() => { setSupplierToEdit(null); setModalOpen(true); }}
      />

      <SupplierFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} supplierToEdit={supplierToEdit} />

      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Remove Supplier"
        message={`Remove "${deleteConfirm.name}" from your supplier list? Existing batches linked to them will not be affected.`}
        confirmLabel="Remove Supplier"
        variant="danger"
      />
    </div>
  );
}
