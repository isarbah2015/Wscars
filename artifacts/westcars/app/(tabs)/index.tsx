import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const WC_BADGE    = require("@/assets/images/wc-badge.png");
const CAR_NEW     = require("@/assets/images/car-new.png");
const CAR_USED    = require("@/assets/images/car-used.png");
const CAR_MOTO    = require("@/assets/images/car-moto.png");
const SEARCH_ICON = require("@/assets/images/search-car-icon.png");
const CAT_SUV     = require("@/assets/images/cat-suv.png");
const CAT_SEDAN   = require("@/assets/images/cat-sedan.png");
const CAT_PICKUP  = require("@/assets/images/cat-pickup.png");
const CAT_VAN     = require("@/assets/images/cat-van.png");
const CAT_COUPE   = require("@/assets/images/cat-coupe.png");
const CAT_HATCH   = require("@/assets/images/cat-hatchback.png");
const CAT_MOTO    = require("@/assets/images/cat-motorcycle.png");
const BANNER_CAR  = require("@/assets/images/banner-car.png");

type Condition = "new" | "used" | "moto";

const CONDITION_TABS: { id: Condition; label: string; img: any; grad: [string, string]; dot: string }[] = [
  { id: "new",  label: "New",  img: CAR_NEW,  grad: ["#CC3D00", "#FF6B00"], dot: "#FF6B00" },
  { id: "used", label: "Used", img: CAR_USED, grad: ["#CC3D00", "#FF6B00"], dot: "#FF6B00" },
  { id: "moto", label: "Moto", img: CAR_MOTO, grad: ["#CC3D00", "#FF6B00"], dot: "#FF6B00" },
];

const CAT_COLORS: Record<string, { bg: string; border: string; textColor: string }> = {
  "SUV / 4×4":  { bg: "rgba(129,140,248,0.18)", border: "rgba(129,140,248,0.55)", textColor: "#C7D2FE" },
  "Sedan":      { bg: "rgba(244,114,182,0.18)", border: "rgba(244,114,182,0.55)", textColor: "#FBCFE8" },
  "Pickup":     { bg: "rgba(252,211,77,0.18)",  border: "rgba(252,211,77,0.55)",  textColor: "#FDE68A" },
  "Van":        { bg: "rgba(134,239,172,0.18)", border: "rgba(134,239,172,0.55)", textColor: "#BBF7D0" },
  "Coupe":      { bg: "rgba(192,132,252,0.18)", border: "rgba(192,132,252,0.55)", textColor: "#E9D5FF" },
  "Hatchback":  { bg: "rgba(103,232,249,0.18)", border: "rgba(103,232,249,0.55)", textColor: "#A5F3FC" },
  "Motorcycle": { bg: "rgba(147,197,253,0.18)", border: "rgba(147,197,253,0.55)", textColor: "#BFDBFE" },
  "Scooter":    { bg: "rgba(251,113,133,0.18)", border: "rgba(251,113,133,0.55)", textColor: "#FECDD3" },
  "ATV / Quad": { bg: "rgba(110,231,183,0.18)", border: "rgba(110,231,183,0.55)", textColor: "#A7F3D0" },
  "Dirt Bike":  { bg: "rgba(253,186,116,0.18)", border: "rgba(253,186,116,0.55)", textColor: "#FED7AA" },
};

const VEHICLE_CATEGORIES: Record<Condition, { label: string; img: any; count: number }[]> = {
  new: [
    { label: "SUV / 4×4", img: CAT_SUV,    count: 4 },
    { label: "Sedan",     img: CAT_SEDAN,  count: 2 },
    { label: "Pickup",    img: CAT_PICKUP, count: 1 },
    { label: "Van",       img: CAT_VAN,    count: 0 },
    { label: "Coupe",     img: CAT_COUPE,  count: 0 },
    { label: "Hatchback", img: CAT_HATCH,  count: 0 },
  ],
  used: [
    { label: "SUV / 4×4", img: CAT_SUV,    count: 5 },
    { label: "Sedan",     img: CAT_SEDAN,  count: 2 },
    { label: "Pickup",    img: CAT_PICKUP, count: 1 },
    { label: "Van",       img: CAT_VAN,    count: 0 },
    { label: "Coupe",     img: CAT_COUPE,  count: 0 },
    { label: "Hatchback", img: CAT_HATCH,  count: 0 },
  ],
  moto: [
    { label: "Motorcycle", img: CAT_MOTO,    count: 3 },
    { label: "Scooter",    img: CAR_MOTO,    count: 2 },
    { label: "ATV / Quad", img: CAT_PICKUP,  count: 0 },
    { label: "Dirt Bike",  img: CAT_MOTO,    count: 0 },
  ],
};

