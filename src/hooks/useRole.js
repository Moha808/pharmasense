import { useAuth } from './useAuth';

export function useRole() {
  const { role, isAdmin, isStaff } = useAuth();

  const permissions = {
    // Medicines & Categories
    canCreateMedicine: isAdmin,
    canEditMedicine: isAdmin,
    canDeleteMedicine: isAdmin,
    canViewMedicines: true,

    // Batches & Stock
    canStockInBatch: isAdmin,
    canAdjustStock: isAdmin,
    canViewBatches: true,

    // Suppliers
    canAccessSuppliers: isAdmin,

    // Staff Management
    canManageStaff: isAdmin,

    // POS & Sales
    canProcessSale: true,
    canViewAllSales: isAdmin,
    canViewOwnSales: true,

    // Reports
    canViewAllReports: isAdmin,
    canViewStaffReports: true,

    // Settings & Audit
    canAccessSettings: isAdmin,
    canViewAuditLog: isAdmin,
  };

  return {
    role,
    isAdmin,
    isStaff,
    permissions,
    can: (permName) => Boolean(permissions[permName])
  };
}
