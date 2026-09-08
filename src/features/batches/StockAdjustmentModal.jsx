import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { stockAdjustmentSchema } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { batchService } from './batchService';
import toast from 'react-hot-toast';

export function StockAdjustmentModal({ isOpen, onClose, batch = null, medicine = null }) {
  const { user } = useAuth();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      medicineId: batch?.medicineId || medicine?.id || '',
      batchId: batch?.id || '',
      type: 'adjustment',
      quantityChange: -1,
      reason: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      await batchService.adjustStock(data, user?.uid);
      toast.success('Stock adjusted and recorded in stock movements');
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Adjustment"
      subtitle={`Adjusting Batch #${batch?.batchNumber || ''} (${medicine?.name || 'Medicine'})`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" value={batch?.medicineId || medicine?.id || ''} {...register('medicineId')} />
        <input type="hidden" value={batch?.id || ''} {...register('batchId')} />

        <div className="p-3 bg-surface-alt rounded-lg border border-border text-xs">
          <div className="flex justify-between py-0.5">
            <span className="text-text-muted">Current Quantity Remaining:</span>
            <strong className="text-text-main">{batch?.quantityRemaining || 0} units</strong>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-text-muted">Batch Expiry:</span>
            <strong>{batch?.expiryDate || '—'}</strong>
          </div>
        </div>

        <Select
          label="Adjustment Type"
          error={errors.type?.message}
          {...register('type')}
        >
          <option value="adjustment">Manual Inventory Correction (+ / -)</option>
          <option value="return">Customer / Supplier Return (+)</option>
          <option value="expired-removal">Expired Drug Disposal (-)</option>
        </Select>

        <Input
          label="Quantity Change (Signed integer: negative for deduction, positive for addition)"
          type="number"
          placeholder="e.g. -5 for damage/disposal, or +10 for found stock"
          helperText="Negative numbers decrease inventory, positive numbers increase it."
          error={errors.quantityChange?.message}
          {...register('quantityChange')}
        />

        <Textarea
          label="Reason for Adjustment"
          placeholder="e.g. Broken seal during shelf restock, inventory recount discrepancy..."
          rows={3}
          error={errors.reason?.message}
          {...register('reason')}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="danger" type="submit" loading={isSubmitting}>
            Apply Stock Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
