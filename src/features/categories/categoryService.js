import { fetchCollection, insertDocument, updateDocument, softDeleteDocument } from '../../firebase/firestore';

export const categoryService = {
  async getCategories() {
    return fetchCollection('categories');
  },

  async createCategory(data, actorId) {
    return insertDocument('categories', data, null, actorId);
  },

  async updateCategory(id, data, actorId) {
    return updateDocument('categories', id, data, actorId);
  },

  async deleteCategory(id, actorId) {
    return softDeleteDocument('categories', id, actorId);
  }
};
