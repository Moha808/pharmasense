import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staffUserSchema } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { staffService } from './staffService';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export function StaffFormModal({ isOpen, onClose, userToEdit = null }) {
  const { user } = useAuth();
  const isEditing = Boolean(userToEdit);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(staffUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'staff',
      status: 'active',
      password: 'password123',
    }
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        fullName: userToEdit.fullName || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        role: userToEdit.role || 'staff',
        status: userToEdit.status || 'active',
        password: '',
      });
    } else {
      reset({
        fullName: '',
        email: '',
        phone: '',
        role: 'staff',
        status: 'active',
        password: 'password123',
      });
    }
  }, [userToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await staffService.updateStaffUser(userToEdit.uid || userToEdit.id, data, user?.uid);
        toast.success('Staff profile updated successfully');
      } else {
        await staffService.createStaffUser(data, user?.uid);
        toast.success(`Staff user "${data.fullName}" created successfully!`);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save staff account');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff Account' : 'Provision Staff Account'}
      subtitle="Configure access control role and contact details"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Legal Name & Title"
          placeholder="e.g. Pharm. Mary Johnson"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Work Email Address"
            type="email"
            placeholder="e.g. mary@pharmasense.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone Number"
            placeholder="e.g. +234 803 444 5566"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="System Role"
            error={errors.role?.message}
            {...register('role')}
          >
            <option value="staff">Staff Cashier (POS & Dispensing)</option>
            <option value="admin">Administrator (Full Access)</option>
          </Select>

          <Select
            label="Account Status"
            error={errors.status?.message}
            {...register('status')}
          >
            <option value="active">Active (Access Granted)</option>
            <option value="suspended">Suspended (Access Blocked)</option>
          </Select>
        </div>

        {!isEditing && (
          <Input
            label="Initial Temporary Password"
            type="text"
            placeholder="e.g. password123"
            helperText="Staff member will use this to sign in to their terminal"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Provision Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
