import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

// ── "Any" icon per filter section ────────────────────────────────────────────
const SECTION_ANY_ICON: Record<string, any> = {
  Brand:        "layers",
  Location:     "map",
  "Fuel Type":  "zap",
  Transmission: "settings",
  Condition:    "check-circle",
  "Price Range":"dollar-sign",
};

// ── Premium Filter Modal ──────────────────────────────────────────────────────
function FilterModal({
  visible, onClose, onApply, colors,
}: { visible: boolean; onClose: () => void; onApply: (f: any) => void; colors: any }) {
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

  // Generic horizontal chip row with "Any" icon
  const FilterSection = ({
    title, options, selected, onSelect,
  }: { title: string; options: string[]; selected: string; onSelect: (v: string) => void }) => {
    const anyIcon = SECTION_ANY_ICON[title] || "layers";
    return (
      <View style={fStyles.section}>
        <View style={fStyles.sectionHeader}>
          <View style={[fStyles.sectionIconBg, { backgroundColor: "#0EB5CA18" }]}>
            <Feather name={anyIcon} size={13} color="#0EB5CA" />
          </View>
          <Text style={fStyles.sectionTitle}>{title}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={fStyles.chips}>
            {/* "Any" chip with icon */}
            <Pressable
              style={[fStyles.chip, selected === "Any" && fStyles.chipActive]}
              onPress={() => onSelect("Any")}
            >
              <Feather
                name={anyIcon}
                size={13}
                color={selected === "Any" ? "#fff" : "#94A3B8"}
              />
              <Text style={[fStyles.chipText, selected === "Any" && fStyles.chipTextActive]}>
                Any
              </Text>
            </Pressable>
            {options.map((opt) => (
              <Pressable
                key={opt}
                style={[fStyles.chip, selected === opt && fStyles.chipActive]}
                onPress={() => onSelect(opt)}
              >
                <Text style={[fStyles.chipText, selected === opt && fStyles.chipTextActive]}>
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Brand section with logo chips
  const BrandSection = () => (
    <View style={fStyles.section}>
      <View style={fStyles.sectionHeader}>
        <View style={[fStyles.sectionIconBg, { backgroundColor: "#0EB5CA18" }]}>
          <Feather name="layers" size={13} color="#0EB5CA" />
        </View>
        <Text style={fStyles.sectionTitle}>Brand</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={fStyles.chips}>
          {/* "Any" brand chip with icon */}
          <Pressable
            style={[fStyles.brandChip, brand === "Any" && fStyles.chipActive]}
            onPress={() => setBrand("Any")}
          >
            <View style={[fStyles.brandLogoWrap, brand === "Any" && { backgroundColor: "rgba(255,255,255,0.18)" }]}>
              <Feather name="layers" size={16} color={brand === "Any" ? "#fff" : "#94A3B8"} />
            </View>
            <Text style={[fStyles.chipText, brand === "Any" && fStyles.chipTextActive]}>Any</Text>
          </Pressable>
          {CAR_BRANDS.map((b) => {
            const logoUrl = BRAND_LOGOS[b];
            const active  = brand === b;
            return (
              <Pressable
                key={b}
                style={[fStyles.brandChip, active && fStyles.chipActive]}
                onPress={() => setBrand(b)}
              >
                <View style={[fStyles.brandLogoWrap, active && { backgroundColor: "rgba(255,255,255,0.15)" }]}>
                  {logoUrl ? (
                    <Image source={{ uri: logoUrl }} style={fStyles.brandLogo} resizeMode="contain" />
                  ) : (
                    <Text style={[fStyles.brandInitial, { color: active ? "#fff" : "#64748B" }]}>{b.charAt(0)}</Text>
                  )}
                </View>
                <Text style={[fStyles.chipText, active && fStyles.chipTextActive]}>{b}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  // Price range — 2-column grid cards
  const PriceSection = () => (
    <View style={fStyles.section}>
      <View style={fStyles.sectionHeader}>
        <View style={[fStyles.sectionIconBg, { backgroundColor: "#0EB5CA18" }]}>
          <Feather name="dollar-sign" size={13} color="#0EB5CA" />
        </View>
        <Text style={fStyles.sectionTitle}>Price Range</Text>
      </View>
      <View style={fStyles.priceGrid}>
        {PRICE_RANGES.map((pr) => {
          const active = priceRange.label === pr.label;
          return (
            <Pressable
              key={pr.label}
              style={[fStyles.priceCard, active && fStyles.priceCardActive]}
              onPress={() => setPriceRange(pr)}
            >
              <Feather name={pr.icon} size={15} color={active ? "#fff" : "#0EB5CA"} />
              <Text style={[fStyles.priceLabel, active && { color: "#fff" }]}>{pr.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={fStyles.overlay}>
        <View style={fStyles.sheet}>
          {/* Premium gradient header */}
          <LinearGradient
            colors={["#0EB5CA", "#0098AA"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={fStyles.gradHeader}
          >
            <View style={fStyles.handle} />
            <View style={fStyles.headerRow}>
              <View>
                <Text style={fStyles.headerTitle}>Filters</Text>
                <Text style={fStyles.headerSub}>Refine your search</Text>
              </View>
              <Pressable style={fStyles.closeBtn} onPress={onClose}>
                <Feather name="x" size={18} color="#fff" />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, flexShrink: 1 }}>
            <BrandSection />
            <View style={fStyles.divider} />
            <FilterSection title="Location"     options={GHANA_CITIES}   selected={location}     onSelect={setLocation}     />
            <View style={fStyles.divider} />
            <FilterSection title="Fuel Type"    options={FUEL_TYPES}     selected={fuelType}     onSelect={setFuelType}     />
            <View style={fStyles.divider} />
            <FilterSection title="Transmission" options={TRANSMISSIONS}   selected={transmission} onSelect={setTransmission} />
            <View style={fStyles.divider} />
            <FilterSection title="Condition"    options={CONDITIONS}     selected={condition}    onSelect={setCondition}    />
            <View style={fStyles.divider} />
            <PriceSection />
            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer actions */}
          <View style={fStyles.footer}>
            <Pressable style={fStyles.resetBtn} onPress={reset}>
              <Feather name="refresh-ccw" size={15} color="#0EB5CA" />
              <Text style={fStyles.resetText}>Reset</Text>
            </Pressable>
            <Pressable
              style={fStyles.applyBtn}
              onPress={() => { onApply({ brand, location, fuelType, transmission, condition, priceRange }); onClose(); }}
            >
              <LinearGradient
                colors={["#0EB5CA", "#0098AA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={fStyles.applyGrad}
              >
                <Feather name="check" size={16} color="#fff" />
                <Text style={fStyles.applyText}>Apply Filters</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
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
    fontSize: 10,
    fontFamily: "Raleway_800ExtraBold",
    letterSpacing: 2.5,
    marginBottom: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: "Raleway_800ExtraBold",
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  countBadge: {
    alignItems: "center",
    backgroundColor: "#0EB5CA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 2,
  },
  countText: { fontSize: 18, fontFamily: "Raleway_800ExtraBold", color: "#fff", lineHeight: 22 },
  countLabel: { fontSize: 9, fontFamily: "Manrope_600SemiBold", color: "rgba(255,255,255,0.85)", letterSpacing: 1 },

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
    fontFamily: "Manrope_500Medium",
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
    fontFamily: "Manrope_700Bold",
    color: "#334155",
  },
  chipLabelActive: {
    fontSize: 12,
    fontFamily: "Manrope_800ExtraBold",
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
    fontFamily: "Manrope_600SemiBold",
    color: "#0EB5CA",
  },

  row: { flexDirection: "row", paddingHorizontal: 10, gap: 10 },
  half: { flex: 1, marginBottom: 12 },

  empty: { alignItems: "center", paddingVertical: 80, gap: 14 },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Raleway_800ExtraBold", letterSpacing: -0.3 },
  emptyText: { fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
});

const fStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: "82%",
    overflow: "hidden",
    flexDirection: "column",
  },

  // Gradient header
  gradHeader: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 6,
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.45)",
    alignSelf: "center",
    marginBottom: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Raleway_800ExtraBold",
    color: "#fff",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: "rgba(255,255,255,0.8)",
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 2,
    gap: 7,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionIconBg: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0F172A",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
    marginTop: 4,
  },

  chips: { flexDirection: "row", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#DDE3EC",
  },
  chipActive: {
    backgroundColor: "#0EB5CA",
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "Manrope_800ExtraBold",
  },

  // Brand chips — horizontal: logo left, text right
  brandChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#DDE3EC",
  },
  brandLogoWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E8EEF5",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogo: { width: 22, height: 22 },
  brandInitial: {
    fontSize: 12,
    fontFamily: "Raleway_800ExtraBold",
  },

  // Price grid
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  priceCard: {
    width: "30%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#DDE3EC",
  },
  priceCardActive: {
    backgroundColor: "#0EB5CA",
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  priceLabel: {
    fontSize: 10.5,
    fontFamily: "Manrope_700Bold",
    color: "#1E293B",
    textAlign: "center",
    flexShrink: 1,
  },

  // Footer
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  resetBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 42,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#0EB5CA",
    backgroundColor: "#0EB5CA0D",
  },
  resetText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#0EB5CA",
  },
  applyBtn: {
    flex: 2,
    borderRadius: 11,
    overflow: "hidden",
  },
  applyGrad: {
    height: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  applyText: {
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 0.2,
  },
});
