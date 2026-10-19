import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot as firestoreOnSnapshot, 
  serverTimestamp,
  runTransaction as firestoreRunTransaction
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { 
  initialCategories, 
  initialSuppliers, 
  initialMedicines, 
  initialBatches, 
  initialUsers, 
  initialSales, 
  initialStockMovements, 
  initialAuditLogs, 
  initialSettings 
} from './mockData';

// Storage keys for local persistence in demo mode
const STORAGE_PREFIX = 'pharmasense_db_';
const listeners = new Map();

// Helper to initialize local storage with mock data if not already present
function initLocalStore() {
  const collections = {
    categories: initialCategories,
    suppliers: initialSuppliers,
    medicines: initialMedicines,
    batches: initialBatches,
    users: initialUsers,
    sales: initialSales,
    stockMovements: initialStockMovements,
    auditLogs: initialAuditLogs,
    settings: [initialSettings]
  };

  Object.entries(collections).forEach(([key, initialData]) => {
    const storageKey = STORAGE_PREFIX + key;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(initialData));
    }
  });
}

// Run init
if (typeof window !== 'undefined') {
  initLocalStore();
}

function getLocalData(colName) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + colName);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading from local storage:', e);
    return [];
  }
}

function setLocalData(colName, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + colName, JSON.stringify(data));
    notifyListeners(colName);
  } catch (e) {
    console.error('Error writing to local storage:', e);
  }
}

function notifyListeners(colName) {
  const colListeners = listeners.get(colName);
  if (colListeners) {
    const currentData = getLocalData(colName);
    colListeners.forEach(cb => {
      try {
        cb(currentData);
      } catch (err) {
        console.error('Listener callback error:', err);
      }
    });
  }
}

// Reset data back to initial seeds
export function resetDatabaseToSeeds() {
  localStorage.clear();
  initLocalStore();
  ['categories', 'suppliers', 'medicines', 'batches', 'users', 'sales', 'stockMovements', 'auditLogs', 'settings'].forEach(notifyListeners);
}

// ==========================================
// AUDIT LOG HELPER
// ==========================================
export async function logAuditEvent({ userId, action, targetCollection, targetId, beforeValue = null, afterValue = null }) {
  const logEntry = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    userId: userId || 'system',
    action,
    targetCollection,
    targetId,
    beforeValue,
    afterValue,
    timestamp: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        ...logEntry,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not write audit log to Firebase, writing locally:', e);
      const logs = getLocalData('auditLogs');
      setLocalData('auditLogs', [logEntry, ...logs]);
    }
  } else {
    const logs = getLocalData('auditLogs');
    setLocalData('auditLogs', [logEntry, ...logs]);
  }
  return logEntry;
}

// ==========================================
// CORE COLLECTION DATA HELPERS
// ==========================================

export async function fetchCollection(colName) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, colName));
      const snapshot = await getDocs(q);
      // Spread data first, then id — ensures Firestore doc ID always wins
      return snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
    } catch (err) {
      console.warn(`Firestore read failed for ${colName}, falling back to local:`, err);
      return getLocalData(colName);
    }
  }
  return getLocalData(colName);
}

export async function fetchDocument(colName, docId) {
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, colName, docId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...snapshot.data(), id: snapshot.id };
      }
      return null;
    } catch (err) {
      console.warn(`Firestore read failed for ${colName}/${docId}, falling back to local:`, err);
      const items = getLocalData(colName);
      return items.find(item => item.id === docId || item.uid === docId) || null;
    }
  }
  const items = getLocalData(colName);
  return items.find(item => item.id === docId || item.uid === docId) || null;
}

