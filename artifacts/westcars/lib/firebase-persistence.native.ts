import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase';

let auth: Auth | null = null;

console.log('[firebase-persistence] native load, app ready:', !!app);

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
    auth = initializeAuth(app, {
      persistence: reactNativeAsyncStoragePersistence,
    });
    console.log('[firebase-persistence] native initializeAuth succeeded');
  } catch (err) {
    console.error('[firebase-persistence] initializeAuth failed, falling back to getAuth:', err);
    try {
      auth = getAuth(app);
      console.log('[firebase-persistence] native getAuth fallback succeeded');
    } catch (fallbackErr) {
      console.error('[firebase-persistence] getAuth fallback failed:', fallbackErr);
    }
  }
} else {
  console.error('[firebase-persistence] native Firebase app is null before auth initialization');
}

export { auth };
