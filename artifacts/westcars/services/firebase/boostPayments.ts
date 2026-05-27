import { httpsCallable } from "firebase/functions";
import { getFirebaseFunctions } from "@/lib/firebaseFunctions";

export interface InitializeBoostPaymentInput {
  planId: string;
  carId?: string;
  email?: string;
}

export interface InitializeBoostPaymentResult {
  reference: string;
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
  const fn = httpsCallable<InitializeBoostPaymentInput, InitializeBoostPaymentResult>(
    getFirebaseFunctions(),
    "initializeBoostPayment",
  );
  const { data } = await fn(input);
  return data;
}

export async function verifyBoostPayment(reference: string): Promise<VerifyBoostPaymentResult> {
  const fn = httpsCallable<{ reference: string }, VerifyBoostPaymentResult>(
    getFirebaseFunctions(),
    "verifyBoostPayment",
  );
  const { data } = await fn({ reference });
  return data;
}
