import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
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
import { BRAND_LOGOS } from "@/utils/brandLogos";

const SHEET_H = Dimensions.get("window").height * 0.80;

const PRICE_RANGES = [
  { label: "Any Price",     min: 0,      max: 9999999, icon: "layers" as const },
  { label: "Under ₵50k",   min: 0,      max: 50000,   icon: "tag" as const },
  { label: "₵50k–₵100k",  min: 50000,  max: 100000,  icon: "tag" as const },
  { label: "₵100k–₵250k", min: 100000, max: 250000,  icon: "tag" as const },
  { label: "₵250k–₵500k", min: 250000, max: 500000,  icon: "tag" as const },
  { label: "₵500k+",       min: 500000, max: 9999999, icon: "award" as const },
];

type QuickFilterKey = "All"|"SUV"|"Sedan"|"Tokunbo"|"Budget"|"Luxury"|"Pickup"|"Truck"|"Bus"|"Heavy"|"Moto"|"New";

const QUICK_FILTERS: { key: QuickFilterKey; label: string; icon: any; color: string }[] = [
  { key: "All",     label: "All",     icon: "grid",        color: "#0EB5CA" },
  { key: "SUV",     label: "SUV",     icon: "box",         color: "#6366F1" },
  { key: "Sedan",   label: "Sedan",   icon: "minus-circle",color: "#EC4899" },
  { key: "Tokunbo", label: "Tokunbo", icon: "package",     color: "#22C55E" },
  { key: "Budget",  label: "Budget",  icon: "tag",         color: "#F59E0B" },
  { key: "Luxury",  label: "Luxury",  icon: "award",       color: "#A855F7" },
  { key: "Pickup",  label: "Pickup",  icon: "truck",       color: "#F97316" },
  { key: "Truck",   label: "Truck",   icon: "truck",       color: "#DC2626" },
  { key: "Bus",     label: "Bus",     icon: "users",       color: "#0284C7" },
  { key: "Heavy",   label: "Heavy",   icon: "tool",        color: "#92400E" },
  { key: "Moto",    label: "Moto",    icon: "navigation-2",color: "#0F766E" },
  { key: "New",     label: "New",     icon: "star",        color: "#7C3AED" },
];

function mapCategoryToFilter(cat: string): { quickFilter: QuickFilterKey; query: string } {
  const l = cat.toLowerCase();
  if (l.includes("suv") || l.includes("4x4") || l.includes("4×4"))              return { quickFilter: "SUV",    query: "" };
  if (l.includes("sedan"))                                                         return { quickFilter: "Sedan",  query: "" };
  if (l.includes("pickup"))                                                        return { quickFilter: "Pickup", query: "" };
  if (l.includes("cargo truck") || l.includes("tipper") || l.includes("flatbed") ||
      l.includes("tanker") || l.includes("box truck"))                            return { quickFilter: "Truck",  query: "" };
  if (l.includes("bus") || l.includes("minibus") || l.includes("coach"))         return { quickFilter: "Bus",    query: "" };
  if (l.includes("excavator") || l.includes("bulldozer") || l.includes("crane") ||
      l.includes("forklift") || l.includes("loader") || l.includes("grader") ||
      l.includes("compactor") || l.includes("mixer") || l.includes("tractor") ||
      l.includes("harvester") || l.includes("ambulance") || l.includes("fire"))  return { quickFilter: "Heavy",  query: "" };
  if (l.includes("motorcycle") || l.includes("scooter") || l.includes("atv") ||
      l.includes("dirt bike") || l.includes("quad"))                              return { quickFilter: "Moto",   query: "" };
  if (l.includes("hatchback"))                                                     return { quickFilter: "All",    query: "hatchback" };
  if (l.includes("van") || l.includes("station wagon"))                           return { quickFilter: "All",    query: l };
  return { quickFilter: "All", query: cat };
}

