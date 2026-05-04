import React from "react";

// expo-auth-session/providers/google requires ExpoCryptoAES which is a
// custom native module NOT included in Expo Go. It only works in a full
// development or production build. We keep this file as a no-op so the
// app loads in Expo Go without crashing. Google sign-in can be wired back
// here once a proper native build is used.
export function GoogleAuthBridge(_props: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  return null;
}
