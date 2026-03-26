import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

export default function VerificationCentreScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser, verifyPhone, verifyId, updateUserProfile } = useApp();
  const insets = useSafeAreaInsets();
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [verifyingDealer, setVerifyingDealer] = useState(false);

  const v = currentUser?.verification;

  const handleVerifyPhone = () => {
    if (v?.phone) {
      Alert.alert("Phone Verified ✓", "Your phone number has been verified via SMS. You now show a verified badge.");
      return;
    }
    setVerifyingPhone(true);
    Alert.alert(
      "Verify Phone Number",
      `A 6-digit OTP will be sent to ${currentUser?.phone || "your number"}. Standard SMS rates may apply.`,
      [
        { text: "Cancel", style: "cancel", onPress: () => setVerifyingPhone(false) },
        {
          text: "Send OTP",
          onPress: async () => {
            const ok = await verifyPhone();
            setVerifyingPhone(false);
            if (ok) Alert.alert("Phone Verified! ✓", "Your phone is now verified. A badge has been added to your profile.");
          },
        },
      ]
    );
  };

  const handleVerifyId = () => {
    if (v?.id) {
      Alert.alert("Identity Verified ✓", "Your identity has been verified by Kora. You have a verified ID badge on your profile.");
      return;
    }
    setVerifyingId(true);
    Alert.alert(
      "ID Verification — Powered by Kora",
      "Kora will verify your identity securely. You will need:\n\n• Ghana Card or Passport\n• A clear selfie\n\nVerification typically takes 1–5 minutes.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setVerifyingId(false) },
        {
          text: "Start Verification",
          onPress: async () => {
            const ok = await verifyId();
            setVerifyingId(false);
            if (ok) Alert.alert("ID Verified! ✓", "Your identity has been verified by Kora. A verified badge now appears on your profile and listings.");
          },
        },
      ]
    );
  };

  const handleDealerVerify = () => {
    if (v?.dealer) {
      Alert.alert("Dealer Verified ✓", "Your dealership is verified. You show a gold dealer badge across all listings.");
      return;
    }
    Alert.alert(
      "Dealer Verification",
      "To become a Verified Dealer, email us your:\n\n• Business registration certificate\n• NCA or GPHA dealer licence (if applicable)\n\nOur team reviews applications within 3 business days.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Email Us",
          onPress: () => Linking.openURL("mailto:westcarsgh@gmail.com?subject=Dealer Verification Application"),
        },
      ]
    );
  };

  const trustScore = currentUser ? (
    (v?.phone ? 30 : 0) + (v?.id ? 50 : 0) + (v?.dealer ? 20 : 0)
  ) : 0;

  const STEPS = [
    {
      key: "phone",
      icon: "phone" as const,
      iconColor: "#0066CC",
      iconBg: isDark ? "#0A2040" : "#EDF4FF",
      title: "Phone Verification",
      subtitle: "Via SMS OTP — instant",
      provider: null,
      points: 30,
      done: !!v?.phone,
      onPress: handleVerifyPhone,
      loading: verifyingPhone,
    },
    {
      key: "id",
      icon: "credit-card" as const,
      iconColor: "#0EB5CA",
      iconBg: isDark ? "#082028" : "#E0F7FA",
      title: "Identity Verification",
      subtitle: "Ghana Card / Passport",
      provider: "Powered by Kora",
      points: 50,
      done: !!v?.id,
      onPress: handleVerifyId,
      loading: verifyingId,
    },
    {
      key: "dealer",
      icon: "briefcase" as const,
      iconColor: "#F59E0B",
      iconBg: isDark ? "#2A1F00" : "#FEF3C7",
      title: "Dealer Verification",
      subtitle: "Business registration · Manual",
      provider: null,
      points: 20,
      done: !!v?.dealer,
      onPress: handleDealerVerify,
      loading: verifyingDealer,
    },
  ];

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
        {/* Trust score bar */}
        <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoreTop}>
            <View>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Your Trust Score</Text>
              <Text style={[styles.scoreNum, { color: colors.text }]}>{trustScore}<Text style={styles.scoreDen}>/100</Text></Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: trustScore >= 80 ? "#DCFCE7" : trustScore >= 50 ? "#FEF3C7" : "#F3F4F6" }]}>
              <Feather
                name="shield"
                size={14}
                color={trustScore >= 80 ? "#16A34A" : trustScore >= 50 ? "#D97706" : "#9CA3AF"}
              />
              <Text style={[styles.scoreBadgeText, { color: trustScore >= 80 ? "#16A34A" : trustScore >= 50 ? "#D97706" : "#9CA3AF" }]}>
                {trustScore >= 80 ? "Highly Trusted" : trustScore >= 50 ? "Partially Verified" : "Unverified"}
              </Text>
            </View>
          </View>
          <View style={[styles.scoreBarBg, { backgroundColor: colors.background }]}>
            <View style={[styles.scoreBarFill, { width: `${trustScore}%` as any, backgroundColor: trustScore >= 80 ? "#16A34A" : "#0EB5CA" }]} />
          </View>
          <Text style={[styles.scoreTip, { color: colors.textTertiary }]}>
            Complete all 3 steps to reach 100% and unlock the gold Trusted Seller badge
          </Text>
        </View>

        {/* Verification steps */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>VERIFICATION STEPS</Text>

        {STEPS.map((step) => (
          <Pressable
            key={step.key}
            style={[styles.stepCard, { backgroundColor: colors.card, borderColor: step.done ? "rgba(22,163,74,0.4)" : colors.border }]}
            onPress={step.onPress}
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
              <View style={[styles.statusBadge, { backgroundColor: step.done ? "#DCFCE7" : "#FEF3C7" }]}>
                <Text style={[styles.statusText, { color: step.done ? "#16A34A" : "#D97706" }]}>
                  {step.done ? "Verified ✓" : `+${step.points}pts`}
                </Text>
              </View>
              {!step.done && (
                <Feather name="chevron-right" size={16} color={colors.textTertiary} />
              )}
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
        <View style={[styles.koraNote, { backgroundColor: "rgba(14,181,202,0.07)", borderColor: "rgba(14,181,202,0.25)" }]}>
          <Feather name="lock" size={16} color="#0EB5CA" />
          <Text style={[styles.koraNoteText, { color: colors.textSecondary }]}>
            Identity verification is handled securely by <Text style={{ color: "#0EB5CA", fontFamily: "Manrope_700Bold" }}>Kora</Text>. Your documents are encrypted and never stored on Westcars servers. Kora's privacy policy applies.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 18, gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 12 },

  scoreCard: {
    borderRadius: 18, borderWidth: 1, padding: 18, gap: 12,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  scoreTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreLabel: { fontSize: 12, fontFamily: "Manrope_500Medium" },
  scoreNum: { fontSize: 32, fontFamily: "Manrope_800ExtraBold", lineHeight: 38 },
  scoreDen: { fontSize: 16, fontFamily: "Manrope_400Regular" },
  scoreBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  scoreBadgeText: { fontSize: 12, fontFamily: "Manrope_700Bold" },
  scoreBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: 8, borderRadius: 4 },
  scoreTip: { fontSize: 11, fontFamily: "Manrope_400Regular", lineHeight: 16 },

  sectionLabel: { fontSize: 11, fontFamily: "Manrope_700Bold", letterSpacing: 1, marginTop: 4 },

  stepCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  stepIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  stepTitle: { fontSize: 14, fontFamily: "Manrope_700Bold" },
  stepSub: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  providerText: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: "#0EB5CA" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: "Manrope_700Bold" },

  benefitsCard: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitText: { fontSize: 13, fontFamily: "Manrope_400Regular", flex: 1 },

  koraNote: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 14, borderWidth: 1, padding: 14,
  },
  koraNoteText: { fontSize: 12, fontFamily: "Manrope_400Regular", lineHeight: 18, flex: 1 },
});
