import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { supplierService } from './supplierService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function SupplierFormModal({ isOpen, onClose, supplierToEdit = null }) {
  const { user } = useAuth();
  const isEditing = Boolean(supplierToEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
    }
  });

  useEffect(() => {
    if (supplierToEdit) {
      reset({
        name: supplierToEdit.name || '',
        contactPerson: supplierToEdit.contactPerson || '',
        phone: supplierToEdit.phone || '',
        email: supplierToEdit.email || '',
        address: supplierToEdit.address || '',
      });
    } else {
      reset({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
      });
    }
  }, [supplierToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await supplierService.updateSupplier(supplierToEdit.id, data, user?.uid);
        toast.success('Supplier details updated');
      } else {
        await supplierService.createSupplier(data, user?.uid);
        toast.success('Supplier registered successfully');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save supplier');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Supplier Record' : 'Register Pharmaceutical Supplier'}
      subtitle="Maintain verified distributor contacts for batch supply verification"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Company / Supplier Name"
          placeholder="e.g. Emzor Pharmaceuticals Plc"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Contact Person & Title"
          placeholder="e.g. Dr. Emeka Okonkwo (Sales Rep)"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            placeholder="e.g. +234 803 123 4567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. orders@emzorpharma.com"
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <Textarea
          label="Physical / Warehouse Address"
          placeholder="e.g. Plot 3C, Industrial Estate, Ikeja, Lagos"
          rows={3}
          error={errors.address?.message}
          {...register('address')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Register Supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
