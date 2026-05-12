import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Brand ───────────────────────────────────────────────
const TEAL      = "#0EB5CA";
const TEAL_DEEP = "#006F80";
const DARK_CARD = "#1C1C1E";
const DARK_CELL = "#2C2C2E";
const DARK_SEP  = "#2A2A2C";

// ─── Types ───────────────────────────────────────────────
type Period = "days" | "weeks" | "months";
interface PeriodOption { period: Period; count: number; price: number }
interface Package {
  id: string;
  category: string;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
  periodOptions: PeriodOption[];
}

// ─── Data (unchanged prices / durations) ─────────────────
const AD_PACKAGES: Package[] = [
  {
    id: "sponsored_listing",
    category: "Listing Boost",
    label: "Sponsored Listing",
    description: "Your car appears at the top of all search results and category pages.",
    icon: "trending-up",
    iconBg: "#FFF3E0",
    iconColor: "#E65100",
    badge: "🔥 Best Seller",
    badgeColor: "#E65100",
    badgeTextColor: "#fff",
    periodOptions: [
      { period: "days",   count: 3,  price: 12  },
      { period: "days",   count: 7,  price: 22  },
      { period: "weeks",  count: 2,  price: 40  },
      { period: "months", count: 1,  price: 70  },
      { period: "months", count: 3,  price: 180 },
    ],
  },
  {
    id: "featured_listing",
    category: "Listing Boost",
    label: "Featured Car",
    description: "Highlighted gold border on your listing card, shown in 'Special Offers' on home.",
    icon: "star",
    iconBg: "#FFFDE7",
    iconColor: "#F9A825",
    periodOptions: [
      { period: "days",   count: 3,  price: 8  },
      { period: "days",   count: 7,  price: 15 },
      { period: "weeks",  count: 2,  price: 28 },
      { period: "months", count: 1,  price: 50 },
    ],
  },
  {
    id: "urgent_badge",
    category: "Listing Boost",
    label: "Urgent Sale Badge",
    description: "Bright \"Urgent\" badge added to your car card. Drives 3× more clicks.",
    icon: "zap",
    iconBg: "#FCE4EC",
    iconColor: "#C62828",
    periodOptions: [
      { period: "days",  count: 3,  price: 5  },
      { period: "days",  count: 7,  price: 9  },
      { period: "weeks", count: 2,  price: 16 },
    ],
  },
  {
    id: "flyer",
    category: "Display Ads",
    label: "Flyer Ad",
    description: "Static image banner shown in the feed carousel and home page. Great for brand awareness.",
    icon: "image",
    iconBg: "#E8F5E9",
    iconColor: "#2E7D32",
    periodOptions: [
      { period: "days",   count: 3,  price: 18  },
      { period: "days",   count: 7,  price: 35  },
      { period: "weeks",  count: 2,  price: 60  },
      { period: "months", count: 1,  price: 100 },
      { period: "months", count: 3,  price: 260 },
    ],
  },
  {
    id: "banner_top",
    category: "Display Ads",
    label: "Top Banner Ad",
    description: "Full-width banner displayed at the top of the listings page — maximum visibility.",
    icon: "layout",
    iconBg: "#E3F2FD",
    iconColor: "#1565C0",
    badge: "High Impact",
    badgeColor: "#1565C0",
    badgeTextColor: "#fff",
    periodOptions: [
      { period: "days",   count: 3,  price: 25  },
      { period: "days",   count: 7,  price: 45  },
      { period: "weeks",  count: 2,  price: 80  },
      { period: "months", count: 1,  price: 140 },
    ],
  },
  {
    id: "video_15",
    category: "Video Ads",
    label: "15-Second Video",
    description: "Short video shown before car detail screens. Maximum impact, minimum skip.",
    icon: "play-circle",
    iconBg: "#F3E5F5",
    iconColor: "#7B1FA2",
    periodOptions: [
      { period: "days",   count: 3,  price: 45  },
      { period: "days",   count: 7,  price: 80  },
      { period: "weeks",  count: 2,  price: 140 },
      { period: "months", count: 1,  price: 240 },
      { period: "months", count: 3,  price: 600 },
    ],
  },
  {
    id: "video_20",
    category: "Video Ads",
    label: "20-Second Video",
    description: "Mid-length video for showcasing your dealership or fleet in full detail.",
    icon: "play-circle",
    iconBg: "#E8EAF6",
    iconColor: "#283593",
    popular: true,
    periodOptions: [
      { period: "days",   count: 3,  price: 60  },
      { period: "days",   count: 7,  price: 105 },
      { period: "weeks",  count: 2,  price: 185 },
      { period: "months", count: 1,  price: 320 },
      { period: "months", count: 3,  price: 800 },
    ],
  },
  {
    id: "video_30",
    category: "Video Ads",
    label: "30-Second Video",
    description: "Full-length premium spot. Ideal for dealerships, brands & major campaigns.",
    icon: "play-circle",
    iconBg: "#EDE7F6",
    iconColor: "#4527A0",
    periodOptions: [
      { period: "days",   count: 3,  price: 80   },
      { period: "days",   count: 7,  price: 140  },
      { period: "weeks",  count: 2,  price: 240  },
      { period: "months", count: 1,  price: 420  },
      { period: "months", count: 3,  price: 1050 },
    ],
  },
  {
    id: "push_blast",
    category: "Outreach",
    label: "Push Notification Blast",
    description: "Send a push notification about your listing to all Westcars users in your region.",
    icon: "bell",
    iconBg: "#FFF3E0",
    iconColor: "#BF360C",
    badge: "New",
    badgeColor: TEAL,
    badgeTextColor: "#fff",
    periodOptions: [
      { period: "days",  count: 1,  price: 18 },
      { period: "days",  count: 3,  price: 45 },
      { period: "weeks", count: 1,  price: 80 },
    ],
  },
  {
    id: "dealer_spotlight",
    category: "Dealer Packages",
    label: "Dealer Spotlight Page",
    description: "A dedicated branded page for your dealership — all your listings in one place.",
    icon: "briefcase",
    iconBg: "#E8F5E9",
    iconColor: "#1B5E20",
    badge: "Dealer Only",
    badgeColor: "#1B5E20",
    badgeTextColor: "#fff",
    periodOptions: [
      { period: "weeks",  count: 2,  price: 120 },
      { period: "months", count: 1,  price: 200 },
      { period: "months", count: 3,  price: 500 },
    ],
  },
  {
    id: "dealer_verified",
    category: "Dealer Packages",
    label: "Verified Dealer Badge",
    description: "Blue verified ✓ badge on all your listings & profile. Builds instant buyer trust.",
    icon: "check-circle",
    iconBg: "#E3F2FD",
    iconColor: "#0D47A1",
    periodOptions: [
      { period: "months", count: 1,  price: 50  },
      { period: "months", count: 3,  price: 130 },
      { period: "months", count: 6,  price: 220 },
    ],
  },
];

