// @ts-nocheck
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';  // ← FIXED: was '@firebase/auth' which caused "Component auth has not been registered yet"
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase';

let auth: Auth | null = null;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (e: any) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.error('[firebase-persistence] initializeAuth failed:', e);
    try {
      auth = getAuth(app);
    } catch (e2) {
      console.error('[firebase-persistence] getAuth fallback failed:', e2);
    }
  }
}

export { auth };
export default auth;
