import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDateTime } from './formatters';

export function generatePdfReceipt(sale, settings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // 80mm standard thermal / receipt width
  });

  const pharmacyName = settings.pharmacyName || 'PharmaSense Pharmacy';
  const address = settings.address || 'Victoria Island, Lagos';
  const phone = settings.phone || '+234 800 PHARMASENSE';
  const nafdacLic = settings.nafdacLicense || 'PCN-REG-2026-8841';

  let y = 10;

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(pharmacyName, 40, y, { align: 'center' });
  y += 5;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(address, 40, y, { align: 'center' });
  y += 3.5;
  doc.text(`Tel: ${phone}`, 40, y, { align: 'center' });
  y += 3.5;
  doc.text(`Lic: ${nafdacLic}`, 40, y, { align: 'center' });
  y += 5;

  // Divider
  doc.setLineDash([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 4;

  // Sale metadata
  doc.setFontSize(7.5);
  doc.text(`Receipt #: ${sale.saleId || sale.id}`, 5, y);
  y += 3.5;
  doc.text(`Date: ${formatDateTime(sale.timestamp)}`, 5, y);
  y += 3.5;
  doc.text(`Cashier: ${sale.cashierName || 'Staff Cashier'}`, 5, y);
  y += 4;

  // Table of items
  const tableData = sale.items.map(item => [
    item.medicineName || 'Medicine',
    `${item.quantity}`,
    formatCurrency(item.unitPrice),
    formatCurrency(item.subtotal)
  ]);

  doc.autoTable({
    startY: y,
    head: [['Item', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      overflow: 'linebreak'
    },
    headStyles: {
      fontStyle: 'bold',
      borderBottomWidth: 0.5
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 14, halign: 'right' },
      3: { cellWidth: 16, halign: 'right' }
    },
    margin: { left: 4, right: 4 }
  });

  y = doc.lastAutoTable.finalY + 3;

  // Summary
  doc.setLineDash([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT:', 5, y);
  doc.text(formatCurrency(sale.totalAmount), 75, y, { align: 'right' });
  y += 4;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment: ${sale.paymentMethod || 'Cash'}`, 5, y);
  doc.text(`Paid: ${formatCurrency(sale.amountPaid || sale.totalAmount)}`, 75, y, { align: 'right' });
  y += 3.5;

  if (sale.change > 0) {
    doc.text('Change:', 5, y);
    doc.text(formatCurrency(sale.change), 75, y, { align: 'right' });
    y += 4;
  }

  // Footer
  y += 3;
  doc.setLineDash([1, 1], 0);
  doc.line(5, y, 75, y);
  y += 4;

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.text(settings.receiptFooter || 'Thank you for your patronage! Quick recovery.', 40, y, { align: 'center' });
  y += 3;
  doc.text('Dispensed by PharmaSense System', 40, y, { align: 'center' });

  // Save PDF
  doc.save(`Receipt_${sale.saleId || sale.id}.pdf`);
}
