import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

type AdType = "flyer" | "video";
type Period = "days" | "weeks" | "months";

interface Package {
  id: string;
  type: AdType;
  label: string;
  description: string;
  duration?: string;
  periodOptions: { period: Period; count: number; price: number }[];
  icon: string;
  popular?: boolean;
  color: string;
}

const AD_PACKAGES: Package[] = [
  {
    id: "flyer",
    type: "flyer",
    label: "Flyer Ad",
    description: "Static image displayed in the listings feed and home carousel. Great for brand awareness.",
    icon: "image",
    color: "#2563EB",
    periodOptions: [
      { period: "days", count: 3, price: 50 },
      { period: "days", count: 7, price: 100 },
      { period: "weeks", count: 2, price: 180 },
      { period: "months", count: 1, price: 320 },
      { period: "months", count: 3, price: 800 },
    ],
  },
  {
    id: "video_15",
    type: "video",
    label: "15-Second Video",
    description: "Short punchy video shown before car detail screens. Maximum impact, minimum skip.",
    duration: "15 sec",
    icon: "play-circle",
    color: "#7C3AED",
    popular: false,
    periodOptions: [
      { period: "days", count: 3, price: 120 },
      { period: "days", count: 7, price: 220 },
      { period: "weeks", count: 2, price: 400 },
      { period: "months", count: 1, price: 700 },
      { period: "months", count: 3, price: 1800 },
    ],
  },
  {
    id: "video_20",
    type: "video",
    label: "20-Second Video",
    description: "Mid-length video. Perfect for showcasing your dealership or services in detail.",
    duration: "20 sec",
    icon: "play-circle",
    color: "#00873E",
    popular: true,
    periodOptions: [
      { period: "days", count: 3, price: 160 },
      { period: "days", count: 7, price: 290 },
      { period: "weeks", count: 2, price: 520 },
      { period: "months", count: 1, price: 920 },
      { period: "months", count: 3, price: 2400 },
    ],
  },
  {
    id: "video_30",
    type: "video",
    label: "30-Second Video",
    description: "Full-length premium spot. Ideal for dealerships and major brands.",
    duration: "30 sec",
    icon: "play-circle",
    color: "#D97706",
    popular: false,
    periodOptions: [
      { period: "days", count: 3, price: 220 },
      { period: "days", count: 7, price: 400 },
      { period: "weeks", count: 2, price: 720 },
      { period: "months", count: 1, price: 1300 },
      { period: "months", count: 3, price: 3400 },
    ],
  },
];

function periodLabel(period: Period, count: number): string {
  if (period === "days") return count === 1 ? "1 Day" : `${count} Days`;
  if (period === "weeks") return count === 1 ? "1 Week" : `${count} Weeks`;
  return count === 1 ? "1 Month" : `${count} Months`;
}

