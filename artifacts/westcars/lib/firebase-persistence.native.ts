// @ts-nocheck
import { initializeAuth, getAuth, getReactNativePersistence, type Auth } from '@firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase';

console.log('[firebase-persistence] native loaded');
console.log('[firebase-persistence] app is:', app ? 'READY' : 'NULL');

let auth: Auth | null = null;

if (app) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
    console.log('[firebase-persistence] initializeAuth success');
  } catch (err: any) {
    if (err?.code === 'auth/already-initialized') {
      auth = getAuth(app);
      console.log('[firebase-persistence] reused existing auth instance');
    } else {
      console.error('[firebase-persistence] initializeAuth failed:', err);
      try {
        auth = getAuth(app);
      } catch (e) {
        console.error('[firebase-persistence] getAuth fallback failed:', e);
      }
    }
  }
}

export { auth };
export default auth;
