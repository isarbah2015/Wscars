/**
 * Firebase initialization for the Westcars Expo app.
 *
 * Reads config from EXPO_PUBLIC_FIREBASE_* env vars (must be set as Replit
 * secrets). If any value is missing, isFirebaseReady() returns false and the
 * AppContext falls back to mock data so dev keeps working without secrets.
 */
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
      // RN needs initializeAuth with AsyncStorage persistence the first time.
      // getReactNativePersistence is only available in the RN build of
      // firebase/auth, so we resolve it dynamically to avoid import errors
      // on web.
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getReactNativePersistence } = require("firebase/auth") as any;
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence
            ? getReactNativePersistence(AsyncStorage)
            : undefined,
        });
      } catch {
        // initializeAuth throws if it was already initialised (Fast Refresh)
        auth = getAuth(app);
      }
    }
    const databaseId = process.env.EXPO_PUBLIC_FIREBASE_DATABASE_ID;
    db      = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("[firebase] init failed:", err);
  }
} else if (__DEV__) {
  console.warn(
    `[firebase] Missing config keys: ${missing.join(", ")}. ` +
    `App is running in mock-data mode. Set EXPO_PUBLIC_FIREBASE_* secrets to enable Firebase.`,
  );
}

export const isFirebaseReady = (): boolean => app !== null && auth !== null && db !== null;

export { app, auth, db, storage };
