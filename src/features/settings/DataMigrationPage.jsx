import React, { useState } from 'react';
import { db, isFirebaseConfigured } from '../../firebase/config';
import { collection, doc, setDoc, writeBatch, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { CloudUpload, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_PREFIX = 'pharmasense_db_';
// Write users FIRST so the admin doc exists before other collections are written
const COLLECTIONS = [
  'users',
  'categories',
  'suppliers',
  'medicines',
  'batches',
  'sales',
  'stockMovements',
  'auditLogs',
  'settings',
];

function readLocalCollection(name) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + name);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function DataMigrationPage() {
  const { user: currentUser } = useAuth();
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState(null);

  const appendLog = (msg, type = 'info') => {
    setLog(prev => [...prev, { msg, type, ts: Date.now() }]);
  };

  const handleMigrate = async () => {
    if (!isFirebaseConfigured || !db) {
      toast.error('Firebase is not configured. Run this on localhost with Firebase credentials.');
      return;
    }

    const firebaseAuth = getAuth();
    const firebaseUser = firebaseAuth.currentUser;

    if (!firebaseUser) {
      toast.error('You must be logged in to migrate data.');
      return;
    }

    setStatus('running');
    setLog([]);
    setSummary(null);

    // ── Step 1: Ensure the admin's own Firestore document exists ──────────
    // Without this, isAdmin() in security rules returns false and all writes fail.
    appendLog('Ensuring admin profile exists in Firestore...', 'info');
    try {
      const adminDocRef = doc(db, 'users', firebaseUser.uid);
      const adminSnap = await getDoc(adminDocRef);
      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || currentUser?.email || '',
          fullName: currentUser?.fullName || 'Administrator',
          role: 'admin',
          status: 'active',
          phone: currentUser?.phone || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          id: firebaseUser.uid,
        });
        appendLog('Admin profile created in Firestore.', 'success');
      } else {
        // Ensure role is admin on the existing doc
        const existing = adminSnap.data();
        if (existing.role !== 'admin') {
          await setDoc(adminDocRef, { ...existing, role: 'admin', status: 'active' });
          appendLog('Admin profile role updated to "admin".', 'success');
        } else {
          appendLog('Admin profile already exists — OK.', 'success');
        }
      }
    } catch (err) {
      appendLog(`Failed to create admin profile: ${err.message}`, 'error');
      appendLog('Migration aborted. Check Firestore security rules.', 'error');
      setStatus('error');
      setSummary({ totalDocs: 0, totalCollections: 0, errors: [{ colName: 'users (admin)', err: err.message }] });
      return;
    }

    // ── Step 2: Migrate all localStorage collections ───────────────────────
    let totalDocs = 0;
    let totalCollections = 0;
    const errors = [];

    for (const colName of COLLECTIONS) {
      const items = readLocalCollection(colName);

      if (items.length === 0) {
        appendLog(`${colName}: 0 documents — skipped`, 'skip');
        continue;
      }

      appendLog(`${colName}: uploading ${items.length} document(s)...`, 'info');

      const BATCH_SIZE = 400;
      let uploaded = 0;

      try {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
          const chunk = items.slice(i, i + BATCH_SIZE);
          const batch = writeBatch(db);

          chunk.forEach(item => {
            const docId = item.id || item.uid || null;
            const ref = docId
              ? doc(db, colName, String(docId))
              : doc(collection(db, colName));

            // Remove undefined values — Firestore rejects them
            const clean = JSON.parse(JSON.stringify(item));
            batch.set(ref, clean, { merge: true });
          });

          await batch.commit();
          uploaded += chunk.length;
        }

        totalDocs += uploaded;
        totalCollections += 1;
        appendLog(`${colName}: ${uploaded} document(s) uploaded successfully`, 'success');
      } catch (err) {
        errors.push({ colName, err: err.message });
        appendLog(`${colName}: FAILED — ${err.message}`, 'error');
      }
    }

    setSummary({ totalDocs, totalCollections, errors });
    setStatus(errors.length === 0 ? 'done' : 'error');

    if (errors.length === 0) {
      toast.success(`Migration complete — ${totalDocs} documents synced to Firestore`);
    } else {
      toast.error(`Migration finished with ${errors.length} error(s)`);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Cloud Data Migration"
        subtitle="Sync your local browser data to Firebase Firestore"
      />

      <div
        className="border border-amber-500/40 p-4 text-sm"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg-card) 90%, #f59e0b 10%)' }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 text-txt-muted">
            <p className="font-semibold text-txt">Run on localhost only.</p>
            <p>
              Reads all data from your browser's localStorage and uploads it to Firebase Firestore.
              Run from <code className="text-primary">localhost:5173</code>. Documents are merged — existing Firestore data is preserved.
            </p>
          </div>
        </div>
      </div>

      {/* Collections preview */}
      <div className="border border-bdr" style={{ backgroundColor: 'var(--color-bg-card)' }}>
        <div className="px-5 py-4 border-b border-bdr">
          <p className="text-sm font-semibold text-txt">Collections to migrate</p>
          <p className="text-xs text-txt-muted mt-0.5">
            Prefix: <code className="text-primary">pharmasense_db_</code>
          </p>
        </div>
        <div className="divide-y divide-bdr">
          {COLLECTIONS.map(name => {
            const items = readLocalCollection(name);
            return (
              <div key={name} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="text-txt font-mono">{name}</span>
                <span className={`text-xs font-semibold ${items.length > 0 ? 'text-primary' : 'text-txt-muted'}`}>
                  {items.length} doc{items.length !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="primary"
          size="lg"
          icon={CloudUpload}
          loading={status === 'running'}
          onClick={handleMigrate}
          disabled={status === 'running'}
        >
          {status === 'running' ? 'Uploading...' : 'Migrate Local Data to Firestore'}
        </Button>

        {status === 'done' && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" /> Complete
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-sm text-red-400">
            <AlertTriangle className="w-4 h-4" /> Finished with errors
          </span>
        )}
      </div>

      {log.length > 0 && (
        <div className="border border-bdr" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <div className="px-5 py-3 border-b border-bdr">
            <p className="text-xs font-semibold text-txt uppercase tracking-widest">Migration Log</p>
          </div>
          <div className="px-5 py-4 space-y-1.5 font-mono text-xs max-h-72 overflow-y-auto">
            {log.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.type === 'success' ? 'text-green-400'
                  : entry.type === 'error' ? 'text-red-400'
                  : entry.type === 'skip' ? 'text-txt-muted'
                  : 'text-txt'
                }
              >
                {entry.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="border border-bdr p-5 text-sm" style={{ backgroundColor: 'var(--color-bg-card)' }}>
          <p className="font-semibold text-txt mb-2">Summary</p>
          <p className="text-txt-muted">
            {summary.totalDocs} document(s) across {summary.totalCollections} collection(s) uploaded.
          </p>
          {summary.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-400">
              {summary.errors.map((e, i) => (
                <li key={i}><span className="font-semibold">{e.colName}:</span> {e.err}</li>
              ))}
            </ul>
          )}
          {summary.errors.length === 0 && (
            <p className="mt-2 text-green-400 font-semibold">
              All collections migrated without errors. Refresh the Vercel deployment to see the data.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
