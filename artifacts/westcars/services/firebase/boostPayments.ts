import { PAYSTACK_CALLBACK_URL } from "@/lib/paystackCheckout";
import {
  initializeBoostPaymentHttp,
  verifyBoostPaymentHttp,
  type InitializeBoostPaymentInput,
  type InitializeBoostPaymentResult,
  type VerifyBoostPaymentResult,
} from "@/lib/boostPaymentApi";

export type {
  InitializeBoostPaymentInput,
  InitializeBoostPaymentResult,
  VerifyBoostPaymentResult,
};

export async function initializeBoostPayment(
  input: InitializeBoostPaymentInput,
): Promise<InitializeBoostPaymentResult> {
  return initializeBoostPaymentHttp({
    ...input,
    callbackUrl: input.callbackUrl ?? PAYSTACK_CALLBACK_URL,
  });
}

export async function verifyBoostPayment(
  reference: string,
  verificationSecret: string,
): Promise<VerifyBoostPaymentResult> {
  return verifyBoostPaymentHttp(reference, verificationSecret);
}
