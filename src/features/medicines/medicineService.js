import { fetchCollection, fetchDocument, insertDocument, updateDocument, softDeleteDocument } from '../../firebase/firestore';

export const medicineService = {
  async getMedicines() {
    return fetchCollection('medicines');
  },

  async getMedicineById(id) {
    return fetchDocument('medicines', id);
  },

  async createMedicine(data, actorId) {
    return insertDocument('medicines', {
      ...data,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorId || 'system'
    }, null, actorId);
  },

  async updateMedicine(id, data, actorId) {
    return updateDocument('medicines', id, {
      ...data,
      updatedAt: new Date().toISOString()
    }, actorId);
  },

  async deleteMedicine(id, actorId) {
    return softDeleteDocument('medicines', id, actorId);
  }
};
