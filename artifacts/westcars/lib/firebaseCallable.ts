import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase-persistence";
import { FIREBASE_WEB_CONFIG } from "@/lib/firebase-config";
import { getFirebaseFunctions } from "@/lib/firebaseFunctions";

const REGION = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1";
const PROJECT_ID = FIREBASE_WEB_CONFIG.projectId;

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

async function getIdToken(forceRefresh: boolean): Promise<string | null> {
  await waitForAuthReady();
  const user = auth?.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    try {
      return await user.getIdToken(false);
    } catch {
      return null;
    }
  }
}

type CallableEnvelope<T> = { result?: T; error?: { message?: string; status?: string } };

async function callCallableHttp<T>(name: string, data: unknown, token: string | null): Promise<T> {
  const url = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/${name}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  const json = (await res.json()) as CallableEnvelope<T>;
  if (json.error) {
    const err = new Error(json.error.message ?? "Request failed") as Error & { code?: string };
    err.code = `functions/${String(json.error.status ?? "unknown").toLowerCase()}`;
    throw err;
  }
  return json.result as T;
}

/**
 * Calls a Firebase callable with retries and explicit Bearer token (fixes RN token attach issues).
 */
export async function callFirebaseCallable<TInput extends object, TResult>(
  name: string,
  data: TInput,
  options?: { requireAuth?: boolean },
): Promise<TResult> {
  const requireAuth = options?.requireAuth !== false;
  let lastError: unknown;

  for (let attempt = 0; attempt < 4; attempt++) {
    const forceRefresh = attempt >= 2;
    const token = requireAuth ? await getIdToken(forceRefresh) : await getIdToken(false);

    if (requireAuth && !token) {
      await sleep(350 * (attempt + 1));
      continue;
    }

    try {
      if (token && auth?.currentUser) {
        const fn = httpsCallable<TInput, TResult>(getFirebaseFunctions(), name);
        const { data: result } = await fn(data);
        return result;
      }
      return await callCallableHttp<TResult>(name, data, token);
    } catch (err) {
      lastError = err;
      await sleep(400 * (attempt + 1));
    }
  }

  if (requireAuth) {
    const token = await getIdToken(true);
    if (token) {
      try {
        return await callCallableHttp<TResult>(name, data, token);
      } catch (err) {
        lastError = err;
      }
    }
  } else {
    try {
      return await callCallableHttp<TResult>(name, data, null);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not reach the server. Try again.");
}

export function callableUserMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message?: string }).message);
    if (msg && !msg.toLowerCase().includes("sign in")) return msg;
  }
  return fallback;
}
