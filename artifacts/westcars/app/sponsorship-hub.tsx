import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toDateString } from "@/utils/formatFirestoreDate";

export default function SponsorshipHubScreen() {
  const { cars, conversations, currentUser } = useApp();
  const { sponsorship } = useAuth();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const myListings = cars.filter((c) => c.sellerId === currentUser?.id);
  const activeListings = myListings.filter((c) => !c.isSold);
  const sponsorshipTier = sponsorship?.tier ?? (activeListings.some((c) => c.isSponsored) ? "Premium Seller" : "Standard Seller");
  const adCredits = sponsorship?.adCredits ?? 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#E4E8EF" }]}>
        <Pressable style={[styles.backBtn, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA" }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sponsorship & Ads</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Promote your listings professionally</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.summaryCard, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Seller tier</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{sponsorshipTier}</Text>
            </View>
            {sponsorshipTier === "Premium Seller" && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{adCredits}</Text>
              <Text style={styles.statLbl}>Ad credits</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]} />
            <View style={styles.summaryStat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{activeListings.length}</Text>
              <Text style={styles.statLbl}>Active listings</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]} />
            <View style={styles.summaryStat}>
              <Text style={[styles.statNum, { color: colors.text }]}>{activeListings.filter((c) => c.isSponsored).length}</Text>
              <Text style={styles.statLbl}>Sponsored</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.primaryCta} onPress={() => router.push("/boost" as "/advertise")}>
            <Feather name="trending-up" size={16} color="#004D5A" />
            <Text style={styles.primaryCtaText}>Boost a listing (Paystack)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryCta, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0" }]}
            onPress={() => router.push("/advertise")}
          >
            <Text style={[styles.secondaryCtaText, { color: colors.textSecondary }]}>Flyer & video ad packages</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your listings</Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
          Boost individual cars to reach more buyers across Ghana.
        </Text>

        {activeListings.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="truck" size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No active listings</Text>
            <TouchableOpacity style={styles.primaryCta} onPress={() => router.push("/(tabs)/sell")}>
              <Text style={styles.primaryCtaText}>List a car</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeListings.map((listing) => {
            const msgCount = conversations.filter((c) => c.carId === listing.id).length;
            const startDate = toDateString(listing.createdAt, "—");
            const endDate = listing.expiresAt ? toDateString(listing.expiresAt) : "Active";
            return (
              <View
                key={listing.id}
                style={[styles.listingCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}
              >
                <View style={styles.listingHead}>
                  <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={1}>
                    {listing.year} {listing.brand} {listing.model}
                  </Text>
                  {listing.isSponsored && (
                    <View style={styles.sponsoredPill}>
                      <Text style={styles.sponsoredPillText}>Sponsored</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.listingMeta, { color: colors.textSecondary }]}>
                  GHS {listing.price.toLocaleString()} · {startDate} → {endDate}
                </Text>
                <View style={styles.metricsRow}>
                  <Text style={styles.metric}>👁 {listing.views ?? 0} views</Text>
                  <Text style={styles.metric}>💬 {msgCount} messages</Text>
                </View>
                <TouchableOpacity
                  style={styles.boostBtn}
                  onPress={() =>
                    router.push({
                      pathname: "/boost",
                      params: { carId: listing.id },
                    } as { pathname: "/advertise" })
                  }
                >
                  <Text style={styles.boostBtnText}>Boost this listing</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_800ExtraBold" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  content: { padding: 16, gap: 12 },
  summaryCard: { borderRadius: 16, borderWidth: 0.5, padding: 16, gap: 14 },
  summaryTop: { flexDirection: "row", alignItems: "center" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
  summaryValue: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", marginTop: 2 },
  premiumBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  premiumBadgeText: { color: "#004D5A", fontSize: 11, fontFamily: "Inter_700Bold" },
  summaryStats: { flexDirection: "row", alignItems: "center" },
  summaryStat: { flex: 1, alignItems: "center", gap: 2 },
  statNum: { fontSize: 18, fontFamily: "Manrope_800ExtraBold" },
  statLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#64748B", textAlign: "center" },
  summaryDivider: { width: 1, height: 28 },
  primaryCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0EB5CA",
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryCtaText: { color: "#004D5A", fontSize: 14, fontFamily: "Inter_700Bold" },
  secondaryCta: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 11,
  },
  secondaryCtaText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 16, fontFamily: "Manrope_800ExtraBold", marginTop: 4 },
  sectionSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18, marginBottom: 4 },
  listingCard: { borderRadius: 14, borderWidth: 0.5, padding: 14, gap: 8 },
  listingHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  listingTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_700Bold" },
  sponsoredPill: { backgroundColor: "rgba(14,181,202,0.12)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sponsoredPillText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#0EB5CA" },
  listingMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metricsRow: { flexDirection: "row", gap: 14 },
  metric: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  boostBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(14,181,202,0.12)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  boostBtnText: { color: "#0098AA", fontSize: 12, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyTitle: { fontSize: 15, fontFamily: "Inter_500Medium" },
});
