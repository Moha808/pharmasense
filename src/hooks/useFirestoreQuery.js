import { useState, useEffect } from 'react';
import { subscribeToCollection } from '../firebase/firestore';

export function useFirestoreQuery(collectionName, filterFn = null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToCollection(collectionName, (rawDocs) => {
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
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [collectionName, JSON.stringify(filterFn ? true : false)]);

  return { data, loading, error };
}
