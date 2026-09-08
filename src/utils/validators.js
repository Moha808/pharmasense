import { z } from 'zod';

// NAFDAC Registration Number pattern (e.g., A4-1029, 04-0124, B4-2038)
export const nafdacRegex = /^[A-Za-z0-9]{1,2}-[0-9]{3,5}$/;

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  description: z.string().max(300).optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name is required').max(150),
  contactPerson: z.string().min(2, 'Contact person name is required').max(100),
  phone: z.string().min(8, 'Valid phone number is required').max(20),
  email: z.string().email('Valid email address is required'),
  address: z.string().min(5, 'Physical address is required').max(250),
});

export const medicineSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'Medicine trade name is required').max(150),
  genericName: z.string().min(2, 'Generic name is required').max(150),
  brand: z.string().min(1, 'Manufacturer / Brand is required').max(100),
  categoryId: z.string().min(1, 'Please select a category'),
  description: z.string().max(500).optional(),

  // Strength / Measurement
  strength: z.string().min(1, 'Strength value is required (e.g. 500, 80/480)'),
  unit: z.string().min(1, 'Unit of measurement is required (e.g. mg, ml, IU, mcg)'),
  dosageForm: z.string().min(1, 'Dosage form is required (e.g. Tablet, Capsule, Syrup, Injection)'),

  // Packaging
  packSize: z.string().min(1, 'Pack size is required (e.g. 10x10, 1 Bottle, 1x6)'),
  unitsPerPack: z.coerce.number().int().positive('Units per pack must be at least 1'),

  // Safety Info
  sideEffects: z.string().max(500).optional(),
  contraindications: z.string().max(500).optional(),
  storageInstructions: z.string().max(300).optional(),
  requiresPrescription: z.boolean().default(false),

  // Regulatory & Tracking
  nafdacRegNumber: z.string().regex(nafdacRegex, 'Invalid NAFDAC format (expected format like A4-1029 or 04-0124)'),
  barcode: z.string().min(4, 'Barcode is required for scanning').max(50),
  reorderThreshold: z.coerce.number().int().nonnegative('Reorder threshold must be 0 or greater'),
});

export const batchSchema = z.object({
  medicineId: z.string().min(1, 'Please select a medicine'),
  batchNumber: z.string().min(2, 'Batch number is required').max(50),
  supplierId: z.string().min(1, 'Please select a supplier'),
  costPrice: z.coerce.number().positive('Cost price must be greater than zero'),
  sellingPrice: z.coerce.number().positive('Selling price must be greater than zero'),
  quantityReceived: z.coerce.number().int().positive('Quantity received must be greater than zero'),
  expiryDate: z.string().min(8, 'Valid expiry date is required'),
  dateReceived: z.string().min(8, 'Date received is required'),
});

export const staffUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required').max(100),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(8, 'Phone number is required'),
  role: z.enum(['admin', 'staff']),
  status: z.enum(['active', 'suspended']).default('active'),
  password: z.string().min(6, 'Temporary password must be at least 6 characters').optional(),
});

export const stockAdjustmentSchema = z.object({
  medicineId: z.string().min(1, 'Medicine is required'),
  batchId: z.string().min(1, 'Batch is required'),
  type: z.enum(['adjustment', 'return', 'expired-removal']),
  quantityChange: z.coerce.number().int().refine(val => val !== 0, 'Quantity change cannot be 0'),
  reason: z.string().min(3, 'Please provide a clear reason for the adjustment').max(300),
});
