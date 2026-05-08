// @ts-nocheck
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebase';

let auth = null;
if (app) {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    try { auth = getAuth(app); } catch {}
  }
}

export { auth };
