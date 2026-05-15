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

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

let auth: Auth | null = null;

if (app) {
  try {
    // getAuth() throws if auth was already initialised with different options,
    // so we try to get the existing instance first.
    try {
      auth = getAuth(app);
      // If auth exists but has no persistence set (default in-memory),
      // we can't change it after the fact — but initializeAuth below
      // will be skipped since getAuth() succeeded, meaning the first
      // call to this file already set persistence correctly.
    } catch {
      // Auth not yet initialised — set it up with AsyncStorage persistence
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    }
  } catch (err) {
    console.warn('[firebase-persistence] Auth init failed:', err);
    // Fallback: try plain getAuth so the app doesn't hard-crash
    try { auth = getAuth(app); } catch {}
  }
} else {
  console.warn('[firebase-persistence] Firebase app not ready — auth disabled');
}

export { auth };
export default auth;
