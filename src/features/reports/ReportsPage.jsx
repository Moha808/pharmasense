import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
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
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export function ReportsPage() {
  const { user, isAdmin } = useAuth();
  const isDark = true; // App is locked to Deep Navy dark theme

  const { data: sales = [], loading: salesLoading } = useFirestoreQuery('sales');
  const { data: medicines = [] } = useFirestoreQuery('medicines');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: users = [] } = useFirestoreQuery('users');
  const { data: categories = [] } = useFirestoreQuery('categories');

  // Total Revenue & Volume
  const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalTransactions = sales.length;

  // Inventory Cost & Selling Valuation
  const totalCostValuation = batches
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + (b.costPrice * b.quantityRemaining), 0);

  const totalRetailValuation = batches
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + (b.sellingPrice * b.quantityRemaining), 0);

  const estimatedProfitMargin = totalRetailValuation > 0 
    ? Math.round(((totalRetailValuation - totalCostValuation) / totalRetailValuation) * 100)
    : 0;

  // Top Selling Medicines Aggregation
  const medicineSalesMap = {};
  sales.forEach(s => {
    s.items?.forEach(it => {
      if (!medicineSalesMap[it.medicineId]) {
        medicineSalesMap[it.medicineId] = {
          name: it.medicineName,
          totalQty: 0,
          totalRevenue: 0
        };
      }
      medicineSalesMap[it.medicineId].totalQty += it.quantity;
      medicineSalesMap[it.medicineId].totalRevenue += it.subtotal;
    });
  });

  const topMedicines = Object.values(medicineSalesMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Staff Sales Performance Aggregation
  const staffSalesMap = {};
  sales.forEach(s => {
    const cashierKey = s.cashierName || 'Staff Member';
    if (!staffSalesMap[cashierKey]) {
      staffSalesMap[cashierKey] = {
        name: cashierKey,
        cashierId: s.cashierId,
        salesCount: 0,
        totalRevenue: 0
      };
    }
    staffSalesMap[cashierKey].salesCount += 1;
    staffSalesMap[cashierKey].totalRevenue += s.totalAmount;
  });

  const staffPerformance = Object.values(staffSalesMap)
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Category Distribution for Pie Chart
  const COLORS = ['#119b8d', '#2878c8', '#d59624', '#7956b7', '#168b66', '#d8545d'];
  const categoryData = categories.map((cat, idx) => {
    const medCount = medicines.filter(m => m.categoryId === cat.id).length;
    return {
      name: cat.name,
      value: medCount || 1,
      color: COLORS[idx % COLORS.length]
    };
  }).filter(c => c.value > 0);

  // Top Medicines Table Columns
  const topMedColumns = [
    {
      header: 'Medicine Product',
      render: (m) => <span className="font-bold text-txt">{m.name}</span>
    },
    {
      header: 'Units Dispensed',
      align: 'center',
      render: (m) => <span className="font-mono font-semibold text-txt">{m.totalQty} units</span>
    },
    {
      header: 'Revenue Generated',
      align: 'right',
      render: (m) => <strong className="text-primary font-bold">{formatCurrency(m.totalRevenue)}</strong>
    }
  ];

  // Staff Columns
  const staffColumns = [
    {
      header: 'Cashier Staff',
      render: (st) => <span className="font-bold text-txt">{st.name}</span>
    },
    {
      header: 'Transactions',
      align: 'center',
      render: (st) => <span className="font-mono text-txt">{st.salesCount} order(s)</span>
    },
    {
      header: 'Total Gross Collected',
      align: 'right',
      render: (st) => <strong className="text-primary font-bold">{formatCurrency(st.totalRevenue)}</strong>
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Pharmacy Analytics"
        subtitle="Comprehensive financial, dispensing velocity, and inventory valuation reports"
      />

      {/* High Level Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="All-Time Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${totalTransactions} total transactions`}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Retail Inventory Value"
          value={formatCurrency(totalRetailValuation)}
          subtitle="Estimated retail inventory"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Inventory Cost Value"
          value={formatCurrency(totalCostValuation)}
          subtitle="Total supplier acquisition cost"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Estimated Gross Margin"
          value={`${estimatedProfitMargin}%`}
          subtitle="Average markup spread"
          icon={BarChart3}
          color="success"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products Breakdown */}
        <Card
          title="Top Selling Medications by Revenue"
          subtitle="Performance ranked by gross dispensed value"
          className="lg:col-span-7"
        >
          <Table
            columns={topMedColumns}
            data={topMedicines}
            emptyTitle="No dispensing data yet"
            emptyDescription="Dispense medicines through POS to populate sales analytics."
          />
        </Card>

        {/* Category Distribution Chart */}
        <Card
          title="Catalog Category Distribution"
          subtitle="Inventory composition across drug classes"
          className="lg:col-span-5"
        >
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#162a2e' : '#ffffff',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? '#244349' : '#e3eded'}`,
                    color: isDark ? '#e4f0f2' : '#183a3e',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: isDark ? '#9fb5b9' : '#819396' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Staff Cashier Performance Leaderboard */}
      <Card
        title="Cashier & Staff Sales Performance"
        subtitle="Individual dispensing volume and register collections"
      >
        <Table
          columns={staffColumns}
          data={staffPerformance}
          emptyTitle="No staff sales records"
          emptyDescription="Sales will be mapped to active cashiers automatically."
        />
      </Card>
    </div>
  );
}
