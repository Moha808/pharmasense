import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate, formatDateTime } from './formatters';

/**
 * Professional multi-page PDF Report Exporter
 * Generates official administrative report with executive KPI metrics and detailed audit tables.
 */
export function exportReportToPdf(reportData, settings = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4' // 210 x 297 mm
  });

  const pharmacyName = settings.pharmacyName || 'PharmaSense Community Pharmacy';
  const address = settings.address || 'Victoria Island, Lagos, Nigeria';
  const phone = settings.phone || '+234 800 PHARMASENSE';
  const email = settings.email || 'care@pharmasense.ng';
  const nafdacLic = settings.nafdacLicense || 'PCN-REG-2026-8841';

  const {
    periodLabel,
    dateRangeLabel,
    generatedAt,
    generatedBy,
    totalRevenue,
    totalTransactions,
    totalDrugUnitsSold,
    averageOrderValue,
    expiredDrugCount,
    expiredUnitsCount,
    expiredCostValuation,
    expiredRetailValuation,
    lowStockMedicines,
    bestSellingDrugs,
    staffPerformance,
    expiredBatchesList
  } = reportData;

  const pageWidth = 210;
  const margin = 14;
  let y = 14;

  // ── Header ──────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(pharmacyName.toUpperCase(), margin, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(`${address}  •  Tel: ${phone}  •  Email: ${email}`, margin, 17);
  doc.text(`Premises / PCN License: ${nafdacLic}  •  Confidential Administrative Audit Document`, margin, 22);

  y = 35;

  // ── Report Title & Metadata ─────────────────────────────────────────
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`PHARMACY OPERATIONS & SALES REPORT (${periodLabel.toUpperCase()})`, margin, y);
  y += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`Reporting Period: ${dateRangeLabel}`, margin, y);
  doc.text(`Generated: ${formatDateTime(generatedAt)}  |  By: ${generatedBy || 'Administrator'}`, pageWidth - margin, y, { align: 'right' });
  y += 7;

  // ── Executive KPI Summary Grid ──────────────────────────────────────
  const kpiBoxWidth = (pageWidth - (margin * 2) - 9) / 4;
  const kpiBoxHeight = 18;

  const kpis = [
    { label: 'TOTAL REVENUE', value: formatCurrency(totalRevenue), sub: `${totalTransactions} orders completed` },
    { label: 'TOTAL DRUGS SOLD', value: `${totalDrugUnitsSold} Units`, sub: `Avg ${averageOrderValue ? formatCurrency(averageOrderValue) : '₦0'} / sale` },
    { label: 'EXPIRED INVENTORY', value: `${expiredUnitsCount} Units`, sub: `Loss: ${formatCurrency(expiredCostValuation)}` },
    { label: 'LOW STOCK ALERTS', value: `${lowStockMedicines.length} Medicines`, sub: 'Require urgent reorder' }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + (idx * (kpiBoxWidth + 3));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, kpiBoxWidth, kpiBoxHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, y + 5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.value, x + 3, y + 11);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.sub, x + 3, y + 15.5);
  });

  y += kpiBoxHeight + 8;

  // ── Section 1: Best-Selling Drugs Table ─────────────────────────────
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Best-Selling Medications (Dispensing Velocity)', margin, y);
  y += 3;

  const bestSellingRows = bestSellingDrugs.length > 0
    ? bestSellingDrugs.map((d, index) => [
        `#${index + 1}`,
        d.name,
        d.category || 'General',
        `${d.totalQty} units`,
        formatCurrency(d.averagePrice || d.unitPrice),
        formatCurrency(d.totalRevenue),
        `${d.percentageOfTotal}%`
      ])
    : [['—', 'No drug sales recorded in this reporting period', '—', '—', '—', '—', '—']];

  doc.autoTable({
    startY: y,
    head: [['Rank', 'Medicine Product', 'Category', 'Units Sold', 'Avg Price', 'Gross Revenue', '% Share']],
    body: bestSellingRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 32 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 26, halign: 'right' },
      6: { cellWidth: 18, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 2: Staff Sales Performance Table ────────────────────────
  if (y > 240) { doc.addPage(); y = 16; }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Staff Sales Performance & Cashier Reconciliation', margin, y);
  y += 3;

  const staffRows = staffPerformance.length > 0
    ? staffPerformance.map(st => [
        st.name,
        st.role || 'Staff Cashier',
        `${st.salesCount} orders`,
        `${st.totalUnitsSold || 0} units`,
        formatCurrency(st.totalRevenue),
        formatCurrency(st.averageOrderValue || 0),
        `${st.percentageOfTotal}%`
      ])
    : [['No staff sales recorded in this period', '—', '—', '—', '—', '—', '—']];

  doc.autoTable({
    startY: y,
    head: [['Staff Member', 'Role', 'Transactions', 'Units Dispensed', 'Revenue Generated', 'Avg Order Value', 'Contribution']],
    body: staffRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 28 },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 10, halign: 'center' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 3: Expired Drugs Report ─────────────────────────────────
  if (y > 230) { doc.addPage(); y = 16; }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Red 700
  doc.text(`3. Expired Drugs Quarantine Audit (${expiredUnitsCount} Units Blocked)`, margin, y);
  y += 3;

  const expiredRows = expiredBatchesList.length > 0
    ? expiredBatchesList.map(b => [
        b.medicineName,
        b.batchNumber,
        formatDate(b.expiryDate),
        `${b.quantityRemaining} units`,
        formatCurrency(b.costPrice),
        formatCurrency(b.costPrice * b.quantityRemaining),
        formatCurrency(b.sellingPrice * b.quantityRemaining)
      ])
    : [['Zero expired drugs detected in active inventory. All stock is valid and compliant.', '—', '—', '—', '—', '—', '—']];

  doc.autoTable({
    startY: y,
    head: [['Medicine Name', 'Batch Lot #', 'Expiry Date', 'Expired Units', 'Unit Cost', 'Financial Loss (Cost)', 'Potential Retail']],
    body: expiredRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { fillColor: [153, 27, 27], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 26 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 18, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 8;

  // ── Section 4: Low-Stock & Reorder Report ────────────────────────────
  if (y > 230) { doc.addPage(); y = 16; }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9); // Amber 700
  doc.text(`4. Low-Stock & Restocking Assessment (${lowStockMedicines.length} Medicines Flagged)`, margin, y);
  y += 3;

  const lowStockRows = lowStockMedicines.length > 0
    ? lowStockMedicines.map(m => [
        m.name,
        m.categoryName || 'General',
        `${m.currentValidStock} units`,
        `${m.threshold} units`,
        `${m.shortfall} units`,
        m.currentValidStock === 0 ? 'CRITICAL (Out of Stock)' : 'LOW STOCK ALERT',
        formatCurrency(m.costPrice || 0),
        formatCurrency((m.costPrice || 0) * m.shortfall)
      ])
    : [['All catalog medicines currently maintain healthy inventory levels above minimum thresholds.', '—', '—', '—', '—', '—', '—', '—']];

  doc.autoTable({
    startY: y,
    head: [['Medicine', 'Category', 'Current Valid Stock', 'Reorder Level', 'Shortfall', 'Status', 'Unit Cost', 'Est. Restock Cost']],
    body: lowStockRows,
    theme: 'grid',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [15, 23, 42] },
    headStyles: { fillColor: [180, 83, 9], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 42 },
      1: { cellWidth: 26 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 26, halign: 'center' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 18, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });

  y = doc.lastAutoTable.finalY + 12;

  // ── Sign-off Block ──────────────────────────────────────────────────
  if (y > 255) { doc.addPage(); y = 20; }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('AUDIT CERTIFICATION & VERIFICATION:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('I hereby certify that this report reflects genuine database transactions and current physical stock states.', margin, y);
  y += 12;

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + 60, y);
  doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);

  doc.text('Supervising Pharmacist Signature / Date', margin, y + 4);
  doc.text('Internal Auditor / Quality Assurance', pageWidth - margin - 60, y + 4);

  // Download PDF
  const filename = `PharmaSense_Report_${periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

/**
 * Excel / CSV Report Exporter
 * Exports comprehensive CSV workbook containing all 6 reporting dimensions with metadata.
 */
export function exportReportToCsv(reportData, settings = {}) {
  const pharmacyName = settings.pharmacyName || 'PharmaSense Pharmacy';
  const {
    periodLabel,
    dateRangeLabel,
    generatedAt,
    generatedBy,
    totalRevenue,
    totalTransactions,
    totalDrugUnitsSold,
    averageOrderValue,
    expiredUnitsCount,
    expiredCostValuation,
    lowStockMedicines,
    bestSellingDrugs,
    staffPerformance,
    expiredBatchesList
  } = reportData;

  const lines = [];

  // Header metadata
  lines.push(`"${pharmacyName} - Pharmacy Audit Report"`);
  lines.push(`"Report Type:","${periodLabel.toUpperCase()}"`);
  lines.push(`"Reporting Interval:","${dateRangeLabel}"`);
  lines.push(`"Generated At:","${formatDateTime(generatedAt)}"`);
  lines.push(`"Generated By:","${generatedBy || 'Administrator'}"`);
  lines.push('');

  // 1. KPI Executive Summary
  lines.push('"EXECUTIVE SUMMARY"');
  lines.push('"Metric","Value"');
  lines.push(`"Total Revenue Generated (NGN)","${totalRevenue}"`);
  lines.push(`"Total Drug Units Dispensed","${totalDrugUnitsSold}"`);
  lines.push(`"Total Transactions Completed","${totalTransactions}"`);
  lines.push(`"Average Order Value (NGN)","${averageOrderValue.toFixed(2)}"`);
  lines.push(`"Expired Drug Units Quarantined","${expiredUnitsCount}"`);
  lines.push(`"Total Financial Loss on Expired Stock (NGN)","${expiredCostValuation}"`);
  lines.push(`"Low-Stock Alerts Count","${lowStockMedicines.length}"`);
  lines.push('');

  // 2. Best Selling Drugs
  lines.push('"1. BEST-SELLING MEDICATIONS (DISPENSING VELOCITY)"');
  lines.push('"Rank","Medicine Name","Category","Units Sold","Average Unit Price (NGN)","Total Revenue (NGN)","Revenue Share (%)"');
  if (bestSellingDrugs.length > 0) {
    bestSellingDrugs.forEach((d, idx) => {
      lines.push(`"#${idx + 1}","${d.name}","${d.category || 'General'}","${d.totalQty}","${d.averagePrice || d.unitPrice}","${d.totalRevenue}","${d.percentageOfTotal}%"`);
    });
  } else {
    lines.push('"None","No drug sales recorded in this period","—","0","0","0","0%"');
  }
  lines.push('');

  // 3. Staff Sales Performance
  lines.push('"2. STAFF SALES PERFORMANCE"');
  lines.push('"Staff Member","Role","Orders Count","Units Dispensed","Revenue Collected (NGN)","Average Ticket (NGN)","Revenue Contribution (%)"');
  if (staffPerformance.length > 0) {
    staffPerformance.forEach(st => {
      lines.push(`"${st.name}","${st.role || 'Staff Cashier'}","${st.salesCount}","${st.totalUnitsSold || 0}","${st.totalRevenue}","${(st.averageOrderValue || 0).toFixed(2)}","${st.percentageOfTotal}%"`);
    });
  } else {
    lines.push('"None","No staff transactions in this period","0","0","0","0","0%"');
  }
  lines.push('');

  // 4. Expired Drugs Report
  lines.push('"3. EXPIRED DRUGS QUARANTINE REPORT"');
  lines.push('"Medicine Name","Batch Lot #","Supplier","Expiry Date","Expired Units Remaining","Unit Cost (NGN)","Financial Loss Valuation (NGN)","Retail Value (NGN)"');
  if (expiredBatchesList.length > 0) {
    expiredBatchesList.forEach(b => {
      lines.push(`"${b.medicineName}","${b.batchNumber}","${b.supplierName || '—'}","${b.expiryDate}","${b.quantityRemaining}","${b.costPrice}","${b.costPrice * b.quantityRemaining}","${b.sellingPrice * b.quantityRemaining}"`);
    });
  } else {
    lines.push('"All stock valid","No expired batches in inventory","—","—","0","0","0","0"');
  }
  lines.push('');

  // 5. Low Stock Report
  lines.push('"4. LOW STOCK & REORDER REPORT"');
  lines.push('"Medicine Name","Category","Valid Stock Remaining","Minimum Reorder Level","Shortfall Units","Status","Unit Cost (NGN)","Estimated Restock Cost (NGN)"');
  if (lowStockMedicines.length > 0) {
    lowStockMedicines.forEach(m => {
      const statusText = m.currentValidStock === 0 ? 'CRITICAL OUT OF STOCK' : 'LOW STOCK';
      lines.push(`"${m.name}","${m.categoryName || 'General'}","${m.currentValidStock}","${m.threshold}","${m.shortfall}","${statusText}","${m.costPrice || 0}","${(m.costPrice || 0) * m.shortfall}"`);
    });
  } else {
    lines.push('"All items healthy","All medicines are stocked above minimum thresholds","—","—","0","OPTIMAL","0","0"');
  }

  const csvContent = lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `PharmaSense_Report_${periodLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
