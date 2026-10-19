import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layout & Guards
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../features/auth/LoginPage';
import { AdminLoginPage } from '../features/auth/AdminLoginPage';
import { StaffRegistrationPage } from '../features/auth/StaffRegistrationPage';
import { UnauthorizedPage, NotFoundPage } from '../pages/UnauthorizedPage';

// Dashboards
import { DashboardRouter } from '../features/dashboard/DashboardRouter';

// Core Features
import { POSPage } from '../features/pos/POSPage';
import { SalesHistoryPage } from '../features/pos/SalesHistoryPage';
import { MedicineListPage } from '../features/medicines/MedicineListPage';
import { MedicineDetailPage } from '../features/medicines/MedicineDetailPage';
import { CategoryListPage } from '../features/categories/CategoryListPage';
import { BatchListPage } from '../features/batches/BatchListPage';
import { SupplierListPage } from '../features/suppliers/SupplierListPage';
import { StaffListPage } from '../features/staff/StaffListPage';
import { AlertsPage } from '../features/alerts/AlertsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { AuditLogPage } from '../features/auditLog/AuditLogPage';
import { SettingsPage } from '../features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminLoginPage />,
  },
  {
    path: '/register',
    element: <StaffRegistrationPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardRouter />,
      },
      {
        path: 'pos',
        element: <POSPage />,
      },
      {
        path: 'sales',
        element: <SalesHistoryPage />,
      },
      {
        path: 'medicines',
        element: <MedicineListPage />,
      },
      {
        path: 'medicines/:id',
        element: <MedicineDetailPage />,
      },
      {
        path: 'categories',
        element: (
          <ProtectedRoute requiredRole="admin">
            <CategoryListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'batches',
        element: <BatchListPage />,
      },
      {
        path: 'suppliers',
        element: (
          <ProtectedRoute requiredRole="admin">
            <SupplierListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute requiredRole="admin">
            <StaffListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'alerts',
        element: <AlertsPage />,
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requiredRole="admin">
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'audit-log',
        element: (
          <ProtectedRoute requiredRole="admin">
            <AuditLogPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requiredRole="admin">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
