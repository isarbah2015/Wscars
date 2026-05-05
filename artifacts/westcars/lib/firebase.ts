import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

    if (Platform.OS === "web") {
      auth = getAuth(app);
    } else {
      try {
        // getReactNativePersistence is available at runtime in firebase/auth
        // but not always reflected in TypeScript types for every Firebase version.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getReactNativePersistence } = require("firebase/auth") as {
          getReactNativePersistence: (storage: typeof AsyncStorage) => unknown;
        };
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage) as any,
        });
      } catch {
        // Falls here on Fast Refresh (already initialised) or if persistence
        // factory is unavailable — getAuth returns the existing instance.
        auth = getAuth(app);
      }
    }

    // Default to the named database used by this project.
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
