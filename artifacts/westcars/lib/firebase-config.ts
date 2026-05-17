/**
 * Resolves Firebase web config from EXPO_PUBLIC_FIREBASE_* env vars, with a
 * fallback to google-services.json (already bundled for Android builds).
 */
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

export function resolveFirebaseConfig(): FirebaseWebConfig | null {
  const fallback = configFromGoogleServices();

  const config = {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? fallback?.apiKey ?? "",
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      fallback?.authDomain ??
      "",
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
      fallback?.projectId ??
      "",
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      fallback?.storageBucket ??
      "",
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      fallback?.messagingSenderId ??
      "",
    appId:
      process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? fallback?.appId ?? "",
  };

  const required = ["apiKey", "projectId", "appId"] as const;
  if (required.some((k) => !config[k])) return null;

  return config;
}
