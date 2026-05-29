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

async function refreshTokenIfNeeded(requireAuth: boolean, forceRefresh: boolean): Promise<void> {
  if (!requireAuth) return;
  await waitForAuthReady();
  const user = auth?.currentUser;
  if (!user) return;
  try {
    await user.getIdToken(forceRefresh);
  } catch {
    await user.getIdToken(false).catch(() => {});
  }
}

/**
 * Calls a Firebase callable via the official SDK (correct URL for Gen 2 functions).
 * Do not use manual fetch to cloudfunctions.net — Gen 2 returns HTML and breaks JSON parsing.
 */
export async function callFirebaseCallable<TInput extends object, TResult>(
  name: string,
  data: TInput,
  options?: { requireAuth?: boolean },
): Promise<TResult> {
  const requireAuth = options?.requireAuth !== false;
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt++) {
    await refreshTokenIfNeeded(requireAuth, attempt >= 2);

    if (requireAuth) {
      await waitForAuthReady();
      if (!auth?.currentUser) {
        lastError = new Error("Not signed in");
        await sleep(400 * (attempt + 1));
        continue;
      }
    }

    try {
      const fn = httpsCallable<TInput, TResult>(getFirebaseFunctions(), name);
      const { data: result } = await fn(data);
      return result;
    } catch (err) {
      lastError = err;
      await sleep(450 * (attempt + 1));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not reach Paystack services. Check your connection and try again.");
}

export function callableUserMessage(err: unknown, fallback: string): string {
  const msg =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message)
      : "";

  if (msg.includes("JSON Parse error") || msg.includes("Unexpected character")) {
    return "Server connection error. Update the app or try again in a moment.";
  }
  if (msg && !msg.toLowerCase().includes("sign in")) return msg;
  return fallback;
}