export async function insertDocument(colName, data, customId = null, actorId = 'system') {
  const newId = customId || (colName.slice(0, 3) + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4));
  const newDoc = {
    ...data,
    id: newId,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = customId ? doc(db, colName, customId) : doc(collection(db, colName));
      await setDoc(docRef, {
        ...newDoc,
        id: docRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      newDoc.id = docRef.id;
    } catch (err) {
      console.warn(`Firestore insert failed for ${colName}, writing locally:`, err);
      const items = getLocalData(colName);
      setLocalData(colName, [newDoc, ...items]);
    }
  } else {
    const items = getLocalData(colName);
    setLocalData(colName, [newDoc, ...items]);
  }

  // Record audit log
  if (colName !== 'auditLogs') {
    await logAuditEvent({
      userId: actorId,
      action: `CREATE_${colName.toUpperCase().slice(0, -1)}`,
      targetCollection: colName,
      targetId: newDoc.id,
      beforeValue: null,
      afterValue: newDoc
    });
  }

  return newDoc;
}

export async function updateDocument(colName, docId, updates, actorId = 'system') {
  const beforeItem = await fetchDocument(colName, docId);
  const updatedItem = {
    ...(beforeItem || {}),
    ...updates,
    id: docId,
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    // In Firebase mode: write to Firestore only — do NOT fall back to localStorage.
    // If this throws (e.g. permission denied), the error surfaces to the UI.
    const docRef = doc(db, colName, docId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } else {
    const items = getLocalData(colName);
    const next = items.map(it => (it.id === docId || it.uid === docId ? updatedItem : it));
    setLocalData(colName, next);
  }

  // Record audit log
  if (colName !== 'auditLogs') {
    await logAuditEvent({
      userId: actorId,
      action: `UPDATE_${colName.toUpperCase().slice(0, -1)}`,
      targetCollection: colName,
      targetId: docId,
      beforeValue: beforeItem,
      afterValue: updatedItem
    });
  }

  return updatedItem;
}

export async function softDeleteDocument(colName, docId, actorId = 'system') {
  return updateDocument(colName, docId, { status: 'deleted' }, actorId);
}

// Subscribe to real-time changes
export function subscribeToCollection(colName, callback) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, colName));
      const unsubscribe = firestoreOnSnapshot(q, (snapshot) => {
        // Spread data first, then id — ensures Firestore doc ID always wins
        const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        callback(data);
      }, (error) => {
        console.warn(`Real-time subscription error for ${colName}, using local fallback:`, error);
        callback(getLocalData(colName));
      });
      return unsubscribe;
    } catch (err) {
      console.warn(`Subscription init error:`, err);
    }
  }

  // Local storage subscription
  if (!listeners.has(colName)) {
    listeners.set(colName, new Set());
  }
  const colListeners = listeners.get(colName);
  colListeners.add(callback);

  // Immediate first call
  callback(getLocalData(colName));

  return () => {
    colListeners.delete(callback);
  };
}

