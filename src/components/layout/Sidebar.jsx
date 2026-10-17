import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, ShoppingCart, Receipt, Pill, Layers,
  Truck, Users, BellRing, BarChart3, ShieldAlert, Settings,
  LogOut, X, Activity, PackageSearch,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';

export function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => { 
    setShowLogoutConfirm(false);
    await logout(); 
    navigate('/'); 
  };

  const adminNav = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Overview',         path: '/app/dashboard', icon: LayoutDashboard, exact: true },
        { label: 'Dispensing / POS', path: '/app/pos',       icon: ShoppingCart },
        { label: 'Sales History',    path: '/app/sales',     icon: Receipt },
      ],
    },
    {
      title: 'INVENTORY',
      items: [
        { label: 'Medicines',        path: '/app/medicines',  icon: Pill },
        { label: 'Batches & Stock',  path: '/app/batches',    icon: Layers },
        { label: 'Expiry & Alerts',  path: '/app/alerts',     icon: BellRing },
      ],
    },
    {
      title: 'SUPPLY',
      items: [
        { label: 'Suppliers',        path: '/app/suppliers',  icon: Truck },
      ],
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Staff Accounts',   path: '/app/staff',      icon: Users },
        { label: 'Reports',          path: '/app/reports',    icon: BarChart3 },
        { label: 'Audit Trail',      path: '/app/audit-log',  icon: ShieldAlert },
        { label: 'Settings',         path: '/app/settings',   icon: Settings },
      ],
    },
  ];

  const staffNav = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Overview',         path: '/app/dashboard', icon: LayoutDashboard, exact: true },
        { label: 'Dispensing / POS', path: '/app/pos',       icon: ShoppingCart },
        { label: 'Sales History',    path: '/app/sales',     icon: Receipt },
      ],
    },
    {
      title: 'INVENTORY',
      items: [
        { label: 'Medicines',        path: '/app/medicines',  icon: Pill },
        { label: 'Batches & Stock',  path: '/app/batches',    icon: Layers },
        { label: 'Expiry & Alerts',  path: '/app/alerts',     icon: BellRing },
      ],
    },
  ];

  const navSections = isAdmin ? adminNav : staffNav;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-56 flex flex-col border-r border-bdr
          transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: 'var(--color-bg-sidebar, var(--color-bg-card))' }}
      >
        {/* Brand */}
        <div className="h-14 px-4 border-b border-bdr flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Square logo mark — no rounded corners */}
            <div className="w-7 h-7 bg-primary flex items-center justify-center flex-shrink-0">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm text-txt">
                Pharma<span className="text-primary">Sense</span>
              </span>
              <span className="text-[9px] text-txt-light font-medium block leading-none mt-0.5 uppercase tracking-wider">
                {isAdmin ? 'Admin Console' : 'Staff Portal'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-txt-light hover:text-txt lg:hidden transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 px-2 py-4 overflow-y-auto">
          {navSections.map((sec, i) => (
            <div key={i} className="mb-5">
              <div className="px-3 mb-1.5 text-[9px] font-bold tracking-[0.12em] text-txt-light uppercase">
                {sec.title}
              </div>
              <div className="space-y-px">
                {sec.items.map((item, j) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={j}
                      to={item.path}
                      end={item.exact}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className={({ isActive }) => `
                        relative flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-medium transition-colors duration-100
                        ${isActive
                          ? 'text-primary bg-primary/10'
                          : 'text-txt-muted hover:text-txt hover:bg-white/4'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Left border indicator instead of rounded pill */}
                          {isActive && (
                            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
                          )}
                          <Icon className="w-[14px] h-[14px] flex-shrink-0" />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-bdr flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* User avatar — square, not pill */}
              <div
                className="w-6 h-6 bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px] flex-shrink-0"
                style={{ fontVariantNumeric: 'normal' }}
              >
                {getInitials(user?.fullName)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-txt truncate">{user?.fullName || 'User'}</p>
                <p className="text-[9px] text-txt-light capitalize truncate">{user?.role || 'staff'}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 text-txt-light hover:text-danger transition-colors flex-shrink-0"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to end your current session?"
        confirmLabel="Sign Out"
        variant="warning"
      />
    </>
  );
}
