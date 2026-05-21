import { useRef, useState } from "react";
import type { ConfirmationResult } from "firebase/auth";
import FirebaseRecaptchaVerifierModal from "@/components/firebase-recaptcha/FirebaseRecaptchaVerifierModal";
import { confirmPhoneOtp, sendPhoneOtp, authErrorMessage } from "@/services/firebase/auth";
import { resolveFirebaseConfig } from "@/lib/firebase-config";
import { auth } from "@/lib/firebase-persistence";
import { COUNTRY_CODE } from "@/utils/ghanaData";

export function formatGhanaPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (input.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("233")) return `+${digits}`;
  if (digits.startsWith("0")) return `${COUNTRY_CODE}${digits.slice(1)}`;
  return `${COUNTRY_CODE}${digits}`;
}

export function usePhoneAuth() {
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const firebaseConfig = resolveFirebaseConfig();

  const requestOtp = async (rawPhone: string) => {
    setError("");
    if (!auth) {
      setError("Authentication is not available. Check your connection.");
      return false;
    }
    if (!firebaseConfig) {
      setError("Firebase is not configured on this build.");
      return false;
    }
    const phone = formatGhanaPhone(rawPhone);
    if (phone.replace(/\D/g, "").length < 12) {
      setError("Enter a valid Ghana phone number.");
      return false;
    }
    setLoading(true);
    try {
      const verifier = recaptchaRef.current;
      if (!verifier) {
        setError("Verification is not ready. Please try again.");
        return false;
      }
      const result = await sendPhoneOtp(phone, verifier);
      setConfirmation(result);
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setError("");
    if (!confirmation) {
      setError("Request a new code first.");
      return false;
    }
    if (code.replace(/\D/g, "").length < 6) {
      setError("Enter the 6-digit code.");
      return false;
    }
    setLoading(true);
    try {
      await confirmPhoneOtp(confirmation, code.trim());
      setConfirmation(null);
      return true;
    } catch (err) {
      setError(authErrorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setConfirmation(null);
    setError("");
  };

  return {
    recaptchaRef,
    firebaseConfig,
    confirmation,
    loading,
    error,
    setError,
    requestOtp,
    verifyOtp,
    reset,
  };
}
