import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdBanner } from "@/components/AdBanner";
import { CarCard } from "@/components/CarCard";
import { CategoryChips } from "@/components/CategoryChip";
import { SearchBar } from "@/components/SearchBar";
import { SponsoredCard } from "@/components/SponsoredCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { Car } from "@/types";
import { MOCK_ADS } from "@/utils/mockData";

export default function HomeScreen() {
  const { cars, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filteredCars =
    selectedCategory === "all"
      ? cars
      : cars.filter((c) => c.category === selectedCategory);

  const sponsored = cars.filter((c) => c.isSponsored);

  const buildListData = () => {
    const result: Array<{ type: "car"; item: Car } | { type: "ad"; car: Car }> = [];
    let adIdx = 0;
    filteredCars.forEach((car, i) => {
      result.push({ type: "car", item: car });
      if ((i + 1) % 4 === 0 && adIdx < sponsored.length) {
        result.push({ type: "ad", car: sponsored[adIdx % sponsored.length] });
        adIdx++;
      }
    });
    return result;
  };

  const listData = buildListData();

  const renderHeader = () => (
    <>
      {/* ── Green Header ── */}
      <LinearGradient
        colors={["#002E13", "#004D22", "#00873E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 14 }]}
      >
        {/* Top row */}
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              {currentUser
                ? `Hello, ${currentUser.name.split(" ")[0]} 👋`
                : "Welcome to Westcars"}
            </Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.location}>
                {currentUser?.location || "Ghana"} · 20+ cities
              </Text>
            </View>
          </View>

          {/* Advertise + Notif */}
          <View style={styles.headerActions}>
            <Pressable
              style={styles.advertiseBtn}
              onPress={() => router.push("/advertise")}
            >
              <Feather name="zap" size={13} color="#FFD700" />
              <Text style={styles.advertiseBtnText}>Advertise</Text>
            </Pressable>
            <Pressable style={styles.notifBtn}>
              <Feather name="bell" size={19} color="#fff" />
              <View style={styles.notifDot} />
            </Pressable>
          </View>
        </View>

        {/* Search bar */}
        <SearchBar
          value=""
          onChangeText={() => {}}
          onPress={() => router.push("/(tabs)/search")}
          editable={false}
          placeholder="Search by brand, model, city…"
        />

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{cars.length}</Text>
            <Text style={styles.statLbl}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>20+</Text>
            <Text style={styles.statLbl}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>50k+</Text>
            <Text style={styles.statLbl}>Buyers</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesWrap}>
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* Ad Banner */}
      <View style={styles.bannerWrap}>
        <AdBanner ads={MOCK_ADS} />
      </View>

      {/* Section heading */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all" ? "Latest Listings" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + " Cars"}
        </Text>
        <Text style={styles.sectionCount}>{filteredCars.length} cars</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={(item, i) =>
          item.type === "car" ? item.item.id : `ad_${i}`
        }
        renderItem={({ item, index }) => {
          if (item.type === "ad") {
            return <SponsoredCard car={item.car} />;
          }
          const carsBefore = listData
            .slice(0, index)
            .filter((x) => x.type === "car").length;
          if (carsBefore % 2 === 1) return null;

          const nextItem = listData[index + 1];
          const nextCar = nextItem?.type === "car" ? nextItem.item : null;

          return (
            <View style={styles.row}>
              <CarCard car={item.item} style={styles.halfCard} />
              {nextCar ? (
                <CarCard car={nextCar} style={styles.halfCard} />
              ) : (
                <View style={styles.halfCard} />
              )}
            </View>
          );
        }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          <View style={{ height: 100 + (Platform.OS === "web" ? 34 : insets.bottom) }} />
        }
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.3 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  location: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  advertiseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
  },
  advertiseBtnText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#FFD700",
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    borderWidth: 1.5,
    borderColor: "#004D22",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 2,
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.2)" },
  categoriesWrap: { backgroundColor: "#fff", paddingVertical: 10 },
  bannerWrap: { backgroundColor: "#fff", paddingBottom: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sectionCount: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  row: { flexDirection: "row", paddingHorizontal: 12, gap: 8 },
  halfCard: { flex: 1 },
});
