import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { formatGhanaPhone, usePhoneAuth } from "@/hooks/usePhoneAuth";
import { COUNTRY_CODE } from "@/utils/ghanaData";

export default function PhoneAuthScreen() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const {
    recaptchaRef,
    firebaseConfig,
    loading,
    error,
    setError,
    requestOtp,
    verifyOtp,
    reset,
  } = usePhoneAuth();

  const formattedPhone = formatGhanaPhone(phone);

  const handleSend = async () => {
    setError("");
    const ok = await requestOtp(phone);
    if (ok) setStep("otp");
  };

  const handleVerify = async () => {
    setError("");
    const ok = await verifyOtp(code);
    if (ok) router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {firebaseConfig ? (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaRef}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification
        />
      ) : null}

      <View style={styles.inner}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="#aacdd3" />
        </Pressable>

        <Text style={styles.brand}>WestCars</Text>
        <Text style={styles.title}>Sign in with phone</Text>
        <Text style={styles.subtitle}>
          {step === "phone"
            ? "We'll text you a 6-digit verification code."
            : `Enter the code sent to ${formattedPhone}`}
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {step === "phone" ? (
          <>
            <View style={styles.inputRow}>
              <View style={styles.dialBadge}>
                <Text style={styles.dialText}>{COUNTRY_CODE}</Text>
              </View>
              <TextInput
                style={styles.inputFlex}
                placeholder="024 000 0000"
                placeholderTextColor="#7aafb8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
            </View>

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0d3d4a" />
              ) : (
                <Text style={styles.buttonText}>Send code</Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="6-digit code"
              placeholderTextColor="#7aafb8"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0d3d4a" />
              ) : (
                <Text style={styles.buttonText}>Verify & sign in</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                reset();
                setCode("");
                setStep("phone");
              }}
            >
              <Text style={styles.linkText}>← Use a different number</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.disclaimer}>Standard SMS rates may apply.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d3d4a" },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 14,
  },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "web" ? 16 : 56,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 32,
    fontWeight: "700",
    color: "#2ec4c4",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#aacdd3",
    textAlign: "center",
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: "#1a4e5a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  errorText: { color: "#f87171", fontSize: 14, textAlign: "center" },
  input: {
    backgroundColor: "#154555",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#1e5f70",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#154555",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e5f70",
    paddingHorizontal: 12,
    gap: 10,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#ffffff",
  },
  dialBadge: {
    backgroundColor: "rgba(46,196,196,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dialText: { color: "#2ec4c4", fontWeight: "700", fontSize: 13 },
  button: {
    backgroundColor: "#2ec4c4",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#0d3d4a", fontSize: 17, fontWeight: "700" },
  linkText: { color: "#2ec4c4", fontSize: 14, textAlign: "center", marginTop: 4 },
  disclaimer: { color: "#7aafb8", fontSize: 12, textAlign: "center", marginTop: 8 },
});
