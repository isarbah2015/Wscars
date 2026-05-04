import React from "react";

// expo-auth-session / expo-crypto require native modules that do not exist on web.
// Metro resolves this file on web so the native version is never bundled.
export function GoogleAuthBridge(_props: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  return null;
}
