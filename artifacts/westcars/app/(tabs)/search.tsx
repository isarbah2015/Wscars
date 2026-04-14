import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { SponsoredCard } from "@/components/SponsoredCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
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
  { label: "₵50k–₵100k", min: 50000, max: 100000 },
  { label: "₵100k–₵250k", min: 100000, max: 250000 },
  { label: "₵250k–₵500k", min: 250000, max: 500000 },
  { label: "₵500k+", min: 500000, max: 9999999 },
];

const QUICK_FILTERS = ["All", "SUV", "Sedan", "Tokunbo", "Budget", "Luxury", "Pickup", "New"];

function mapCategoryToFilter(cat: string): { quickFilter: string; query: string } {
  const l = cat.toLowerCase();
  if (l.includes("suv") || l.includes("4x4") || l.includes("4×4")) return { quickFilter: "SUV",    query: "" };
  if (l.includes("sedan"))                                             return { quickFilter: "Sedan",  query: "" };
  if (l.includes("pickup"))                                            return { quickFilter: "Pickup", query: "" };
  if (l.includes("hatchback") || l.includes("hatch"))                 return { quickFilter: "All",    query: "hatchback" };
  if (l.includes("van") || l.includes("minibus"))                     return { quickFilter: "All",    query: "van" };
  return { quickFilter: "All", query: cat };
}
const CHIP_COLORS: Record<string, { bg: string; text: string; activeBg: string; activeText: string }> = {
  "All":     { bg: "#F1F5F9", text: "#64748B", activeBg: "#0EB5CA", activeText: "#FFFFFF" },
  "SUV":     { bg: "#F1F5F9", text: "#64748B", activeBg: "#818CF8", activeText: "#fff" },
  "Sedan":   { bg: "#F1F5F9", text: "#64748B", activeBg: "#F472B6", activeText: "#fff" },
  "Tokunbo": { bg: "#F1F5F9", text: "#64748B", activeBg: "#22C55E", activeText: "#fff" },
  "Budget":  { bg: "#F1F5F9", text: "#64748B", activeBg: "#F59E0B", activeText: "#fff" },
  "Luxury":  { bg: "#F1F5F9", text: "#64748B", activeBg: "#A855F7", activeText: "#fff" },
  "Pickup":  { bg: "#F1F5F9", text: "#64748B", activeBg: "#F97316", activeText: "#fff" },
  "New":     { bg: "#F1F5F9", text: "#64748B", activeBg: "#06B6D4", activeText: "#fff" },
};

