import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { SearchBar } from "@/components/SearchBar";
import { SponsoredCard } from "@/components/SponsoredCard";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { Car } from "@/types";
import {
  CAR_BRANDS,
  CONDITIONS,
  FUEL_TYPES,
  GHANA_CITIES,
  TRANSMISSIONS,
} from "@/utils/ghanaData";

const PRICE_RANGES = [
  { label: "Any Price", min: 0, max: 9999999 },
  { label: "Under ₵50k", min: 0, max: 50000 },
  { label: "₵50k - ₵100k", min: 50000, max: 100000 },
  { label: "₵100k - ₵250k", min: 100000, max: 250000 },
  { label: "₵250k - ₵500k", min: 250000, max: 500000 },
  { label: "₵500k+", min: 500000, max: 9999999 },
];

function FilterModal({
  visible,
  onClose,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}) {
  const [brand, setBrand] = useState("Any");
  const [location, setLocation] = useState("Any");
  const [fuelType, setFuelType] = useState("Any");
  const [transmission, setTransmission] = useState("Any");
  const [condition, setCondition] = useState("Any");
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);

  const FilterSection = ({
    title,
    options,
    selected,
    onSelect,
  }: {
    title: string;
    options: string[];
    selected: string;
    onSelect: (v: string) => void;
  }) => (
    <View style={fStyles.section}>
      <Text style={fStyles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={fStyles.chips}>
          {["Any", ...options].map((opt) => (
            <Pressable
              key={opt}
              style={[fStyles.chip, selected === opt && fStyles.chipActive]}
              onPress={() => onSelect(opt)}
            >
              <Text
                style={[fStyles.chipText, selected === opt && fStyles.chipTextActive]}
              >
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={fStyles.overlay}>
        <View style={fStyles.sheet}>
          <View style={fStyles.handle} />
          <View style={fStyles.header}>
            <Text style={fStyles.title}>Filters</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={Colors.light.text} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <FilterSection
              title="Brand"
              options={CAR_BRANDS.slice(0, 10)}
              selected={brand}
              onSelect={setBrand}
            />
            <FilterSection
              title="Location"
              options={GHANA_CITIES}
              selected={location}
              onSelect={setLocation}
            />
            <FilterSection
              title="Fuel Type"
              options={FUEL_TYPES}
              selected={fuelType}
              onSelect={setFuelType}
            />
            <FilterSection
              title="Transmission"
              options={TRANSMISSIONS}
              selected={transmission}
              onSelect={setTransmission}
            />
            <FilterSection
              title="Condition"
              options={CONDITIONS}
              selected={condition}
              onSelect={setCondition}
            />
            <View style={fStyles.section}>
              <Text style={fStyles.sectionTitle}>Price Range</Text>
              <View style={fStyles.chips}>
                {PRICE_RANGES.map((range) => (
                  <Pressable
                    key={range.label}
                    style={[
                      fStyles.chip,
                      priceRange.label === range.label && fStyles.chipActive,
                    ]}
                    onPress={() => setPriceRange(range)}
                  >
                    <Text
                      style={[
                        fStyles.chipText,
                        priceRange.label === range.label && fStyles.chipTextActive,
                      ]}
                    >
                      {range.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={fStyles.footer}>
            <Pressable
              style={fStyles.resetBtn}
              onPress={() => {
                setBrand("Any");
                setLocation("Any");
                setFuelType("Any");
                setTransmission("Any");
                setCondition("Any");
                setPriceRange(PRICE_RANGES[0]);
              }}
            >
              <Text style={fStyles.resetText}>Reset</Text>
            </Pressable>
            <Pressable
              style={fStyles.applyBtn}
              onPress={() => {
                onApply({ brand, location, fuelType, transmission, condition, priceRange });
                onClose();
              }}
            >
              <Text style={fStyles.applyText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SearchScreen() {
  const { cars } = useApp();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const filtered = cars.filter((car) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      car.brand.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      car.location.toLowerCase().includes(q) ||
      car.condition.toLowerCase().includes(q);

    if (!matchQuery) return false;
    if (!activeFilters) return true;

    const { brand, location, fuelType, transmission, condition, priceRange } =
      activeFilters;

    return (
      (brand === "Any" || car.brand === brand) &&
      (location === "Any" || car.location === location) &&
      (fuelType === "Any" || car.fuelType === fuelType) &&
      (transmission === "Any" || car.transmission === transmission) &&
      (condition === "Any" || car.condition === condition) &&
      car.price >= priceRange.min &&
      car.price <= priceRange.max
    );
  });

  const sponsored = filtered.filter((c) => c.isSponsored);
  const buildList = () => {
    const result: any[] = [];
    let adIdx = 0;
    filtered.forEach((car, i) => {
      result.push({ type: "car", item: car });
      if ((i + 1) % 4 === 0 && adIdx < sponsored.length) {
        result.push({ type: "ad", car: sponsored[adIdx % sponsored.length] });
        adIdx++;
      }
    });
    return result;
  };
  const listData = buildList();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Text style={styles.title}>Search Cars</Text>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onFilter={() => setFilterVisible(true)}
          placeholder="Brand, model, location..."
        />
        {activeFilters && (
          <View style={styles.filterTag}>
            <Feather name="filter" size={12} color={Colors.primary} />
            <Text style={styles.filterTagText}>Filters applied</Text>
            <Pressable onPress={() => setActiveFilters(null)} hitSlop={8}>
              <Feather name="x" size={12} color={Colors.primary} />
            </Pressable>
          </View>
        )}
      </View>

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
        ListHeaderComponent={
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {filtered.length} car{filtered.length !== 1 ? "s" : ""} found
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={48} color={Colors.light.textTertiary} />
            <Text style={styles.emptyTitle}>No cars found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ height: 100 + insets.bottom }} />
        }
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={setActiveFilters}
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
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 8,
  },
  halfCard: { flex: 1 },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});

const fStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "90%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    marginBottom: 10,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: "center",
  },
  resetText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  applyText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
});
