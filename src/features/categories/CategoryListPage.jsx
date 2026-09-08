import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import { SearchInput } from '../../components/common/SearchInput';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { CategoryFormModal } from './CategoryFormModal';
import { categoryService } from './categoryService';
import { Plus, Edit2, Trash2, Tags, Pill } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export function CategoryListPage() {
  const { isAdmin, user } = useAuth();
  const { data: categories = [], loading: catLoading } = useFirestoreQuery('categories');
  const { data: medicines = [] } = useFirestoreQuery('medicines');

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await categoryService.deleteCategory(deleteConfirm.id, user?.uid);
      toast.success(`Category "${deleteConfirm.name}" deleted`);
    } catch (err) {
      toast.error('Failed to delete category');
    } finally {
      setDeleteLoading(false);
      setDeleteConfirm({ open: false, id: null, name: '' });
    }
  };

  const columns = [
    {
      header: 'Category Name',
      render: (cat) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Tags className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-txt block">{cat.name}</span>
            <span className="text-[11px] text-txt-muted">{cat.description || 'No description'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Assigned Medicines',
      render: (cat) => {
        const count = medicines.filter(m => m.categoryId === cat.id).length;
        return (
          <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-txt-muted px-2.5 py-1 rounded-full border border-bdr" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
            <Pill className="w-3.5 h-3.5 text-primary" /> {count} Medicine{count !== 1 ? 's' : ''}
          </span>
        );
      }
    },
    {
      header: 'Created On',
      render: (cat) => <span className="text-xs text-txt-muted">{formatDate(cat.createdAt)}</span>
    },
    ...(isAdmin ? [{
      header: '',
      align: 'right',
      render: (cat) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => { setCategoryToEdit(cat); setModalOpen(true); }} className="p-1.5 rounded-lg text-txt-muted hover:text-primary hover:bg-primary/10 transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteConfirm({ open: true, id: cat.id, name: cat.name })} className="p-1.5 rounded-lg text-txt-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medicine Categories"
        subtitle="Manage therapeutic groups and classification categories"
        actions={isAdmin && (
          <Button variant="primary" size="md" icon={Plus} onClick={() => { setCategoryToEdit(null); setModalOpen(true); }}>
            Add Category
          </Button>
        )}
      />

      <div className="flex items-center gap-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search categories..." className="w-full max-w-md" />
      </div>

      <Table
        columns={columns}
        data={filteredCategories}
        loading={catLoading}
        emptyTitle="No categories found"
        emptyDescription="Create categories such as Antibiotics, Analgesics, etc. to organise your catalog."
        emptyIcon={Tags}
        emptyActionLabel={isAdmin ? "Create First Category" : undefined}
        onEmptyAction={() => { setCategoryToEdit(null); setModalOpen(true); }}
      />

      <CategoryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} categoryToEdit={categoryToEdit} />

      <ConfirmModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Category"
        message={`Delete "${deleteConfirm.name}"? Medicines in this category will become uncategorised.`}
        confirmLabel="Delete Category"
        variant="danger"
      />
    </div>
  );
}
