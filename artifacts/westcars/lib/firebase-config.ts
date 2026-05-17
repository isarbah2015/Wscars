/**
 * Resolves Firebase web config from EXPO_PUBLIC_FIREBASE_* env vars, with a
 * fallback to google-services.json (already bundled for Android builds).
 */
import Constants from "expo-constants";
import googleServices from "../google-services.json";

export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function configFromGoogleServices(): Partial<FirebaseWebConfig> | null {
  try {
    const pinfo = googleServices.project_info;
    const client = googleServices.client?.[0];
    const apiKey = client?.api_key?.[0]?.current_key;
    const appId = client?.client_info?.mobilesdk_app_id;
    if (!pinfo?.project_id || !apiKey || !appId) return null;

    const projectId = pinfo.project_id;
    return {
      apiKey,
      authDomain: `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket:
        pinfo.storage_bucket ?? `${projectId}.firebasestorage.app`,
      messagingSenderId: pinfo.project_number,
      appId,
    };
  } catch {
    return null;
  }
}

const extraFirebase =
  (Constants.expoConfig?.extra?.firebase ??
    (Constants as any).manifest2?.extra?.expoClient?.extra?.firebase ??
    {}) as Partial<FirebaseWebConfig>;

function envOrExtra(envKey: string, extraKey: keyof FirebaseWebConfig, fallback = "") {
  return process.env[envKey] ?? extraFirebase[extraKey] ?? fallback;
}

export function resolveFirebaseConfig(): FirebaseWebConfig | null {
  const fallback = configFromGoogleServices();

  const config = {
    apiKey:
      envOrExtra("EXPO_PUBLIC_FIREBASE_API_KEY", "apiKey", fallback?.apiKey),
    authDomain:
      envOrExtra("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN", "authDomain", fallback?.authDomain),
    projectId:
      envOrExtra("EXPO_PUBLIC_FIREBASE_PROJECT_ID", "projectId", fallback?.projectId),
    storageBucket:
      envOrExtra("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET", "storageBucket", fallback?.storageBucket),
    messagingSenderId:
      envOrExtra("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "messagingSenderId", fallback?.messagingSenderId),
    appId:
      envOrExtra("EXPO_PUBLIC_FIREBASE_APP_ID", "appId", fallback?.appId),
  };

  const required = ["apiKey", "projectId", "appId"] as const;
  if (required.some((k) => !config[k])) return null;

  return config;
}
