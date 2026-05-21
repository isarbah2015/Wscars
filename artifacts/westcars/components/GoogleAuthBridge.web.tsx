import React, { useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase-persistence";

export function GoogleAuthBridge({
  onIdToken,
  promptRef,
}: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  onAuthError?: (message: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  useEffect(() => {
    promptRef.current = async () => {
      if (!auth) throw new Error("Firebase is not configured.");
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const idToken = credential?.idToken ?? (await result.user.getIdToken());
      onIdToken(idToken, credential?.accessToken ?? undefined);
    };
    return () => {
      promptRef.current = null;
    };
  }, [onIdToken, promptRef]);

  return null;
}
