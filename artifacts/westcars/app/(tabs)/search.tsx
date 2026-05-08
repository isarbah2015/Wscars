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

const BRAND_MODELS: Record<string, string[]> = {
  Toyota:      ["Camry","Corolla","RAV4","Highlander","Land Cruiser","Prado","Fortuner","Venza","Yaris","Hiace","Avensis","Auris"],
  Honda:       ["Accord","Civic","CR-V","HR-V","Pilot","Odyssey","Fit","Jazz","Vezel"],
  Nissan:      ["Altima","Sentra","Pathfinder","Murano","X-Trail","Patrol","Navara","Note","Micra","Kicks","Armada"],
  Hyundai:     ["Elantra","Sonata","Tucson","Santa Fe","i10","i20","i30","Creta","Accent","Kona"],
  Kia:         ["Sportage","Sorento","Cerato","Picanto","Rio","Telluride","Seltos","Stinger"],
  Mercedes:    ["C-Class","E-Class","S-Class","GLC","GLE","GLS","A-Class","B-Class","GLA","GLK","ML","G-Class"],
  BMW:         ["3 Series","5 Series","7 Series","X1","X3","X5","X6","X7","M3","M5","4 Series"],
  Ford:        ["Focus","Ranger","Explorer","F-150","Fusion","Edge","Expedition","EcoSport","Escape"],
  Volkswagen:  ["Golf","Passat","Tiguan","Touareg","Polo","Jetta","Amarok","Caddy"],
  Chevrolet:   ["Cruze","Trax","Equinox","Traverse","Malibu","Silverado","Captiva","Trailblazer"],
  Mitsubishi:  ["Outlander","Pajero","Eclipse Cross","Galant","Lancer","L200","ASX","Montero"],
  Mazda:       ["Mazda3","Mazda6","CX-5","CX-9","CX-3","MX-5","BT-50"],
  Subaru:      ["Forester","Outback","Impreza","Legacy","XV","Tribeca"],
  Lexus:       ["RX","ES","GX","LX","IS","LS","NX","UX"],
  Isuzu:       ["D-Max","MU-X","Trooper","Rodeo","Bighorn"],
  Suzuki:      ["Swift","Vitara","Jimny","Ertiga","Baleno","Grand Vitara","Ignis"],
  Peugeot:     ["208","308","508","2008","3008","5008","407","Partner"],
  Renault:     ["Clio","Megane","Duster","Kadjar","Koleos","Scenic","Captur"],
  "Land Rover":["Defender","Discovery","Range Rover","Freelander","Evoque","Velar","Sport"],
  Jeep:        ["Wrangler","Cherokee","Grand Cherokee","Compass","Renegade","Commander","Gladiator"],
  Porsche:     ["911","Cayenne","Macan","Panamera","Taycan","Boxster","Cayman"],
  Audi:        ["A3","A4","A6","A8","Q3","Q5","Q7","Q8","TT","R8","e-tron"],
  Volvo:       ["XC40","XC60","XC90","S60","S90","V60","V90","C40"],
  Cadillac:    ["Escalade","XT5","XT6","CT5","CT6","SRX"],
  GMC:         ["Terrain","Acadia","Yukon","Sierra","Canyon","Envoy"],
  Dodge:       ["Durango","Charger","Challenger","Journey","Ram 1500"],
  Infiniti:    ["Q50","QX50","QX60","QX80","G35","FX"],
  Acura:       ["TLX","RDX","MDX","ILX","NSX"],
};

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
  { key: "All",     label: "All",     icon: "grid",        color: "#FF6B00" },
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
  const [model,        setModel]        = useState("Any");
  const [location,     setLocation]     = useState("Any");
  const [fuelType,     setFuelType]     = useState("Any");
  const [transmission, setTransmission] = useState("Any");
  const [condition,    setCondition]    = useState("Any");
  const [priceRange,   setPriceRange]   = useState(PRICE_RANGES[0]);

  const reset = () => {
    setBrand("Any"); setModel("Any"); setLocation("Any"); setFuelType("Any");
    setTransmission("Any"); setCondition("Any"); setPriceRange(PRICE_RANGES[0]);
  };

  const handleBrandSelect = (b: string) => { setBrand(b); setModel("Any"); };

  const hasFilters =
    brand !== "Any" || model !== "Any" || location !== "Any" || fuelType !== "Any" ||
    transmission !== "Any" || condition !== "Any" || priceRange.label !== "Any Price";

  const activeCount = [
    brand !== "Any", model !== "Any", location !== "Any", fuelType !== "Any",
    transmission !== "Any", condition !== "Any", priceRange.label !== "Any Price",
  ].filter(Boolean).length;

  // ── Section block ──
  const Section = ({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
    <View style={fStyles.section}>
      <View style={fStyles.sectionHeader}>
        <View style={fStyles.sectionIconWrap}>
          <Feather name={icon} size={13} color="#FF6B00" />
        </View>
        <Text style={fStyles.sectionLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );

  // ── Pill chip row ──
  const ChipRow = ({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
        {["Any", ...options].map((opt) => {
          const active = selected === opt;
          return (
            <Pressable key={opt} onPress={() => onSelect(opt)}
              style={[fStyles.chip, active && fStyles.chipActive]}>
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
      <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
        {[{ name: "Any", logo: null }, ...CAR_BRANDS.map(b => ({ name: b, logo: BRAND_LOGOS[b] ?? null }))].map(({ name: b, logo }) => {
          const active = brand === b;
          return (
            <Pressable key={b} onPress={() => handleBrandSelect(b)}
              style={[fStyles.brandChip, active && fStyles.chipActive]}>
              <View style={[fStyles.brandLogoWrap, active && fStyles.brandLogoWrapActive]}>
                {b === "Any"
                  ? <Feather name="layers" size={14} color={active ? "#FF6B00" : "#64748B"} />
                  : logo
                    ? <Image source={{ uri: logo }} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    : <Text style={{ fontSize: 10, fontFamily: "Manrope_800ExtraBold", color: active ? "#FF6B00" : "#64748B" }}>{b.charAt(0)}</Text>
                }
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
          <Pressable key={pr.label} onPress={() => setPriceRange(pr)}
            style={[fStyles.priceCard, active && fStyles.priceCardActive]}>
            <Feather name={pr.icon} size={13} color={active ? "#fff" : "#FF6B00"} />
            <Text style={[fStyles.priceLabel, active && fStyles.priceLabelActive]}>{pr.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={fStyles.safeArea} edges={["top", "bottom"]}>

        {/* ── Dark header ── */}
        <View style={fStyles.header}>
          <Pressable style={fStyles.headerBack} onPress={onClose}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={fStyles.headerTitle}>Filters</Text>
            {activeCount > 0 && (
              <Text style={fStyles.headerSub}>{activeCount} active</Text>
            )}
          </View>
          <Pressable onPress={reset} style={[fStyles.clearBtn, !hasFilters && { opacity: 0.3 }]} disabled={!hasFilters}>
            <Text style={fStyles.clearBtnText}>Reset</Text>
          </Pressable>
        </View>

        {/* ── Scrollable body ── */}
        <ScrollView style={fStyles.body} contentContainerStyle={fStyles.bodyContent} showsVerticalScrollIndicator={false}>

          <Section icon="layers" label="Brand">
            <BrandRow />
          </Section>

          {brand !== "Any" && BRAND_MODELS[brand] && (
            <Section icon="tag" label={`${brand} Model`}>
              <ChipRow options={BRAND_MODELS[brand]} selected={model} onSelect={setModel} />
            </Section>
          )}

          <Section icon="map-pin" label="Location">
            <ChipRow options={GHANA_CITIES} selected={location} onSelect={setLocation} />
          </Section>

          <Section icon="zap" label="Fuel Type">
            <ChipRow options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />
          </Section>

          <Section icon="settings" label="Transmission">
            <ChipRow options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />
          </Section>

          <Section icon="check-circle" label="Condition">
            <ChipRow options={CONDITIONS} selected={condition} onSelect={setCondition} />
          </Section>

          <Section icon="dollar-sign" label="Price Range">
            <PriceGrid />
          </Section>

        </ScrollView>

        {/* ── Footer ── */}
        <View style={fStyles.footer}>
          <Pressable
            style={fStyles.applyBtn}
            onPress={() => { onApply({ brand, model, location, fuelType, transmission, condition, priceRange }); onClose(); }}
          >
            <LinearGradient
              colors={["#FF6B00", "#C85000"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={fStyles.applyGrad}
            >
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={fStyles.applyText}>
                {hasFilters ? `Show Results (${activeCount} filter${activeCount > 1 ? "s" : ""})` : "Show All Results"}
              </Text>
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

    const { brand, model, location, fuelType, transmission, condition, priceRange } = activeFilters;
    return (
      (brand === "Any" || car.brand === brand) &&
      (model === "Any" || car.model.toLowerCase().includes(model.toLowerCase())) &&
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
  const ORANGE = "#FF6B00";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* ── Premium Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 14, backgroundColor: bgHeader, borderBottomColor: borderHeader }]}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.titleSub, { color: ORANGE }]}>WESTCARS</Text>
            <Text style={[styles.title, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Search</Text>
          </View>
          {filtered.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: ORANGE }]}>
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
              colors={["#FF6B00", "#E05A00"]}
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
              colors={["rgba(255,107,0,0.10)", "rgba(224,90,0,0.10)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.filterBadge}
            >
              <Feather name="filter" size={11} color="#FF6B00" />
              <Text style={styles.filterBadgeText}>Filters active</Text>
              <Pressable onPress={() => setActiveFilters(null)} hitSlop={10}>
                <Feather name="x" size={12} color="#FF6B00" />
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
              colors={["rgba(255,107,0,0.10)", "rgba(224,90,0,0.10)"]}
              style={styles.emptyIconBg}
            >
              <Feather name="search" size={34} color="#FF6B00" />
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
    backgroundColor: "#FF6B00",
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
    shadowColor: "#FF6B00",
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
    borderColor: "rgba(255,107,0,0.20)",
  },
  filterBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B00",
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
  safeArea: { flex: 1, backgroundColor: "#0D0D1A" },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#FF6B00",
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.40)",
  },
  clearBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B00",
  },

  // ── Body ──
  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // ── Section blocks ──
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  sectionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "rgba(255,107,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  // ── Chips ──
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 8,
    elevation: 6,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },

  // ── Brand chips ──
  brandChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  brandLogoWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandLogoWrapActive: {
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  // ── Price grid ──
  priceCard: {
    width: "30%",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  priceCardActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.50,
    shadowRadius: 8,
    elevation: 6,
  },
  priceLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.50)",
    textAlign: "center",
    flexShrink: 1,
  },
  priceLabelActive: {
    color: "#fff",
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: "#0D0D1A",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  applyBtn: {
    borderRadius: 28,
    overflow: "hidden",
  },
  applyGrad: {
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  applyText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
