/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (set as Replit secrets).
 * If any required value is missing, isFirebaseReady() returns false and
 * AppContext falls back to mock data.
 *
 * Auth persistence strategy:
 *   Native (Android/iOS) — initAuthNative() in firebase-persistence.native.ts
 *     uses Metro's react-native conditional export to get
 *     getReactNativePersistence, giving proper AsyncStorage-backed persistence.
 *   Web — initAuthNative() in firebase-persistence.ts calls getAuth(app) which
 *     uses browser localStorage automatically.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { initAuthNative } from "./firebase-persistence";

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

    // initAuthNative() resolves to the .native.ts file on Android/iOS (gives
    // AsyncStorage persistence) and the .ts stub on web (getAuth, localStorage).
    // Falls back to plain getAuth if already initialized (Fast Refresh).
    try {
      auth = initAuthNative(app);
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
