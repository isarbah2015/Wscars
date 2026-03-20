import { Feather } from "@expo/vector-icons";
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

interface PeriodOption { period: Period; count: number; price: number }
interface Package {
  id: string;
  type: AdType;
  label: string;
  description: string;
  duration?: string;
  periodOptions: PeriodOption[];
  icon: string;
  popular?: boolean;
}

const AD_PACKAGES: Package[] = [
  {
    id: "flyer",
    type: "flyer",
    label: "Flyer Ad",
    description: "Static image shown in the feed and home carousel. Great for brand awareness.",
    icon: "image",
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
    description: "Short video shown before car detail screens. Maximum impact, minimum skip.",
    duration: "15 sec",
    icon: "play-circle",
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
    description: "Mid-length video for showcasing your dealership in detail.",
    duration: "20 sec",
    icon: "play-circle",
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
    periodOptions: [
      { period: "days", count: 3, price: 220 },
      { period: "days", count: 7, price: 400 },
      { period: "weeks", count: 2, price: 720 },
      { period: "months", count: 1, price: 1300 },
      { period: "months", count: 3, price: 3400 },
    ],
  },
];

function periodLabel(period: Period, count: number) {
  if (period === "days") return count === 1 ? "1 Day" : `${count} Days`;
  if (period === "weeks") return count === 1 ? "1 Week" : `${count} Weeks`;
  return count === 1 ? "1 Month" : `${count} Months`;
}

