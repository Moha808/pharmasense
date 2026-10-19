import { useState, useEffect, useRef } from 'react';
import { subscribeToCollection } from '../firebase/firestore';

export function useFirestoreQuery(collectionName, filterFn = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    const unsubscribe = subscribeToCollection(collectionName, (rawDocs) => {
      if (!mountedRef.current) return;
      try {
        let filtered = rawDocs;
        // Filter out soft-deleted items by default
        filtered = filtered.filter(item => item.status !== 'deleted');
        if (filterFn) {
          filtered = filtered.filter(filterFn);
        }
        setData(filtered);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    });

    return () => {
      mountedRef.current = false;
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (e) {
          // Suppress Firestore internal errors during unmount
          console.warn('Firestore unsubscribe warning:', e);
        }
      }
    };
  }, [collectionName]);

  return { data, loading, error };
}
