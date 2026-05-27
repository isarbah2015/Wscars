import { Platform } from "react-native";
import googleServices from "../google-services.json";

export type GoogleAuthConfig = {
  androidClientId?: string;
  iosClientId?: string;
  /** Web client ID — required for Firebase idToken on Android/iOS native sign-in. */
  webClientId?: string;
};

const WEB_CLIENT_ID_FALLBACK =
  "778261594022-pcjs02bpm0hgu0ield7o0pmiaa4v5qta.apps.googleusercontent.com";

const IOS_CLIENT_ID_FALLBACK =
  "778261594022-mn0nqerq73nktnl1il1878e9gk4vha9a.apps.googleusercontent.com";

/** Resolve OAuth client IDs from env, falling back to bundled google-services.json. */
export function resolveGoogleAuthConfig(): GoogleAuthConfig {
  const client = googleServices.client?.[0];
  const oauthClients = client?.oauth_client ?? [];
  const otherClients =
    client?.services?.appinvite_service?.other_platform_oauth_client ?? [];

  let androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  let iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  let webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!androidClientId) {
    androidClientId = oauthClients.find((c) => c.client_type === 1)?.client_id;
  }
  if (!webClientId) {
    webClientId =
      oauthClients.find((c) => c.client_type === 3)?.client_id ??
      WEB_CLIENT_ID_FALLBACK;
  }
  if (!iosClientId) {
    iosClientId =
      otherClients.find((c) => c.client_type === 2)?.client_id ??
      IOS_CLIENT_ID_FALLBACK;
  }

  return { androidClientId, iosClientId, webClientId };
}

export function isGoogleAuthConfigured(): boolean {
  const { androidClientId, iosClientId, webClientId } = resolveGoogleAuthConfig();
  if (Platform.OS === "android") return !!(androidClientId && webClientId);
  if (Platform.OS === "ios") return !!(iosClientId && webClientId);
  return !!webClientId;
}

/** iOS URL scheme for Google Sign-In config plugin (reversed iOS client id). */
export function getGoogleIosUrlScheme(): string {
  const { iosClientId } = resolveGoogleAuthConfig();
  const id = iosClientId?.replace(".apps.googleusercontent.com", "") ?? "";
  return id ? `com.googleusercontent.apps.${id}` : "";
}
