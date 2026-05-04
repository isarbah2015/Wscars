import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export function GoogleAuthBridge({
  onIdToken,
  promptRef,
}: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:        GOOGLE_WEB_CLIENT_ID,
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    promptRef.current = async () => { await promptAsync(); };
    return () => { promptRef.current = null; };
  }, [promptAsync, promptRef]);

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken    = response.params?.id_token || (response as any).authentication?.idToken;
    const accessToken = (response as any).authentication?.accessToken;
    if (idToken) onIdToken(idToken, accessToken);
  }, [response, onIdToken]);

  return null;
}
