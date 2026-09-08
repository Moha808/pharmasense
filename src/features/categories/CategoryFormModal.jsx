import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { categoryService } from './categoryService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function CategoryFormModal({ isOpen, onClose, categoryToEdit = null }) {
  const { user } = useAuth();
  const isEditing = Boolean(categoryToEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
      });
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [categoryToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await categoryService.updateCategory(categoryToEdit.id, data, user?.uid);
        toast.success('Category updated successfully');
      } else {
        await categoryService.createCategory(data, user?.uid);
        toast.success('Category created successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error saving category');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create New Category'}
      subtitle="Categorize medicines for structured inventory tracking"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Category Name"
          placeholder="e.g. Antibiotics, Analgesics, Antimalarials"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Brief description of therapeutic classification..."
          rows={3}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
