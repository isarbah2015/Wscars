// @ts-nocheck
/**
 * GoogleAuthBridge — Native (Android / iOS)
 * Uses native Google Sign-In (not browser OAuth) for Firebase compliance.
 */
import React, { useEffect } from "react";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { resolveGoogleAuthConfig } from "@/lib/google-auth-config";

export function GoogleAuthBridge({
  onIdToken,
  onAuthFinished,
  onAuthError,
  promptRef,
}: {
  onIdToken: (idToken: string, accessToken?: string) => void;
  onAuthFinished?: () => void;
  onAuthError?: (message: string) => void;
  promptRef: React.MutableRefObject<(() => Promise<void>) | null>;
}) {
  const { webClientId, iosClientId } = resolveGoogleAuthConfig();

  useEffect(() => {
    if (!webClientId) return;
    GoogleSignin.configure({
      webClientId,
      iosClientId,
      offlineAccess: false,
    });
  }, [webClientId, iosClientId]);

  useEffect(() => {
    promptRef.current = async () => {
      try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();
        if (isSuccessResponse(response)) {
          const idToken = response.data?.idToken;
          if (idToken) {
            onIdToken(idToken, response.data?.serverAuthCode ?? undefined);
            return;
          }
          onAuthError?.("Google sign-in did not return a token. Try again.");
          onAuthFinished?.();
          return;
        }
        onAuthFinished?.();
      } catch (error) {
        if (isErrorWithCode(error)) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            onAuthFinished?.();
            return;
          }
          if (error.code === statusCodes.IN_PROGRESS) {
            onAuthFinished?.();
            return;
          }
          if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            onAuthError?.("Google Play Services is required for sign-in.");
            onAuthFinished?.();
            return;
          }
          if (error.code === "10" || error.code === 10) {
            onAuthError?.(
              "Google sign-in is misconfigured (SHA-1 / OAuth client). Contact support or try email sign-in.",
            );
            onAuthFinished?.();
            return;
          }
        }
        onAuthError?.("Google sign-in failed. Please try again.");
        onAuthFinished?.();
      }
    };
    return () => {
      promptRef.current = null;
    };
  }, [onIdToken, onAuthFinished, onAuthError, promptRef]);

  return null;
}
