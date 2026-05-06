/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (set as Replit secrets).
 * If any required value is missing, isFirebaseReady() returns false and
 * AppContext falls back to mock data.
 *
 * Auth persistence strategy:
 *   Native (Android/iOS) — initializeAuth + getReactNativePersistence(AsyncStorage)
 *     loaded via require() so the web bundler never tries to import it.
 *   Web — getAuth(app) which uses browser localStorage automatically.
 *
 * Resilience rules:
 *   • The auth init is isolated in its OWN try/catch so a failure there never
 *     prevents db / storage from initialising (and never surfaces as the outer
 *     "init failed" warning).
 *   • If initializeAuth throws (e.g. already-initialized on Fast Refresh, or
 *     duplicate-module mismatch), we fall back to getAuth(app) in a SECOND
 *     isolated try/catch so that exception also cannot escape.
 *   • db and storage are always attempted independently of auth.
 */
import { Platform } from "react-native";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
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
let auth:    Auth            | null = null;
let db:      Firestore       | null = null;
let storage: FirebaseStorage | null = null;

if (missing.length === 0) {
  try {
    // ── App ──────────────────────────────────────────────────────────────
    app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);

    // ── Auth ─────────────────────────────────────────────────────────────
    // Attempt 1: native persistence via AsyncStorage (best UX on device).
    // Both imports are via require() so the web bundler never touches them.
    if (Platform.OS !== "web") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const AsyncStorage = require("@react-native-async-storage/async-storage").default;
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch {
        // initializeAuth failed — fall through to attempt 2.
      }
    }

    // Attempt 2: getAuth() — memory persistence on native, localStorage on web.
    // This is always safe because metro.config.js pins all @firebase/* packages
    // to the same v11 copies that the firebase app was created with.
    if (!auth) {
      try {
        auth = getAuth(app);
      } catch (e2) {
        console.warn("[firebase] auth init failed (both attempts):", e2);
      }
    }

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
  app !== null && auth !== null && db !== null;

export { app, auth, db, storage };
