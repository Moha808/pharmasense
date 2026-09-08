import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Menu, ChevronDown, LogOut, ExternalLink, ShieldCheck } from 'lucide-react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { getDaysUntilExpiry, getInitials } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import { useNavigate } from 'react-router-dom';

export function Topbar({ onMenuToggle }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: medicines = [] } = useFirestoreQuery('medicines');

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    navigate('/login');
  };

  const criticalBatches = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(b.expiryDate);
    return d <= 7 && d >= 0;
  });

  const warningBatches = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(b.expiryDate);
    return d > 7 && d <= 30;
  });

  const lowStockCount = medicines.filter(med => {
    const total = batches
      .filter(b => b.medicineId === med.id && b.status === 'active')
      .reduce((s, b) => s + b.quantityRemaining, 0);
    return total <= (med.reorderThreshold || 10);
  }).length;

  const totalAlerts = criticalBatches.length + warningBatches.length + lowStockCount;

  return (
    <header
      className="h-14 sticky top-0 z-30 px-3 sm:px-5 flex items-center justify-between border-b border-bdr"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded text-txt-muted hover:text-txt hover:bg-white/5 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Alerts Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded text-txt-muted hover:text-txt hover:bg-white/5 transition-colors"
            aria-label="Alerts"
          >
            <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 top-full mt-1.5 w-76 w-72 sm:w-80 rounded-lg shadow-lg border border-bdr z-50 overflow-hidden"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
                <h4 className="text-[12px] font-bold text-txt">Pharmacy Alerts</h4>
                <span className="text-[10px] text-txt-muted">{totalAlerts} active</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {criticalBatches.length > 0 && (
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/app/alerts'); }}
                    className="w-full text-left px-4 py-3 border-b border-bdr hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-danger">{criticalBatches.length} batch{criticalBatches.length > 1 ? 'es' : ''} expiring within 7 days</p>
                      <p className="text-[11px] text-txt-muted mt-0.5">Critical — immediate review required</p>
                    </div>
                  </button>
                )}
                {warningBatches.length > 0 && (
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/app/alerts'); }}
                    className="w-full text-left px-4 py-3 border-b border-bdr hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-warning">{warningBatches.length} batch{warningBatches.length > 1 ? 'es' : ''} expiring within 30 days</p>
                      <p className="text-[11px] text-txt-muted mt-0.5">Review stock rotation plan</p>
                    </div>
                  </button>
                )}
                {lowStockCount > 0 && (
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/app/alerts'); }}
                    className="w-full text-left px-4 py-3 border-b border-bdr hover:bg-white/5 transition-colors flex items-start gap-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12px] font-semibold text-warning">{lowStockCount} medicine{lowStockCount > 1 ? 's' : ''} below reorder level</p>
                      <p className="text-[11px] text-txt-muted mt-0.5">Place purchase orders</p>
                    </div>
                  </button>
                )}
                {totalAlerts === 0 && (
                  <div className="px-4 py-5 text-center">
                    <p className="text-[12px] text-txt-muted">All inventory alerts clear</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-bdr">
                <button
                  onClick={() => { setShowNotifications(false); navigate('/app/alerts'); }}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  View all alerts →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary text-white font-bold flex items-center justify-center text-[11px]">
              {getInitials(user?.fullName)}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-[12px] font-semibold text-txt block leading-tight">{user?.fullName || 'User'}</span>
              <span className="text-[10px] text-txt-muted capitalize">{user?.role || 'staff'}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-txt-muted hidden md:block" />
          </button>

          {showProfileMenu && (
            <div
              className="absolute right-0 top-full mt-1.5 w-44 rounded-lg shadow-lg border border-bdr py-1 z-50"
              style={{ backgroundColor: 'var(--color-bg-card)' }}
            >
              <div className="px-3 py-2 border-b border-bdr mb-1">
                <p className="text-[12px] font-bold text-txt truncate">{user?.fullName}</p>
                <p className="text-[10px] text-txt-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/'); }}
                className="w-full text-left px-3 py-1.5 text-[12px] text-txt-muted hover:text-txt hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Landing page
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setShowProfileMenu(false); navigate('/app/settings'); }}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-txt-muted hover:text-txt hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3" /> Settings
                </button>
              )}
              <div className="border-t border-bdr mt-1 pt-1">
                <button
                  onClick={() => { setShowProfileMenu(false); setShowLogoutConfirm(true); }}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-danger hover:bg-danger/10 flex items-center gap-2 font-medium transition-colors"
                >
                  <LogOut className="w-3 h-3" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to end your current session?"
        confirmLabel="Sign Out"
        variant="warning"
      />
    </header>
  );
}
