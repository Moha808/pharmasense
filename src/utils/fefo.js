/**
 * FEFO (First-Expiry-First-Out) Inventory Engine
 * Ensures stock is automatically deducted from active batches with the earliest expiry dates first.
 */

export function getFefoBatchesForMedicine(medicineId, allBatches) {
  return allBatches
    .filter(batch => 
      batch.medicineId === medicineId && 
      batch.status === 'active' && 
      batch.quantityRemaining > 0
    )
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
}

/**
 * Calculates batch allocation for a required quantity of a medicine using FEFO
 * @param {string} medicineId 
 * @param {number} requiredQuantity 
 * @param {Array} allBatches 
 * @returns {{ allocations: Array, totalAvailable: number, isSufficient: boolean, shortfall: number }}
 */
export function calculateFefoAllocations(medicineId, requiredQuantity, allBatches) {
  const sortedBatches = getFefoBatchesForMedicine(medicineId, allBatches);
  const totalAvailable = sortedBatches.reduce((sum, b) => sum + b.quantityRemaining, 0);

  if (totalAvailable < requiredQuantity) {
    return {
      allocations: [],
      totalAvailable,
      isSufficient: false,
      shortfall: requiredQuantity - totalAvailable,
      sortedBatches
    };
  }

  let remainingToFulfill = requiredQuantity;
  const allocations = [];

  for (const batch of sortedBatches) {
    if (remainingToFulfill <= 0) break;

    const takeQty = Math.min(batch.quantityRemaining, remainingToFulfill);
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      medicineId: batch.medicineId,
      quantityToDeduct: takeQty,
      sellingPrice: batch.sellingPrice,
      expiryDate: batch.expiryDate,
      supplierId: batch.supplierId
    });

    remainingToFulfill -= takeQty;
  }

  return {
    allocations,
    totalAvailable,
    isSufficient: true,
    shortfall: 0,
    sortedBatches
  };
}
