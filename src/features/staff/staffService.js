import { fetchCollection, insertDocument, updateDocument } from '../../firebase/firestore';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '../../firebase/config';

export const staffService = {
  async getStaffUsers() {
    return fetchCollection('users');
  },

  async createStaffUser(data, actorId) {
    let newUid;
    
    // Create a temporary secondary Firebase app specifically for creating the user.
    // This prevents the current Admin session from being automatically logged out!
    const tempAppName = 'TempStaffCreationApp-' + Date.now();
    const tempApp = initializeApp(firebaseConfig, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth, 
        data.email.trim().toLowerCase(), 
        data.password || 'password123'
      );
      newUid = userCredential.user.uid;
    } catch (err) {
      // Pass the Firebase Auth error up to the UI
      throw new Error(err.message || 'Failed to create login credentials');
    } finally {
      // Always clean up the temporary app instance
      await deleteApp(tempApp);
    }

    return insertDocument('users', {
      uid: newUid,
      fullName: data.fullName,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      role: data.role || 'staff',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      createdBy: actorId || 'admin'
    }, newUid, actorId);
  },

  async updateStaffUser(uid, data, actorId) {
    return updateDocument('users', uid, data, actorId);
  },

  async toggleStatus(uid, currentStatus, actorId) {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    return updateDocument('users', uid, { status: nextStatus }, actorId);
  },

  async updateStatus(uid, status, actorId) {
    return updateDocument('users', uid, { status }, actorId);
  }
};
