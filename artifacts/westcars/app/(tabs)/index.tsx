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

type Condition = "new" | "used" | "moto";

export default function HomeScreen() {
  const { cars, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);
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

        {/* Logo */}
        <Text style={styles.logo}>Westcars</Text>

        {/* Search box */}
        <Pressable
          style={styles.searchBox}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Feather name="truck" size={22} color="#9E9E9E" />
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

        {/* Condition tabs */}
        <View style={styles.tabs}>
          {(
            [
              { id: "new", label: "New", emoji: "🚗" },
              { id: "used", label: "Used", emoji: "🚙" },
              { id: "moto", label: "Moto", emoji: "🏍️" },
            ] as { id: Condition; label: string; emoji: string }[]
          ).map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tab, condition === tab.id && styles.tabActive]}
              onPress={() => setCondition(tab.id)}
            >
              <Text style={[styles.tabLabel, condition === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
            </Pressable>
          ))}
        </View>
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
  avatarText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0066CC" },
  userName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },

  // Logo — big red like auto.ru
  logo: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    color: "#E8192C",
    textAlign: "center",
    letterSpacing: -1,
    marginVertical: -4,
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
    fontFamily: "Inter_500Medium",
    color: "#1A1A1A",
  },
  searchBoxCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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

  // Tabs
  tabs: { flexDirection: "row", gap: 8 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
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
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#6B6B6B",
  },
  tabLabelActive: {
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  tabEmoji: { fontSize: 18 },

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
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  seeAll: { fontSize: 14, color: "#0066CC", fontFamily: "Inter_400Regular" },

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
  offerPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  offerName: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B6B6B" },
  offerYear: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9E9E9E" },

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
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
  },
  adBannerSub: {
    fontSize: 12,
    color: "#6B6B6B",
    fontFamily: "Inter_400Regular",
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
