import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

type ActiveStep = "phone" | "id" | "dealer" | null;

export default function VerificationCentreScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser, verifyPhone, verifyId } = useApp();
  const insets = useSafeAreaInsets();

  const [activeStep, setActiveStep] = useState<ActiveStep>(null);
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [successStep, setSuccessStep] = useState<ActiveStep>(null);

  const v = currentUser?.verification;

  const trustScore = currentUser
    ? (v?.phone ? 30 : 0) + (v?.id ? 50 : 0) + (v?.dealer ? 20 : 0)
    : 0;

  const STEPS = [
    {
      key: "phone" as const,
      icon: "phone" as const,
      iconColor: "#0066CC",
      iconBg: isDark ? "#0A2040" : "#EDF4FF",
      title: "Phone Verification",
      subtitle: "Via SMS OTP — instant",
      provider: null,
      points: 30,
      done: !!v?.phone,
    },
    {
      key: "id" as const,
      icon: "credit-card" as const,
      iconColor: "#0EB5CA",
      iconBg: isDark ? "#082028" : "#E0F7FA",
      title: "Identity Verification",
      subtitle: "Ghana Card / Passport",
      provider: "Powered by Kora",
      points: 50,
      done: !!v?.id,
    },
    {
      key: "dealer" as const,
      icon: "briefcase" as const,
      iconColor: "#F59E0B",
      iconBg: isDark ? "#2A1F00" : "#FEF3C7",
      title: "Dealer Verification",
      subtitle: "Business registration · Manual",
      provider: null,
      points: 20,
      done: !!v?.dealer,
    },
  ];

  const handleConfirmPhone = async () => {
    if (!otpValue || otpValue.length < 4) return;
    setLoading(true);
    const ok = await verifyPhone();
    setLoading(false);
    if (ok) {
      setActiveStep(null);
      setSuccessStep("phone");
      setOtpValue("");
    }
  };

  const handleConfirmId = async () => {
    setLoading(true);
    const ok = await verifyId();
    setLoading(false);
    if (ok) {
      setActiveStep(null);
      setSuccessStep("id");
    }
  };

  const handleEmailDealer = () => {
    setActiveStep(null);
    Linking.openURL(
      "mailto:westcarsgh@gmail.com?subject=Dealer Verification Application&body=Hello Westcars Team,%0A%0AI would like to apply for Dealer Verification.%0A%0ABusiness Name:%0ARegistration Number:%0A%0APlease find attached:%0A- Business registration certificate%0A- Dealer licence (if applicable)"
    );
  };

  const closeModal = () => {
    setActiveStep(null);
    setOtpValue("");
    setLoading(false);
  };

  const closeSuccess = () => setSuccessStep(null);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#0EB5CA", "#0098AA"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verification Centre</Text>
          <Text style={styles.headerSub}>Build trust with buyers</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Trust score */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Your Trust Score</Text>
              <Text style={[styles.scoreNum, { color: colors.text }]}>
                {trustScore}
                <Text style={styles.scoreDen}>/100</Text>
              </Text>
            </View>
            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor:
                    trustScore >= 80 ? "#DCFCE7" : trustScore >= 50 ? "#FEF3C7" : "#F3F4F6",
                },
              ]}
            >
              <Feather
                name="shield"
                size={14}
                color={trustScore >= 80 ? "#16A34A" : trustScore >= 50 ? "#D97706" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.scoreBadgeText,
                  {
                    color:
                      trustScore >= 80 ? "#16A34A" : trustScore >= 50 ? "#D97706" : "#9CA3AF",
                  },
                ]}
              >
                {trustScore >= 80 ? "Highly Trusted" : trustScore >= 50 ? "Partially Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          <View style={[styles.scoreBarBg, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.scoreBarFill,
                {
                  width: `${trustScore}%` as any,
                  backgroundColor: trustScore >= 80 ? "#16A34A" : "#0EB5CA",
                },
              ]}
            />
          </View>
          <Text style={[styles.scoreTip, { color: colors.textTertiary }]}>
            Complete all 3 steps to reach 100% and unlock the gold Trusted Seller badge
          </Text>
        </View>

        {/* Steps */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>VERIFICATION STEPS</Text>
        {STEPS.map((step) => (
          <Pressable
            key={step.key}
            style={({ pressed }) => [
              styles.stepCard,
              {
                backgroundColor: colors.card,
                borderColor: step.done ? "rgba(22,163,74,0.4)" : colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={() => setActiveStep(step.key)}
          >
            <View style={[styles.stepIcon, { backgroundColor: step.iconBg }]}>
              <Feather name={step.icon} size={20} color={step.iconColor} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.stepSub, { color: colors.textTertiary }]}>{step.subtitle}</Text>
              {step.provider && (
                <View style={styles.providerRow}>
                  <Feather name="shield" size={10} color="#0EB5CA" />
                  <Text style={styles.providerText}>{step.provider}</Text>
                </View>
              )}
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: step.done ? "#DCFCE7" : "#FEF3C7" },
                ]}
              >
                <Text
                  style={[styles.statusText, { color: step.done ? "#16A34A" : "#D97706" }]}
                >
                  {step.done ? "Verified ✓" : `+${step.points}pts`}
                </Text>
              </View>
              <Feather
                name={step.done ? "check-circle" : "chevron-right"}
                size={16}
                color={step.done ? "#16A34A" : colors.textTertiary}
              />
            </View>
          </Pressable>
        ))}

        {/* Benefits */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>WHY VERIFY?</Text>
        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "eye" as const, text: "Verified listings get 3× more views" },
            { icon: "trending-up" as const, text: "Higher trust score = faster sales" },
            { icon: "shield" as const, text: "Buyers prefer verified sellers by 78%" },
            { icon: "award" as const, text: "Gold badge unlocked at 100% trust score" },
          ].map((b) => (
            <View key={b.text} style={styles.benefitRow}>
              <View style={[styles.benefitIcon, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
                <Feather name={b.icon} size={15} color="#0EB5CA" />
              </View>
              <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Kora note */}
        <View
          style={[
            styles.koraNote,
            { backgroundColor: "rgba(14,181,202,0.07)", borderColor: "rgba(14,181,202,0.25)" },
          ]}
        >
          <Feather name="lock" size={16} color="#0EB5CA" />
          <Text style={[styles.koraNoteText, { color: colors.textSecondary }]}>
            Identity verification is handled securely by{" "}
            <Text style={{ color: "#0EB5CA", fontFamily: "PlusJakartaSans_700Bold" }}>Kora</Text>.
            Your documents are encrypted and never stored on Westcars servers.
          </Text>
        </View>
      </ScrollView>

      {/* ── PHONE MODAL ── */}
      <Modal visible={activeStep === "phone"} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHandle} />
            <View style={[styles.sheetIconWrap, { backgroundColor: "#EDF4FF" }]}>
              <Feather name="phone" size={28} color="#0066CC" />
            </View>
            {v?.phone ? (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Phone Verified ✓</Text>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  Your phone number is verified via SMS OTP. A verified badge is displayed on your profile.
                </Text>
                <Pressable style={[styles.sheetBtn, { backgroundColor: "#0EB5CA" }]} onPress={closeModal}>
                  <Text style={styles.sheetBtnText}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Verify Phone Number</Text>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  A 6-digit OTP will be sent to{" "}
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold", color: colors.text }}>
                    {currentUser?.phone || "your number"}
                  </Text>
                  . Standard SMS rates may apply.
                </Text>
                <View style={[styles.otpInputWrap, { borderColor: colors.border, backgroundColor: colors.background }]}>
                  <Feather name="hash" size={16} color={colors.textTertiary} />
                  <TextInput
                    style={[styles.otpInput, { color: colors.text }]}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpValue}
                    onChangeText={setOtpValue}
                  />
                </View>
                <Pressable
                  style={[styles.sheetBtn, { backgroundColor: "#0EB5CA", opacity: loading ? 0.7 : 1 }]}
                  onPress={handleConfirmPhone}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sheetBtnText}>Verify OTP</Text>
                  )}
                </Pressable>
                <Pressable style={styles.sheetCancelBtn} onPress={closeModal}>
                  <Text style={[styles.sheetCancelText, { color: colors.textTertiary }]}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── ID MODAL ── */}
      <Modal visible={activeStep === "id"} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHandle} />
            <View style={[styles.sheetIconWrap, { backgroundColor: "#E0F7FA" }]}>
              <Feather name="credit-card" size={28} color="#0EB5CA" />
            </View>
            {v?.id ? (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Identity Verified ✓</Text>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  Your identity has been verified by Kora. A verified ID badge appears on your profile and all your listings.
                </Text>
                <Pressable style={[styles.sheetBtn, { backgroundColor: "#0EB5CA" }]} onPress={closeModal}>
                  <Text style={styles.sheetBtnText}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  ID Verification
                </Text>
                <View style={[styles.koraTagRow]}>
                  <Feather name="shield" size={13} color="#0EB5CA" />
                  <Text style={styles.koraTagText}>Powered by Kora</Text>
                </View>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  Kora will verify your identity securely. You will need:
                </Text>
                {["Ghana Card or Passport", "A clear, well-lit selfie"].map((item) => (
                  <View key={item} style={styles.requireRow}>
                    <Feather name="check" size={14} color="#0EB5CA" />
                    <Text style={[styles.requireText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                <Text style={[styles.sheetNote, { color: colors.textTertiary }]}>
                  Verification typically takes 1–5 minutes.
                </Text>
                <Pressable
                  style={[styles.sheetBtn, { backgroundColor: "#0EB5CA", opacity: loading ? 0.7 : 1 }]}
                  onPress={handleConfirmId}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.sheetBtnText}>Start Verification</Text>
                  )}
                </Pressable>
                <Pressable style={styles.sheetCancelBtn} onPress={closeModal}>
                  <Text style={[styles.sheetCancelText, { color: colors.textTertiary }]}>Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── DEALER MODAL ── */}
      <Modal visible={activeStep === "dealer"} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={styles.sheetHandle} />
            <View style={[styles.sheetIconWrap, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="briefcase" size={28} color="#F59E0B" />
            </View>
            {v?.dealer ? (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Dealer Verified ✓</Text>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  Your dealership is verified. A gold dealer badge is shown across all your listings.
                </Text>
                <Pressable style={[styles.sheetBtn, { backgroundColor: "#0EB5CA" }]} onPress={closeModal}>
                  <Text style={styles.sheetBtnText}>Done</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Dealer Verification</Text>
                <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
                  To become a Verified Dealer, email us your documents. Our team reviews applications within 3 business days.
                </Text>
                <Text style={[styles.requiresTitle, { color: colors.text }]}>Required documents:</Text>
                {[
                  "Business registration certificate",
                  "NCA or GPHA dealer licence (if applicable)",
                ].map((item) => (
                  <View key={item} style={styles.requireRow}>
                    <Feather name="file-text" size={14} color="#F59E0B" />
                    <Text style={[styles.requireText, { color: colors.textSecondary }]}>{item}</Text>
                  </View>
                ))}
                <Pressable
                  style={[styles.sheetBtn, { backgroundColor: "#F59E0B" }]}
                  onPress={handleEmailDealer}
                >
                  <Feather name="mail" size={16} color="#fff" />
                  <Text style={styles.sheetBtnText}>Email Us to Apply</Text>
                </Pressable>
                <Pressable style={styles.sheetCancelBtn} onPress={closeModal}>
                  <Text style={[styles.sheetCancelText, { color: colors.textTertiary }]}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── SUCCESS MODAL ── */}
      <Modal visible={!!successStep} transparent animationType="fade" onRequestClose={closeSuccess}>
        <View style={styles.overlay}>
          <View style={[styles.successSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: "#DCFCE7" }]}>
              <Feather name="check-circle" size={36} color="#16A34A" />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>
              {successStep === "phone" ? "Phone Verified!" : "Identity Verified!"}
            </Text>
            <Text style={[styles.successBody, { color: colors.textSecondary }]}>
              {successStep === "phone"
                ? "Your phone number is now verified. A badge has been added to your profile."
                : "Kora has verified your identity. A verified badge now appears on your profile and listings."}
            </Text>
            <Pressable style={[styles.sheetBtn, { backgroundColor: "#16A34A" }]} onPress={closeSuccess}>
              <Text style={styles.sheetBtnText}>Great, thanks!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
  headerSub: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 12 },

  scoreCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scoreTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_500Medium" },
  scoreNum: { fontSize: 32, fontFamily: "PlusJakartaSans_800ExtraBold", lineHeight: 38 },
  scoreDen: { fontSize: 16, fontFamily: "PlusJakartaSans_400Regular" },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreBadgeText: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold" },
  scoreBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreTip: { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 16 },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1,
    marginTop: 4,
  },

  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: { fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" },
  stepSub: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular" },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  providerText: { fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold" },

  benefitsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", flex: 1 },

  koraNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  koraNoteText: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 18, flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
    alignItems: "center",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.15)",
    marginBottom: 8,
  },
  sheetIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  sheetBody: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  sheetNote: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  otpInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    width: "100%",
  },
  otpInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 4,
  },
  koraTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(14,181,202,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  koraTagText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#0EB5CA",
  },
  requiresTitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    alignSelf: "flex-start",
  },
  requireRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
  },
  requireText: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  sheetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 15,
    width: "100%",
    marginTop: 4,
  },
  sheetBtnText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#fff",
  },
  sheetCancelBtn: {
    paddingVertical: 8,
  },
  sheetCancelText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  successSheet: {
    margin: 32,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    textAlign: "center",
  },
  successBody: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
