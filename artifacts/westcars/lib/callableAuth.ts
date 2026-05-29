import { auth } from "@/lib/firebase-persistence";
import { onAuthStateChanged, type User } from "firebase/auth";

const AUTH_WAIT_MS = 12_000;

/**
 * Waits for Firebase Auth to restore from persistence (after cold start or Paystack return).
 */
export function waitForAuthUser(timeoutMs = AUTH_WAIT_MS): Promise<User | null> {
  const a = auth;
  if (!a) return Promise.resolve(null);
  if (a.currentUser) return Promise.resolve(a.currentUser);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(a.currentUser);
    }, timeoutMs);

    const unsub = onAuthStateChanged(a, (user) => {
      if (user) {
        clearTimeout(timer);
        unsub();
        resolve(user);
      }
    });
  });
}

export type PaymentAuthResult =
  | { ok: true; user: User; email: string }
  | { ok: false; reason: "no_auth" | "token_failed"; message: string };

/**
 * Ensures a signed-in Firebase user with a fresh ID token for Cloud Functions callables.
 */
export async function ensurePaymentAuth(emailFallback?: string): Promise<PaymentAuthResult> {
  const user = await waitForAuthUser();
  if (!user) {
    return {
      ok: false,
      reason: "no_auth",
      message: "Please sign in to continue.",
    };
  }

  try {
    await user.getIdToken(true);
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : "";
    if (code === "auth/user-token-expired" || code === "auth/user-disabled") {
      return {
        ok: false,
        reason: "token_failed",
        message: "Your sign-in expired. Please sign in again.",
      };
    }
    // Transient network — retry once without forcing refresh
    try {
      await user.getIdToken(false);
    } catch {
      return {
        ok: false,
        reason: "token_failed",
        message: "Could not refresh your session. Check your connection and try again.",
      };
    }
  }

  const email = user.email?.trim() || emailFallback?.trim() || `buyer_${user.uid.slice(0, 8)}@westcars.app`;
  return { ok: true, user, email };
}

export function isCallableUnauthenticated(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : "";
  return code.includes("unauthenticated");
}

export function callableErrorMessage(err: unknown, fallback: string): string {
  if (isCallableUnauthenticated(err)) {
    return "Your sign-in expired. Please sign in again.";
  }
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: string }).message) || fallback;
  }
  return fallback;
}
