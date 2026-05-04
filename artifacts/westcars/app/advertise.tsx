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

type Period = "days" | "weeks" | "months";
interface PeriodOption { period: Period; count: number; price: number }
interface Package {
  id: string;
  category: string;
  label: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  duration?: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  popular?: boolean;
  periodOptions: PeriodOption[];
}

const AD_PACKAGES: Package[] = [
  // ─── Listing Boost ───
  {
    id: "sponsored_listing",
    category: "Listing Boost",
    label: "Sponsored Listing",
    description: "Your car appears at the top of all search results and category pages.",
    icon: "trending-up",
    iconBg: "#FFF3E0",
    iconColor: "#E65100",
    badge: "Best Seller",
    badgeColor: "#E65100",
    periodOptions: [
      { period: "days", count: 3, price: 12 },
      { period: "days", count: 7, price: 22 },
      { period: "weeks", count: 2, price: 40 },
      { period: "months", count: 1, price: 70 },
      { period: "months", count: 3, price: 180 },
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
      { period: "days", count: 3, price: 8 },
      { period: "days", count: 7, price: 15 },
      { period: "weeks", count: 2, price: 28 },
      { period: "months", count: 1, price: 50 },
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
      { period: "days", count: 3, price: 5 },
      { period: "days", count: 7, price: 9 },
      { period: "weeks", count: 2, price: 16 },
    ],
  },
  // ─── Display Ads ───
  {
    id: "flyer",
    category: "Display Ads",
    label: "Flyer Ad",
    description: "Static image banner shown in the feed carousel and home page. Great for brand awareness.",
    icon: "image",
    iconBg: "#E8F5E9",
    iconColor: "#2E7D32",
    periodOptions: [
      { period: "days", count: 3, price: 18 },
      { period: "days", count: 7, price: 35 },
      { period: "weeks", count: 2, price: 60 },
      { period: "months", count: 1, price: 100 },
      { period: "months", count: 3, price: 260 },
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
    periodOptions: [
      { period: "days", count: 3, price: 25 },
      { period: "days", count: 7, price: 45 },
      { period: "weeks", count: 2, price: 80 },
      { period: "months", count: 1, price: 140 },
    ],
  },
  // ─── Video Ads ───
  {
    id: "video_15",
    category: "Video Ads",
    label: "15-Second Video",
    description: "Short video shown before car detail screens. Maximum impact, minimum skip.",
    duration: "15 sec",
    icon: "play-circle",
    iconBg: "#F3E5F5",
    iconColor: "#7B1FA2",
    periodOptions: [
      { period: "days", count: 3, price: 45 },
      { period: "days", count: 7, price: 80 },
      { period: "weeks", count: 2, price: 140 },
      { period: "months", count: 1, price: 240 },
      { period: "months", count: 3, price: 600 },
    ],
  },
  {
    id: "video_20",
    category: "Video Ads",
    label: "20-Second Video",
    description: "Mid-length video for showcasing your dealership or fleet in full detail.",
    duration: "20 sec",
    icon: "play-circle",
    iconBg: "#E8EAF6",
    iconColor: "#283593",
    popular: true,
    periodOptions: [
      { period: "days", count: 3, price: 60 },
      { period: "days", count: 7, price: 105 },
      { period: "weeks", count: 2, price: 185 },
      { period: "months", count: 1, price: 320 },
      { period: "months", count: 3, price: 800 },
    ],
  },
  {
    id: "video_30",
    category: "Video Ads",
    label: "30-Second Video",
    description: "Full-length premium spot. Ideal for dealerships, brands & major campaigns.",
    duration: "30 sec",
    icon: "play-circle",
    iconBg: "#EDE7F6",
    iconColor: "#4527A0",
    periodOptions: [
      { period: "days", count: 3, price: 80 },
      { period: "days", count: 7, price: 140 },
      { period: "weeks", count: 2, price: 240 },
      { period: "months", count: 1, price: 420 },
      { period: "months", count: 3, price: 1050 },
    ],
  },
  // ─── Outreach ───
  {
    id: "push_blast",
    category: "Outreach",
    label: "Push Notification Blast",
    description: "Send a push notification about your listing to all Westcars users in your region.",
    icon: "bell",
    iconBg: "#FFF3E0",
    iconColor: "#BF360C",
    badge: "New",
    badgeColor: "#BF360C",
    periodOptions: [
      { period: "days", count: 1, price: 18 },
      { period: "days", count: 3, price: 45 },
      { period: "weeks", count: 1, price: 80 },
    ],
  },
  // ─── Dealer Packages ───
  {
    id: "dealer_spotlight",
    category: "Dealer Packages",
    label: "Dealer Spotlight Page",
    description: "A dedicated branded page for your dealership shown in search and home — all your listings in one place.",
    icon: "briefcase",
    iconBg: "#E8F5E9",
    iconColor: "#1B5E20",
    badge: "Dealer Only",
    badgeColor: "#1B5E20",
    periodOptions: [
      { period: "weeks", count: 2, price: 120 },
      { period: "months", count: 1, price: 200 },
      { period: "months", count: 3, price: 500 },
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
      { period: "months", count: 1, price: 50 },
      { period: "months", count: 3, price: 130 },
      { period: "months", count: 6, price: 220 },
    ],
  },
];

const CATEGORIES = Array.from(new Set(AD_PACKAGES.map((p) => p.category)));

function periodLabel(period: Period, count: number) {
  if (period === "days") return count === 1 ? "1 Day" : `${count} Days`;
  if (period === "weeks") return count === 1 ? "1 Week" : `${count} Weeks`;
  return count === 1 ? "1 Month" : `${count} Months`;
}

export default function AdvertiseScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
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
        pkg: selectedPkg.id,
        price: String(selectedPeriod.price),
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
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </Pressable>
        <Text style={styles.topBarTitle}>Advertise on Westcars</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hero gradient */}
        <LinearGradient
          colors={["#004D5E", "#0098AA", "#0EB5CA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroTitle}>Reach Ghana's Car Buyers</Text>
          <Text style={styles.heroSub}>50,000+ active buyers monthly · 8 regions covered</Text>
          <View style={styles.statsRow}>
            {[
              { val: "50k+", lbl: "Monthly Users" },
              { val: "8", lbl: "Regions" },
              { val: "4.9★", lbl: "App Rating" },
              { val: "2.4k", lbl: "Listings" },
            ].map((s, i) => (
              <React.Fragment key={s.lbl}>
                {i > 0 && <View style={styles.statDiv} />}
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{s.val}</Text>
                  <Text style={styles.statLbl}>{s.lbl}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </LinearGradient>

        {/* Category filter chips */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {["All", ...CATEGORIES].map((cat) => (
                <Pressable
                  key={cat}
                  style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Package groups */}
        {groupedPkgs.map((group) => (
          <View key={group.category} style={styles.group}>
            <Text style={styles.groupTitle}>{group.category}</Text>

            {group.packages.map((pkg) => {
              const isActive = selectedPkg?.id === pkg.id;
              return (
                <Pressable
                  key={pkg.id}
                  style={[styles.pkgCard, isActive && styles.pkgCardActive]}
                  onPress={() => {
                    setSelectedPkg(isActive ? null : pkg);
                    setSelectedPeriod(null);
                  }}
                >
                  {pkg.popular && (
                    <View style={[styles.cornerTag, { backgroundColor: "#0EB5CA" }]}>
                      <Text style={styles.cornerTagText}>MOST POPULAR</Text>
                    </View>
                  )}
                  {pkg.badge && !pkg.popular && (
                    <View style={[styles.cornerTag, { backgroundColor: pkg.badgeColor || "#333" }]}>
                      <Text style={styles.cornerTagText}>{pkg.badge.toUpperCase()}</Text>
                    </View>
                  )}

                  <View style={styles.pkgHeader}>
                    <View style={[styles.pkgIcon, { backgroundColor: pkg.iconBg }]}>
                      <Feather name={pkg.icon as any} size={20} color={pkg.iconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgLabel}>{pkg.label}</Text>
                        {pkg.duration && (
                          <View style={[styles.durationTag, { backgroundColor: pkg.iconBg }]}>
                            <Text style={[styles.durationText, { color: pkg.iconColor }]}>{pkg.duration}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgDesc}>{pkg.description}</Text>
                    </View>
                    <Feather
                      name={isActive ? "check-circle" : "circle"}
                      size={20}
                      color={isActive ? "#0EB5CA" : "#E0E0E0"}
                    />
                  </View>

                  {/* Duration grid when selected */}
                  {isActive && (
                    <View style={styles.periodSection}>
                      <Text style={styles.periodLabel}>Select duration</Text>
                      <View style={styles.periodGrid}>
                        {pkg.periodOptions.map((opt) => {
                          const sel = selectedPeriod === opt;
                          return (
                            <Pressable
                              key={`${opt.period}_${opt.count}`}
                              style={[styles.periodOpt, sel && styles.periodOptActive]}
                              onPress={() => setSelectedPeriod(opt)}
                            >
                              <Text style={[styles.periodOptLabel, sel && styles.periodOptLabelActive]}>
                                {periodLabel(opt.period, opt.count)}
                              </Text>
                              <Text style={[styles.periodOptPrice, sel && styles.periodOptPriceActive]}>
                                GHS {opt.price.toLocaleString()}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={styles.sep} />

        {/* What's included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {[
            { icon: "target", text: "Geo-targeted to your preferred region(s)", color: "#E53935" },
            { icon: "trending-up", text: "Real-time impression & click analytics", color: "#0EB5CA" },
            { icon: "refresh-cw", text: "Creative revision support included", color: "#27AE60" },
            { icon: "users", text: "Reach verified buyers & 200+ active dealers", color: "#7B1FA2" },
            { icon: "phone", text: "Dedicated account manager assigned", color: "#E65100" },
            { icon: "bar-chart-2", text: "Weekly performance report via WhatsApp", color: "#0277BD" },
          ].map((item) => (
            <View key={item.text} style={styles.includeRow}>
              <View style={[styles.includeIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon as any} size={14} color={item.color} />
              </View>
              <Text style={styles.includeText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sep} />

        {/* Contact team */}
        <View style={styles.contactCard}>
          <View style={styles.contactTop}>
            <View style={styles.contactIconWrap}>
              <Feather name="mail" size={20} color="#0EB5CA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Contact our Ads Team</Text>
              <Text style={styles.contactSub}>We respond within 1 business day</Text>
            </View>
          </View>
          <Pressable
            style={[styles.contactBtn, { alignSelf: "center", marginTop: 12 }]}
            onPress={() => Linking.openURL("mailto:westcarsgh@gmail.com?subject=Westcars Ad Enquiry")}
          >
            <Feather name="mail" size={14} color="#0EB5CA" />
            <Text style={styles.contactBtnText}>westcarsgh@gmail.com</Text>
          </Pressable>
        </View>

        <View style={{ height: (insets.bottom || 0) + 120 }} />
      </ScrollView>

      {/* Book Now sticky bar */}
      {selectedPkg && selectedPeriod && (
        <View
          style={[
            styles.bookBar,
            { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 16 : 12) },
          ]}
        >
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontSize: 17, fontFamily: "PlusJakartaSans_700Bold", color: "#1A1A1A" },

  scrollContent: { paddingBottom: 20 },

  hero: {
    padding: 20,
    gap: 10,
  },
  heroTitle: { fontSize: 22, fontFamily: "Sora_800ExtraBold", color: "#fff", letterSpacing: -0.4 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "PlusJakartaSans_400Regular" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: 17, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "PlusJakartaSans_400Regular", textAlign: "center" },
  statDiv: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },

  filterBar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: "#0098AA", borderColor: "#0098AA" },
  filterChipText: { fontSize: 13, fontFamily: "PlusJakartaSans_500Medium", color: "#6B6B6B" },
  filterChipTextActive: { color: "#fff", fontFamily: "PlusJakartaSans_600SemiBold" },

  group: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  groupTitle: {
    fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: "#9E9E9E",
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 2,
  },

  pkgCard: {
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    gap: 12,
    overflow: "hidden",
  },
  pkgCardActive: { borderColor: "#0EB5CA", backgroundColor: "#F8FBFF" },

  cornerTag: {
    position: "absolute", top: 0, right: 0,
    paddingHorizontal: 10, paddingVertical: 5,
    borderBottomLeftRadius: 12,
  },
  cornerTagText: { fontSize: 9, fontFamily: "PlusJakartaSans_700Bold", color: "#fff", letterSpacing: 0.8 },

  pkgHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pkgIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  pkgTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" },
  pkgLabel: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: "#1A1A1A" },
  durationTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  durationText: { fontSize: 11, fontFamily: "PlusJakartaSans_700Bold" },
  pkgDesc: { fontSize: 12, color: "#6B6B6B", fontFamily: "PlusJakartaSans_400Regular", lineHeight: 18 },

  periodSection: { gap: 10, paddingTop: 4 },
  periodLabel: {
    fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold", color: "#9E9E9E",
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  periodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  periodOpt: {
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5, borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5", alignItems: "center", minWidth: 90,
  },
  periodOptActive: { borderColor: "#0EB5CA", backgroundColor: "rgba(14,181,202,0.08)" },
  periodOptLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_500Medium", color: "#6B6B6B" },
  periodOptLabelActive: { color: "#0EB5CA", fontFamily: "PlusJakartaSans_700Bold" },
  periodOptPrice: { fontSize: 14, fontFamily: "PlusJakartaSans_700Bold", color: "#1A1A1A", marginTop: 2 },
  periodOptPriceActive: { color: "#0EB5CA" },

  sep: { height: 8, backgroundColor: "#F5F5F5" },
  section: { backgroundColor: "#fff", padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Sora_800ExtraBold", color: "#1A1A1A", marginBottom: 4, letterSpacing: -0.2 },

  includeRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  includeIcon: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  includeText: { fontSize: 13, color: "#4A4A4A", fontFamily: "PlusJakartaSans_400Regular", flex: 1, lineHeight: 18 },

  contactCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  contactTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "rgba(14,181,202,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  contactTitle: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: "#1A1A1A" },
  contactSub: { fontSize: 12, color: "#6B6B6B", fontFamily: "PlusJakartaSans_400Regular", marginTop: 2 },
  contactActions: { flexDirection: "row", gap: 10 },
  contactBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, height: 40, borderRadius: 10,
    paddingHorizontal: 20,
    borderWidth: 1.5, borderColor: "#0EB5CA",
    backgroundColor: "rgba(14,181,202,0.08)",
  },
  contactBtnText: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA" },
  contactEmail: { fontSize: 12, color: "#9E9E9E", fontFamily: "PlusJakartaSans_400Regular", textAlign: "center" },

  bookBar: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#EEEEEE",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bookSummary: { fontSize: 12, color: "#6B6B6B", fontFamily: "PlusJakartaSans_400Regular" },
  bookPrice: { fontSize: 22, fontFamily: "Sora_800ExtraBold", color: "#0EB5CA", letterSpacing: -0.6 },
  bookBtn: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
});
