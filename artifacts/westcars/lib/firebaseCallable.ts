import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-persistence";

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

/** Firebase ID token for Boost HTTP API (Authorization: Bearer). */
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

export function callableUserMessage(err: unknown, fallback: string): string {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: string }).code) : "";
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message)
      : "";

  if (msg.includes("JSON Parse error") || msg.includes("Unexpected character")) {
    return "Server connection error. Try again in a moment.";
  }
  if (code.includes("unauthenticated") || msg.toLowerCase().includes("sign in")) {
    return "We could not connect your account to payment. Force-close the app, open it again, then try Boost.";
  }
  if (msg.includes("NOT_SIGNED_IN")) {
    return "Sign in to Westcars first, then open Boost.";
  }
  if (msg) return msg;
  return fallback;
}
