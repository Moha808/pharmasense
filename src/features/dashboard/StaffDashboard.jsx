import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import {
  ShoppingCart, Receipt, Package, AlertTriangle,
  Search, ScanBarcode, ArrowRight, Printer, Clock
} from 'lucide-react';
import { formatCurrency, formatDateTime, getDaysUntilExpiry, getIsoDateString } from '../../utils/formatters';
import { generatePdfReceipt } from '../../utils/receiptGenerator';
import toast from 'react-hot-toast';

export function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: allSales = [], loading: salesLoading } = useFirestoreQuery('sales');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: settings = [] } = useFirestoreQuery('settings');
  const activeSettings = settings[0] || {};

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const shiftLabel = currentHour >= 6 && currentHour < 14
    ? 'Morning shift active'
    : currentHour >= 14 && currentHour < 22
    ? 'Afternoon shift active'
    : 'Night shift active';

  // My sales today
  const todayStr = new Date().toISOString().slice(0, 10);
  const mySales = allSales.filter(s => s.cashierId === user?.uid || s.cashierName === user?.fullName);
  const myTodaySales = mySales.filter(s => {
    const iso = getIsoDateString(s.timestamp);
    return iso && iso.startsWith(todayStr);
  });
  const myTodayRevenue = myTodaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const myTodayItems = myTodaySales.reduce((sum, s) => sum + (s.items?.reduce((a, it) => a + it.quantity, 0) || 0), 0);

  // Alerts for this staff member
  const criticalBatches = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(getIsoDateString(b.expiryDate) || b.expiryDate);
    return d >= 0 && d <= 7;
  });
  const lowStockCount = medicines.filter(med => {
    const total = batches
      .filter(b => b.medicineId === med.id && b.status === 'active')
      .reduce((acc, b) => acc + b.quantityRemaining, 0);
    return total <= (med.reorderThreshold || 15);
  }).length;

  const myTotalRevenue = mySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const handlePrintReceipt = (sale) => {
    try {
      generatePdfReceipt(sale, activeSettings);
      toast.success(`Receipt ${sale.saleId || sale.id} downloaded`);
    } catch {
      toast.error('Could not generate receipt PDF');
    }
  };

  const columns = [
    { header: 'Receipt', render: s => <span className="font-mono text-[12px] font-bold text-primary">{s.saleId || s.id}</span> },
    { header: 'Time', render: s => <span className="text-[12px] text-txt-muted">{formatDateTime(s.timestamp)}</span> },
    { header: 'Items', render: s => <span className="text-[12px] text-txt-muted">{s.items?.length || 0}</span> },
    { header: 'Total', align: 'right', render: s => <span className="text-[12px] font-bold text-txt">{formatCurrency(s.totalAmount)}</span> },
    {
      header: 'Method', align: 'center',
      render: s => <Badge variant={s.paymentMethod === 'Cash' ? 'success' : 'primary'} size="sm">{s.paymentMethod || 'Cash'}</Badge>
    },
    {
      header: '', align: 'center',
      render: s => (
        <button
          onClick={() => handlePrintReceipt(s)}
          className="p-1.5 text-txt-muted hover:text-primary transition-colors"
          title="Print receipt"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      )
    },
  ];

  return (
    <div className="space-y-5">
      {/* ── Compact Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[11px] text-txt-muted mb-0.5">{dateLabel} &middot; {shiftLabel}</p>
          <h1 className="text-xl font-semibold text-txt">
            {greeting}, {user?.fullName?.split(' ')[0] || 'Pharmacist'}
          </h1>
          <p className="text-xs text-txt-muted mt-0.5">
            Shift overview and dispensing console.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/app/pos')}
          icon={ShoppingCart}
          variant="primary"
        >
          New Dispensing
        </Button>
      </div>

      {/* ── Alert Strip (conditional) ───────────────────────────────────── */}
      {(criticalBatches.length > 0 || lowStockCount > 0) && (
        <button
          onClick={() => navigate('/app/alerts')}
          className="w-full text-left px-4 py-2.5 border border-warning/30 bg-warning/8 flex items-center justify-between gap-3 hover:bg-warning/12 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <div className="flex flex-wrap gap-x-4 gap-y-0.5">
              {criticalBatches.length > 0 && (
                <span className="text-[12px] font-medium text-warning">
                  {criticalBatches.length} batch{criticalBatches.length > 1 ? 'es' : ''} expiring within 7 days
                </span>
              )}
              {lowStockCount > 0 && (
                <span className="text-[12px] font-medium text-warning">
                  {lowStockCount} medicine{lowStockCount > 1 ? 's' : ''} below reorder level
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] text-txt-muted flex-shrink-0">View alerts &rarr;</span>
        </button>
      )}

      {/* ── Dispensing Workspace ────────────────────────────────────────── */}
      <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="px-4 py-3 border-b border-bdr">
          <h2 className="text-xs font-semibold text-txt">Dispensing Workspace</h2>
          <p className="text-[11px] text-txt-muted mt-0.5">FEFO batch allocation is active — earliest expiry dispensed first</p>
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/app/pos')}
              className="flex-1 flex items-center gap-3 px-3.5 py-2.5 border border-bdr text-left transition-colors hover:border-txt-light hover:bg-white/3"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              <Search className="w-4 h-4 text-txt-muted flex-shrink-0" />
              <span className="text-xs text-txt-muted">Search medicine, barcode or batch number...</span>
            </button>
            <button
              onClick={() => navigate('/app/pos')}
              className="flex items-center gap-2 px-3.5 py-2.5 border border-primary/30 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/15 transition-colors flex-shrink-0"
            >
              <ScanBarcode className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Barcode</span>
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Paracetamol', 'Amoxicillin', 'Metronidazole', 'Omeprazole'].map(name => (
              <button
                key={name}
                onClick={() => navigate('/app/pos')}
                className="px-2.5 py-1 border border-bdr text-[11px] text-txt-muted hover:text-txt hover:border-txt-light transition-colors"
                style={{ backgroundColor: 'var(--color-bg-alt)' }}
              >
                {name}
              </button>
            ))}
            <button
              onClick={() => navigate('/app/medicines')}
              className="px-2.5 py-1 border border-bdr text-[11px] text-primary hover:underline transition-colors"
              style={{ backgroundColor: 'var(--color-bg-alt)' }}
            >
              Browse all &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ── Shift Stats Strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-bdr border border-bdr">
        {[
          { label: "My Total Revenue", value: formatCurrency(myTotalRevenue), sub: `Today: ${formatCurrency(myTodayRevenue)}`, icon: Receipt },
          { label: "Today's Transactions", value: myTodaySales.length, sub: 'Orders completed today', icon: ShoppingCart },
          { label: "Today's Units", value: myTodayItems, sub: 'Medicines dispensed today', icon: Package },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-3.5 h-3.5 text-txt-light" />
                <span className="text-[11px] text-txt-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-txt tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-txt-muted mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── Recent Dispensing Activity ──────────────────────────────────── */}
      <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-txt">My Dispensing Activity</h2>
            <p className="text-[11px] text-txt-muted mt-0.5">Your sales records for this shift</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/sales')} icon={ArrowRight}>
            All records
          </Button>
        </div>
        <Table
          columns={columns}
          data={mySales.slice(0, 5)}
          loading={salesLoading}
          emptyTitle="No dispensing activity yet"
          emptyDescription="Click 'New Dispensing' to start processing customer orders."
          pageSize={5}
        />
      </div>
    </div>
  );
}
