import { executeAtomicSale, fetchCollection } from '../../firebase/firestore';
import { calculateFefoAllocations } from '../../utils/fefo';

export const posService = {
  /**
   * Process a complete sale transaction with automatic FEFO batch deductions
   */
  async processSale({ cartItems, paymentMethod, amountPaid, cashierId, cashierName }) {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty. Please add items to dispense.');
    }

    const allBatches = await fetchCollection('batches');
    const allFefoAllocations = [];
    let totalAmount = 0;
    const finalItems = [];

    // Verify stock availability and compute FEFO allocations for every cart item
    for (const item of cartItems) {
      const fefoResult = calculateFefoAllocations(item.medicineId, item.quantity, allBatches);
      
      // If all batches for this medicine are expired, block with an explicit safety warning
      if (fefoResult.allExpired) {
        throw new Error(
          `Dispensing Blocked: All available inventory (${fefoResult.totalExpired} units) for "${item.medicineName}" has EXPIRED. The system strictly prohibits selling expired stock.`
        );
      }

      if (!fefoResult.isSufficient) {
        const expiredNotice = fefoResult.totalExpired > 0
          ? ` (${fefoResult.totalExpired} expired units quarantined and blocked)`
          : '';
        throw new Error(
          `Insufficient non-expired stock for "${item.medicineName}". Available valid stock: ${fefoResult.totalAvailable} units${expiredNotice}, Requested: ${item.quantity} units.`
        );
      }

      // Add to overall FEFO batch deduction plan
      allFefoAllocations.push(...fefoResult.allocations);

      const subtotal = item.unitPrice * item.quantity;
      totalAmount += subtotal;

      finalItems.push({
        medicineId: item.medicineId,
        medicineName: item.medicineName,
        genericName: item.genericName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
        fefoBatches: fefoResult.allocations.map(a => ({
          batchId: a.batchId,
          batchNumber: a.batchNumber,
          deducted: a.quantityToDeduct,
          expiryDate: a.expiryDate
        }))
      });
    }

    const paidNum = Number(amountPaid) || totalAmount;
    const change = Math.max(0, paidNum - totalAmount);

    const salePayload = {
      items: finalItems,
      totalAmount,
      amountPaid: paidNum,
      change,
      paymentMethod,
    };

    // Execute atomic commit
    const completedSale = await executeAtomicSale({
      saleData: salePayload,
      fefoAllocations: allFefoAllocations,
      cashierId,
      cashierName
    });

    return completedSale;
  },

  async getAllSales() {
    return fetchCollection('sales');
  }
};
