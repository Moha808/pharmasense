import { fetchCollection, insertDocument, updateDocument, softDeleteDocument } from '../../firebase/firestore';

export const supplierService = {
  async getSuppliers() {
    return fetchCollection('suppliers');
  },

  async createSupplier(data, actorId) {
    return insertDocument('suppliers', {
      ...data,
      status: 'active',
      createdAt: new Date().toISOString()
    }, null, actorId);
  },

  async updateSupplier(id, data, actorId) {
    return updateDocument('suppliers', id, data, actorId);
  },

  async deleteSupplier(id, actorId) {
    return softDeleteDocument('suppliers', id, actorId);
  }
};
