/**
 * FEFO (First-Expiry-First-Out) Inventory Engine
 * 
 * Automatically ensures:
 * 1. Stock is deducted strictly from active, non-expired batches with earliest expiry dates first.
 * 2. Any batch that has passed its expiry date is automatically blocked from being sold.
 * 3. Expired batches remain in inventory records for monitoring, audits, and reporting.
 * 4. The next valid, non-expired batch is selected automatically.
 * 5. If all batches for a medicine are expired, transactions are prevented with a clear warning.
 */

/**
 * Checks if a batch expiry date has passed.
 * Supports ISO strings, YYYY-MM-DD format, and timestamp values.
 * @param {string|Date|number} expiryDateVal 
 * @returns {boolean} true if expired, false if valid
 */
export function isBatchExpired(expiryDateVal) {
  if (!expiryDateVal) return false;
  const now = new Date();
  
  if (typeof expiryDateVal === 'string' && expiryDateVal.length <= 10) {
    // Treat YYYY-MM-DD as expiring at the end of that day (23:59:59.999 local time)
    const endOfDay = new Date(`${expiryDateVal}T23:59:59.999`);
    if (!isNaN(endOfDay.getTime())) {
      return endOfDay.getTime() < now.getTime();
    }
  }

  const expDate = new Date(expiryDateVal);
  if (isNaN(expDate.getTime())) return false;
  return expDate.getTime() < now.getTime();
}

/**
 * Returns strictly valid, non-expired active batches with quantity > 0,
 * sorted by earliest expiry date first (FEFO).
 * @param {string} medicineId 
 * @param {Array} allBatches 
 * @returns {Array} sorted valid batches
 */
export function getFefoBatchesForMedicine(medicineId, allBatches = []) {
  return allBatches
    .filter(batch => 
      batch.medicineId === medicineId && 
      batch.status === 'active' && 
      Number(batch.quantityRemaining) > 0 &&
      !isBatchExpired(batch.expiryDate)
    )
    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
}

/**
 * Returns all expired batches for a specific medicine that still have quantity remaining.
 * @param {string} medicineId 
 * @param {Array} allBatches 
 * @returns {Array} expired batches
 */
export function getExpiredBatchesForMedicine(medicineId, allBatches = []) {
  return allBatches.filter(batch =>
    batch.medicineId === medicineId &&
    Number(batch.quantityRemaining) > 0 &&
    isBatchExpired(batch.expiryDate)
  );
}

/**
 * Returns all expired batches across the entire inventory that have remaining stock.
 * @param {Array} allBatches 
 * @returns {Array} all expired batches
 */
export function getAllExpiredBatches(allBatches = []) {
  return allBatches.filter(batch =>
    Number(batch.quantityRemaining) > 0 &&
    isBatchExpired(batch.expiryDate)
  );
}

/**
 * Computes complete batch availability status for a medicine.
 * @param {string} medicineId 
 * @param {Array} allBatches 
 */
export function getMedicineBatchStatus(medicineId, allBatches = []) {
  const validBatches = getFefoBatchesForMedicine(medicineId, allBatches);
  const expiredBatches = getExpiredBatchesForMedicine(medicineId, allBatches);

  const totalValidStock = validBatches.reduce((sum, b) => sum + (Number(b.quantityRemaining) || 0), 0);
  const totalExpiredStock = expiredBatches.reduce((sum, b) => sum + (Number(b.quantityRemaining) || 0), 0);
  
  const allBatchesExpired = totalValidStock === 0 && totalExpiredStock > 0;
  const hasExpiredBatches = totalExpiredStock > 0;
  const nextValidBatch = validBatches[0] || null;

  return {
    validBatches,
    expiredBatches,
    totalValidStock,
    totalExpiredStock,
    allBatchesExpired,
    hasExpiredBatches,
    nextValidBatch
  };
}

/**
 * Calculates batch allocation for a required quantity of a medicine using strict FEFO.
 * Guarantees that expired batches are excluded. If all batches are expired, flags allExpired: true.
 * Automatically selects the next available non-expired batch.
 * 
 * @param {string} medicineId 
 * @param {number} requiredQuantity 
 * @param {Array} allBatches 
 * @returns {{ allocations: Array, totalAvailable: number, totalExpired: number, isSufficient: boolean, allExpired: boolean, shortfall: number, sortedBatches: Array }}
 */
export function calculateFefoAllocations(medicineId, requiredQuantity, allBatches = []) {
  const status = getMedicineBatchStatus(medicineId, allBatches);
  const { validBatches, totalValidStock, totalExpiredStock, allBatchesExpired } = status;

  // Case 1: All available batches for this medicine are expired
  if (allBatchesExpired) {
    return {
      allocations: [],
      totalAvailable: 0,
      totalExpired: totalExpiredStock,
      isSufficient: false,
      allExpired: true,
      shortfall: requiredQuantity,
      sortedBatches: []
    };
  }

  // Case 2: Insufficient valid stock
  if (totalValidStock < requiredQuantity) {
    return {
      allocations: [],
      totalAvailable: totalValidStock,
      totalExpired: totalExpiredStock,
      isSufficient: false,
      allExpired: false,
      shortfall: requiredQuantity - totalValidStock,
      sortedBatches: validBatches
    };
  }

  // Case 3: Allocate from valid batches in FEFO order (next available valid batch automatically chosen)
  let remainingToFulfill = requiredQuantity;
  const allocations = [];

  for (const batch of validBatches) {
    if (remainingToFulfill <= 0) break;

    const availableInBatch = Number(batch.quantityRemaining) || 0;
    const takeQty = Math.min(availableInBatch, remainingToFulfill);

    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      medicineId: batch.medicineId,
      quantityToDeduct: takeQty,
      sellingPrice: Number(batch.sellingPrice) || 0,
      costPrice: Number(batch.costPrice) || 0,
      expiryDate: batch.expiryDate,
      supplierId: batch.supplierId
    });

    remainingToFulfill -= takeQty;
  }

  return {
    allocations,
    totalAvailable: totalValidStock,
    totalExpired: totalExpiredStock,
    isSufficient: true,
    allExpired: false,
    shortfall: 0,
    sortedBatches: validBatches
  };
}
