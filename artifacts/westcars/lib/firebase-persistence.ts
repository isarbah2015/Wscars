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
  type Auth,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '@/lib/firebase';

let auth: Auth | null = null;

const reactNativeAsyncStoragePersistence = {
  type: 'LOCAL',
  async _isAvailable() {
    try {
      const key = '@westcars/firebase-auth-test';
      await ReactNativeAsyncStorage.setItem(key, '1');
      await ReactNativeAsyncStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  _set(key: string, value: string) {
    return ReactNativeAsyncStorage.setItem(key, value);
  },
  _get(key: string) {
    return ReactNativeAsyncStorage.getItem(key);
  },
  _remove(key: string) {
    return ReactNativeAsyncStorage.removeItem(key);
  },
  _addListener() {},
  _removeListener() {},
} as any;

if (app) {
  try {
    // Initialise first so native sessions persist through AsyncStorage.
    auth = initializeAuth(app, {
      persistence: reactNativeAsyncStoragePersistence,
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
