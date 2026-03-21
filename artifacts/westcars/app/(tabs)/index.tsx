import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
    { label: "Motorcycle", img: CAT_MOTO,   count: 3 },
    { label: "Scooter",    img: CAR_MOTO,   count: 2 },
    { label: "ATV / Quad", img: CAT_PICKUP, count: 0 },
    { label: "Dirt Bike",  img: CAT_COUPE,  count: 0 },
  ],
};

const SUB_CATS_HEIGHT = 100;

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

  // ── Animated collapse of SUB-category row on scroll (main tabs always visible) ──
  const subHeightAnim = useRef(new Animated.Value(SUB_CATS_HEIGHT)).current;
  const subOpacityAnim = useRef(new Animated.Value(1)).current;
  const lastScrollY = useRef(0);
  const subsVisible = useRef(true);

  const showCats = () => {
    if (subsVisible.current) return;
    subsVisible.current = true;
    Animated.parallel([
      Animated.spring(subHeightAnim, { toValue: SUB_CATS_HEIGHT, useNativeDriver: false, speed: 30, bounciness: 0 }),
      Animated.timing(subOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const hideCats = () => {
    if (!subsVisible.current) return;
    subsVisible.current = false;
    Animated.parallel([
      Animated.spring(subHeightAnim, { toValue: 0, useNativeDriver: false, speed: 30, bounciness: 0 }),
      Animated.timing(subOpacityAnim, { toValue: 0, duration: 160, useNativeDriver: false }),
    ]).start();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 6 && y > 30) {
      hideCats();
    } else if (y < lastScrollY.current - 6) {
      showCats();
    }
    lastScrollY.current = y;
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Fixed Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>

        {/* ── Row 1: Search bar (on top) ── */}
        <Pressable
          style={[styles.searchBox, { backgroundColor: colors.accentLight, borderColor: isDark ? colors.border : "#C8D8F8" }]}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Image source={SEARCH_ICON} style={styles.searchCarIcon} resizeMode="contain" />
          <View style={styles.searchBoxText}>
            <Text style={[styles.searchBoxLabel, { color: colors.text }]}>Brand, model</Text>
            <Text style={[styles.searchBoxCount, { color: colors.textTertiary }]}>
              {totalCount.toLocaleString()} listings
            </Text>
          </View>
          <View style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: isDark ? colors.border : "#C8D8F8" }]}>
            <Feather name="sliders" size={17} color={colors.accent} />
          </View>
        </Pressable>

        {/* ── Row 2: Logo + user avatar ── */}
        <View style={styles.topRow}>
          <View style={styles.logoRow}>
            <Image source={WC_BADGE} style={styles.logoBadge} resizeMode="contain" />
            <Text style={[styles.logoText, { color: colors.text }]}>WESTCARS</Text>
          </View>
          <View style={styles.userRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {currentUser?.name?.[0] || "W"}
              </Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {currentUser?.name?.split(" ")[0] || "Guest"}
            </Text>
          </View>
        </View>

        {/* ── Row 3: 3 FIXED main condition tabs — always visible ── */}
        <View style={styles.mainTabsRow}>
          {(
            [
              { id: "new",  label: "New",  img: CAR_NEW  },
              { id: "used", label: "Used", img: CAR_USED },
              { id: "moto", label: "Moto", img: CAR_MOTO },
            ] as { id: Condition; label: string; img: any }[]
          ).map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.mainTab,
                { backgroundColor: colors.background, borderColor: colors.border },
                condition === tab.id && {
                  backgroundColor: colors.accentLight,
                  borderColor: colors.accent,
                  borderWidth: 1.5,
                },
              ]}
              onPress={() => setCondition(tab.id)}
            >
              <Text
                style={[
                  styles.mainTabLabel,
                  { color: colors.textSecondary },
                  condition === tab.id && { color: colors.accent, fontFamily: "Manrope_700Bold" },
                ]}
              >
                {tab.label}
              </Text>
              <Image source={tab.img} style={styles.mainTabImg} resizeMode="contain" />
            </Pressable>
          ))}
        </View>

        {/* ── Row 4: Sub-categories — horizontal 1×1 scroll, collapses on scroll ── */}
        <Animated.View style={{ height: subHeightAnim, opacity: subOpacityAnim, overflow: "hidden" }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subCatsRow}
          >
            {VEHICLE_CATEGORIES[condition].map((cat) => (
              <Pressable
                key={cat.label}
                style={[styles.subTab, { backgroundColor: colors.background, borderColor: colors.border }]}
              >
                <Image source={cat.img} style={styles.subTabImg} resizeMode="contain" />
                <Text style={[styles.subTabLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                  {cat.label}
                </Text>
                {cat.count > 0 && (
                  <Text style={[styles.subTabCount, { color: colors.textTertiary }]}>{cat.count}</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 100 + (insets.bottom || 0),
        }}
      >
        {/* ── Sponsored Banner → leads to Advertise ── */}
        <Pressable style={styles.promoBanner} onPress={() => router.push("/advertise")}>
          <View style={styles.promoBannerLeft}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>SPONSORED</Text>
            </View>
            <Text style={styles.promoBannerTitle}>Toyota Certified Pre-Owned</Text>
            <Text style={styles.promoBannerSub}>0% Interest · 12-month Warranty · Nationwide</Text>
            <View style={styles.promoCta}>
              <Text style={styles.promoCtaText}>View Offer</Text>
              <Feather name="arrow-right" size={12} color="#BFFF00" />
            </View>
          </View>
          <Image source={BANNER_CAR} style={styles.bannerCarImg} resizeMode="contain" />
        </Pressable>

        {/* ── "Personally for you" section ── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personally for you</Text>
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Special Offers</Text>
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

        {/* ── Advertise ── */}
        <Pressable
          style={[styles.adBanner, { backgroundColor: isDark ? colors.accentLight : "#EBF4FF", borderColor: isDark ? colors.border : "#C6DEFF" }]}
          onPress={() => router.push("/advertise")}
        >
          <View>
            <Text style={[styles.adBannerTitle, { color: colors.text }]}>Advertise on Westcars</Text>
            <Text style={[styles.adBannerSub, { color: colors.textSecondary }]}>
              Reach 50,000+ buyers · Flyer & Video from GHS 50
            </Text>
          </View>
          <View style={[styles.adBannerArrow, { backgroundColor: colors.card, borderColor: isDark ? colors.border : "#C6DEFF" }]}>
            <Feather name="arrow-right" size={16} color={colors.accent} />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F0F2F5" },

  // ── Header ──
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EAED",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
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
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#0066CC" },
  userName: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },

  // Logo
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: { width: 34, height: 34, borderRadius: 8 },
  logoText: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0A1628",
    letterSpacing: 4,
  },

  // ── Search box (now on top) ──
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0F4FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: "#C8D8F8",
  },
  searchBoxText: { flex: 1 },
  searchBoxLabel: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    color: "#1A1A1A",
  },
  searchBoxCount: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: "#7A8AA8",
    marginTop: 1,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E8F0FE",
    borderWidth: 1,
    borderColor: "#C8D8F8",
    alignItems: "center",
    justifyContent: "center",
  },
  // Search car icon — bigger
  searchCarIcon: { width: 44, height: 44 },

  // ── 3 fixed main condition tabs ──
  mainTabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
  },
  mainTab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
  },
  mainTabLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    textAlign: "center",
  },
  mainTabImg: { width: 72, height: 40 },

  // ── Sub-category row (horizontal scroll) ──
  subCatsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
  },
  subTab: {
    width: 82,
    height: 82,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  subTabImg: { width: 58, height: 34 },
  subTabLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    textAlign: "center",
  },
  subTabCount: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
  },

  scroll: { flex: 1 },

  // ── Sponsored Banner ──
  promoBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#08122A",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 18,
    shadowColor: "#08122A",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  promoCtaText: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: "#BFFF00",
  },
  bannerCarImg: {
    width: 130,
    height: 76,
  },

  // ── Section ──
  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 8,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: "#0A1628",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: "Manrope_700Bold",
    color: "#0A1628",
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: "#0066CC", fontFamily: "Manrope_500Medium" },

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
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C6DEFF",
    shadowColor: "#0066CC",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  adBannerTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#0A1628",
  },
  adBannerSub: {
    fontSize: 12,
    color: "#6B7A90",
    fontFamily: "Manrope_400Regular",
    marginTop: 2,
  },
  adBannerArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C6DEFF",
  },
});
