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

  const filteredCars = selectedCategory === "all"
    ? cars
    : cars.filter((c) => c.category === selectedCategory);

  const sponsored = cars.filter((c) => c.isSponsored);

  // Interleave ads every 4 items
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
      {/* Header */}
      <LinearGradient
        colors={["#FF6B00", "#FF8C42"]}
        style={[styles.header, { paddingTop: topPad + 14 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Hello, {currentUser?.name.split(" ")[0] || "Guest"} 👋
            </Text>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.location}>
                {currentUser?.location || "Ghana"}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.notifBtn}
            onPress={() => {}}
          >
            <Feather name="bell" size={20} color="#fff" />
          </Pressable>
        </View>

        <SearchBar
          value=""
          onChangeText={() => {}}
          onPress={() => router.push("/(tabs)/search")}
          editable={false}
          placeholder="Search cars, brands, models..."
        />
      </LinearGradient>

      {/* Categories */}
      <View style={styles.section}>
        <CategoryChips
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </View>

      {/* Ads carousel */}
      <View style={styles.section}>
        <AdBanner ads={MOCK_ADS} />
      </View>

      {/* Section heading */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === "all" ? "Latest Cars" : `${selectedCategory.toUpperCase()} Cars`}
        </Text>
        <Text style={styles.sectionCount}>{filteredCars.length} cars</Text>
      </View>
    </>
  );

  const renderItem = ({ item, index }: { item: (typeof listData)[0]; index: number }) => {
    if (item.type === "ad") {
      return <SponsoredCard car={item.car} />;
    }

    // 2-column grid
    if (index % 2 === 0) {
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
    }
    return null;
  };

  // Filter to only even indices for grid rendering
  const gridData = listData.filter((_, i) => {
    const item = listData[i];
    if (item.type === "ad") return true;
    // Only render even car indices (odd ones are rendered alongside even)
    let carIdx = 0;
    for (let j = 0; j < i; j++) {
      if (listData[j].type === "car") carIdx++;
    }
    return item.type !== "car" || carIdx % 2 === 0;
  });

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
          // Skip odd car items (rendered alongside even)
          const carsBefore = listData.slice(0, index).filter(
            (x) => x.type === "car"
          ).length;
          if (carsBefore % 2 === 1) return null;

          const nextItem = listData[index + 1];
          const nextCar =
            nextItem?.type === "car" ? nextItem.item : null;

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
          <View
            style={{
              height: 100 + (Platform.OS === "web" ? 34 : insets.bottom),
            }}
          />
        }
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 14,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  notifBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    backgroundColor: "#fff",
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  halfCard: {
    flex: 1,
  },
});
