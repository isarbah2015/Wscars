/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Firebase v12 automatically detects the React Native environment and uses
 * @react-native-async-storage/async-storage for auth persistence when that
 * package is installed — no manual initializeAuth call is needed.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (set as Replit secrets).
 * If any required value is missing, isFirebaseReady() returns false and
 * AppContext falls back to mock data.
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

    // Firebase v12 auto-handles AsyncStorage persistence on React Native
    // when @react-native-async-storage/async-storage is installed.
    // getAuth() is the correct entry point for all platforms.
    auth = getAuth(app);

    // Fall back to the named database used by this project.
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
