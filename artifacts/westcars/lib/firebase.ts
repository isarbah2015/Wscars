/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (set as Replit secrets).
 * If any required value is missing, isFirebaseReady() returns false and
 * AppContext falls back to mock data.
 *
 * Auth is initialized in lib/firebase-persistence (platform-specific files)
 * so native builds use AsyncStorage persistence and web uses localStorage.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = ["apiKey", "projectId", "appId"] as const;
const missing = requiredKeys.filter((k) => !firebaseConfig[k]);

let app:     FirebaseApp     | null = null;
let db:      Firestore       | null = null;
let storage: FirebaseStorage | null = null;

if (missing.length === 0) {
  try {
    // ── App ──────────────────────────────────────────────────────────────
    app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);

    // ── Firestore ─────────────────────────────────────────────────────────
    const databaseId =
      process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID ?? "(default)";
    db = getFirestore(app, databaseId);

    // ── Storage ───────────────────────────────────────────────────────────
    storage = getStorage(app);

  } catch (err) {
    console.warn("[firebase] init failed:", err);
  }
} else if (__DEV__) {
  console.warn(
    `[firebase] Missing config keys: ${missing.join(", ")}. ` +
    `Set EXPO_PUBLIC_FIREBASE_* secrets to enable Firebase.`,
  );
}

export const isFirebaseReady = (): boolean =>
  app !== null && db !== null;

export { app, db, storage };
export default app;
