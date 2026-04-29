/**
 * Firebase initialization for the Westcars Admin web app (Vite).
 * Reads from VITE_FIREBASE_* env vars exposed by Vite.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const cfg = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
} as const;

const required = ["apiKey", "projectId", "appId"] as const;
const missing = required.filter((k) => !cfg[k]);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (missing.length === 0) {
  try {
    app = getApps().length ? getApp() : initializeApp(cfg as any);
    auth = getAuth(app);
    const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID as string | undefined;
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("[firebase] init failed:", err);
  }
} else if (import.meta.env.DEV) {
  console.warn(
    `[firebase] Missing config keys: ${missing.join(", ")}. ` +
    `Admin is running in mock-data mode. Set VITE_FIREBASE_* secrets to enable Firebase.`,
  );
}

export const isFirebaseReady = (): boolean => app !== null && auth !== null && db !== null;
export { app, auth, db, storage };