function FilterModal({
  visible,
  onClose,
  onApply,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  colors: any;
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
      <Text style={[fStyles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={fStyles.chips}>
          {["Any", ...options].map((opt) => (
            <Pressable
              key={opt}
              style={[fStyles.chip, { backgroundColor: colors.background, borderColor: colors.border },
                selected === opt && { backgroundColor: colors.accent, borderColor: colors.accent }]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[fStyles.chipText, { color: colors.textSecondary },
                selected === opt && { color: "#fff", fontFamily: "Manrope_600SemiBold" }]}>
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
        <View style={[fStyles.sheet, { backgroundColor: colors.card }]}>
          <View style={[fStyles.handle, { backgroundColor: colors.border }]} />
          <View style={fStyles.header}>
            <Text style={[fStyles.title, { color: colors.text }]}>Filters</Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <FilterSection title="Brand" options={CAR_BRANDS} selected={brand} onSelect={setBrand} />
            <FilterSection title="Location" options={GHANA_CITIES} selected={location} onSelect={setLocation} />
            <FilterSection title="Fuel Type" options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />
            <FilterSection title="Transmission" options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />
            <FilterSection title="Condition" options={CONDITIONS} selected={condition} onSelect={setCondition} />
            <View style={fStyles.section}>
              <Text style={[fStyles.sectionTitle, { color: colors.text }]}>Price Range</Text>
              <View style={[fStyles.chips, { flexWrap: "wrap" }]}>
                {PRICE_RANGES.map((pr) => (
                  <Pressable
                    key={pr.label}
                    style={[fStyles.chip, { backgroundColor: colors.background, borderColor: colors.border },
                      priceRange.label === pr.label && { backgroundColor: colors.accent, borderColor: colors.accent }]}
                    onPress={() => setPriceRange(pr)}
                  >
                    <Text style={[fStyles.chipText, { color: colors.textSecondary },
                      priceRange.label === pr.label && { color: "#fff", fontFamily: "Manrope_600SemiBold" }]}>
                      {pr.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>
          <View style={[fStyles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              style={[fStyles.resetBtn, { borderColor: colors.accent }]}
              onPress={() => {
                setBrand("Any"); setLocation("Any"); setFuelType("Any");
                setTransmission("Any"); setCondition("Any"); setPriceRange(PRICE_RANGES[0]);
              }}
            >
              <Text style={[fStyles.resetText, { color: colors.accent }]}>Reset</Text>
            </Pressable>
            <Pressable
              style={[fStyles.applyBtn, { backgroundColor: colors.accent }]}
              onPress={() => { onApply({ brand, location, fuelType, transmission, condition, priceRange }); onClose(); }}
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
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;

  const { category } = useLocalSearchParams<{ category?: string }>();

  const [query, setQuery] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [quickFilter, setQuickFilter] = useState("All");

  useEffect(() => {
    if (category) {
      const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
      setQuickFilter(qf);
      setQuery(q);
      setActiveFilters(null);
    }
  }, [category]);

  const filtered = cars.filter((car) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      car.brand.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      car.location.toLowerCase().includes(q) ||
      car.condition.toLowerCase().includes(q) ||
      (car.category?.toLowerCase().includes(q) ?? false);

    if (!matchQuery) return false;

    let matchQuick = true;
    if (quickFilter === "SUV") matchQuick = car.category?.toLowerCase().includes("suv") ?? false;
    else if (quickFilter === "Sedan") matchQuick = car.category?.toLowerCase().includes("sedan") ?? false;
    else if (quickFilter === "Tokunbo") matchQuick = car.condition === "Foreign Used";
    else if (quickFilter === "Budget") matchQuick = car.price < 100000;
    else if (quickFilter === "Luxury") matchQuick = car.price > 300000;
    else if (quickFilter === "Pickup") matchQuick = car.category?.toLowerCase().includes("pickup") ?? false;
    else if (quickFilter === "New") matchQuick = car.condition === "New";

    if (!matchQuick) return false;
    if (!activeFilters) return true;

    const { brand, location, fuelType, transmission, condition, priceRange } = activeFilters;
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Light Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 14,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Search Cars</Text>
          {filtered.length > 0 && (
            <View style={[styles.resultPill, { backgroundColor: "#0EB5CA" }]}>
              <Text style={styles.resultPillText}>{filtered.length} found</Text>
            </View>
          )}
        </View>

        {/* Search input */}
        <View style={[styles.searchRow, {
          backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        }]}>
          <Feather name="search" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#F1F5F9" : "#0F172A" }]}
            placeholder="Brand, model, location..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
            </Pressable>
          )}
          <Pressable
            onPress={() => setFilterVisible(true)}
            style={[styles.filterIconBtn, { backgroundColor: "#0EB5CA" }]}
          >
            <Feather name="sliders" size={17} color="#FFFFFF" />
            {activeFilters && <View style={styles.filterDot} />}
          </Pressable>
        </View>

        {/* Quick filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll}>
          <View style={styles.quickRow}>
            {QUICK_FILTERS.map((f) => {
              const c = CHIP_COLORS[f] || CHIP_COLORS["All"];
              const active = quickFilter === f;
              return (
                <Pressable
                  key={f}
                  style={[styles.quickChip, {
                    backgroundColor: active ? c.activeBg : (isDark ? "#1E293B" : c.bg),
                    borderColor: active ? "transparent" : (isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"),
                  }]}
                  onPress={() => setQuickFilter(f)}
                >
                  <Text style={[styles.quickChipText, { color: active ? c.activeText : (isDark ? "#94A3B8" : c.text) },
                    active && { fontFamily: "Manrope_700Bold" }]}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Active filter tag */}
      {activeFilters && (
        <View style={[styles.filterTagRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.filterTag, { backgroundColor: colors.accentLight }]}>
            <Feather name="filter" size={12} color={colors.accent} />
            <Text style={[styles.filterTagText, { color: colors.accent }]}>Filters applied</Text>
            <Pressable onPress={() => setActiveFilters(null)} hitSlop={8}>
              <Feather name="x" size={12} color={colors.accent} />
            </Pressable>
          </View>
        </View>
      )}

      <FlatList
        data={listData}
        keyExtractor={(item, i) => item.type === "car" ? item.item.id : `ad_${i}`}
        renderItem={({ item, index }) => {
          if (item.type === "ad") {
            return <SponsoredCard car={item.car} />;
          }
          const carsBefore = listData.slice(0, index).filter((x) => x.type === "car").length;
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.accentLight }]}>
              <Feather name="search" size={36} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No cars found</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 + insets.bottom }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 8 }}
      />

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={setActiveFilters}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.3,
  },
  resultPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resultPillText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Manrope_400Regular",
    padding: 0,
  },
  filterIconBtn: {
    position: "relative",
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  quickScroll: { flexGrow: 0 },
  quickRow: { flexDirection: "row", gap: 8 },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
  },

  filterTagRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterTagText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 10,
    marginBottom: 0,
  },
  halfCard: { flex: 1, marginBottom: 12 },

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 14,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Manrope_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
  },
});

const fStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
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
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontFamily: "Manrope_700Bold" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontFamily: "Manrope_600SemiBold", marginBottom: 10 },
  chips: { flexDirection: "row", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Manrope_400Regular" },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  resetText: { fontSize: 15, fontFamily: "Manrope_600SemiBold" },
  applyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  applyText: { fontSize: 15, color: "#fff", fontFamily: "Manrope_600SemiBold" },
});
