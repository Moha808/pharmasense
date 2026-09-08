import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nafdacRegex } from '../../utils/validators';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Button } from '../../components/common/Button';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { medicineService } from './medicineService';
import { useAuth } from '../../hooks/useAuth';
import {
  Pill, ShieldAlert, Package, FileCheck, Info, Barcode,
  AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simplified schema — NAFDAC can be empty (warn but don't block)
const medicineSchema = z.object({
  name: z.string().min(2, 'Trade name is required'),
  genericName: z.string().min(2, 'Generic name is required'),
  brand: z.string().min(1, 'Manufacturer is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  strength: z.string().min(1, 'Strength is required (e.g. 500)'),
  unit: z.string().min(1, 'Unit is required'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  packSize: z.string().min(1, 'Pack size is required (e.g. 10x10)'),
  unitsPerPack: z.coerce.number().int().positive('Must be at least 1'),
  sideEffects: z.string().optional(),
  contraindications: z.string().optional(),
  storageInstructions: z.string().optional(),
  requiresPrescription: z.boolean().default(false),
  nafdacRegNumber: z.string()
    .optional()
    .refine(val => !val || nafdacRegex.test(val), {
      message: 'Format must be like A4-1029, 04-0124, or B4-2038',
    }),
  barcode: z.string().min(4, 'Barcode / SKU is required'),
  reorderThreshold: z.coerce.number().int().nonnegative('Must be 0 or greater'),
});

const TABS = [
  { id: 'basic',      label: 'Basic Info',         icon: Info,       fields: ['name', 'genericName', 'brand', 'categoryId', 'description'] },
  { id: 'strength',   label: 'Strength & Pack',     icon: Package,    fields: ['strength', 'unit', 'dosageForm', 'packSize', 'unitsPerPack'] },
  { id: 'safety',     label: 'Safety',              icon: ShieldAlert, fields: ['requiresPrescription', 'sideEffects', 'contraindications', 'storageInstructions'] },
  { id: 'regulatory', label: 'Regulatory',          icon: FileCheck,  fields: ['nafdacRegNumber', 'barcode', 'reorderThreshold'] },
];

export function MedicineFormModal({ isOpen, onClose, medicineToEdit = null }) {
  const { user } = useAuth();
  const isEditing = Boolean(medicineToEdit);
  const [activeTab, setActiveTab] = useState('basic');

  const { data: categories = [] } = useFirestoreQuery('categories');

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '', genericName: '', brand: '', categoryId: '',
      description: '', strength: '', unit: 'mg', dosageForm: 'Tablet',
      packSize: '', unitsPerPack: 1, sideEffects: '',
      contraindications: '', storageInstructions: 'Store in a cool dry place below 30°C',
      requiresPrescription: false, nafdacRegNumber: '',
      barcode: String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
      reorderThreshold: 20,
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
    if (medicineToEdit) {
      reset({
        name: medicineToEdit.name || '',
        genericName: medicineToEdit.genericName || '',
        brand: medicineToEdit.brand || '',
        categoryId: medicineToEdit.categoryId || '',
        description: medicineToEdit.description || '',
        strength: medicineToEdit.strength || '',
        unit: medicineToEdit.unit || 'mg',
        dosageForm: medicineToEdit.dosageForm || 'Tablet',
        packSize: medicineToEdit.packSize || '',
        unitsPerPack: medicineToEdit.unitsPerPack || 1,
        sideEffects: medicineToEdit.sideEffects || '',
        contraindications: medicineToEdit.contraindications || '',
        storageInstructions: medicineToEdit.storageInstructions || '',
        requiresPrescription: Boolean(medicineToEdit.requiresPrescription),
        nafdacRegNumber: medicineToEdit.nafdacRegNumber || '',
        barcode: medicineToEdit.barcode || '',
        reorderThreshold: medicineToEdit.reorderThreshold ?? 20,
      });
    } else {
      reset({
        name: '', genericName: '', brand: '',
        categoryId: categories[0]?.id || '',
        description: '', strength: '', unit: 'mg', dosageForm: 'Tablet',
        packSize: '', unitsPerPack: 1, sideEffects: '',
        contraindications: '', storageInstructions: 'Store in a cool dry place below 30°C',
        requiresPrescription: false, nafdacRegNumber: '',
        barcode: String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
        reorderThreshold: 20,
      });
    }
  }, [isOpen, medicineToEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await medicineService.updateMedicine(medicineToEdit.id, data, user?.uid);
        toast.success('Medicine updated successfully');
      } else {
        await medicineService.createMedicine(data, user?.uid);
        toast.success(`"${data.name}" registered successfully`);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save medicine');
    }
  };

  // Work out which tabs have errors so we can highlight them
  const tabsWithErrors = TABS.filter(tab =>
    tab.fields.some(field => errors[field])
  );

  const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
  const isLastTab = currentTabIndex === TABS.length - 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Medicine Record' : 'Register New Medicine'}
      subtitle="Fill in all 4 sections, then click Register"
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Tab Bar */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-bg-alt)' }}>
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const hasError = tab.fields.some(f => errors[f]);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-[11px] font-bold transition-all duration-150
                  ${isActive
                    ? 'bg-bg-card text-primary shadow-sm'
                    : hasError
                    ? 'text-danger bg-danger/10'
                    : 'text-txt-muted hover:text-txt'}
                `}
              >
                {hasError ? <AlertCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5 hidden sm:block" />}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Error summary banner (only shows after failed submit) */}
        {tabsWithErrors.length > 0 && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-0.5">Please fix errors before saving:</p>
              <p className="text-danger/80">
                Issues found in: <span className="font-bold">{tabsWithErrors.map(t => t.label).join(', ')}</span>. Click those tabs to see the fields.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab 1: Basic Info ───────────────────────────── */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Trade / Brand Name *"
                placeholder="e.g. Amoxil 500mg, Coartem"
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Generic / Active Ingredient *"
                placeholder="e.g. Amoxicillin, Artemether"
                error={errors.genericName?.message}
                {...register('genericName')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Manufacturer / Brand *"
                placeholder="e.g. GSK, Emzor, Fidson"
                error={errors.brand?.message}
                {...register('brand')}
              />
              <Select
                label="Therapeutic Category *"
                error={errors.categoryId?.message}
                {...register('categoryId')}
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>
            <Textarea
              label="Description / Indications"
              placeholder="Brief clinical description..."
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        )}

        {/* ── Tab 2: Strength & Packaging ─────────────────── */}
        {activeTab === 'strength' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Strength *"
                placeholder="e.g. 500, 80/480"
                error={errors.strength?.message}
                {...register('strength')}
              />
              <Select label="Unit *" error={errors.unit?.message} {...register('unit')}>
                <option value="mg">mg (Milligrams)</option>
                <option value="g">g (Grams)</option>
                <option value="ml">ml (Millilitres)</option>
                <option value="IU">IU (Intl. Units)</option>
                <option value="mcg">mcg (Micrograms)</option>
                <option value="%">% (Percentage)</option>
              </Select>
              <Select label="Dosage Form *" error={errors.dosageForm?.message} {...register('dosageForm')}>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Suspension">Suspension</option>
                <option value="Injection">Injection</option>
                <option value="Ointment / Cream">Ointment / Cream</option>
                <option value="Eye / Ear Drop">Eye / Ear Drop</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Infusion">Infusion</option>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Pack Size *"
                placeholder="e.g. 10x10 Blister, 1 Bottle"
                error={errors.packSize?.message}
                {...register('packSize')}
              />
              <Input
                label="Units Per Pack *"
                type="number"
                min="1"
                placeholder="e.g. 100"
                error={errors.unitsPerPack?.message}
                {...register('unitsPerPack')}
              />
            </div>
          </div>
        )}

        {/* ── Tab 3: Safety ───────────────────────────────── */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg border border-bdr flex items-center justify-between"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              <div>
                <label className="text-xs font-bold text-txt block">Prescription Requirement</label>
                <p className="text-[11px] text-txt-muted">Is this a Prescription-Only Medicine (POM)?</p>
              </div>
              <input
                type="checkbox"
                id="requiresPrescription"
                className="w-4 h-4 rounded accent-primary"
                {...register('requiresPrescription')}
              />
            </div>
            <Textarea
              label="Known Side Effects"
              placeholder="e.g. Nausea, dizziness, rash..."
              rows={2}
              {...register('sideEffects')}
            />
            <Textarea
              label="Contraindications"
              placeholder="e.g. Hypersensitivity, severe hepatic impairment..."
              rows={2}
              {...register('contraindications')}
            />
            <Input
              label="Storage Instructions"
              placeholder="e.g. Store below 25°C in a dry place"
              {...register('storageInstructions')}
            />
          </div>
        )}

        {/* ── Tab 4: Regulatory ───────────────────────────── */}
        {activeTab === 'regulatory' && (
          <div className="space-y-4">
            <div
              className="p-3 rounded-lg border border-primary/20 text-xs text-primary/80"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              NAFDAC number format examples: <strong>A4-1029</strong>, <strong>04-0124</strong>, <strong>B4-2038</strong>. Leave blank if not yet available.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="NAFDAC Registration Number"
                placeholder="e.g. A4-1029, 04-0124"
                error={errors.nafdacRegNumber?.message}
                {...register('nafdacRegNumber')}
              />
              <Input
                label="Barcode / SKU *"
                placeholder="e.g. 8901234567890"
                leftIcon={Barcode}
                error={errors.barcode?.message}
                {...register('barcode')}
              />
            </div>
            <Input
              label="Low Stock Alert Threshold *"
              type="number"
              min="0"
              placeholder="e.g. 20"
              helperText="You'll get an alert when total stock across batches falls below this number"
              error={errors.reorderThreshold?.message}
              {...register('reorderThreshold')}
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-bdr">
          {/* Prev/Next */}
          <div className="flex gap-2">
            {currentTabIndex > 0 && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                icon={ChevronLeft}
                onClick={() => setActiveTab(TABS[currentTabIndex - 1].id)}
              >
                Back
              </Button>
            )}
            {!isLastTab && (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                icon={ChevronRight}
                onClick={() => setActiveTab(TABS[currentTabIndex + 1].id)}
              >
                Next
              </Button>
            )}
          </div>

          {/* Cancel / Submit */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting} icon={Pill}>
              {isEditing ? 'Save Changes' : 'Register Medicine'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
