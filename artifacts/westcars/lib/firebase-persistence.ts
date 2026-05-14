import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

if (!app) {
  throw new Error('[firebase-persistence] Firebase app is not initialized. Check your EXPO_PUBLIC_FIREBASE_* env vars.');
}

let auth: Auth;

try {
  // If auth was already initialized (hot reload / fast refresh), reuse it
  auth = getAuth(app);
} catch {
  // First initialization — set up AsyncStorage persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export default auth;
