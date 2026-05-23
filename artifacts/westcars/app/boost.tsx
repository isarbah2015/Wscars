import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaystack } from "react-native-paystack-webview";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  PAYSTACK_PUBLIC_KEY,
  BOOST_PLANS,
  formatGHS,
} from "@/lib/paystack";
import type { BoostPlan } from "@/lib/paystack";
import { initializeBoostPayment, verifyBoostPayment } from "@/services/firebase/boostPayments";

export default function BoostScreen() {
  const { currentUser, isAuthenticated } = useApp();
  const { user: firebaseUser } = useAuth();
  const { isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ carId?: string }>();
  const carId = params.carId;

  const { popup } = usePaystack();
  const [selectedPlan, setSelectedPlan] = useState<BoostPlan>(BOOST_PLANS[0]);
  const [paying, setPaying] = useState(false);
  const [checkoutReference, setCheckoutReference] = useState<string | null>(null);

  const email = firebaseUser?.email ?? currentUser?.email ?? "user@westcars.com";

  const completePaymentOnServer = async (reference: string) => {
    setPaying(true);
    try {
      const result = await verifyBoostPayment(reference);
      if (result.ok && result.status === "completed") {
        Alert.alert(
          "Boost active",
          `Your listing is boosted for ${selectedPlan.days} days.`,
          [{ text: "Done", onPress: () => router.back() }],
        );
        return;
      }
      Alert.alert("Pending", "Payment is still processing. Try again in a few seconds.");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Could not verify payment.";
      Alert.alert("Verification failed", message);
    } finally {
      setPaying(false);
      setCheckoutReference(null);
    }
  };

  const startPayment = async () => {
    if (!isAuthenticated || !firebaseUser) {
      Alert.alert("Sign in required", "Please sign in to boost a listing.", [
        { text: "Sign in", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }

    if (!PAYSTACK_PUBLIC_KEY) {
      Alert.alert(
        "Paystack not configured",
        "Add EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY to your .env file and restart Expo.",
      );
      return;
    }

    setPaying(true);
    try {
      const init = await initializeBoostPayment({
        planId: selectedPlan.id,
        carId: carId || undefined,
        email,
      });
      setCheckoutReference(init.reference);

      popup.checkout({
        email,
        amount: init.amountGHS,
        reference: init.reference,
        metadata: {
          custom_fields: [
            { display_name: "Plan", variable_name: "plan", value: selectedPlan.id },
            { display_name: "User ID", variable_name: "user_id", value: firebaseUser.uid },
            ...(carId
              ? [{ display_name: "Car ID", variable_name: "car_id", value: carId }]
              : []),
          ],
        },
        onSuccess: () => {
          void completePaymentOnServer(init.reference);
        },
        onCancel: () => {
          setCheckoutReference(null);
          setPaying(false);
          Alert.alert("Cancelled", "Payment was cancelled.");
        },
        onError: () => {
          setCheckoutReference(null);
          setPaying(false);
          Alert.alert("Payment error", "Something went wrong. Please try again.");
        },
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Could not start payment.";
      Alert.alert("Error", message);
    } finally {
      setPaying(false);
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
          Payments are verified on our server via Paystack before your boost goes live.
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
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                    {plan.isSubscription && (
                      <View style={styles.subBadge}>
                        <Text style={styles.subBadgeText}>Monthly</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planDesc, { color: colors.textTertiary }]}>{plan.description}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.planPrice}>{formatGHS(plan.amount)}</Text>
                  <Text style={[styles.planDays, { color: colors.textTertiary }]}>{plan.days} days</Text>
                </View>
              </View>
              {selected && (
                <View style={styles.selectedCheck}>
                  <Feather name="check-circle" size={18} color="#0EB5CA" />
                </View>
              )}
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
          style={[styles.payBtn, { opacity: paying ? 0.7 : 1 }]}
          onPress={() => void startPayment()}
          disabled={paying}
        >
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="lock" size={16} color="#fff" />
              <Text style={styles.payBtnText}>Pay {formatGHS(selectedPlan.amount)} securely</Text>
            </>
          )}
        </Pressable>

        {checkoutReference && (
          <Pressable
            style={styles.verifyBtn}
            onPress={() => void completePaymentOnServer(checkoutReference)}
            disabled={paying}
          >
            <Text style={styles.verifyBtnText}>Already paid? Verify payment</Text>
          </Pressable>
        )}

        <Text style={[styles.secureNote, { color: colors.textTertiary }]}>
          Secured by Paystack · Card, Mobile Money & USSD · Server-verified
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
  planCard: { borderRadius: 16, padding: 16, marginBottom: 12, position: "relative" },
  planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  planIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  planName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  planDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  planPrice: { fontSize: 16, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  planDays: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  subBadge: { backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  subBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#D97706" },
  selectedCheck: { position: "absolute", top: 12, right: 12 },
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
