import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
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
import { Car } from "@/types";
import { MOCK_ADS } from "@/utils/mockData";
import { CAR_BRANDS } from "@/utils/ghanaData";

const POPULAR_BRANDS = [
  { name: "Toyota", icon: "🚗", count: 12 },
  { name: "Honda", icon: "🚘", count: 7 },
  { name: "Hyundai", icon: "🚙", count: 5 },
  { name: "Mercedes", icon: "🏎️", count: 4 },
  { name: "BMW", icon: "🚀", count: 3 },
  { name: "Kia", icon: "🚖", count: 6 },
  { name: "Nissan", icon: "🚐", count: 4 },
  { name: "Ford", icon: "🛻", count: 3 },
];

export default function HomeScreen() {
  const { cars, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);

  const sponsored = cars.filter((c) => c.isSponsored);
  const featured = cars.filter((c) => c.isFeatured && !c.isSponsored);
  const specialOffers = [...sponsored, ...featured].filter(
    (car, i, arr) => arr.findIndex((c) => c.id === car.id) === i
  ).slice(0, 5);
  const latest = cars.slice(0, 8);

  return (
    <View style={styles.root}>
      {/* ── Sticky Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        {/* Location row */}
        <View style={styles.locRow}>
          <Pressable style={styles.locBtn}>
            <Feather name="map-pin" size={13} color="#0066CC" />
            <Text style={styles.locText}>Ghana, Accra</Text>
            <Feather name="chevron-down" size={13} color="#0066CC" />
          </Pressable>
          <View style={styles.headerRight}>
            <Pressable
              style={styles.sellBtn}
              onPress={() => router.push("/(tabs)/sell")}
            >
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.sellBtnText}>Sell car</Text>
            </Pressable>
            <Pressable style={styles.notifBtn} onPress={() => {}}>
              <Feather name="bell" size={20} color={Colors.light.textSecondary} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Feather name="search" size={16} color={Colors.light.textTertiary} />
          <Text style={styles.searchPlaceholder}>Search by brand, model, or code…</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + (insets.bottom || 0) }}
      >
        {/* ── Popular Brands ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Brands</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.brandsRow}>
              {POPULAR_BRANDS.map((b) => (
                <Pressable
                  key={b.name}
                  style={styles.brandChip}
                  onPress={() => router.push({ pathname: "/(tabs)/search", params: { brand: b.name } })}
                >
                  <Text style={styles.brandEmoji}>{b.icon}</Text>
                  <Text style={styles.brandName}>{b.name}</Text>
                  <Text style={styles.brandCount}>{b.count}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.dividerBlock} />

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
                  key={`offer_${car.id}`}
                  style={styles.offerCard}
                  onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
                >
                  <View style={styles.offerImageWrap}>
                    <Image source={{ uri: car.images[0] }} style={styles.offerImage} />
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>Special price</Text>
                    </View>
                  </View>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerTitle} numberOfLines={1}>
                      {car.year} {car.brand} {car.model}
                    </Text>
                    <Text style={styles.offerPrice} numberOfLines={1}>
                      GHS {car.price.toLocaleString()}
                    </Text>
                    <Text style={styles.offerSub}>{Math.round(car.mileage / 1000)}k km · {car.location}</Text>
                    <Text style={styles.creditTag}>Credit available</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.dividerBlock} />

        {/* ── Advertise Banner ── */}
        <Pressable style={styles.adBanner} onPress={() => router.push("/advertise")}>
          <View>
            <Text style={styles.adBannerTitle}>Advertise on Westcars</Text>
            <Text style={styles.adBannerSub}>Reach 50,000+ buyers · Flyer & Video ads from GHS 50</Text>
          </View>
          <View style={styles.adBannerBtn}>
            <Text style={styles.adBannerBtnText}>Learn more</Text>
            <Feather name="arrow-right" size={14} color="#0066CC" />
          </View>
        </Pressable>

        <View style={styles.dividerBlock} />

        {/* ── Latest Listings ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Latest Listings</Text>
            <Text style={styles.sectionCount}>{cars.length} cars</Text>
          </View>
        </View>

        {/* 2-column grid */}
        <View style={styles.grid}>
          {latest.map((car, i) => (
            <View key={car.id} style={styles.gridItem}>
              <CarCard car={car} />
            </View>
          ))}
        </View>

        <Pressable
          style={styles.showAllBtn}
          onPress={() => router.push("/(tabs)/search")}
        >
          <Text style={styles.showAllText}>Show all {cars.length} listings</Text>
          <Feather name="arrow-right" size={15} color="#0066CC" />
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
    paddingBottom: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  locText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0066CC" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  sellBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0066CC",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  sellBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  notifBtn: { position: "relative", padding: 4 },
  notifDot: {
    position: "absolute", top: 4, right: 4,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#E53935",
    borderWidth: 1.5, borderColor: "#fff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchPlaceholder: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },

  scroll: { flex: 1 },
  dividerBlock: { height: 8, backgroundColor: "#F5F5F5" },

  section: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  sectionCount: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  seeAll: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_500Medium" },

  // Brands
  brandsRow: { flexDirection: "row", gap: 10, paddingRight: 16 },
  brandChip: {
    width: 80,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  brandEmoji: { fontSize: 22 },
  brandName: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  brandCount: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },

  // Offers
  offersRow: { flexDirection: "row", gap: 12, paddingRight: 16 },
  offerCard: {
    width: 190,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  offerImageWrap: { height: 110, backgroundColor: "#F0F4FF", position: "relative" },
  offerImage: { width: "100%", height: "100%", resizeMode: "cover" },
  offerBadge: {
    position: "absolute",
    top: 8, left: 8,
    backgroundColor: "#E53935",
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 4,
    zIndex: 1,
  },
  offerBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  offerImgPlaceholder: { flex: 1 },
  offerInfo: { padding: 10, gap: 3 },
  offerTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.light.text },
  offerPrice: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#0066CC" },
  offerSub: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  creditTag: { fontSize: 11, color: "#43A047", fontFamily: "Inter_600SemiBold", marginTop: 2 },

  // Ad banner
  adBanner: {
    backgroundColor: "#EBF4FF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#C6DEFF",
  },
  adBannerTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.light.text },
  adBannerSub: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", marginTop: 2 },
  adBannerBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  adBannerBtnText: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_600SemiBold" },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#fff",
  },
  gridItem: { width: "50%" },

  showAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  showAllText: { fontSize: 14, color: "#0066CC", fontFamily: "Inter_600SemiBold" },
});
