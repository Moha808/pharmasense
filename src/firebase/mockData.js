// Production Clean State — Zero Mock Data
export const initialCategories = [];
export const initialSuppliers = [];
export const initialMedicines = [];
export const initialBatches = [];
export const initialUsers = [];
export const initialSales = [];
export const initialStockMovements = [];
export const initialAuditLogs = [];

export const initialSettings = {
  id: 'general',
  pharmacyName: 'PharmaSense Pharmacy',
  tagline: 'Healthcare Excellence & Smart Dispensing',
  address: '',
  phone: '',
  email: '',
  currency: 'NGN',
  currencySymbol: '₦',
  expiryAlertDays: 60,
  taxRate: 0,
  receiptFooter: 'Thank you for your patronage! Take your medicines as prescribed.',
  nafdacLicense: '',
  updatedAt: new Date().toISOString()
};
