import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAU4uGFnvQkATIOmG3b7h3SsHkSRBQVy1Q",
  authDomain: "westcar-5c1e6.firebaseapp.com",
  projectId: "westcar-5c1e6",
  storageBucket: "westcar-5c1e6.appspot.com",
  messagingSenderId: "765088365666",
  appId: "1:765088365666:android:5a2a7ef1c9f6b123",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const isFirebaseReady = (): boolean => !!app && !!db;
export { app };
export default app;
