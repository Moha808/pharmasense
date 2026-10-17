import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Table } from '../../components/common/Table';
import {
  DollarSign, Pill, AlertTriangle, Clock, ShoppingCart,
  PlusCircle, Layers, ArrowRight, TrendingUp, Package,
  ChevronRight, Activity
} from 'lucide-react';
import {
  formatCurrency, formatDateTime, getDaysUntilExpiry, getIsoDateString
} from '../../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: sales = [], loading: salesLoading } = useFirestoreQuery('sales');
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: categories = [] } = useFirestoreQuery('categories');

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Today metrics
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter(s => {
    const iso = getIsoDateString(s.timestamp);
    return iso && iso.startsWith(todayStr);
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  // Inventory health
  const activeBatches = batches.filter(b => b.status === 'active');
  const totalStock = activeBatches.reduce((sum, b) => sum + (b.quantityRemaining || 0), 0);

  // Expiry buckets
  const critical7 = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(getIsoDateString(b.expiryDate) || b.expiryDate);
    return d >= 0 && d <= 7;
  });
  const warning30 = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(getIsoDateString(b.expiryDate) || b.expiryDate);
    return d > 7 && d <= 30;
  });
  const expiring60 = batches.filter(b => {
    if (b.status !== 'active' || b.quantityRemaining <= 0) return false;
    const d = getDaysUntilExpiry(getIsoDateString(b.expiryDate) || b.expiryDate);
    return d >= 0 && d <= 60;
  });

  // Low stock
  const lowStockMedicines = medicines.filter(med => {
    const total = batches
      .filter(b => b.medicineId === med.id && b.status === 'active')
      .reduce((acc, b) => acc + b.quantityRemaining, 0);
    return total <= (med.reorderThreshold || 15);
  });

  const needsAttention = critical7.length + warning30.length + lowStockMedicines.length;

  // 7-day chart
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayIso = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' });
    const dayTotal = sales
      .filter(s => { const iso = getIsoDateString(s.timestamp); return iso && iso.startsWith(dayIso); })
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    return { name: dayLabel, revenue: dayTotal };
  });

  const recentSalesColumns = [
    { header: 'Receipt', render: s => <span className="font-mono text-[12px] font-bold text-primary">{s.saleId || s.id}</span> },
    { header: 'Date & Time', render: s => <span className="text-[12px] text-txt-muted">{formatDateTime(s.timestamp)}</span> },
    { header: 'Cashier', render: s => <span className="text-[12px] text-txt">{s.cashierName || '—'}</span> },
    { header: 'Items', render: s => <span className="text-[12px] text-txt-muted">{s.items?.length || 0}</span> },
    {
      header: 'Total', align: 'right',
      render: s => <span className="text-[12px] font-bold text-txt">{formatCurrency(s.totalAmount)}</span>
    },
    {
      header: 'Method', align: 'center',
      render: s => (
        <Badge variant={s.paymentMethod === 'Cash' ? 'success' : 'primary'} size="sm">
          {s.paymentMethod || 'Cash'}
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-0">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="pb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[11px] text-txt-muted mb-0.5">{dateLabel}</p>
          <h1 className="text-xl font-semibold text-txt">
            {greeting}, {user?.fullName?.split(' ')[0] || 'Administrator'}
          </h1>
          <p className="text-xs text-txt-muted mt-0.5">
            Pharmacy operations overview for today.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button
            size="sm"
            onClick={() => navigate('/app/medicines')}
            icon={PlusCircle}
            variant="secondary"
          >
            Add Medicine
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/app/pos')}
            icon={ShoppingCart}
            variant="primary"
          >
            Launch POS
          </Button>
        </div>
      </div>

      {/* ── KPI Strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-bdr border border-bdr mb-5">
        {[
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            sub: `Today: ${formatCurrency(todayRevenue)} (${todaySales.length} sales)`,
            icon: DollarSign, iconColor: 'text-primary', accent: '#0D9488',
            onClick: () => navigate('/app/sales'),
          },
          {
            label: 'Total Medicines',
            value: medicines.length,
            sub: `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`,
            icon: Pill, iconColor: 'text-blue-400', accent: '#60a5fa',
            onClick: () => navigate('/app/medicines'),
          },
          {
            label: 'Low Stock',
            value: lowStockMedicines.length,
            sub: lowStockMedicines.length > 0 ? 'Below reorder level' : 'All levels healthy',
            icon: AlertTriangle,
            iconColor: lowStockMedicines.length > 0 ? 'text-warning' : 'text-success',
            accent: lowStockMedicines.length > 0 ? '#F59E0B' : '#22C55E',
            onClick: () => navigate('/app/alerts'),
          },
          {
            label: 'Expiring ≤ 30 days',
            value: warning30.length + critical7.length,
            sub: critical7.length > 0 ? `${critical7.length} critical (≤7 days)` : 'No critical batches',
            icon: Clock,
            iconColor: critical7.length > 0 ? 'text-danger' : warning30.length > 0 ? 'text-warning' : 'text-success',
            accent: critical7.length > 0 ? '#EF4444' : warning30.length > 0 ? '#F59E0B' : '#22C55E',
            onClick: () => navigate('/app/alerts'),
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <button
              key={i}
              onClick={kpi.onClick}
              className="bg-bg-card hover:bg-bg-alt transition-colors p-4 text-left group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-semibold text-txt-muted uppercase tracking-wide">{kpi.label}</span>
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: kpi.accent + '18' }}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.iconColor}`} />
                </div>
              </div>
              <p className="text-[22px] font-bold text-txt leading-none mb-1">{kpi.value}</p>
              <p className="text-[11px] text-txt-muted">{kpi.sub}</p>
            </button>
          );
        })}
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left column: Needs Attention + Recent Sales */}
        <div className="xl:col-span-2 space-y-5">

          {/* Needs Attention Panel */}
          {needsAttention > 0 && (
            <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
              <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                  <h2 className="text-xs font-semibold text-txt">Needs Attention</h2>
                  <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-warning/15 text-warning">{needsAttention}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/alerts')}>View all</Button>
              </div>
              <div className="divide-y divide-bdr">
                {critical7.length > 0 && (
                  <button
                    onClick={() => navigate('/app/alerts')}
                    className="w-full text-left px-4 py-3 hover:bg-white/3 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
                      <div>
                        <p className="text-[12.5px] font-medium text-danger">
                          {critical7.length} batch{critical7.length > 1 ? 'es' : ''} expiring within 7 days
                        </p>
                        <p className="text-[11px] text-txt-muted mt-0.5">Immediate disposal or return action required</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-txt-light flex-shrink-0" />
                  </button>
                )}
                {warning30.length > 0 && (
                  <button
                    onClick={() => navigate('/app/alerts')}
                    className="w-full text-left px-4 py-3 hover:bg-white/3 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                      <div>
                        <p className="text-[12.5px] font-medium text-warning">
                          {warning30.length} batch{warning30.length > 1 ? 'es' : ''} expiring within 30 days
                        </p>
                        <p className="text-[11px] text-txt-muted mt-0.5">Review stock rotation — prioritize in dispensing</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-txt-light flex-shrink-0" />
                  </button>
                )}
                {lowStockMedicines.slice(0, 3).map(med => (
                  <button
                    key={med.id}
                    onClick={() => navigate('/app/medicines')}
                    className="w-full text-left px-4 py-3 hover:bg-white/3 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0" />
                      <div>
                        <p className="text-[12.5px] font-medium text-txt">{med.name}</p>
                        <p className="text-[11px] text-txt-muted mt-0.5">
                          Below reorder level — threshold: {med.reorderThreshold || 15} units
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-txt-light flex-shrink-0" />
                  </button>
                ))}
                {lowStockMedicines.length > 3 && (
                  <button
                    onClick={() => navigate('/app/alerts')}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/3 transition-colors"
                  >
                    <p className="text-[11px] text-primary font-medium">
                      +{lowStockMedicines.length - 3} more medicines below reorder level
                    </p>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 border-b border-bdr flex items-center justify-between">
              <div>
                <h2 className="text-xs font-semibold text-txt">Recent Transactions</h2>
                <p className="text-[11px] text-txt-muted mt-0.5">Latest point-of-sale activity</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/sales')} icon={ArrowRight}>
                All sales
              </Button>
            </div>
            <Table
              columns={recentSalesColumns}
              data={sales.slice(0, 6)}
              loading={salesLoading}
              emptyTitle="No sales recorded yet"
              emptyDescription="Process your first sale through the Point of Sale."
              pageSize={6}
            />
          </div>
        </div>

        {/* Right column: Revenue chart + Inventory summary */}
        <div className="space-y-5">
          {/* 7-Day Revenue Chart */}
          <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-xs font-semibold text-txt">Revenue — 7 Days</h2>
              <p className="text-[11px] text-txt-muted mt-0.5">Daily sales in Nigerian Naira</p>
            </div>
            <div className="p-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E3840" vertical={false} />
                    <XAxis dataKey="name" stroke="#526373" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#526373" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v > 0 ? `₦${(v/1000).toFixed(0)}k` : '0'} />
                    <Tooltip
                      formatter={v => [formatCurrency(v), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#111F26',
                        border: '1px solid #1E3840',
                        borderRadius: '0',
                        color: '#E8EEF2',
                        fontSize: '12px',
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="revenue" fill="#0D9488" radius={[2, 2, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 pt-3 border-t border-bdr flex justify-between items-center">
                <span className="text-[11px] text-txt-muted">All-time revenue</span>
                <span className="text-sm font-semibold text-txt tabular-nums">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-xs font-semibold text-txt">Inventory Summary</h2>
            </div>
            <div className="divide-y divide-bdr">
              {[
                { label: 'Active batches', value: activeBatches.length, icon: Package, onClick: () => navigate('/app/batches') },
                { label: 'Total units in stock', value: totalStock.toLocaleString(), icon: Layers, onClick: () => navigate('/app/batches') },
                { label: 'Expiring within 60 days', value: expiring60.length, icon: Clock, onClick: () => navigate('/app/alerts'), warn: expiring60.length > 0 },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <button
                    key={i}
                    onClick={row.onClick}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-txt-light" />
                      <span className="text-[12px] text-txt-muted">{row.label}</span>
                    </div>
                    <span className={`text-[12px] font-semibold tabular-nums ${row.warn ? 'text-warning' : 'text-txt'}`}>{row.value}</span>
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-bdr">
              <button
                onClick={() => navigate('/app/batches')}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                Manage batches & stock
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border border-bdr overflow-hidden" style={{ backgroundColor: 'var(--color-bg-card)' }}>
            <div className="px-4 py-3 border-b border-bdr">
              <h2 className="text-xs font-semibold text-txt">Quick Actions</h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Receive stock',  sub: 'Batch stock-in',   path: '/app/batches' },
                { label: 'Add supplier',   sub: 'Supplier profile',  path: '/app/suppliers' },
                { label: 'View reports',   sub: 'Sales analytics',   path: '/app/reports' },
                { label: 'Audit trail',    sub: 'System log',        path: '/app/audit-log' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => navigate(item.path)}
                  className="text-left p-3 border border-bdr hover:border-txt-light hover:bg-white/3 transition-all"
                  style={{ backgroundColor: 'var(--color-bg-alt)' }}
                >
                  <p className="text-[11.5px] font-medium text-txt">{item.label}</p>
                  <p className="text-[10px] text-txt-muted mt-0.5">{item.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
