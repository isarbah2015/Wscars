/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (set as Replit secrets).
 * If any required value is missing, isFirebaseReady() returns false and
 * AppContext falls back to mock data.
 *
 * Auth persistence strategy (inlined — no Metro extension helper needed):
 *   Native (Android/iOS) — initializeAuth + getReactNativePersistence(AsyncStorage)
 *     loaded via require() so web bundler never tries to import it.
 *   Web — getAuth(app) which uses browser localStorage automatically.
 *   Fast Refresh / already-initialized — caught and falls back to getAuth(app).
 */
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
    app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);

    // Try AsyncStorage-backed persistence (Android/iOS).
    // Both initializeAuth/getReactNativePersistence and AsyncStorage are loaded
    // via require() so:
    //   • TypeScript sees only the typed getAuth import above (no missing-type error).
    //   • Web bundlers never try to resolve @react-native-async-storage.
    // Falls back to getAuth() on web or when already initialized (Fast Refresh).
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
    } catch {
      auth = getAuth(app);
    }

    const databaseId =
      process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID ?? "westcar-5c1e6";
    db      = getFirestore(app, databaseId);
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