export default function AdvertiseScreen() {
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Package["periodOptions"][0] | null>(null);

  const handleBooking = () => {
    if (!selectedPackage || !selectedPeriod) {
      Alert.alert("Select a Package", "Please choose an ad type and duration.");
      return;
    }
    Alert.alert(
      "Booking Confirmed!",
      `Your ${selectedPackage.label} (${periodLabel(selectedPeriod.period, selectedPeriod.count)}) ad has been submitted.\n\nOur team will contact you within 24 hours to collect your creative and finalise payment.\n\nTotal: GHS ${selectedPeriod.price}`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#003D1A", "#00873E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerLabel}>ADVERTISE WITH US</Text>
          <Text style={styles.headerTitle}>Reach Ghana's Car Buyers</Text>
          <Text style={styles.headerSubtitle}>
            Over 50,000 active buyers monthly across Ghana
          </Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>50k+</Text>
            <Text style={styles.statLbl}>Monthly Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>8</Text>
            <Text style={styles.statLbl}>Regions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>4.9★</Text>
            <Text style={styles.statLbl}>App Rating</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <Text style={styles.sectionTitle}>Choose Ad Format</Text>

        {/* Packages */}
        {AD_PACKAGES.map((pkg) => (
          <Pressable
            key={pkg.id}
            style={[
              styles.packageCard,
              selectedPackage?.id === pkg.id && styles.packageCardActive,
              selectedPackage?.id === pkg.id && { borderColor: pkg.color },
            ]}
            onPress={() => {
              setSelectedPackage(pkg);
              setSelectedPeriod(null);
            }}
          >
            {pkg.popular && (
              <View style={[styles.popularBadge, { backgroundColor: pkg.color }]}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.packageHeader}>
              <View style={[styles.pkgIconCircle, { backgroundColor: pkg.color + "18" }]}>
                <Feather name={pkg.icon as any} size={22} color={pkg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.pkgTitleRow}>
                  <Text style={styles.pkgLabel}>{pkg.label}</Text>
                  {pkg.duration && (
                    <View style={[styles.durationTag, { backgroundColor: pkg.color + "18" }]}>
                      <Text style={[styles.durationText, { color: pkg.color }]}>
                        {pkg.duration}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.pkgDesc}>{pkg.description}</Text>
              </View>
            </View>

            {/* Period selector — shown when this package is selected */}
            {selectedPackage?.id === pkg.id && (
              <View style={styles.periodSection}>
                <Text style={styles.periodSectionTitle}>Select Duration</Text>
                <View style={styles.periodGrid}>
                  {pkg.periodOptions.map((opt) => (
                    <Pressable
                      key={`${opt.period}_${opt.count}`}
                      style={[
                        styles.periodOption,
                        selectedPeriod === opt && { borderColor: pkg.color, backgroundColor: pkg.color + "0D" },
                      ]}
                      onPress={() => setSelectedPeriod(opt)}
                    >
                      <Text
                        style={[
                          styles.periodLabel,
                          selectedPeriod === opt && { color: pkg.color, fontFamily: "Inter_700Bold" },
                        ]}
                      >
                        {periodLabel(opt.period, opt.count)}
                      </Text>
                      <Text
                        style={[
                          styles.periodPrice,
                          selectedPeriod === opt && { color: pkg.color },
                        ]}
                      >
                        ₵{opt.price.toLocaleString()}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
        ))}

        {/* What's included */}
        <View style={styles.includesCard}>
          <Text style={styles.includesTitle}>What's Included</Text>
          {[
            { icon: "target", text: "Geo-targeted to your preferred region(s)" },
            { icon: "trending-up", text: "Real-time impression & click analytics" },
            { icon: "refresh-cw", text: "Creative revision support" },
            { icon: "users", text: "Reach verified buyers & dealers" },
            { icon: "phone", text: "Dedicated account manager" },
          ].map((item) => (
            <View key={item.text} style={styles.includeRow}>
              <View style={styles.includeIconWrap}>
                <Feather name={item.icon as any} size={14} color={Colors.primary} />
              </View>
              <Text style={styles.includeText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Contact CTA */}
        <View style={styles.contactCard}>
          <Feather name="phone-call" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Talk to our Ad Team</Text>
            <Text style={styles.contactSub}>+233 30 274 0000 · ads@westcars.com.gh</Text>
          </View>
        </View>
      </ScrollView>

      {/* Book Now CTA */}
      {selectedPackage && selectedPeriod && (
        <View
          style={[
            styles.bookBar,
            { paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 16) },
          ]}
        >
          <View>
            <Text style={styles.bookSummary}>
              {selectedPackage.label} · {periodLabel(selectedPeriod.period, selectedPeriod.count)}
            </Text>
            <Text style={styles.bookPrice}>GHS {selectedPeriod.price.toLocaleString()}</Text>
          </View>
          <Pressable style={styles.bookBtn} onPress={handleBooking}>
            <Text style={styles.bookBtnText}>Book Now</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 6,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headerContent: { gap: 4 },
  headerLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  statsStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },
  content: { padding: 16, gap: 12 },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  packageCardActive: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  popularText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 1,
  },
  packageHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  pkgIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pkgTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  pkgLabel: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  durationTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  pkgDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  periodSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 10,
  },
  periodSectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  periodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  periodOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    minWidth: 90,
  },
  periodLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  periodPrice: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginTop: 2,
  },
  includesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  includesTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  includeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  includeIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  includeText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    flex: 1,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.primary + "0E",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  contactTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  contactSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  bookBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 12,
  },
  bookSummary: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  bookPrice: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
