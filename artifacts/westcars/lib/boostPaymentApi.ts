import { FIREBASE_WEB_CONFIG } from "@/lib/firebase-config";
import { getFirebaseIdToken, waitForAuthReady } from "@/lib/firebaseCallable";

const REGION = process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION ?? "us-central1";
const PROJECT_ID = FIREBASE_WEB_CONFIG.projectId;

const DEFAULT_INIT_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/boostPaymentInitialize`;
const DEFAULT_VERIFY_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/boostPaymentVerify`;

const BOOST_INIT_URL =
  process.env.EXPO_PUBLIC_BOOST_PAYMENT_INIT_URL ?? DEFAULT_INIT_URL;
const BOOST_VERIFY_URL =
  process.env.EXPO_PUBLIC_BOOST_PAYMENT_VERIFY_URL ?? DEFAULT_VERIFY_URL;

type ApiErrorBody = { error?: { message?: string; status?: string } };

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (text.trimStart().startsWith("<")) {
    throw new Error("Server returned an unexpected response. Try again shortly.");
  }
  let json: T & ApiErrorBody;
  try {
    json = JSON.parse(text) as T & ApiErrorBody;
  } catch {
    throw new Error("Invalid server response. Check your connection and try again.");
  }
  if (!res.ok) {
    const err = new Error(json.error?.message ?? "Request failed") as Error & { code?: string };
    err.code = `functions/${(json.error?.status ?? "unknown").toLowerCase()}`;
    throw err;
  }
  return json;
}

export interface InitializeBoostPaymentInput {
  planId: string;
  carId?: string;
  email?: string;
  callbackUrl?: string;
}

export interface InitializeBoostPaymentResult {
  reference: string;
  authorizationUrl: string;
  verificationSecret: string;
  accessCode?: string | null;
  amountPesewas: number;
  amountGHS: number;
  planName: string;
  days: number;
}

export interface VerifyBoostPaymentResult {
  ok: boolean;
  status: string;
  expiresAt?: string;
}

export async function initializeBoostPaymentHttp(
  input: InitializeBoostPaymentInput,
): Promise<InitializeBoostPaymentResult> {
  await waitForAuthReady();
  const token = await getFirebaseIdToken(true);

  const res = await fetch(BOOST_INIT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  return parseJsonResponse<InitializeBoostPaymentResult>(res);
}

export async function verifyBoostPaymentHttp(
  reference: string,
  verificationSecret: string,
): Promise<VerifyBoostPaymentResult> {
  const res = await fetch(BOOST_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, verificationSecret }),
  });

  return parseJsonResponse<VerifyBoostPaymentResult>(res);
}
