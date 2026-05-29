import { callFirebaseCallable } from "@/lib/firebaseCallable";
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

export async function initializeBoostPayment(
  input: InitializeBoostPaymentInput,
): Promise<InitializeBoostPaymentResult> {
  return callFirebaseCallable<InitializeBoostPaymentInput, InitializeBoostPaymentResult>(
    "initializeBoostPayment",
    {
      ...input,
      callbackUrl: input.callbackUrl ?? PAYSTACK_CALLBACK_URL,
    },
    { requireAuth: true },
  );
}

/** Uses payment secret from initialize — no re-sign-in after Paystack browser. */
export async function verifyBoostPayment(
  reference: string,
  verificationSecret: string,
): Promise<VerifyBoostPaymentResult> {
  return callFirebaseCallable<
    { reference: string; verificationSecret: string },
    VerifyBoostPaymentResult
  >(
    "verifyBoostPayment",
    { reference, verificationSecret },
    { requireAuth: false },
  );
}
