// @ts-nocheck
/**
 * GoogleAuthBridge — Native (Android / iOS) — REAL IMPLEMENTATION
 * Requires a full dev/production build (not Expo Go)
 */
import React, { useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export function GoogleAuthBridge({
  onIdToken,
  promptRef,
}: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token, access_token } = response.params as Record<string, string>;
      if (id_token) onIdToken(id_token, access_token ?? undefined);
    }
  }, [response, onIdToken]);

  useEffect(() => {
    if (!promptAsync) { promptRef.current = null; return; }
    promptRef.current = async () => { await promptAsync(); };
    return () => { promptRef.current = null; };
  }, [request, promptAsync, promptRef]);

  return null;
}
