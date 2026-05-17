/**
 * lib/firebase-persistence.ts
 *
 * Initialises Firebase Auth with AsyncStorage persistence so the user's
 * session is saved to device storage and survives app restarts, updates,
 * and background kills — they should never have to sign in again.
 *
 * WHY THIS FILE EXISTS SEPARATELY FROM lib/firebase.ts:
 * - Firestore + Storage can share one initializeApp() call
 * - Auth persistence on React Native requires getReactNativePersistence()
 *   which needs AsyncStorage — a native module not available on web
 * - Keeping auth init here lets web builds use browserLocalPersistence
 *   without crashing on the AsyncStorage import
 */

import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

let auth: Auth | null = null;

if (app) {
  try {
    // Web uses browser local persistence. Native resolves firebase-persistence.native.ts.
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
    });
  } catch (err) {
    // Auth may already be initialised by another import path; reuse it.
    try { auth = getAuth(app); } catch {}
  }
} else {
  console.warn('[firebase-persistence] Firebase app not ready — auth disabled');
}

export { auth };
export default auth;
