import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase-persistence";
import { getFirebaseFunctions } from "@/lib/firebaseFunctions";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Wait until Firebase has restored the session from device storage. */
export async function waitForAuthReady(): Promise<void> {
  const a = auth;
  if (!a) return;
  if (typeof a.authStateReady === "function") {
    await a.authStateReady();
    return;
  }
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 10_000);
    const unsub = onAuthStateChanged(a, () => {
      clearTimeout(timer);
      unsub();
      resolve();
    });
  });
}

/** Fresh Firebase ID token for Cloud Functions (Gen 2 RN may not populate request.auth). */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string> {
  await waitForAuthReady();
  const user = auth?.currentUser;
  if (!user) {
    throw new Error("NOT_SIGNED_IN");
  }
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    return await user.getIdToken(false);
  }
}

/**
 * Calls a Firebase Gen 2 callable via the official SDK.
 * When requireAuth is true, sends idToken in the payload for server-side verification.
 */
export async function callFirebaseCallable<TInput extends object, TResult>(
  name: string,
  data: TInput,
  options?: { requireAuth?: boolean },
): Promise<TResult> {
  const requireAuth = options?.requireAuth !== false;
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      let payload: TInput & { idToken?: string } = { ...data };
      if (requireAuth) {
        payload = {
          ...data,
          idToken: await getFirebaseIdToken(attempt >= 2),
        };
      }

      const fn = httpsCallable<typeof payload, TResult>(getFirebaseFunctions(), name);
      const { data: result } = await fn(payload);
      return result;
    } catch (err) {
      lastError = err;
      if (err instanceof Error && err.message === "NOT_SIGNED_IN") {
        throw new Error("You must be signed in to boost a listing.");
      }
      await sleep(450 * (attempt + 1));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not reach Paystack services. Check your connection and try again.");
}

export function callableUserMessage(err: unknown, fallback: string): string {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : "";
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message)
      : "";

  if (code.includes("unauthenticated") || msg.toLowerCase().includes("unauthenticated")) {
    return "Could not confirm your account. Open Profile, sign out, sign in once, then try Boost again.";
  }
  if (msg.includes("JSON Parse error") || msg.includes("Unexpected character")) {
    return "Server connection error. Update the app or try again in a moment.";
  }
  if (msg.includes("NOT_SIGNED_IN") || msg.includes("must be signed in")) {
    return "Sign in to your Westcars account first, then open Boost again.";
  }
  if (msg && !msg.toLowerCase().includes("sign in")) return msg;
  return fallback;
}
