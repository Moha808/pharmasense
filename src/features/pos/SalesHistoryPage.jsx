import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { ReceiptModal } from './ReceiptModal';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { generatePdfReceipt } from '../../utils/receiptGenerator';
import { Receipt, Printer, Eye, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export function SalesHistoryPage() {
  const { user, isAdmin } = useAuth();
  const { data: allSales = [], loading: salesLoading } = useFirestoreQuery('sales');
  const { data: settings = [] } = useFirestoreQuery('settings');
  const activeSettings = settings[0] || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Role security: Staff sees only own sales
  const sales = isAdmin 
    ? allSales 
    : allSales.filter(s => s.cashierId === user?.uid || s.cashierName === user?.fullName);

  const filteredSales = sales.filter(s =>
    (s.saleId || s.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cashierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.items?.some(it => it.medicineName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenReceipt = (sale) => {
    setSelectedSale(sale);
    setReceiptModalOpen(true);
  };

  const handleDirectPdf = (sale) => {
    try {
      generatePdfReceipt(sale, activeSettings);
      toast.success(`Receipt PDF for #${sale.saleId || sale.id} downloaded`);
    } catch {
      toast.error('Could not generate PDF');
    }
  };

  const columns = [
    {
      header: 'Receipt ID',
      render: (s) => (
        <span className="font-mono font-bold text-primary">{s.saleId || s.id}</span>
      )
    },
    {
      header: 'Date & Time',
      render: (s) => <span className="text-text-muted">{formatDateTime(s.timestamp)}</span>
    },
    ...(isAdmin ? [{
      header: 'Cashier Staff',
      render: (s) => <span className="font-semibold text-text-main">{s.cashierName || 'Staff Cashier'}</span>
    }] : []),
    {
      header: 'Items Dispensed',
      render: (s) => (
        <div>
          <span className="font-semibold block text-text-main">{s.items?.length || 0} unique item(s)</span>
          <span className="text-[10px] text-text-muted">
            {s.items?.map(it => `${it.quantity}x ${it.medicineName}`).join(', ')}
          </span>
        </div>
      )
    },
    {
      header: 'Total Paid',
      align: 'right',
      render: (s) => <strong className="text-text-main font-bold text-sm">{formatCurrency(s.totalAmount)}</strong>
    },
    {
      header: 'Payment Mode',
      align: 'center',
      render: (s) => (
        <Badge variant={s.paymentMethod === 'Cash' ? 'success' : 'primary'} size="sm">
          {s.paymentMethod || 'Cash'}
        </Badge>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => handleOpenReceipt(s)}
            title="View Receipt"
          >
            Receipt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Printer}
            onClick={() => handleDirectPdf(s)}
            title="Download PDF"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Pharmacy Sales Ledger" : "My Dispensed Sales"}
        subtitle={isAdmin ? "Pharmacy-wide transaction history across all active registers" : "Your completed transaction receipts for this shift"}
      />

      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by receipt ID, cashier, or medicine..."
          className="w-full max-w-md"
        />
      </div>

      <Table
        columns={columns}
        data={filteredSales}
        loading={salesLoading}
        emptyTitle="No transactions recorded"
        emptyDescription="Complete your first sale in the POS module to generate sales records."
        emptyIcon={Receipt}
      />

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
        settings={activeSettings}
      />
    </div>
  );
}