// ── Full-screen Premium Filter Modal ─────────────────────────────────────────
function FilterModal({
  visible, onClose, onApply,
}: { visible: boolean; onClose: () => void; onApply: (f: any) => void; colors?: any }) {
  const [brand,        setBrand]        = useState("Any");
  const [location,     setLocation]     = useState("Any");
  const [fuelType,     setFuelType]     = useState("Any");
  const [transmission, setTransmission] = useState("Any");
  const [condition,    setCondition]    = useState("Any");
  const [priceRange,   setPriceRange]   = useState(PRICE_RANGES[0]);

  const reset = () => {
    setBrand("Any"); setLocation("Any"); setFuelType("Any");
    setTransmission("Any"); setCondition("Any"); setPriceRange(PRICE_RANGES[0]);
  };

  const hasFilters =
    brand !== "Any" || location !== "Any" || fuelType !== "Any" ||
    transmission !== "Any" || condition !== "Any" || priceRange.label !== "Any Price";

  // ── Section card ──
  const SectionCard = ({
    icon, label, children,
  }: { icon: any; label: string; children: React.ReactNode }) => (
    <View style={fStyles.card}>
      <View style={fStyles.cardHeader}>
        <View style={fStyles.cardIconBg}>
          <Feather name={icon} size={14} color="#0EB5CA" />
        </View>
        <Text style={fStyles.cardLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );

  // ── Chip row ──
  const ChipRow = ({
    options, selected, onSelect,
  }: { options: string[]; selected: string; onSelect: (v: string) => void }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", gap: 7, paddingRight: 4 }}>
        {["Any", ...options].map((opt) => {
          const active = selected === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onSelect(opt)}
              style={[fStyles.chip, active && fStyles.chipActive]}
            >
              <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  // ── Brand row ──
  const BrandRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingRight: 4 }}>
        {[{ name: "Any", logo: null }, ...CAR_BRANDS.map(b => ({ name: b, logo: BRAND_LOGOS[b] ?? null }))].map(({ name: b, logo }) => {
          const active = brand === b;
          return (
            <Pressable
              key={b}
              onPress={() => setBrand(b)}
              style={[fStyles.brandChip, active && fStyles.chipActive]}
            >
              <View style={[fStyles.brandLogoWrap, active && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                {b === "Any" ? (
                  <Feather name="layers" size={15} color={active ? "#fff" : "#94A3B8"} />
                ) : logo ? (
                  <Image source={{ uri: logo }} style={{ width: 22, height: 22 }} resizeMode="contain" />
                ) : (
                  <Text style={{ fontSize: 11, fontFamily: "Manrope_800ExtraBold", color: active ? "#fff" : "#64748B" }}>{b.charAt(0)}</Text>
                )}
              </View>
              <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{b}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  // ── Price grid ──
  const PriceGrid = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
      {PRICE_RANGES.map((pr) => {
        const active = priceRange.label === pr.label;
        return (
          <Pressable
            key={pr.label}
            onPress={() => setPriceRange(pr)}
            style={[fStyles.priceCard, active && fStyles.priceCardActive]}
          >
            <Feather name={pr.icon} size={14} color={active ? "#fff" : "#0EB5CA"} />
            <Text style={[fStyles.priceLabel, active && { color: "#fff" }]}>{pr.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={fStyles.safeArea} edges={["top", "bottom"]}>
        {/* ── Header ── */}
        <LinearGradient
          colors={["#0EB5CA", "#008FA0"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={fStyles.header}
        >
          <Pressable style={fStyles.headerBack} onPress={onClose}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <Text style={fStyles.headerTitle}>Filters</Text>
          <Pressable onPress={reset} style={fStyles.headerClear}>
            <Text style={[fStyles.headerClearText, !hasFilters && { opacity: 0.45 }]}>Clear All</Text>
          </Pressable>
        </LinearGradient>

        {/* ── Scrollable body ── */}
        <ScrollView
          style={fStyles.body}
          contentContainerStyle={fStyles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionCard icon="layers" label="Brand">
            <BrandRow />
          </SectionCard>

          <SectionCard icon="map-pin" label="Location">
            <ChipRow options={GHANA_CITIES} selected={location} onSelect={setLocation} />
          </SectionCard>

          <SectionCard icon="zap" label="Fuel Type">
            <ChipRow options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />
          </SectionCard>

          <SectionCard icon="settings" label="Transmission">
            <ChipRow options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />
          </SectionCard>

          <SectionCard icon="check-circle" label="Condition">
            <ChipRow options={CONDITIONS} selected={condition} onSelect={setCondition} />
          </SectionCard>

          <SectionCard icon="dollar-sign" label="Price Range">
            <PriceGrid />
          </SectionCard>
        </ScrollView>

        {/* ── Footer ── */}
        <View style={fStyles.footer}>
          <Pressable
            style={fStyles.applyBtn}
            onPress={() => { onApply({ brand, location, fuelType, transmission, condition, priceRange }); onClose(); }}
          >
            <LinearGradient
              colors={["#0EB5CA", "#008FA0"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={fStyles.applyGrad}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={fStyles.applyText}>Apply Filters</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ── Main Search Screen ────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { cars } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;

  const { category, brand: brandParam } = useLocalSearchParams<{ category?: string; brand?: string }>();

  const [query,         setQuery]         = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [quickFilter,   setQuickFilter]   = useState<QuickFilterKey>("All");

  useEffect(() => {
    if (brandParam) {
      setActiveFilters((prev: any) => ({ ...(prev || {}), brand: brandParam }));
      setQuickFilter("All");
      setQuery("");
    }
  }, [brandParam]);

  useEffect(() => {
    if (category) {
      const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
      setQuickFilter(qf);
      setQuery(q);
      setActiveFilters(null);
    }
  }, [category]);

  const filtered = cars.filter((car: Car) => {
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
    const cat = car.category?.toLowerCase() ?? "";
    if      (quickFilter === "SUV")     matchQuick = cat.includes("suv") || cat.includes("4x4") || cat.includes("4×4");
    else if (quickFilter === "Sedan")   matchQuick = cat.includes("sedan");
    else if (quickFilter === "Tokunbo") matchQuick = car.condition === "Foreign Used";
    else if (quickFilter === "Budget")  matchQuick = car.price < 100000;
    else if (quickFilter === "Luxury")  matchQuick = car.price > 300000;
    else if (quickFilter === "Pickup")  matchQuick = cat.includes("pickup");
    else if (quickFilter === "Truck")   matchQuick = cat.includes("cargo") || cat.includes("tipper") || cat.includes("tanker") || cat.includes("flatbed") || cat.includes("box truck");
    else if (quickFilter === "Bus")     matchQuick = cat.includes("bus") || cat.includes("minibus") || cat.includes("coach");
    else if (quickFilter === "Heavy")   matchQuick = cat.includes("excavator") || cat.includes("bulldozer") || cat.includes("crane") || cat.includes("forklift") || cat.includes("loader") || cat.includes("grader") || cat.includes("compactor") || cat.includes("mixer") || cat.includes("tractor") || cat.includes("harvester") || cat.includes("ambulance") || cat.includes("fire truck");
    else if (quickFilter === "Moto")    matchQuick = cat.includes("motorcycle") || cat.includes("scooter") || cat.includes("atv") || cat.includes("dirt bike") || cat.includes("quad");
    else if (quickFilter === "New")     matchQuick = car.condition === "New";

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

  const listData = React.useMemo(() => {
    const seeded = filtered.map((car) => ({
      car,
      k: [...car.id].reduce((s, ch) => (s * 33 + ch.charCodeAt(0)) >>> 0, 13),
    }));
    seeded.sort((a, b) => a.k - b.k);
    return seeded.map((x) => ({ type: "car" as const, item: x.car }));
  }, [filtered]);

  const bgHeader = isDark ? "#111827" : "#FFFFFF";
  const borderHeader = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Premium Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 14, backgroundColor: bgHeader, borderBottomColor: borderHeader }]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.titleSub, { color: "#0EB5CA" }]}>WESTCARS</Text>
            <Text style={[styles.title, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Search</Text>
          </View>
          {filtered.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{filtered.length}</Text>
              <Text style={styles.countLabel}>found</Text>
            </View>
          )}
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, {
          backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
        }]}>
          <Feather name="search" size={17} color={isDark ? "#64748B" : "#94A3B8"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#F1F5F9" : "#0F172A" }]}
            placeholder="Brand, model, location..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Feather name="x-circle" size={16} color="#94A3B8" />
            </Pressable>
          )}
          <Pressable
            onPress={() => setFilterVisible(true)}
            style={[styles.filterBtn, activeFilters && styles.filterBtnActive]}
          >
            <LinearGradient
              colors={["#0EB5CA", "#0098AA"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.filterBtnGrad}
            >
              <Feather name="sliders" size={16} color="#fff" />
              {activeFilters && <View style={styles.filterDot} />}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Premium quick-filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {QUICK_FILTERS.map(({ key, label, icon, color }) => {
              const active = quickFilter === key;
              return (
                <Pressable
                  key={key}
                  style={[styles.chip, { borderColor: active ? "transparent" : (isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0") }]}
                  onPress={() => setQuickFilter(key)}
                >
                  {active ? (
                    <LinearGradient
                      colors={[color, color + "CC"]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.chipInner}
                    >
                      <View style={styles.chipIconCircle}>
                        <Feather name={icon} size={12} color={color} />
                      </View>
                      <Text style={styles.chipLabelActive}>{label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.chipInner, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                      <View style={[styles.chipIconCircleInactive, { backgroundColor: color + "1A" }]}>
                        <Feather name={icon} size={12} color={color} />
                      </View>
                      <Text style={[styles.chipLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>{label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Active filter badge */}
        {activeFilters && (
          <View style={styles.filterBadgeRow}>
            <LinearGradient
              colors={["#0EB5CA18", "#0098AA18"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.filterBadge}
            >
              <Feather name="filter" size={11} color="#0EB5CA" />
              <Text style={styles.filterBadgeText}>Filters active</Text>
              <Pressable onPress={() => setActiveFilters(null)} hitSlop={10}>
                <Feather name="x" size={12} color="#0EB5CA" />
              </Pressable>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* ── Results ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.item.id}
        renderItem={({ item, index }) => {
          if (index % 2 === 1) return null;
          const next = listData[index + 1];
          return (
            <View style={styles.row}>
              <CarCard car={item.item} style={styles.half} />
              {next ? <CarCard car={next.item} style={styles.half} /> : <View style={styles.half} />}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={["#0EB5CA18", "#0098AA18"]}
              style={styles.emptyIconBg}
            >
              <Feather name="search" size={34} color="#0EB5CA" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No vehicles found</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 + insets.bottom }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10 }}
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

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  titleRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  titleSub: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    marginBottom: 1,
  },
  title: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#0EB5CA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 2,
  },
  countText: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#fff", lineHeight: 22 },
  countLabel: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)", letterSpacing: 1 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  filterBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  filterBtnActive: {
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  filterBtnGrad: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  chipScroll: { flexGrow: 0, marginHorizontal: -2 },
  chipRow: { flexDirection: "row", gap: 7, paddingHorizontal: 2 },
  chip: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  chipInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipIconCircleInactive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#334155",
  },
  chipLabelActive: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },

  filterBadgeRow: { flexDirection: "row" },
  filterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0EB5CA33",
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#0EB5CA",
  },

  row: { flexDirection: "row", paddingHorizontal: 8, gap: 8 },
  half: { flex: 1, marginBottom: 10 },

  empty: { alignItems: "center", paddingVertical: 80, gap: 14 },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.3 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});

const fStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F5F9",
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 0,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerClear: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerClearText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },

  // ── Body ──
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 14,
    gap: 12,
    paddingBottom: 8,
  },

  // ── Section cards ──
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardIconBg: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#E6F8FB",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#0F172A",
    letterSpacing: 0.1,
  },

  // ── Chips ──
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#0EB5CA",
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#334155",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },

  // ── Brand chips ──
  brandChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  brandLogoWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EEF3F8",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Price grid ──
  priceCard: {
    width: "30%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },
  priceCardActive: {
    backgroundColor: "#0EB5CA",
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#1E293B",
    textAlign: "center",
    flexShrink: 1,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8EEF5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  applyBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  applyGrad: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  applyText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
