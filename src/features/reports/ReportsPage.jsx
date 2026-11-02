import React, { useState, useMemo } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Layers, 
  Pill, 
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  AlertOctagon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, getDaysUntilExpiry } from '../../utils/formatters';
import { isBatchExpired, getMedicineBatchStatus } from '../../utils/fefo';
import { exportReportToPdf, exportReportToCsv } from '../../utils/reportExporter';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const { user } = useAuth();

  // Fetch live database collections
  const { data: sales = [], loading: salesLoading } = useFirestoreQuery('sales');
  const { data: medicines = [], loading: medsLoading } = useFirestoreQuery('medicines');
  const { data: batches = [], loading: batchesLoading } = useFirestoreQuery('batches');
  const { data: suppliers = [] } = useFirestoreQuery('suppliers');
  const { data: users = [] } = useFirestoreQuery('users');
  const { data: categories = [] } = useFirestoreQuery('categories');
  const { data: settings = [] } = useFirestoreQuery('settings');
  const activeSettings = settings[0] || {};

  // Period Type: 'weekly' | 'monthly' | 'yearly' | 'custom'
  const [periodType, setPeriodType] = useState('monthly');

  // Period state references
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-11
  
  // Weekly offset (0 = current week, -1 = previous week, etc.)
  const [weekOffset, setWeekOffset] = useState(0);

  // Custom date range strings YYYY-MM-DD
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);
  const [customStartDate, setCustomStartDate] = useState(thirtyDaysAgoStr);
  const [customEndDate, setCustomEndDate] = useState(todayStr);

  // ── Calculate Start & End Date Boundaries ────────────────────────────
  const { startDate, endDate, periodLabel, dateRangeLabel } = useMemo(() => {
    let start = new Date();
    let end = new Date();
    let label = '';
    let rangeStr = '';

    if (periodType === 'weekly') {
      const now = new Date();
      // Adjust by weekOffset
      now.setDate(now.getDate() + (weekOffset * 7));
      const dayOfWeek = now.getDay(); // 0 is Sunday
      // Set to Monday of this week
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      start = new Date(now);
      start.setDate(now.getDate() + diffToMonday);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      const isCurrentWeek = weekOffset === 0;
      label = isCurrentWeek ? 'Current Week' : `Week of ${formatDate(start)}`;
      rangeStr = `${formatDate(start)} – ${formatDate(end)}`;
    } else if (periodType === 'monthly') {
      start = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
      end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

      const monthName = start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      label = monthName;
      rangeStr = `${formatDate(start)} – ${formatDate(end)}`;
    } else if (periodType === 'yearly') {
      start = new Date(selectedYear, 0, 1, 0, 0, 0, 0);
      end = new Date(selectedYear, 11, 31, 23, 59, 59, 999);

      label = `Year ${selectedYear}`;
      rangeStr = `1 Jan ${selectedYear} – 31 Dec ${selectedYear}`;
    } else if (periodType === 'custom') {
      start = new Date(`${customStartDate}T00:00:00.000`);
      end = new Date(`${customEndDate}T23:59:59.999`);
      label = 'Custom Period';
      rangeStr = `${formatDate(start)} – ${formatDate(end)}`;
    }

    return {
      startDate: start,
      endDate: end,
      periodLabel: label,
      dateRangeLabel: rangeStr
    };
  }, [periodType, selectedYear, selectedMonth, weekOffset, customStartDate, customEndDate]);

  // ── Filter Sales within Selected Period ─────────────────────────────
  const periodSales = useMemo(() => {
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();

    return sales.filter(s => {
      if (!s.timestamp) return false;
      const saleMs = new Date(s.timestamp).getTime();
      return !isNaN(saleMs) && saleMs >= startMs && saleMs <= endMs;
    });
  }, [sales, startDate, endDate]);

  // ── 1. Total Sales & Revenue Aggregations ────────────────────────────
  const totalRevenue = useMemo(() => {
    return periodSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [periodSales]);

  const totalTransactions = periodSales.length;

  const totalDrugUnitsSold = useMemo(() => {
    return periodSales.reduce((totalUnits, sale) => {
      const saleUnits = sale.items?.reduce((itemSum, item) => itemSum + (Number(item.quantity) || 0), 0) || 0;
      return totalUnits + saleUnits;
    }, 0);
  }, [periodSales]);

  const averageOrderValue = totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0;

  // Payment breakdown
  const paymentMethodSummary = useMemo(() => {
    const map = { Cash: 0, 'POS Card / Transfer': 0 };
    periodSales.forEach(s => {
      const method = s.paymentMethod === 'Cash' ? 'Cash' : 'POS Card / Transfer';
      map[method] = (map[method] || 0) + (Number(s.totalAmount) || 0);
    });
    return map;
  }, [periodSales]);

  // ── 2. Expired Drugs Inventory Aggregation ───────────────────────────
  const { expiredBatchesList, expiredUnitsCount, expiredCostValuation, expiredRetailValuation, expiredDrugsCount } = useMemo(() => {
    const expiredList = batches
      .filter(b => isBatchExpired(b.expiryDate) && Number(b.quantityRemaining) > 0)
      .map(b => {
        const med = medicines.find(m => m.id === b.medicineId);
        const sup = suppliers.find(s => s.id === b.supplierId);
        const cost = Number(b.costPrice) || 0;
        const sell = Number(b.sellingPrice) || 0;
        const qty = Number(b.quantityRemaining) || 0;

        return {
          ...b,
          medicineName: med?.name || 'Unknown Medicine',
          genericName: med?.genericName || '',
          supplierName: sup?.name || 'N/A',
          costPrice: cost,
          sellingPrice: sell,
          quantityRemaining: qty,
          costValuation: cost * qty,
          retailValuation: sell * qty,
          daysExpired: Math.abs(getDaysUntilExpiry(b.expiryDate))
        };
      })
      .sort((a, b) => b.costValuation - a.costValuation);

    const totalUnits = expiredList.reduce((sum, b) => sum + b.quantityRemaining, 0);
    const totalCost = expiredList.reduce((sum, b) => sum + b.costValuation, 0);
    const totalRetail = expiredList.reduce((sum, b) => sum + b.retailValuation, 0);
    const distinctMeds = new Set(expiredList.map(b => b.medicineId)).size;

    return {
      expiredBatchesList: expiredList,
      expiredUnitsCount: totalUnits,
      expiredCostValuation: totalCost,
      expiredRetailValuation: totalRetail,
      expiredDrugsCount: distinctMeds
    };
  }, [batches, medicines, suppliers]);

  // ── 3. Low-Stock Report Aggregation ─────────────────────────────────
  const lowStockMedicines = useMemo(() => {
    return medicines
      .map(med => {
        const status = getMedicineBatchStatus(med.id, batches);
        const threshold = Number(med.reorderThreshold) || 15;
        const validStock = status.totalValidStock;
        const shortfall = Math.max(0, threshold - validStock);
        const cat = categories.find(c => c.id === med.categoryId);

        return {
          ...med,
          categoryName: cat?.name || 'General',
          currentValidStock: validStock,
          totalExpiredStock: status.totalExpiredStock,
          threshold,
          shortfall,
          isLow: validStock <= threshold,
          isOut: validStock === 0,
          costPrice: Number(med.costPrice) || 0
        };
      })
      .filter(med => med.isLow)
      .sort((a, b) => a.currentValidStock - b.currentValidStock);
  }, [medicines, batches, categories]);

  // ── 4. Best-Selling Drugs Aggregation ────────────────────────────────
  const bestSellingDrugs = useMemo(() => {
    const medMap = {};

    periodSales.forEach(s => {
      s.items?.forEach(it => {
        const medId = it.medicineId || it.name;
        if (!medMap[medId]) {
          const med = medicines.find(m => m.id === it.medicineId);
          const cat = categories.find(c => c.id === med?.categoryId);
          medMap[medId] = {
            id: medId,
            name: it.medicineName || med?.name || 'Medicine',
            genericName: it.genericName || med?.genericName || '',
            category: cat?.name || 'General',
            totalQty: 0,
            totalRevenue: 0,
            unitPrice: Number(it.unitPrice) || 0
          };
        }
        medMap[medId].totalQty += (Number(it.quantity) || 0);
        medMap[medId].totalRevenue += (Number(it.subtotal) || 0);
      });
    });

    return Object.values(medMap)
      .map(d => ({
        ...d,
        averagePrice: d.totalQty > 0 ? (d.totalRevenue / d.totalQty) : d.unitPrice,
        percentageOfTotal: totalRevenue > 0 ? ((d.totalRevenue / totalRevenue) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [periodSales, medicines, categories, totalRevenue]);

  // ── 5. Staff Sales Performance Aggregation ──────────────────────────
  const staffPerformance = useMemo(() => {
    const staffMap = {};

    periodSales.forEach(s => {
      const cashierName = s.cashierName || 'Staff Member';
      const cashierId = s.cashierId || cashierName;

      if (!staffMap[cashierId]) {
        const userProfile = users.find(u => u.uid === cashierId || u.id === cashierId);
        staffMap[cashierId] = {
          id: cashierId,
          name: cashierName,
          role: userProfile?.role === 'admin' ? 'Administrator' : 'Staff Cashier',
          salesCount: 0,
          totalRevenue: 0,
          totalUnitsSold: 0
        };
      }

      staffMap[cashierId].salesCount += 1;
      staffMap[cashierId].totalRevenue += (Number(s.totalAmount) || 0);
      const unitsInSale = s.items?.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0) || 0;
      staffMap[cashierId].totalUnitsSold += unitsInSale;
    });

    return Object.values(staffMap)
      .map(st => ({
        ...st,
        averageOrderValue: st.salesCount > 0 ? (st.totalRevenue / st.salesCount) : 0,
        percentageOfTotal: totalRevenue > 0 ? ((st.totalRevenue / totalRevenue) * 100).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [periodSales, users, totalRevenue]);

  // ── 6. Trend Timeline Data for Charts ────────────────────────────────
  const salesTimelineData = useMemo(() => {
    if (periodSales.length === 0) return [];

    if (periodType === 'weekly') {
      // Days of the week (Mon to Sun)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const map = {};
      days.forEach(d => { map[d] = { period: d, revenue: 0, units: 0 }; });

      periodSales.forEach(s => {
        const d = new Date(s.timestamp);
        const dayIdx = (d.getDay() + 6) % 7; // Monday = 0
        const key = days[dayIdx];
        if (map[key]) {
          map[key].revenue += Number(s.totalAmount) || 0;
          map[key].units += s.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0;
        }
      });
      return days.map(d => map[d]);
    }

    if (periodType === 'monthly') {
      // Days of month
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const points = [];
      for (let day = 1; day <= daysInMonth; day++) {
        points.push({ period: `${day}`, revenue: 0, units: 0 });
      }

      periodSales.forEach(s => {
        const d = new Date(s.timestamp);
        const dayNum = d.getDate();
        if (points[dayNum - 1]) {
          points[dayNum - 1].revenue += Number(s.totalAmount) || 0;
          points[dayNum - 1].units += s.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0;
        }
      });
      return points;
    }

    if (periodType === 'yearly') {
      // 12 Months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const points = months.map(m => ({ period: m, revenue: 0, units: 0 }));

      periodSales.forEach(s => {
        const d = new Date(s.timestamp);
        const mIdx = d.getMonth();
        if (points[mIdx]) {
          points[mIdx].revenue += Number(s.totalAmount) || 0;
          points[mIdx].units += s.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0;
        }
      });
      return points;
    }

    // Custom
    const points = periodSales.slice(0, 15).map(s => ({
      period: formatDate(s.timestamp),
      revenue: Number(s.totalAmount) || 0,
      units: s.items?.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0) || 0
    }));
    return points;
  }, [periodSales, periodType, selectedYear, selectedMonth]);

  // Payment chart slices
  const paymentPieData = useMemo(() => {
    return [
      { name: 'Cash', value: paymentMethodSummary.Cash || 0, color: '#168b66' },
      { name: 'POS / Transfer', value: paymentMethodSummary['POS Card / Transfer'] || 0, color: '#2878c8' }
    ].filter(p => p.value > 0);
  }, [paymentMethodSummary]);

  // ── Handlers for Print and Exports ──────────────────────────────────
  const compiledReportData = {
    periodLabel,
    dateRangeLabel,
    generatedAt: new Date().toISOString(),
    generatedBy: user?.fullName || 'Pharmacy Administrator',
    totalRevenue,
    totalTransactions,
    totalDrugUnitsSold,
    averageOrderValue,
    expiredDrugsCount,
    expiredUnitsCount,
    expiredCostValuation,
    expiredRetailValuation,
    lowStockMedicines,
    bestSellingDrugs,
    staffPerformance,
    expiredBatchesList
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    try {
      exportReportToPdf(compiledReportData, activeSettings);
      toast.success('PDF report downloaded successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report');
    }
  };

  const handleExportCsv = () => {
    try {
      exportReportToCsv(compiledReportData, activeSettings);
      toast.success('Excel / CSV report exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export CSV report');
    }
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <PageHeader
          title="Reporting & Operational Audits"
          subtitle="Generate verified sales, revenue, expired inventory loss, and staff performance reports"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
            title="Print printable summary"
          >
            Print
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportCsv}
            title="Export to Excel or CSV"
          >
            Excel / CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportPdf}
            title="Download formatted audit PDF"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Printable Official Header (Only shown during print) */}
      <div className="hidden print:block border-b border-bdr pb-4 mb-4">
        <h1 className="text-xl font-bold text-txt">{activeSettings.pharmacyName || 'PharmaSense Pharmacy'}</h1>
        <p className="text-xs text-txt-muted">{activeSettings.address || 'Victoria Island, Lagos'} • Tel: {activeSettings.phone} • Lic: {activeSettings.nafdacLicense}</p>
        <div className="mt-2 pt-2 border-t border-bdr flex justify-between text-xs">
          <span className="font-bold">AUDIT REPORT: {periodLabel.toUpperCase()} ({dateRangeLabel})</span>
          <span>Generated: {formatDateTime(new Date())}</span>
        </div>
      </div>

      {/* Period Selection Controls Panel (Hidden in print) */}
      <div 
        className="p-4 border border-bdr rounded-xl space-y-4 print:hidden shadow-sm"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-surface-alt border border-bdr rounded-lg overflow-x-auto">
            {[
              { id: 'weekly', label: 'Weekly Report' },
              { id: 'monthly', label: 'Monthly Report' },
              { id: 'yearly', label: 'Yearly Report' },
              { id: 'custom', label: 'Custom Date Range' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPeriodType(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                  periodType === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-txt-muted hover:text-txt'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Date Range Indicator Badge */}
          <div className="flex items-center gap-2 text-xs text-txt-muted">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-txt">{dateRangeLabel}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary uppercase">
              {periodLabel}
            </span>
          </div>
        </div>

        {/* Dynamic Controls based on Period Type */}
        <div className="pt-3 border-t border-bdr flex items-center justify-between gap-4 flex-wrap">
          {periodType === 'weekly' && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setWeekOffset(w => w - 1)}
              >
                Previous Week
              </Button>
              <button
                onClick={() => setWeekOffset(0)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  weekOffset === 0
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-bdr text-txt hover:bg-white/4'
                }`}
              >
                Current Week
              </button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                onClick={() => setWeekOffset(w => w + 1)}
                disabled={weekOffset >= 0}
              >
                Next Week
              </Button>
            </div>
          )}

          {periodType === 'monthly' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-txt-muted">Month:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs bg-surface border border-bdr rounded-lg text-txt focus:outline-none focus:border-primary"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map((mName, idx) => (
                    <option key={idx} value={idx}>{mName}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-txt-muted">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs bg-surface border border-bdr rounded-lg text-txt focus:outline-none focus:border-primary"
                >
                  {[2024, 2025, 2026, 2027, 2028].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedMonth(today.getMonth());
                  setSelectedYear(today.getFullYear());
                }}
                className="text-xs text-primary hover:underline font-bold"
              >
                Reset to Current Month
              </button>
            </div>
          )}

          {periodType === 'yearly' && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-txt-muted">Select Year:</span>
              <div className="flex items-center gap-2">
                {[2024, 2025, 2026, 2027].map(yr => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      selectedYear === yr
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-bdr text-txt hover:bg-white/4'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {periodType === 'custom' && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-muted">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-surface border border-bdr rounded-lg text-txt focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-muted">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-surface border border-bdr rounded-lg text-txt focus:outline-none focus:border-primary"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCustomStartDate(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
                    setCustomEndDate(todayStr);
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-txt-muted"
                >
                  Last 7d
                </button>
                <button
                  onClick={() => {
                    setCustomStartDate(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
                    setCustomEndDate(todayStr);
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-txt-muted"
                >
                  Last 30d
                </button>
                <button
                  onClick={() => {
                    setCustomStartDate(new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10));
                    setCustomEndDate(todayStr);
                  }}
                  className="px-2 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-txt-muted"
                >
                  Last 90d
                </button>
              </div>
            </div>
          )}

          <div className="text-xs text-txt-muted">
            Matching Database Records: <strong className="text-primary">{periodSales.length} transaction(s)</strong>
          </div>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Period Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${totalTransactions} completed sale order(s)`}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Total Drugs Sold"
          value={`${totalDrugUnitsSold} Units`}
          subtitle={`Avg order: ${formatCurrency(averageOrderValue)}`}
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="Expired Drugs in Stock"
          value={`${expiredUnitsCount} Units`}
          subtitle={`Cost loss: ${formatCurrency(expiredCostValuation)}`}
          icon={AlertOctagon}
          color="danger"
        />
        <StatCard
          title="Low-Stock Alerts"
          value={`${lowStockMedicines.length} Medicines`}
          subtitle={`${lowStockMedicines.filter(m => m.isOut).length} completely out of stock`}
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      {/* Visual Analytics Grid (Hidden in print) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
        {/* Sales Trend Chart */}
        <Card
          title="Dispensing Velocity & Revenue Trend"
          subtitle={`Sales revenue distribution across ${periodLabel}`}
          className="lg:col-span-8"
        >
          {salesTimelineData.length > 0 ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesTimelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#244349" vertical={false} />
                  <XAxis dataKey="period" stroke="#819396" fontSize={11} />
                  <YAxis stroke="#819396" fontSize={11} tickFormatter={(val) => `₦${(val / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val, name) => [name === 'revenue' ? formatCurrency(val) : `${val} units`, name === 'revenue' ? 'Revenue' : 'Units Sold']}
                    contentStyle={{
                      backgroundColor: '#162a2e',
                      borderRadius: '8px',
                      border: '1px solid #244349',
                      color: '#e4f0f2',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="revenue" fill="#119b8d" radius={[4, 4, 0, 0]} name="revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-txt-muted">
              <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs font-semibold">No sales recorded during this selected period</p>
              <p className="text-[11px] mt-0.5">Dispense medications through the POS terminal to generate chart trends.</p>
            </div>
          )}
        </Card>

        {/* Payment Methods Distribution */}
        <Card
          title="Payment Method Breakdown"
          subtitle="Collections by tender method"
          className="lg:col-span-4"
        >
          {paymentPieData.length > 0 ? (
            <div className="h-64 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatCurrency(val), 'Amount Collected']}
                    contentStyle={{
                      backgroundColor: '#162a2e',
                      borderRadius: '8px',
                      border: '1px solid #244349',
                      color: '#e4f0f2',
                      fontSize: '11px'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#9fb5b9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full text-center text-[11px] text-txt-muted border-t border-bdr pt-2">
                Cash: <strong className="text-txt">{formatCurrency(paymentMethodSummary.Cash || 0)}</strong> • POS: <strong className="text-txt">{formatCurrency(paymentMethodSummary['POS Card / Transfer'] || 0)}</strong>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-center text-txt-muted text-xs">
              No transactions in period
            </div>
          )}
        </Card>
      </div>

      {/* ── SECTION 1: Best-Selling Drugs ──────────────────────────────── */}
      <Card
        title="1. Best-Selling Medications (Dispensing Velocity)"
        subtitle={`Ranked product volume and gross revenue contribution for ${periodLabel}`}
      >
        <Table
          columns={[
            {
              header: 'Rank',
              align: 'center',
              render: (_, idx) => <span className="font-mono text-xs font-bold text-primary">#{idx + 1}</span>
            },
            {
              header: 'Medicine Product',
              render: (m) => (
                <div>
                  <span className="font-bold text-txt block text-sm">{m.name}</span>
                  <span className="text-[11px] text-txt-muted">{m.genericName} • {m.category}</span>
                </div>
              )
            },
            {
              header: 'Units Dispensed',
              align: 'center',
              render: (m) => <span className="font-mono font-bold text-txt">{m.totalQty} units</span>
            },
            {
              header: 'Avg Selling Price',
              align: 'right',
              render: (m) => <span className="font-mono text-xs text-txt">{formatCurrency(m.averagePrice)}</span>
            },
            {
              header: 'Gross Revenue',
              align: 'right',
              render: (m) => <strong className="text-primary font-bold">{formatCurrency(m.totalRevenue)}</strong>
            },
            {
              header: 'Revenue Share',
              align: 'center',
              render: (m) => (
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, Number(m.percentageOfTotal))}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-txt-muted">{m.percentageOfTotal}%</span>
                </div>
              )
            }
          ]}
          data={bestSellingDrugs}
          emptyTitle="No dispensing records found"
          emptyDescription={`There were zero drug sales recorded during ${dateRangeLabel}.`}
        />
      </Card>

      {/* ── SECTION 2: Staff Sales Performance ─────────────────────────── */}
      <Card
        title="2. Staff Sales Performance & Cashier Reconciliation"
        subtitle={`Individual sales transactions, units dispensed, and cash/POS collections for ${periodLabel}`}
      >
        <Table
          columns={[
            {
              header: 'Staff Member',
              render: (st) => (
                <div>
                  <span className="font-bold text-txt block">{st.name}</span>
                  <span className="text-[10px] text-txt-muted capitalize">{st.role}</span>
                </div>
              )
            },
            {
              header: 'Transactions Handled',
              align: 'center',
              render: (st) => <span className="font-mono font-bold text-txt">{st.salesCount} sale(s)</span>
            },
            {
              header: 'Units Dispensed',
              align: 'center',
              render: (st) => <span className="font-mono text-txt">{st.totalUnitsSold} units</span>
            },
            {
              header: 'Avg Ticket Size',
              align: 'right',
              render: (st) => <span className="font-mono text-xs text-txt">{formatCurrency(st.averageOrderValue)}</span>
            },
            {
              header: 'Total Gross Collected',
              align: 'right',
              render: (st) => <strong className="text-primary font-bold">{formatCurrency(st.totalRevenue)}</strong>
            },
            {
              header: 'Contribution',
              align: 'center',
              render: (st) => (
                <Badge variant={Number(st.percentageOfTotal) > 50 ? 'primary' : 'neutral'} size="sm">
                  {st.percentageOfTotal}%
                </Badge>
              )
            }
          ]}
          data={staffPerformance}
          emptyTitle="No staff sales records in this period"
          emptyDescription="Sales will automatically attribute to cashier accounts when transactions occur."
        />
      </Card>

      {/* ── SECTION 3: Expired Drugs & Financial Loss Report ───────────── */}
      <Card
        title={`3. Expired Drugs Quarantine Report (${expiredUnitsCount} Units Blocked)`}
        subtitle="Audited batches that have passed expiry dates and are strictly prohibited from sale"
      >
        <div className="mb-4 p-3 bg-danger/5 border border-danger/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-danger flex-shrink-0" />
            <div>
              <span className="font-bold text-danger">Quarantined Stock Value Loss: </span>
              <strong className="text-txt">{formatCurrency(expiredCostValuation)}</strong> (Acquisition Cost) • Potential Retail Value: <strong className="text-txt">{formatCurrency(expiredRetailValuation)}</strong>
            </div>
          </div>
          <span className="px-2 py-1 rounded bg-danger/10 text-danger font-bold uppercase text-[10px] whitespace-nowrap">
            {expiredDrugsCount} Drug(s) Affected
          </span>
        </div>

        <Table
          columns={[
            {
              header: 'Medicine Product',
              render: (b) => (
                <div>
                  <span className="font-bold text-txt block text-sm">{b.medicineName}</span>
                  <span className="text-[11px] text-txt-muted">{b.genericName} • Supplier: {b.supplierName}</span>
                </div>
              )
            },
            {
              header: 'Batch Lot #',
              render: (b) => <span className="font-mono font-bold text-primary">{b.batchNumber}</span>
            },
            {
              header: 'Expiry Date',
              render: (b) => (
                <div>
                  <span className="font-semibold text-danger block">{formatDate(b.expiryDate)}</span>
                  <span className="text-[10px] text-danger/80 font-bold">Expired {b.daysExpired}d ago</span>
                </div>
              )
            },
            {
              header: 'Expired Units',
              align: 'center',
              render: (b) => (
                <span className="px-2 py-0.5 text-xs font-black bg-danger/10 text-danger border border-danger/30 rounded">
                  {b.quantityRemaining} units
                </span>
              )
            },
            {
              header: 'Unit Cost',
              align: 'right',
              render: (b) => <span className="font-mono text-xs text-txt">{formatCurrency(b.costPrice)}</span>
            },
            {
              header: 'Total Cost Loss',
              align: 'right',
              render: (b) => <strong className="text-danger font-bold">{formatCurrency(b.costValuation)}</strong>
            },
            {
              header: 'Status',
              align: 'center',
              render: () => <Badge variant="danger" size="sm" dot>BLOCKED</Badge>
            }
          ]}
          data={expiredBatchesList}
          emptyTitle="Zero Expired Batches in Inventory"
          emptyDescription="All current inventory batches are within valid expiration dates and safe for dispensing."
        />
      </Card>

      {/* ── SECTION 4: Low-Stock & Reorder Assessment ──────────────────── */}
      <Card
        title={`4. Low-Stock & Reorder Requirements (${lowStockMedicines.length} Medicines Flagged)`}
        subtitle="Catalog medicines whose valid unexpired stock is below minimum operating threshold"
      >
        <Table
          columns={[
            {
              header: 'Medicine & Generic',
              render: (m) => (
                <div>
                  <span className="font-bold text-txt block">{m.name}</span>
                  <span className="text-[11px] text-txt-muted">{m.genericName} • {m.categoryName}</span>
                </div>
              )
            },
            {
              header: 'Current Valid Stock',
              align: 'center',
              render: (m) => (
                <div>
                  <span className={`font-black text-sm block ${m.isOut ? 'text-danger' : 'text-warning'}`}>
                    {m.currentValidStock} units
                  </span>
                  {m.totalExpiredStock > 0 && (
                    <span className="text-[9.5px] text-danger font-medium">
                      ({m.totalExpiredStock} expired blocked)
                    </span>
                  )}
                </div>
              )
            },
            {
              header: 'Reorder Level',
              align: 'center',
              render: (m) => <span className="font-mono text-xs text-txt">{m.threshold} units</span>
            },
            {
              header: 'Shortfall Needed',
              align: 'center',
              render: (m) => <strong className="font-mono text-xs text-danger font-bold">+{m.shortfall} units</strong>
            },
            {
              header: 'Urgency Status',
              align: 'center',
              render: (m) => (
                <Badge variant={m.isOut ? 'danger' : 'warning'} size="sm" dot>
                  {m.isOut ? 'Out of Stock' : 'Low Stock'}
                </Badge>
              )
            },
            {
              header: 'Est. Restock Cost',
              align: 'right',
              render: (m) => (
                <div className="text-right">
                  <span className="font-bold text-txt block">{formatCurrency((m.costPrice || 0) * m.shortfall)}</span>
                  <span className="text-[10px] text-txt-muted">@ {formatCurrency(m.costPrice)}/unit</span>
                </div>
              )
            }
          ]}
          data={lowStockMedicines}
          emptyTitle="All Medicine Stock Levels Healthy"
          emptyDescription="No medicines are currently at or below minimum reorder levels."
        />
      </Card>
    </div>
  );
}