export default function AdvertiseScreen() {
  const insets = useSafeAreaInsets();
  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption | null>(null);

  const handleBook = () => {
    if (!selectedPkg || !selectedPeriod) {
      Alert.alert("Select a package", "Choose an ad format and duration first.");
      return;
    }
    Alert.alert(
      "Booking received",
      `Your ${selectedPkg.label} (${periodLabel(selectedPeriod.period, selectedPeriod.count)}) has been submitted.\n\nOur team will contact you within 24h.\n\nTotal: GHS ${selectedPeriod.price}`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>Advertise on Westcars</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: (insets.bottom || 0) + 120 }]}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Reach Ghana's Car Buyers</Text>
          <Text style={styles.heroSub}>Over 50,000 active buyers monthly across Ghana</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>50k+</Text>
              <Text style={styles.statLbl}>Monthly Users</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>8</Text>
              <Text style={styles.statLbl}>Regions</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>4.9 ★</Text>
              <Text style={styles.statLbl}>App Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.sep} />

        {/* Packages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Ad Format</Text>
          {AD_PACKAGES.map((pkg) => {
            const isActive = selectedPkg?.id === pkg.id;
            return (
              <View key={pkg.id}>
                <Pressable
                  style={[styles.pkgCard, isActive && styles.pkgCardActive]}
                  onPress={() => { setSelectedPkg(pkg); setSelectedPeriod(null); }}
                >
                  {pkg.popular && (
                    <View style={styles.popularTag}>
                      <Text style={styles.popularTagText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <View style={styles.pkgHeader}>
                    <View style={[styles.pkgIcon, isActive && styles.pkgIconActive]}>
                      <Feather name={pkg.icon as any} size={20}
                        color={isActive ? "#0066CC" : Colors.light.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgLabel}>{pkg.label}</Text>
                        {pkg.duration && (
                          <View style={styles.durationTag}>
                            <Text style={styles.durationText}>{pkg.duration}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgDesc}>{pkg.description}</Text>
                    </View>
                    <Feather
                      name={isActive ? "check-circle" : "circle"}
                      size={18}
                      color={isActive ? "#0066CC" : "#E0E0E0"}
                    />
                  </View>

                  {/* Duration options */}
                  {isActive && (
                    <View style={styles.periodSection}>
                      <Text style={styles.periodSectionLabel}>Select duration</Text>
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
                                ₵{opt.price.toLocaleString()}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.sep} />

        {/* What's included */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Included</Text>
          {[
            { icon: "target", text: "Geo-targeted to your preferred region(s)" },
            { icon: "trending-up", text: "Real-time impression & click analytics" },
            { icon: "refresh-cw", text: "Creative revision support" },
            { icon: "users", text: "Reach verified buyers & dealers" },
            { icon: "phone", text: "Dedicated account manager" },
          ].map((item) => (
            <View key={item.text} style={styles.includeRow}>
              <View style={styles.includeIcon}>
                <Feather name={item.icon as any} size={14} color="#0066CC" />
              </View>
              <Text style={styles.includeText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sep} />

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Feather name="phone-call" size={18} color="#0066CC" />
            </View>
            <View>
              <Text style={styles.contactTitle}>Talk to our Ad Team</Text>
              <Text style={styles.contactSub}>+233 30 274 0000 · ads@westcars.com.gh</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Now bar */}
      {selectedPkg && selectedPeriod && (
        <View style={[styles.bookBar, { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 28 : 12) }]}>
          <View>
            <Text style={styles.bookSummary}>
              {selectedPkg.label} · {periodLabel(selectedPeriod.period, selectedPeriod.count)}
            </Text>
            <Text style={styles.bookPrice}>GHS {selectedPeriod.price.toLocaleString()}</Text>
          </View>
          <Pressable style={styles.bookBtn} onPress={handleBook}>
            <Text style={styles.bookBtnText}>Book Now</Text>
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
    borderBottomColor: "#E0E0E0",
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topBarTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.light.text },
  content: { gap: 0 },
  sep: { height: 8, backgroundColor: "#F5F5F5" },
  hero: {
    backgroundColor: "#fff",
    padding: 20,
    gap: 8,
  },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, letterSpacing: -0.3 },
  heroSub: { fontSize: 14, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F0F6FF",
    borderRadius: 10,
    padding: 16,
    marginTop: 4,
    alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#0066CC" },
  statLbl: { fontSize: 11, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", textAlign: "center" },
  statDiv: { width: 1, height: 28, backgroundColor: "#D0E4FF" },
  section: { backgroundColor: "#fff", padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.light.text },
  pkgCard: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#fff",
    gap: 12,
    overflow: "hidden",
  },
  pkgCardActive: { borderColor: "#0066CC", backgroundColor: "#FAFCFF" },
  popularTag: {
    position: "absolute", top: 0, right: 0,
    backgroundColor: "#0066CC",
    paddingHorizontal: 10, paddingVertical: 5,
    borderBottomLeftRadius: 10,
  },
  popularTagText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.8 },
  pkgHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  pkgIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },
  pkgIconActive: { backgroundColor: "#EBF4FF" },
  pkgTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  pkgLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.light.text },
  durationTag: {
    backgroundColor: "#EBF4FF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5,
  },
  durationText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#0066CC" },
  pkgDesc: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", lineHeight: 18 },
  periodSection: { gap: 10 },
  periodSectionLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.textTertiary,
    textTransform: "uppercase", letterSpacing: 0.8,
  },
  periodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  periodOpt: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 8, borderWidth: 1.5, borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5", alignItems: "center", minWidth: 88,
  },
  periodOptActive: { borderColor: "#0066CC", backgroundColor: "#EBF4FF" },
  periodOptLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.light.textSecondary },
  periodOptLabelActive: { color: "#0066CC", fontFamily: "Inter_700Bold" },
  periodOptPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.light.text, marginTop: 2 },
  periodOptPriceActive: { color: "#0066CC" },
  includeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  includeIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#EBF4FF", alignItems: "center", justifyContent: "center",
  },
  includeText: { fontSize: 13, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", flex: 1 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: "#EBF4FF", alignItems: "center", justifyContent: "center",
  },
  contactTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  contactSub: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  bookBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#E0E0E0",
  },
  bookSummary: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  bookPrice: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0066CC", letterSpacing: -0.5 },
  bookBtn: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 28, paddingVertical: 14, borderRadius: 8,
  },
  bookBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
