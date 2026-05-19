// @ts-nocheck
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase';

let auth: ReturnType<typeof getAuth>;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  console.log('[auth] initializeAuth success');
} catch (e: any) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('[auth] already initialized — using getAuth');
  } else {
    console.error('[auth] initializeAuth failed:', e);
    auth = getAuth(app);
  }
}

export { auth };
export default auth;
