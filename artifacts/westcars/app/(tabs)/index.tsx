import { Feather } from "@expo/vector-icons";
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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const WC_BADGE = require("@/assets/images/wc-badge.png");
const CAR_NEW = require("@/assets/images/car-new.png");
const CAR_USED = require("@/assets/images/car-used.png");
const CAR_MOTO = require("@/assets/images/car-moto.png");
const SEARCH_ICON = require("@/assets/images/search-car-icon.png");
const CAT_SUV = require("@/assets/images/cat-suv.png");
const CAT_SEDAN = require("@/assets/images/cat-sedan.png");
const CAT_PICKUP = require("@/assets/images/cat-pickup.png");
const CAT_VAN = require("@/assets/images/cat-van.png");
const CAT_COUPE = require("@/assets/images/cat-coupe.png");
const CAT_HATCH = require("@/assets/images/cat-hatchback.png");
const CAT_MOTO = require("@/assets/images/cat-motorcycle.png");

type Condition = "new" | "used" | "moto";

const VEHICLE_CATEGORIES: Record<Condition, { label: string; img: any; count: number }[]> = {
  new: [
    { label: "SUV / 4×4", img: CAT_SUV, count: 4 },
    { label: "Sedan", img: CAT_SEDAN, count: 2 },
    { label: "Pickup", img: CAT_PICKUP, count: 1 },
    { label: "Van", img: CAT_VAN, count: 0 },
    { label: "Coupe", img: CAT_COUPE, count: 0 },
    { label: "Hatchback", img: CAT_HATCH, count: 0 },
  ],
  used: [
    { label: "SUV / 4×4", img: CAT_SUV, count: 5 },
    { label: "Sedan", img: CAT_SEDAN, count: 2 },
    { label: "Pickup", img: CAT_PICKUP, count: 1 },
    { label: "Van", img: CAT_VAN, count: 0 },
    { label: "Coupe", img: CAT_COUPE, count: 0 },
    { label: "Hatchback", img: CAT_HATCH, count: 0 },
  ],
  moto: [
    { label: "Motorcycle", img: CAT_MOTO, count: 3 },
    { label: "Scooter", img: CAT_MOTO, count: 2 },
    { label: "ATV / Quad", img: CAT_MOTO, count: 0 },
    { label: "Dirt Bike", img: CAT_MOTO, count: 0 },
  ],
};