const CATEGORIES = Array.from(new Set(AD_PACKAGES.map((p) => p.category)));

function periodLabel(period: Period, count: number) {
  if (period === "days")   return count === 1 ? "1 Day"   : `${count} Days`;
  if (period === "weeks")  return count === 1 ? "1 Week"  : `${count} Weeks`;
  return count === 1 ? "1 Month" : `${count} Months`;
}

// ─── Screen ──────────────────────────────────────────────
export default function AdvertiseScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const [selectedPkg,    setSelectedPkg]    = useState<Package | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const handleBook = () => {
    if (!selectedPkg || !selectedPeriod) {
      Alert.alert("Select a package", "Choose an ad format and duration first.");
      return;
    }
    router.push({
      pathname: "/advertise-book",
      params: {
        pkg:      selectedPkg.id,
        price:    String(selectedPeriod.price),
        duration: periodLabel(selectedPeriod.period, selectedPeriod.count),
      },
    });
  };

  const displayPkgs = activeCategory === "All"
    ? AD_PACKAGES
    : AD_PACKAGES.filter((p) => p.category === activeCategory);

  const groupedPkgs = CATEGORIES
    .filter((cat) => activeCategory === "All" || cat === activeCategory)
    .map((cat) => ({
      category: cat,
      packages: displayPkgs.filter((p) => p.category === cat),
    }))
    .filter((g) => g.packages.length > 0);

  return (
    <View style={styles.root}>

      {/* ── Teal gradient header ── */}
      <LinearGradient
        colors={["#004D5E", "#0098AA", TEAL]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Advertise on Westcars</Text>
        <Text style={styles.headerSub}>Reach Ghana's car buyers</Text>
      </LinearGradient>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        {[
          { val: "50k+", lbl: "Users",    teal: true  },
          { val: "8",    lbl: "Regions",  teal: false },
          { val: "4.9★", lbl: "Rated",    teal: true  },
          { val: "2.4k", lbl: "Listings", teal: false },
        ].map((s, i) => (
          <React.Fragment key={s.lbl}>
            {i > 0 && <View style={styles.statDiv} />}
            <View style={styles.statItem}>
              <Text style={[styles.statVal, s.teal && { color: TEAL }]}>{s.val}</Text>
              <Text style={styles.statLbl}>{s.lbl}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>

      {/* ── Category filter chips ── */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            {["All", ...CATEGORIES].map((cat) => (
              <Pressable
                key={cat}
                style={[styles.chip, activeCategory === cat && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Package groups ── */}
        {groupedPkgs.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupLabel}>{group.category}</Text>

            {group.packages.map((pkg) => {
              const isSelected = selectedPkg?.id === pkg.id;
              return (
                <View
                  key={pkg.id}
                  style={[styles.pkgCard, isSelected && styles.pkgCardSelected]}
                >
                  {/* Popular ribbon */}
                  {pkg.popular && (
                    <View style={styles.popularRibbon}>
                      <Text style={styles.popularRibbonText}>MOST POPULAR</Text>
                    </View>
                  )}

                  {/* Card header row */}
                  <View style={styles.pkgHeader}>
                    <View style={[styles.pkgIconCircle, { backgroundColor: pkg.iconBg }]}>
                      <Feather name={pkg.icon as any} size={22} color={pkg.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgLabel}>{pkg.label}</Text>
                        {(pkg.badge || pkg.popular) && !pkg.popular && (
                          <View style={[styles.badgePill, { backgroundColor: pkg.badgeColor }]}>
                            <Text style={[styles.badgeText, { color: pkg.badgeTextColor || "#fff" }]}>
                              {pkg.badge}
                            </Text>
                          </View>
                        )}
                        {pkg.popular && (
                          <View style={[styles.badgePill, { backgroundColor: TEAL }]}>
                            <Text style={[styles.badgeText, { color: "#fff" }]}>Popular</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgDesc}>{pkg.description}</Text>
                    </View>
                  </View>

                  {/* Price grid — always visible */}
                  <View style={styles.priceGrid}>
                    {pkg.periodOptions.map((opt) => {
                      const isSel = selectedPkg?.id === pkg.id && selectedPeriod === opt;
                      return (
                        <Pressable
                          key={`${opt.period}_${opt.count}`}
                          style={[styles.priceCell, isSel && styles.priceCellSel]}
                          onPress={() => {
                            setSelectedPkg(pkg);
                            setSelectedPeriod(opt);
                          }}
                        >
                          <Text style={[styles.priceDur, isSel && styles.priceDurSel]}>
                            {periodLabel(opt.period, opt.count)}
                          </Text>
                          <Text style={[styles.priceAmt, isSel && styles.priceAmtSel]}>
                            GHS {opt.price.toLocaleString()}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* ── What's Included ── */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionHeadText}>WHAT'S INCLUDED</Text>
        </View>
        <View style={styles.darkCard}>
          {[
            { icon: "target",     text: "Geo-targeted to your region" },
            { icon: "bar-chart-2", text: "Live analytics dashboard" },
            { icon: "phone",      text: "Dedicated account manager" },
            { icon: "message-square", text: "WhatsApp performance report" },
            { icon: "refresh-cw", text: "One free creative revision" },
          ].map((item, i) => (
            <View key={item.text} style={[styles.includeRow, i > 0 && styles.includeRowBorder]}>
              <Feather name={item.icon as any} size={16} color={TEAL} />
              <Text style={styles.includeText}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* ── Contact card ── */}
        <View style={styles.darkCard}>
          <View style={styles.contactRow}>
            <View style={styles.contactIconWrap}>
              <Feather name="mail" size={20} color={TEAL} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Questions? Email us</Text>
              <Pressable onPress={() => Linking.openURL("mailto:westcarsgh@gmail.com?subject=Westcars Ad Enquiry")}>
                <Text style={styles.contactEmail}>westcarsgh@gmail.com</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: (insets.bottom || 0) + 120 }} />
      </ScrollView>

      {/* ── Sticky Book Now bar ── */}
      {selectedPkg && selectedPeriod && (
        <View style={[styles.bookBar, { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 16 : 12) }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookSummary} numberOfLines={1}>
              {selectedPkg.label} · {periodLabel(selectedPeriod.period, selectedPeriod.count)}
            </Text>
            <Text style={styles.bookPrice}>GHS {selectedPeriod.price.toLocaleString()}</Text>
          </View>
          <Pressable style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Book Now →</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F2F5" },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  backLabel: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" },
  headerTitle: { fontSize: 24, fontFamily: "Manrope_800ExtraBold", color: "#fff", letterSpacing: -0.5 },
  headerSub:   { fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },

  // Stats
  statsRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: "#E8E8E8",
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal:  { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  statLbl:  { fontSize: 10, color: "#9E9E9E", fontFamily: "Inter_400Regular" },
  statDiv:  { width: 1, height: 24, backgroundColor: "#E8E8E8" },

  // Filter chips
  filterBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8E8E8" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: "#1C1C1E",
  },
  chipActive: { backgroundColor: TEAL },
  chipText:   { fontSize: 13, fontFamily: "Inter_500Medium", color: "#fff" },
  chipTextActive: { fontFamily: "Inter_700Bold" },

  // Groups
  scroll: { paddingBottom: 20 },
  group:  { paddingHorizontal: 16, paddingTop: 20, gap: 10 },

  sectionHead: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 },
  sectionHeadText: {
    fontSize: 11, fontFamily: "Inter_700Bold",
    color: TEAL, letterSpacing: 1.2, textTransform: "uppercase",
  },
  groupLabel: {
    fontSize: 11, fontFamily: "Inter_700Bold",
    color: TEAL, letterSpacing: 1.2, textTransform: "uppercase",
  },

  // Package card
  pkgCard: {
    backgroundColor: DARK_CARD,
    borderRadius: 16, padding: 16,
    gap: 14, overflow: "hidden",
    borderWidth: 1.5, borderColor: "transparent",
  },
  pkgCardSelected: { borderColor: TEAL },

  popularRibbon: {
    position: "absolute", top: 0, right: 0,
    backgroundColor: TEAL,
    paddingHorizontal: 12, paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  popularRibbonText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8 },

  pkgHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pkgIconCircle: {
    width: 50, height: 50, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  pkgTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" },
  pkgLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  pkgDesc:  { fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular", lineHeight: 18 },

  badgePill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontFamily: "Inter_700Bold" },

  // Price grid
  priceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  priceCell: {
    flex: 1, minWidth: 80, paddingVertical: 10, paddingHorizontal: 8,
    backgroundColor: DARK_CELL, borderRadius: 10,
    alignItems: "center", gap: 3,
    borderWidth: 1, borderColor: "transparent",
  },
  priceCellSel: { backgroundColor: TEAL, borderColor: TEAL },
  priceDur:    { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },
  priceDurSel: { color: "#fff" },
  priceAmt:    { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  priceAmtSel: { color: "#fff" },

  // What's included + contact (dark cards)
  darkCard: {
    backgroundColor: DARK_CARD, borderRadius: 16,
    marginHorizontal: 16, marginTop: 0, padding: 4,
    overflow: "hidden",
  },
  includeRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 13, paddingHorizontal: 14,
  },
  includeRowBorder: { borderTopWidth: 1, borderTopColor: DARK_SEP },
  includeText: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", flex: 1 },

  contactRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 16, paddingHorizontal: 14,
  },
  contactIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(14,181,202,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  contactTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff", marginBottom: 3 },
  contactEmail: { fontSize: 13, fontFamily: "Inter_500Medium", color: TEAL },

  // Sticky bar
  bookBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#111",
    paddingTop: 14, paddingHorizontal: 20, gap: 16,
    borderTopWidth: 1, borderTopColor: "#2A2A2A",
  },
  bookSummary: { fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  bookPrice:   { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  bookBtn: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 22, paddingVertical: 13,
  },
  bookBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
