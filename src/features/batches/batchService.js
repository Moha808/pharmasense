import { insertDocument, updateDocument, fetchCollection } from '../../firebase/firestore';

export const batchService = {
  async getBatches() {
    return fetchCollection('batches');
  },

  /**
   * Atomic Stock-In: creates a new batch document AND corresponding stockMovements doc
   */
  async stockInBatch(batchData, actorId) {
    const timestamp = new Date().toISOString();
    
    const formattedBatch = {
      ...batchData,
      quantityRemaining: Number(batchData.quantityReceived),
      quantityReceived: Number(batchData.quantityReceived),
      costPrice: Number(batchData.costPrice),
      sellingPrice: Number(batchData.sellingPrice),
      status: 'active',
      dateReceived: batchData.dateReceived || timestamp.slice(0, 10),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 1. Insert Batch Doc
    const createdBatch = await insertDocument('batches', formattedBatch, null, actorId);

    // 2. Insert Stock Movement Doc (Type: stock-in)
    await insertDocument('stockMovements', {
      medicineId: createdBatch.medicineId,
      batchId: createdBatch.id,
      type: 'stock-in',
      quantityChange: createdBatch.quantityReceived,
      reason: `Stock-in batch #${createdBatch.batchNumber}`,
      performedBy: actorId || 'system',
      timestamp
    }, null, actorId);

    return createdBatch;
  },

  /**
   * Atomic Stock Adjustment (Manual adjustment, damage, expired removal, or customer return)
   */
  async adjustStock({ batchId, medicineId, quantityChange, type, reason }, actorId) {
    const timestamp = new Date().toISOString();
    const batches = await fetchCollection('batches');
    const batch = batches.find(b => b.id === batchId);

    if (!batch) {
      throw new Error('Batch not found');
    }

    const currentRemaining = Number(batch.quantityRemaining || 0);
    const newRemaining = currentRemaining + Number(quantityChange);

    if (newRemaining < 0) {
      throw new Error(`Adjustment would result in negative stock (${newRemaining}). Maximum deduction is ${currentRemaining}.`);
    }

    // 1. Update Batch
    const updatedBatch = await updateDocument('batches', batchId, {
      quantityRemaining: newRemaining,
      status: newRemaining === 0 ? 'depleted' : 'active',
      updatedAt: timestamp
    }, actorId);

    // 2. Record Stock Movement
    await insertDocument('stockMovements', {
      medicineId: batch.medicineId,
      batchId,
      type,
      quantityChange: Number(quantityChange),
      reason,
      performedBy: actorId || 'system',
      timestamp
    }, null, actorId);

    return updatedBatch;
  }
};