export default function HomeScreen() {
  const { cars, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);
  const [condition, setCondition] = useState<Condition>("used");

  const filteredCars =
    condition === "new"
      ? cars.filter((c) => c.condition === "New")
      : condition === "moto"
      ? []
      : cars.filter((c) => c.condition !== "New");

  const displayCars = filteredCars.length > 0 ? filteredCars : cars;
  const totalCount = cars.length;

  const specialOffers = cars.filter((c) => c.isSponsored || c.isFeatured)
    .filter((car, i, arr) => arr.findIndex((c) => c.id === car.id) === i)
    .slice(0, 5);

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <View style={styles.topRow}>
          {/* User avatar + name */}
          <View style={styles.userRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {currentUser?.name?.[0] || "W"}
              </Text>
            </View>
            <Text style={styles.userName}>
              {currentUser?.name?.split(" ")[0] || "Guest"}
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/search")}>
            <Feather name="search" size={22} color="#1A1A1A" />
          </Pressable>
        </View>

        {/* Logo — WestCars badge + wordmark */}
        <View style={styles.logoRow}>
          <Image source={WC_BADGE} style={styles.logoBadge} resizeMode="contain" />
          <Text style={styles.logoText}>WESTCARS</Text>
        </View>

        {/* Search box */}
        <Pressable
          style={styles.searchBox}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Image source={SEARCH_ICON} style={styles.searchCarIcon} resizeMode="contain" />
          <View style={styles.searchBoxText}>
            <Text style={styles.searchBoxLabel}>Brand, model</Text>
            <Text style={styles.searchBoxCount}>
              {totalCount.toLocaleString()} listings
            </Text>
          </View>
          <Pressable style={styles.filterBtn}>
            <Feather name="sliders" size={18} color="#1A1A1A" />
          </Pressable>
        </Pressable>

        {/* Condition tabs + category type cards in one horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {(
            [
              { id: "new", label: "New", img: CAR_NEW },
              { id: "used", label: "Used", img: CAR_USED },
              { id: "moto", label: "Moto", img: CAR_MOTO },
            ] as { id: Condition; label: string; img: any }[]
          ).map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, condition === tab.id && styles.tabActive]}
              onPress={() => setCondition(tab.id)}
            >
              <Text style={[styles.tabLabel, condition === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <Image source={tab.img} style={styles.tabImg} resizeMode="contain" />
            </Pressable>
          ))}

          {/* Divider */}
          <View style={styles.tabDivider} />

          {/* Category type cards — same size as condition tabs */}
          {VEHICLE_CATEGORIES[condition].map((cat) => (
            <Pressable key={cat.label} style={styles.tab}>
              <Text style={styles.tabLabel} numberOfLines={1}>{cat.label}</Text>
              <Image source={cat.img} style={styles.tabImg} resizeMode="contain" />
              {cat.count > 0 && (
                <Text style={styles.tabCount}>{cat.count}</Text>
              )}
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100 + (insets.bottom || 0),
        }}
      >
        {/* ── "Personally for you" section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personally for you</Text>
          <View style={styles.grid}>
            {displayCars.map((car) => (
              <View key={car.id} style={styles.gridItem}>
                <CarCard car={car} />
              </View>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.sep} />

        {/* ── Special Offers ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.offersRow}>
              {specialOffers.map((car) => (
                <Pressable
                  key={`special_${car.id}`}
                  style={styles.offerCard}
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
                    <Text style={styles.offerPrice}>
                      from {car.price >= 1000 ? `GHS ${car.price.toLocaleString()}` : `GHS ${car.price}`}
                    </Text>
                    <Text style={styles.offerName} numberOfLines={1}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={styles.offerYear}>{car.year}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.sep} />

        {/* ── Advertise ── */}
        <Pressable style={styles.adBanner} onPress={() => router.push("/advertise")}>
          <View>
            <Text style={styles.adBannerTitle}>Advertise on Westcars</Text>
            <Text style={styles.adBannerSub}>
              Reach 50,000+ buyers · Flyer & Video from GHS 50
            </Text>
          </View>
          <View style={styles.adBannerArrow}>
            <Feather name="arrow-right" size={16} color="#0066CC" />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  // Header
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#0066CC" },
  userName: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },

  // Logo
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginVertical: 4,
  },
  logoBadge: { width: 36, height: 36, borderRadius: 8 },
  logoText: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0A1628",
    letterSpacing: 4,
  },

  // Search box
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchBoxText: { flex: 1 },
  searchBoxLabel: {
    fontSize: 15,
    fontFamily: "Manrope_500Medium",
    color: "#1A1A1A",
  },
  searchBoxCount: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#9E9E9E",
    marginTop: 1,
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs — horizontal scroll row
  tabsRow: { flexDirection: "row", gap: 8, paddingVertical: 2 },
  tab: {
    width: 100,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tabActive: {
    backgroundColor: "#fff",
    borderColor: "#1A1A1A",
    borderWidth: 1.5,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: "#6B6B6B",
    textAlign: "center",
  },
  tabLabelActive: {
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
  },
  tabCount: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "#9E9E9E",
  },
  tabImg: { width: 64, height: 36 },
  tabDivider: {
    width: 1,
    marginHorizontal: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "stretch",
    marginVertical: 4,
  },
  searchCarIcon: { width: 28, height: 28 },

  // Vehicle category grid
  catSection: {
    backgroundColor: "#fff",
    paddingTop: 14,
    paddingBottom: 12,
  },
  catSectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  catScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  catColumn: { flexDirection: "column", gap: 8 },
  catCard: {
    width: 120,
    backgroundColor: "#F8F8F8",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    overflow: "hidden",
    padding: 8,
    alignItems: "center",
  },
  catImg: {
    width: 100,
    height: 60,
    marginBottom: 4,
  },
  catLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
    color: "#1A1A1A",
    textAlign: "center",
  },
  catCount: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 2,
  },

  scroll: { flex: 1 },

  // Section
  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, color: "#0066CC", fontFamily: "Manrope_400Regular" },

  // Grid — 2 column, no gap (like auto.ru)
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 16,
  },

  sep: { height: 8, backgroundColor: "#F5F5F5" },

  // Special offers (horizontal)
  offersRow: { flexDirection: "row", gap: 10, paddingRight: 12, paddingBottom: 12 },
  offerCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  offerImgWrap: { height: 115, position: "relative" },
  offerImg: { width: "100%", height: "100%" },
  offerHeart: { position: "absolute", top: 6, right: 6 },
  offerInfo: { padding: 10, gap: 1 },
  offerPrice: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  offerName: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#6B6B6B" },
  offerYear: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "#9E9E9E" },

  // Ad banner
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#C6DEFF",
  },
  adBannerTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
  },
  adBannerSub: {
    fontSize: 12,
    color: "#6B6B6B",
    fontFamily: "Manrope_400Regular",
    marginTop: 2,
  },
  adBannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C6DEFF",
  },
});
