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
import { resolveFirebaseConfig } from "@/lib/firebase-config";

const firebaseConfig = resolveFirebaseConfig();
console.log('[firebase] config resolved:', firebaseConfig ? 'OK' : 'NULL');
const missing = firebaseConfig
  ? []
  : (["apiKey", "projectId", "appId"] as const);

let app:     FirebaseApp     | null = null;
let db:      Firestore       | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseConfig) {
  try {
    // ── App ──────────────────────────────────────────────────────────────
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);

    // ── Firestore ─────────────────────────────────────────────────────────
    const databaseId =
      process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID ?? "(default)";
    db = getFirestore(app, databaseId);

    // ── Storage ───────────────────────────────────────────────────────────
    storage = getStorage(app);

  } catch (err) {
    console.warn("[firebase] init failed:", err);
  }
} else {
  // Always warn — not just in dev — so production crash logs surface this.
  const level = __DEV__ ? "warn" : "error";
  console[level](
    `[firebase] Missing required config keys: ${missing.join(", ")}. ` +
    (__DEV__
      ? "Set EXPO_PUBLIC_FIREBASE_* secrets to enable Firebase."
      : "PRODUCTION BUILD has no Firebase config — check EAS secrets / env vars."),
  );
}

export const isFirebaseReady = (): boolean =>
  app !== null && db !== null;

export { app, db, storage };
export default app;
