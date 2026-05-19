import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAx63IHICZGjQ9Ee22RuiQ9Vp4Ff61-oP4",
  authDomain: "westcar-5c1e6.firebaseapp.com",
  projectId: "westcar-5c1e6",
  storageBucket: "westcar-5c1e6.firebasestorage.app",
  messagingSenderId: "778261594022",
  appId: "1:778261594022:android:b25d665d6a020597b91967",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const isFirebaseReady = (): boolean => !!app && !!db;
export { app };
export default app;