export default function HomeScreen() {
  const { cars, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);
  const [condition, setCondition] = useState<Condition>("used");

  const filteredCars =
    condition === "new"
      ? cars.filter((c) => c.condition === "New")
      : condition === "moto"
      ? []
      : cars.filter((c) => c.condition !== "New");

  const displayCars  = filteredCars.length > 0 ? filteredCars : cars;
  const totalCount   = cars.length;
  const specialOffers = cars
    .filter((c) => c.isSponsored || c.isFeatured)
    .filter((car, i, arr) => arr.findIndex((c) => c.id === car.id) === i)
    .slice(0, 5);


  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Fixed Header (glassmorphic light) ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        {/* ── Row 1: Logo + user avatar ── */}
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image source={WC_BADGE} style={styles.logoBadge} resizeMode="contain" />
            <Text style={[styles.logoText, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>WESTCARS</Text>
          </View>
          <View style={styles.userRow}>
            <View style={[styles.avatarCircle, { backgroundColor: "#0EB5CA" }]}>
              <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>
                {currentUser?.name?.[0] || "W"}
              </Text>
            </View>
            <Text style={[styles.userName, { color: isDark ? "#94A3B8" : "#475569" }]}>
              {currentUser?.name?.split(" ")[0] || "Guest"}
            </Text>
          </View>
        </View>

        {/* ── Row 2: Search bar ── */}
        <Pressable
          style={[styles.searchBox, {
            backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          }]}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Image source={SEARCH_ICON} style={styles.searchCarIcon} resizeMode="contain" />
          <View style={styles.searchBoxText}>
            <Text style={[styles.searchBoxLabel, { color: isDark ? "#CBD5E1" : "#334155" }]}>Brand, model, location…</Text>
            <Text style={[styles.searchBoxCount, { color: isDark ? "#475569" : "#94A3B8" }]}>
              {totalCount.toLocaleString()} listings available
            </Text>
          </View>
          <View style={[styles.filterBtn, { backgroundColor: "#0EB5CA" }]}>
            <Feather name="sliders" size={17} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* ── Row 3: 3 condition tabs — text TOP, image BOTTOM ── */}
        <View style={styles.mainTabsRow}>
          {CONDITION_TABS.map((tab) => {
            const active = condition === tab.id;
            return (
              <Pressable
                key={tab.id}
                style={[
                  styles.mainTab,
                  active
                    ? { backgroundColor: "#0EB5CA", borderColor: "#0DCAE6" }
                    : {
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
                      },
                ]}
                onPress={() => setCondition(tab.id)}
              >
                {/* Label — TOP */}
                <Text style={[
                  styles.mainTabLabel,
                  active
                    ? { color: "#FFFFFF", fontFamily: "Manrope_800ExtraBold" }
                    : { color: isDark ? "#64748B" : "#94A3B8", fontFamily: "Manrope_600SemiBold" },
                ]}>
                  {tab.label}
                </Text>
                {/* Car image — BOTTOM, clipped */}
                <View style={styles.mainTabImgWrap}>
                  <Image source={tab.img} style={styles.mainTabImg} resizeMode="contain" />
                </View>
              </Pressable>
            );
          })}
        </View>

      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + (insets.bottom || 0) }}
      >
        {/* ── Sub-categories — horizontal strip, white rectangles ── */}
        <View style={[styles.subCatsSection, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCatsRow}
          >
            {VEHICLE_CATEGORIES[condition].map((cat) => (
              <Pressable
                key={cat.label}
                style={[
                  styles.subTab,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                    borderColor: isDark ? "#2D3A4F" : "#E4E8EF",
                  },
                ]}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Text style={[styles.subTabLabel, { color: isDark ? "#CBD5E1" : "#1E293B" }]} numberOfLines={1}>
                  {cat.label}
                </Text>
                <View style={styles.subTabImgWrap}>
                  <Image source={cat.img} style={styles.subTabImg} resizeMode="contain" />
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── Sponsored Banner → leads to Advertise ── */}
        <Pressable onPress={() => router.push("/advertise")} style={styles.promoBannerWrap}>
          <LinearGradient
            colors={["#006F80", "#0EB5CA", "#38D1E5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoBannerLeft}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>SPONSORED</Text>
              </View>
              <Text style={styles.promoBannerTitle}>Toyota Certified Pre-Owned</Text>
              <Text style={styles.promoBannerSub}>0% Interest · 12-month Warranty · Nationwide</Text>
              <View style={styles.promoCta}>
                <View style={styles.promoCtaBtn}>
                  <Text style={styles.promoCtaText}>View Offer</Text>
                  <Feather name="arrow-right" size={11} color="#FFFFFF" />
                </View>
              </View>
            </View>
            <Image source={BANNER_CAR} style={styles.bannerCarImg} resizeMode="contain" />
          </LinearGradient>
        </Pressable>

        {/* ── "Personally for you" section ── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Personally for you</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {displayCars.map((car) => (
              <View key={car.id} style={styles.gridItem}>
                <CarCard car={car} />
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Special Offers ── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: "#D97706" }]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Offers</Text>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.offersRow}>
              {specialOffers.map((car) => (
                <Pressable
                  key={`special_${car.id}`}
                  style={[styles.offerCard, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({ pathname: "/car/[id]", params: { id: car.id } })
                  }
                >
                  <View style={styles.offerImgWrap}>
                    <Image
                      source={{ uri: car.images[0] }}
                      style={styles.offerImg}
                      resizeMode="cover"
                    />
                    <View style={styles.offerHeart}>
                      <Feather name="heart" size={18} color="rgba(255,255,255,0.9)" />
                    </View>
                  </View>
                  <View style={styles.offerInfo}>
                    <Text style={[styles.offerPrice, { color: colors.text }]}>
                      from {car.price >= 1000 ? `GHS ${car.price.toLocaleString()}` : `GHS ${car.price}`}
                    </Text>
                    <Text style={[styles.offerName, { color: colors.textSecondary }]} numberOfLines={1}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={[styles.offerYear, { color: colors.textTertiary }]}>{car.year}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Advertise Banner ── */}
        <Pressable onPress={() => router.push("/advertise")} style={styles.adBannerWrap}>
          <LinearGradient
            colors={["#005F6E", "#0098AA", "#0EB5CA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.adBanner}
          >
            <View style={styles.adBannerLeft}>
              <View style={styles.adBannerIconBox}>
                <Feather name="trending-up" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.adBannerTitle}>Advertise on Westcars</Text>
                <Text style={styles.adBannerSub}>Reach 50,000+ buyers · From GHS 50</Text>
              </View>
            </View>
            <View style={styles.adBannerArrow}>
              <Feather name="arrow-right" size={16} color="#fff" />
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    zIndex: 10,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontFamily: "Manrope_700Bold" },
  userName: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },

  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoBadge: { width: 34, height: 34, borderRadius: 8 },
  logoText: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 4,
  },

  // ── Search box ──
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchBoxText: { flex: 1 },
  searchBoxLabel: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
  },
  searchBoxCount: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    marginTop: 1,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  searchCarIcon: { width: 44, height: 44 },

  // ── 3 fixed main condition tabs ──
  mainTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  mainTab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  mainTabLabel: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    textAlign: "center",
  },
  mainTabImgWrap: {
    width: 80,
    height: 46,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  mainTabImg: { width: 78, height: 48 },

  // ── Sub-category section (white band at top of scroll body) ──
  subCatsSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  subCatsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  subTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 148,
    height: 58,
    borderRadius: 14,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 0,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  subTabImgWrap: {
    width: 70,
    height: 58,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  subTabImg: { width: 70, height: 46 },
  subTabLabel: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    flex: 1,
    letterSpacing: 0.1,
  },

  scroll: { flex: 1 },

  // ── Sponsored Banner ──
  promoBannerWrap: {
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },
  promoBannerLeft: { flex: 1, gap: 5 },
  promoBadge: {
    backgroundColor: "#E8192C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  promoBadgeText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
    letterSpacing: 1.5,
  },
  promoBannerTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
  },
  promoBannerSub: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  promoCta: {
    marginTop: 4,
  },
  promoCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  promoCtaText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  bannerCarImg: {
    width: 130,
    height: 76,
  },

  // ── Section ──
  section: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 18,
    shadowColor: "#0A1628",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
  },
  seeAll: { fontSize: 13, fontFamily: "Manrope_600SemiBold" },

  // Grid — 2 column
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  sep: { height: 10, backgroundColor: "#F0F2F5" },

  // Special offers
  offersRow: { flexDirection: "row", gap: 10, paddingRight: 12, paddingBottom: 12 },
  offerCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#0A1628",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  offerImgWrap: { height: 115, position: "relative" },
  offerImg: { width: "100%", height: "100%" },
  offerHeart: { position: "absolute", top: 6, right: 6 },
  offerInfo: { padding: 10, gap: 2 },
  offerPrice: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0A1628" },
  offerName: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#6B7A90" },
  offerYear: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "#9BAFC4" },

  // Advertise banner
  adBannerWrap: {
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  adBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  adBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  adBannerTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
  },
  adBannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Manrope_400Regular",
    marginTop: 2,
  },
  adBannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
