import React from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { generatePdfReceipt } from '../../utils/receiptGenerator';
import { Printer, Download, CheckCircle2, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export function ReceiptModal({ isOpen, onClose, sale = null, settings = {} }) {
  if (!sale) return null;

  const handleDownloadPdf = () => {
    try {
      generatePdfReceipt(sale, settings);
      toast.success('Receipt PDF generated successfully!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const pharmacyName = settings.pharmacyName || 'PharmaSense Community Pharmacy';
  const address = settings.address || 'Victoria Island, Lagos, Nigeria';
  const phone = settings.phone || '+234 800 PHARMASENSE';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispensed Order Receipt"
      subtitle={`Transaction #${sale.saleId || sale.id}`}
      size="md"
    >
      <div className="space-y-4">
        {/* On-Screen Printable Thermal Receipt Card */}
        <div id="printable-receipt" className="bg-surface-alt/70 p-6 rounded-2xl border border-dashed border-border font-mono text-xs text-text-main shadow-xs">
          {/* Header */}
          <div className="text-center pb-3 border-b border-border border-dashed">
            <h3 className="font-bold text-sm text-text-main uppercase">{pharmacyName}</h3>
            <p className="text-[10px] text-text-muted mt-0.5">{address}</p>
            <p className="text-[10px] text-text-muted">Tel: {phone}</p>
            <p className="text-[10px] text-text-muted">Lic: {settings.nafdacLicense || 'PCN-REG-2026-8841'}</p>
          </div>

          {/* Meta */}
          <div className="py-2.5 border-b border-border border-dashed text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Receipt #:</span>
              <strong className="text-text-main">{sale.saleId || sale.id}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Date & Time:</span>
              <span>{formatDateTime(sale.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Dispensed By:</span>
              <span>{sale.cashierName || 'Pharmacist Cashier'}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-border border-dashed space-y-2">
            <div className="flex justify-between font-bold text-[10px] uppercase text-text-muted pb-1 border-b border-border/40">
              <span className="w-1/2">Medicine</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-18 text-right">Total</span>
            </div>
            {sale.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px] leading-snug">
                <span className="w-1/2 font-semibold truncate">{item.medicineName}</span>
                <span className="w-12 text-center text-text-muted">x{item.quantity}</span>
                <span className="w-16 text-right text-text-muted">{formatCurrency(item.unitPrice)}</span>
                <span className="w-18 text-right font-bold text-text-main">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="py-3 border-b border-border border-dashed space-y-1.5 text-xs">
            <div className="flex justify-between font-extrabold text-sm text-text-main">
              <span>TOTAL AMOUNT:</span>
              <span className="text-primary">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Payment Mode:</span>
              <span className="font-semibold text-text-main">{sale.paymentMethod || 'Cash'}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Amount Tendered:</span>
              <span>{formatCurrency(sale.amountPaid || sale.totalAmount)}</span>
            </div>
            {sale.change > 0 && (
              <div className="flex justify-between text-text-muted">
                <span>Change Returned:</span>
                <span className="font-bold text-success">{formatCurrency(sale.change)}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center pt-3 text-[10px] text-text-muted italic space-y-0.5">
            <p>{settings.receiptFooter || 'Thank you for your patronage! Prompt recovery.'}</p>
            <p className="font-semibold text-text-main">PharmaSense Automated FEFO Dispensing</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Printer}
              onClick={handleBrowserPrint}
            >
              Print Thermal
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
