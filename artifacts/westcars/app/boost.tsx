import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  AppState,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { BOOST_PLANS, formatGHS } from "@/lib/paystack";
import type { BoostPlan } from "@/lib/paystack";
import {
  callableErrorMessage,
  ensurePaymentAuth,
  isCallableUnauthenticated,
} from "@/lib/callableAuth";
import { openPaystackHostedCheckout } from "@/lib/paystackCheckout";
import { initializeBoostPayment, verifyBoostPayment } from "@/services/firebase/boostPayments";

function waitForAppActive(timeoutMs = 8000): Promise<void> {
  if (AppState.currentState === "active") return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      sub.remove();
      resolve();
    }, timeoutMs);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        clearTimeout(timer);
        sub.remove();
        resolve();
      }
    });
  });
}

export default function BoostScreen() {
  const { currentUser, isAuthenticated } = useApp();
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ carId?: string }>();
  const carId = params.carId;

  const [selectedPlan, setSelectedPlan] = useState<BoostPlan>(BOOST_PLANS[0]);
  const [paying, setPaying] = useState(false);
  const [checkoutReference, setCheckoutReference] = useState<string | null>(null);

  const emailFallback = firebaseUser?.email ?? currentUser?.email ?? undefined;

  const goToReauth = useCallback(() => {
    const returnTo = carId ? `/boost?carId=${encodeURIComponent(carId)}` : "/boost";
    router.push({
      pathname: "/auth/login",
      params: { returnTo, reauth: "1" },
    });
  }, [carId]);

  const completePaymentOnServer = async (reference: string) => {
    setPaying(true);
    try {
      await waitForAppActive();
      const authResult = await ensurePaymentAuth(emailFallback);
      if (!authResult.ok) {
        Alert.alert("Sign in required", authResult.message, [
          { text: "Sign in", onPress: goToReauth },
          { text: "Cancel", style: "cancel" },
        ]);
        return;
      }

      const result = await verifyBoostPayment(reference);
      if (result.ok && result.status === "completed") {
        Alert.alert(
          "Boost active 🚀",
          `Your listing is boosted for ${selectedPlan.days} days.`,
          [{ text: "Done", onPress: () => router.back() }],
        );
        return;
      }
      Alert.alert("Pending", "Payment is still processing. Try again in a few seconds.");
    } catch (err: unknown) {
      if (isCallableUnauthenticated(err)) {
        Alert.alert(
          "Sign in required",
          "Please sign in again to finish activating your boost. Your payment is still valid.",
          [
            { text: "Sign in", onPress: goToReauth },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else {
        Alert.alert("Verification failed", callableErrorMessage(err, "Could not verify payment."));
      }
    } finally {
      setPaying(false);
      setCheckoutReference(null);
    }
  };

  const startPayment = async () => {
    if (authLoading) {
      Alert.alert("Please wait", "Restoring your session…");
      return;
    }

    if (!isAuthenticated && !firebaseUser) {
      Alert.alert("Sign in required", "Please sign in to boost a listing.", [
        { text: "Sign in", onPress: goToReauth },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    setPaying(true);
    try {
      const authResult = await ensurePaymentAuth(emailFallback);
      if (!authResult.ok) {
        Alert.alert("Sign in required", authResult.message, [
          { text: "Sign in", onPress: goToReauth },
          { text: "Cancel", style: "cancel" },
        ]);
        return;
      }

      const init = await initializeBoostPayment({
        planId: selectedPlan.id,
        carId: carId || undefined,
        email: authResult.email,
      });

      if (!init.authorizationUrl) {
        throw new Error("Paystack checkout URL was not returned.");
      }

      setCheckoutReference(init.reference);

      const checkout = await openPaystackHostedCheckout(init.authorizationUrl);

      if (checkout.status === "success") {
        await completePaymentOnServer(checkout.reference);
        return;
      }

      setPaying(false);

      if (checkout.status === "cancelled") {
        Alert.alert("Cancelled", "Payment was cancelled.");
        return;
      }

      Alert.alert(
        "Checkout closed",
        "If you completed payment, tap “Verify payment” below.",
      );
    } catch (err: unknown) {
      setPaying(false);
      setCheckoutReference(null);
      if (isCallableUnauthenticated(err)) {
        Alert.alert("Sign in required", callableErrorMessage(err, "Please sign in to continue."), [
          { text: "Sign in", onPress: goToReauth },
          { text: "Cancel", style: "cancel" },
        ]);
      } else {
        Alert.alert("Error", callableErrorMessage(err, "Could not start payment."));
      }
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Boost Your Listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose a Plan</Text>
        <Text style={[styles.sectionSub, { color: colors.textTertiary }]}>
          Pay securely on Paystack (hosted checkout). We verify payment on our server before your boost goes live.
        </Text>

        {BOOST_PLANS.map((plan) => {
          const selected = selectedPlan.id === plan.id;
          return (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                  borderColor: selected ? "#0EB5CA" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                  borderWidth: selected ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planRow}>
                <View
                  style={[
                    styles.planIcon,
                    { backgroundColor: selected ? "#0EB5CA" : isDark ? "#111827" : "#E8F7FA" },
                  ]}
                >
                  <Feather name="trending-up" size={18} color={selected ? "#fff" : "#0EB5CA"} />
                </View>
                <View style={styles.planContent}>
                  <Text style={[styles.planName, { color: colors.text }]} numberOfLines={2}>
                    {plan.name}
                  </Text>
                  {plan.isSubscription ? (
                    <Text style={styles.planMonthlyTag}>Monthly plan</Text>
                  ) : null}
                  <Text style={[styles.planDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                    {plan.description}
                  </Text>
                </View>
                <View style={styles.planPriceCol}>
                  <Text style={styles.planPrice} numberOfLines={1}>
                    {formatGHS(plan.amount)}
                  </Text>
                  <Text style={[styles.planDays, { color: colors.textTertiary }]} numberOfLines={1}>
                    {plan.days} days
                  </Text>
                </View>
                <View style={{ width: 26, alignItems: "flex-end", justifyContent: "center" }}>
                  {selected ? <Feather name="check-circle" size={18} color="#0EB5CA" /> : null}
                </View>
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>What You Get</Text>
        {[
          { icon: "star", text: "Sponsored badge on your listing" },
          { icon: "eye", text: "Top placement in search results" },
          { icon: "users", text: "10× more buyer visibility" },
          { icon: "bell", text: "Priority in notifications feed" },
        ].map((item) => (
          <View key={item.text} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Feather name={item.icon as any} size={14} color="#0EB5CA" />
            </View>
            <Text style={[styles.benefitText, { color: colors.textSecondary }]}>{item.text}</Text>
          </View>
        ))}

        <Pressable
          style={[styles.payBtn, { opacity: paying || authLoading ? 0.7 : 1 }]}
          onPress={() => void startPayment()}
          disabled={paying || authLoading}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="external-link" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Pay {formatGHS(selectedPlan.amount)} on Paystack</Text>
            </>
          )}
        </Pressable>

        {checkoutReference ? (
          <Pressable
            style={styles.verifyBtn}
            onPress={() => void completePaymentOnServer(checkoutReference)}
            disabled={paying}
          >
            <Text style={styles.verifyBtnText}>Already paid? Verify payment</Text>
          </Pressable>
        ) : null}

        <Text style={[styles.secureNote, { color: colors.textTertiary }]}>
          Secured by Paystack · Card, Mobile Money & bank · Server-verified
        </Text>

        <Pressable onPress={() => router.push("/advertise")} style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={{ color: "#0EB5CA", fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
            Looking for flyer or video ads? View ad packages →
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#0EB5CA",
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#fff" },
  sectionTitle: { fontSize: 16, fontFamily: "Manrope_800ExtraBold", marginBottom: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16, lineHeight: 20 },
  planCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  planContent: { flex: 1, minWidth: 0, paddingRight: 6 },
  planName: { fontSize: 15, fontFamily: "Inter_700Bold", lineHeight: 20 },
  planMonthlyTag: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#D97706",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  planDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4, lineHeight: 17 },
  planPriceCol: { alignItems: "flex-end", flexShrink: 0, minWidth: 72, paddingLeft: 4 },
  planPrice: { fontSize: 15, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA", textAlign: "right" },
  planDays: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "right" },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  benefitIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(14,181,202,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  payBtn: {
    backgroundColor: "#0EB5CA",
    borderRadius: 14,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
  },
  payBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  verifyBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EB5CA",
  },
  verifyBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },
  secureNote: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 10 },
});
