import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBqTMQdMYBYK9lcT2cwxL8lMcHSIrHimLI",
  authDomain: "westcar-5c1e6.firebaseapp.com",
  projectId: "westcar-5c1e6",
  storageBucket: "westcar-5c1e6.firebasestorage.app",
  messagingSenderId: "778261594022",
  appId: "1:778261594022:web:fd731c1448c97750b91967",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, 'westcar-5c1e6');
export const storage = getStorage(app);
export const isFirebaseReady = (): boolean => !!app && !!db;
export { app };
export default app;
