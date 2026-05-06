/**
 * Phone OTP sign-in screen (scaffold).
 *
 * NOTE on phone auth limitations:
 * Firebase JS SDK's signInWithPhoneNumber requires a RecaptchaVerifier which
 * does NOT work reliably in React Native. For production-grade phone-OTP login
 * on Android (Play Store), one of the following is required:
 *
 *   1. @react-native-firebase/auth (native module) — requires a custom EAS dev
 *      client; remove this scaffold and use react-native-firebase docs.
 *
 *   2. A third-party SMS verification provider (e.g. Twilio Verify) with a
 *      Cloud Function that mints a Firebase custom token after OTP success.
 *
 * This screen is wired to the UI flow; the OTP send/verify is mocked until
 * one of the above is integrated.
 */
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COUNTRY_CODE } from "@/utils/ghanaData";

export default function PhoneAuthScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const fullPhone = () => (phone.startsWith("+") ? phone : `${COUNTRY_CODE}${phone.replace(/^0+/, "")}`);

  const sendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 9) {
      Alert.alert("Invalid number", "Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    // TODO: Replace with one of:
    //   • signInWithPhoneNumber(auth, fullPhone(), recaptcha)  ← needs RN-compatible verifier
    //   • Cloud-Function-backed Twilio Verify flow
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep("otp");
    Alert.alert("Code sent (demo)", `An OTP would be sent to ${fullPhone()}.`);
  };

  const verifyOtp = async () => {
    if (code.length < 4) {
      Alert.alert("Invalid code", "Please enter the 6-digit code.");
      return;
    }
    setLoading(true);
    // TODO: confirmationResult.confirm(code) → Firebase user
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    Alert.alert(
      "Phone OTP not yet wired",
      "Phone authentication requires either @react-native-firebase/auth (custom dev client) or a Cloud-Function-backed SMS provider. The UI is ready — wire the verifier next.",
    );
  };

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.hero, { paddingTop: topPad + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </Pressable>
        <Text style={styles.title}>Sign in with phone</Text>
        <Text style={styles.subtitle}>
          {step === "phone"
            ? "We'll text you a 6-digit code to verify your number."
            : `Enter the 6-digit code sent to ${fullPhone()}.`}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {step === "phone" ? (
            <>
              <Text style={styles.label}>Phone number</Text>
              <View style={styles.row}>
                <View style={styles.dialBadge}><Text style={styles.dialText}>{COUNTRY_CODE}</Text></View>
                <View style={styles.sep} />
                <TextInput
                  style={styles.input}
                  placeholder="024 000 0000"
                  placeholderTextColor="#C0C0C0"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoFocus
                />
              </View>

              <Pressable
                style={[styles.cta, loading && { opacity: 0.7 }]}
                onPress={sendOtp}
                disabled={loading}
              >
                <Text style={styles.ctaText}>{loading ? "Sending…" : "Send code"}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>6-digit code</Text>
              <View style={styles.row}>
                <Feather name="key" size={16} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="123456"
                  placeholderTextColor="#C0C0C0"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              <Pressable
                style={[styles.cta, loading && { opacity: 0.7 }]}
                onPress={verifyOtp}
                disabled={loading}
              >
                <Text style={styles.ctaText}>{loading ? "Verifying…" : "Verify code"}</Text>
              </Pressable>

              <Pressable onPress={() => setStep("phone")} style={{ marginTop: 8 }}>
                <Text style={styles.linkText}>← Use a different number</Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.disclaimer}>
          Standard SMS rates may apply. We never share your number.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EDF4F7" },
  hero: { backgroundColor: "#fff", paddingHorizontal: 24, paddingBottom: 24, gap: 8 },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  title:    { fontSize: 26, fontFamily: "Manrope_800ExtraBold", color: "#0F172A", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#64748B", lineHeight: 20 },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, gap: 16 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
  },
  label: {
    fontSize: 11, fontFamily: "Inter_700Bold",
    color: "#64748B", letterSpacing: 0.6, textTransform: "uppercase",
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 54, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#FAFAFA",
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", color: "#1A1A1A", padding: 0 },
  dialBadge: {
    backgroundColor: "rgba(14,181,202,0.10)",
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  dialText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#0098AA" },
  sep: { width: 1, height: 22, backgroundColor: "#E0E0E0" },

  cta: {
    height: 52, borderRadius: 12, backgroundColor: "#0EB5CA",
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  ctaText: { fontSize: 16, color: "#fff", fontFamily: "Inter_700Bold" },

  linkText: { fontSize: 13, color: "#0098AA", fontFamily: "Inter_500Medium", textAlign: "center" },
  disclaimer: { fontSize: 12, color: "#9E9E9E", textAlign: "center", fontFamily: "Inter_400Regular" },
});
