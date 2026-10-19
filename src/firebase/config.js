import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if credentials are real vs placeholder
export const isFirebaseConfigured = 
  Boolean(firebaseConfig.apiKey) && 
  !firebaseConfig.apiKey.includes('DemoPharmacyMockKey') && 
  !firebaseConfig.apiKey.includes('your_api_key');

let app = null;
let auth = null;
let db = null;

try {
  if (firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('your_api_key')) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.warn('Firebase initialization note (operating in demo-mode until real credentials provided):', error);
}

export { app, auth, db };
