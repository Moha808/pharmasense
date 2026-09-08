import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { batchSchema } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { batchService } from './batchService';
import toast from 'react-hot-toast';

export function BatchStockInModal({ isOpen, onClose, preselectedMedicineId = '' }) {
  const { user } = useAuth();
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: suppliers = [] } = useFirestoreQuery('suppliers');

  const todayStr = new Date().toISOString().slice(0, 10);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      medicineId: preselectedMedicineId,
      batchNumber: `BAT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      supplierId: suppliers[0]?.id || '',
      costPrice: 1500,
      sellingPrice: 2200,
      quantityReceived: 50,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      dateReceived: todayStr,
    }
  });

  const onSubmit = async (data) => {
    try {
      await batchService.stockInBatch(data, user?.uid);
      toast.success(`Batch #${data.batchNumber} stocked in successfully!`);
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to record stock-in batch');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock In New Medicine Batch"
      subtitle="Adds stock to inventory and records an immutable stock-in audit entry"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Medicine"
            error={errors.medicineId?.message}
            {...register('medicineId')}
          >
            <option value="">Choose medicine...</option>
            {medicines.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.genericName})
              </option>
            ))}
          </Select>

          <Select
            label="Pharmaceutical Supplier"
            error={errors.supplierId?.message}
            {...register('supplierId')}
          >
            <option value="">Choose supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Batch / Lot Number"
            placeholder="e.g. AMX-2026-01, CRT-8812"
            error={errors.batchNumber?.message}
            {...register('batchNumber')}
          />
          <Input
            label="Quantity Received (Units)"
            type="number"
            min="1"
            placeholder="e.g. 100"
            error={errors.quantityReceived?.message}
            {...register('quantityReceived')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Unit Cost Price (₦)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 1500"
            error={errors.costPrice?.message}
            {...register('costPrice')}
          />
          <Input
            label="Unit Selling Price (₦)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 2200"
            error={errors.sellingPrice?.message}
            {...register('sellingPrice')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Expiry Date (FEFO Sorted)"
            type="date"
            error={errors.expiryDate?.message}
            {...register('expiryDate')}
          />
          <Input
            label="Date Received"
            type="date"
            error={errors.dateReceived?.message}
            {...register('dateReceived')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting}>
            Confirm Stock In
          </Button>
        </div>
      </form>
    </Modal>
  );
}