export async function executeAtomicSale({ saleData, fefoAllocations, cashierId, cashierName }) {
  const timestamp = new Date().toISOString();
  const saleId = 'PS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  
  const formattedSale = {
    ...saleData,
    saleId,
    cashierId,
    cashierName,
    timestamp,
    status: 'completed'
  };

  // ─── FIREBASE MODE ────────────────────────────────────────────────────────
  if (isFirebaseConfigured && db) {
    try {
      return await firestoreRunTransaction(db, async (transaction) => {
        // 1. Read all required batches first
        const batchRefs = fefoAllocations.map(alloc => ({
          ref: doc(db, 'batches', alloc.batchId),
          alloc
        }));
        
        const batchDocs = [];
        for (const { ref, alloc } of batchRefs) {
          const bDoc = await transaction.get(ref);
          if (!bDoc.exists()) throw new Error(`Batch ${alloc.batchId} not found in inventory.`);
          batchDocs.push({ doc: bDoc, alloc, ref });
        }

        // 2. Perform checks and queue updates
        for (const { doc: bDoc, alloc, ref } of batchDocs) {
          const batchData = bDoc.data();
          if (batchData.quantityRemaining < alloc.quantityToDeduct) {
            throw new Error(`Insufficient stock in batch ${batchData.batchNumber}. Available: ${batchData.quantityRemaining}, Requested: ${alloc.quantityToDeduct}`);
          }
          const newQty = batchData.quantityRemaining - alloc.quantityToDeduct;
          transaction.update(ref, {
            quantityRemaining: newQty,
            status: newQty === 0 ? 'depleted' : batchData.status,
            updatedAt: serverTimestamp()
          });

          // Stock movement
          const movRef = doc(collection(db, 'stockMovements'));
          transaction.set(movRef, {
            medicineId: alloc.medicineId,
            batchId: alloc.batchId,
            type: 'sale',
            quantityChange: -alloc.quantityToDeduct,
            reason: `Sale ${saleId}`,
            performedBy: cashierId,
            timestamp: serverTimestamp()
          });
        }

        // 3. Create Sale Record
        const saleRef = doc(collection(db, 'sales'));
        transaction.set(saleRef, {
          ...formattedSale,
          timestamp: serverTimestamp()
        });

        // 4. Create Audit Log
        const logRef = doc(collection(db, 'auditLogs'));
        transaction.set(logRef, {
          userId: cashierId || 'system',
          action: 'POS_SALE',
          targetCollection: 'sales',
          targetId: saleRef.id,
          beforeValue: null,
          afterValue: {
            saleId,
            totalAmount: formattedSale.totalAmount,
            itemsCount: formattedSale.items.length,
            cashierId
          },
          timestamp: serverTimestamp()
        });

        return { ...formattedSale, id: saleRef.id };
      });
    } catch (err) {
      console.error('Firebase atomic sale failed:', err);
      throw err; // Re-throw to show the error in UI
    }
  }

  // ─── LOCAL STORAGE MODE ───────────────────────────────────────────────────
  // 1. Process batch deductions
  const currentBatches = getLocalData('batches');
  const currentStockMovements = getLocalData('stockMovements');
  const updatedBatches = [...currentBatches];
  const newStockMovements = [];

  for (const alloc of fefoAllocations) {
    const batchIndex = updatedBatches.findIndex(b => b.id === alloc.batchId);
    if (batchIndex === -1) {
      throw new Error(`Batch ${alloc.batchId} not found in inventory.`);
    }

    const batch = updatedBatches[batchIndex];
    if (batch.quantityRemaining < alloc.quantityToDeduct) {
      throw new Error(`Insufficient stock in batch ${batch.batchNumber}. Available: ${batch.quantityRemaining}, Requested: ${alloc.quantityToDeduct}`);
    }

    const newQty = batch.quantityRemaining - alloc.quantityToDeduct;
    updatedBatches[batchIndex] = {
      ...batch,
      quantityRemaining: newQty,
      status: newQty === 0 ? 'depleted' : batch.status,
      updatedAt: timestamp
    };

    // Create stock movement
    newStockMovements.push({
      id: 'mov-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      medicineId: alloc.medicineId,
      batchId: alloc.batchId,
      type: 'sale',
      quantityChange: -alloc.quantityToDeduct,
      reason: `Sale ${saleId}`,
      performedBy: cashierId,
      timestamp
    });
  }

  // 2. Commit all updates atomically
  setLocalData('batches', updatedBatches);
  setLocalData('stockMovements', [...newStockMovements, ...currentStockMovements]);
  
  const currentSales = getLocalData('sales');
  const finalSaleDoc = { ...formattedSale, id: 'sale-' + Date.now() };
  setLocalData('sales', [finalSaleDoc, ...currentSales]);

  // 3. Write audit log
  await logAuditEvent({
    userId: cashierId,
    action: 'POS_SALE',
    targetCollection: 'sales',
    targetId: finalSaleDoc.id,
    beforeValue: null,
    afterValue: {
      saleId,
      totalAmount: finalSaleDoc.totalAmount,
      itemsCount: finalSaleDoc.items.length,
      cashierId
    }
  });

  return finalSaleDoc;
}
