import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthChanged,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { fetchCollection } from './firestore';

const DEMO_USER_KEY = 'pharmasense_auth_user';

export async function loginWithEmail(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please check your setup.');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const firebaseUser = userCredential.user;
    
    let profile = null;

    // Strategy 1: direct document lookup by uid (most reliable — standard Firebase pattern)
    if (db) {
      try {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (docSnap.exists()) {
          profile = { id: docSnap.id, ...docSnap.data() };
        }
      } catch (e) {
        console.warn('Direct uid lookup failed, falling back to collection scan:', e);
      }
    }

    // Strategy 2: scan the users collection and match by email or uid
    if (!profile) {
      const users = await fetchCollection('users');
      profile = users.find(
        u => u.email?.toLowerCase() === normalizedEmail || u.uid === firebaseUser.uid
      ) || null;
    }

    if (!profile) {
      // No Firestore profile found — sign out and give a clear message
      await firebaseSignOut(auth);
      throw new Error(
        'No user profile found in the system. Please contact the administrator to set up your account.'
      );
    }
    
    if (profile.status === 'suspended') {
      await firebaseSignOut(auth);
      throw new Error('Your account is currently suspended. Please contact the administrator.');
    }

    if (profile.status === 'pending') {
      await firebaseSignOut(auth);
      throw new Error('Your account is pending Admin approval.');
    }

    if (profile.status === 'rejected') {
      await firebaseSignOut(auth);
      throw new Error('Your account registration was rejected.');
    }
    
    const sessionUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: profile.fullName || firebaseUser.displayName || 'Pharmacy User',
      role: profile.role || 'staff',
      status: profile.status || 'active',
      phone: profile.phone || ''
    };
    
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  } catch (err) {
    console.error('Firebase Auth login failed:', err);
    throw err;
  }
}

export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
  }
  localStorage.removeItem(DEMO_USER_KEY);
}

export function getCurrentSessionUser() {
  try {
    const raw = localStorage.getItem(DEMO_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function sendPasswordReset(email) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured.');
  }
  return firebaseSendPasswordResetEmail(auth, email);
}
