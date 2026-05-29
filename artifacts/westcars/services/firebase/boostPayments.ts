import { httpsCallable } from "firebase/functions";
import { ensurePaymentAuth } from "@/lib/callableAuth";
import { getFirebaseFunctions } from "@/lib/firebaseFunctions";
import { PAYSTACK_CALLBACK_URL } from "@/lib/paystackCheckout";

export interface InitializeBoostPaymentInput {
  planId: string;
  carId?: string;
  email?: string;
  callbackUrl?: string;
}

export interface InitializeBoostPaymentResult {
  reference: string;
  authorizationUrl: string;
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

async function callWithFreshAuth<TInput extends object, TResult>(
  name: string,
  data: TInput,
): Promise<TResult> {
  const authResult = await ensurePaymentAuth(
    "email" in data && typeof (data as { email?: string }).email === "string"
      ? (data as { email?: string }).email
      : undefined,
  );
  if (!authResult.ok) {
    const err = new Error(authResult.message) as Error & { code?: string };
    err.code = authResult.reason === "no_auth" ? "functions/unauthenticated" : "auth/token-refresh-failed";
    throw err;
  }

  const fn = httpsCallable<TInput, TResult>(getFirebaseFunctions(), name);
  const { data: result } = await fn(data);
  return result;
}

export async function initializeBoostPayment(
  input: InitializeBoostPaymentInput,
): Promise<InitializeBoostPaymentResult> {
  return callWithFreshAuth<InitializeBoostPaymentInput, InitializeBoostPaymentResult>(
    "initializeBoostPayment",
    {
      ...input,
      callbackUrl: input.callbackUrl ?? PAYSTACK_CALLBACK_URL,
    },
  );
}

export async function verifyBoostPayment(reference: string): Promise<VerifyBoostPaymentResult> {
  return callWithFreshAuth<{ reference: string }, VerifyBoostPaymentResult>("verifyBoostPayment", {
    reference,
  });
}
