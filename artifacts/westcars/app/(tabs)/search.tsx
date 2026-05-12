import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { CONDITIONS, FUEL_TYPES, GHANA_CITIES, TRANSMISSIONS } from "@/utils/ghanaData";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Brand model map ──────────────────────────────────────
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

// ─── Price ranges ──────────────────────────────────────────
const PRICE_RANGES = [
  { label: "Under GHS 30k",  sub: "Under",  main: "GHS 30k",  min: 0,      max: 30000   },
  { label: "Under GHS 60k",  sub: "Under",  main: "GHS 60k",  min: 0,      max: 60000   },
  { label: "Under GHS 100k", sub: "Under",  main: "GHS 100k", min: 0,      max: 100000  },
  { label: "Above GHS 100k", sub: "Above",  main: "GHS 100k", min: 100000, max: 9999999 },
];

// ─── Quick filters ─────────────────────────────────────────
type QuickFilterKey = "All"|"SUV"|"Sedan"|"Tokunbo"|"Budget"|"Luxury"|"Pickup"|"Truck"|"Bus"|"Heavy"|"Moto"|"New";

const QUICK_FILTERS: { key: QuickFilterKey; label: string; color: string }[] = [
  { key: "All",     label: "All",     color: "#0EB5CA" },
  { key: "Budget",  label: "Budget",  color: "#F97316" },
  { key: "SUV",     label: "SUV",     color: "#6366F1" },
  { key: "Sedan",   label: "Sedan",   color: "#EC4899" },
  { key: "Luxury",  label: "Luxury",  color: "#A855F7" },
  { key: "Tokunbo", label: "Tokunbo", color: "#22C55E" },
  { key: "New",     label: "New",     color: "#7C3AED" },
  { key: "Pickup",  label: "Pickup",  color: "#F97316" },
  { key: "Truck",   label: "Truck",   color: "#DC2626" },
  { key: "Bus",     label: "Bus",     color: "#0284C7" },
  { key: "Heavy",   label: "Heavy",   color: "#92400E" },
  { key: "Moto",    label: "Moto",    color: "#0F766E" },
];

// ─── Brand colours (static) ───────────────────────────────
const TEAL   = "#0EB5CA";
const ORANGE = "#F97316";

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

// ─── Quick-filter predicate (extracted for reuse) ────────
function matchesQuickFilter(car: Car, key: QuickFilterKey): boolean {
  const cat = car.category?.toLowerCase() ?? "";
  if (key === "SUV")     return cat.includes("suv") || cat.includes("4x4") || cat.includes("4×4");
  if (key === "Sedan")   return cat.includes("sedan");
  if (key === "Tokunbo") return car.condition === "Foreign Used";
  if (key === "Budget")  return car.price < 100000;
  if (key === "Luxury")  return car.price > 300000;
  if (key === "Pickup")  return cat.includes("pickup");
  if (key === "Truck")   return cat.includes("cargo") || cat.includes("tipper") || cat.includes("tanker") || cat.includes("flatbed") || cat.includes("box truck");
  if (key === "Bus")     return cat.includes("bus") || cat.includes("minibus") || cat.includes("coach");
  if (key === "Heavy")   return cat.includes("excavator") || cat.includes("bulldozer") || cat.includes("crane") || cat.includes("forklift") || cat.includes("loader") || cat.includes("grader") || cat.includes("compactor") || cat.includes("mixer") || cat.includes("tractor") || cat.includes("harvester") || cat.includes("ambulance") || cat.includes("fire truck");
  if (key === "Moto")    return cat.includes("motorcycle") || cat.includes("scooter") || cat.includes("atv") || cat.includes("dirt bike") || cat.includes("quad");
  if (key === "New")     return car.condition === "New";
  return true; // "All"
}


// ─────────────────────────────────────────────────────────────────────────────
// FILTER MODAL — theme-aware
// ─────────────────────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, onApply }: {
  visible: boolean; onClose: () => void; onApply: (f: any) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [brand,        setBrand]        = useState("Any");
  const [model,        setModel]        = useState("Any");
  const [location,     setLocation]     = useState("Any");
  const [fuelType,     setFuelType]     = useState("Any");
  const [transmission, setTransmission] = useState("Any");
  const [condition,    setCondition]    = useState("Any");
  const [priceRange,   setPriceRange]   = useState<typeof PRICE_RANGES[0] | null>(null);

  const reset = () => {
    setBrand("Any"); setModel("Any"); setLocation("Any"); setFuelType("Any");
    setTransmission("Any"); setCondition("Any"); setPriceRange(null);
  };

  const activeCount = [
    brand !== "Any", model !== "Any", location !== "Any", fuelType !== "Any",
    transmission !== "Any", condition !== "Any", priceRange !== null,
  ].filter(Boolean).length;

  const TOP_BRANDS = ["Toyota","Honda","Hyundai","Mercedes","Kia","Ford","BMW","Nissan","Volkswagen","Mitsubishi","Lexus","Isuzu","Suzuki","Mazda","Subaru"];

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={[fS.sectionLabel, { color: colors.accent }]}>{label}</Text>
  );

  const PillWrap = ({ options, selected, onSelect }: {
    options: string[]; selected: string; onSelect: (v: string) => void;
  }) => (
    <View style={fS.pillWrap}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <Pressable
            key={opt}
            style={[
              fS.pill,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
              active && { borderColor: TEAL, backgroundColor: colors.accentLight },
            ]}
            onPress={() => onSelect(active ? "Any" : opt)}
          >
            <Text style={[
              fS.pillText,
              { color: colors.textSecondary },
              active && { color: TEAL, fontFamily: "Inter_600SemiBold" },
            ]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={[fS.root, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>

        <View style={[fS.handle, { backgroundColor: colors.border }]} />

        <View style={fS.titleRow}>
          <Text style={[fS.title, { color: colors.text }]}>Filters</Text>
          {activeCount > 0 && (
            <View style={fS.countPill}>
              <Text style={fS.countPillText}>{activeCount}</Text>
            </View>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fS.body}>

          <SectionLabel label="BRAND" />
          <PillWrap options={TOP_BRANDS} selected={brand} onSelect={(b) => { setBrand(b); setModel("Any"); }} />

          {brand !== "Any" && BRAND_MODELS[brand] && (
            <>
              <SectionLabel label={`${brand.toUpperCase()} MODEL`} />
              <PillWrap options={BRAND_MODELS[brand]} selected={model} onSelect={setModel} />
            </>
          )}

          <SectionLabel label="PRICE RANGE" />
          <View style={fS.priceGrid}>
            {PRICE_RANGES.map((pr) => {
              const active = priceRange?.label === pr.label;
              return (
                <Pressable
                  key={pr.label}
                  style={[
                    fS.priceCard,
                    { backgroundColor: colors.inputBg, borderColor: colors.border },
                    active && { borderColor: TEAL, backgroundColor: colors.accentLight },
                  ]}
                  onPress={() => setPriceRange(active ? null : pr)}
                >
                  <Text style={[fS.priceSub, { color: colors.textTertiary }, active && { color: TEAL }]}>
                    {pr.sub}
                  </Text>
                  <Text style={[fS.priceMain, { color: colors.text }, active && { color: TEAL }]}>
                    {pr.main}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SectionLabel label="CONDITION" />
          <PillWrap options={CONDITIONS} selected={condition} onSelect={setCondition} />

          <SectionLabel label="FUEL" />
          <PillWrap options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />

          <SectionLabel label="TRANSMISSION" />
          <PillWrap options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />

          <SectionLabel label="LOCATION" />
          <PillWrap options={GHANA_CITIES} selected={location} onSelect={setLocation} />

          <View style={{ height: 16 }} />
        </ScrollView>

        <View style={[fS.footer, { borderTopColor: colors.border }]}>
          <Pressable
            style={[fS.resetBtn, { borderColor: colors.border }, activeCount === 0 && { opacity: 0.38 }]}
            onPress={reset}
            disabled={activeCount === 0}
          >
            <Text style={[fS.resetText, { color: colors.textSecondary }]}>Reset</Text>
          </Pressable>
          <Pressable
            style={fS.applyBtnWrap}
            onPress={() => {
              onApply({ brand, model, location, fuelType, transmission, condition, priceRange });
              onClose();
            }}
          >
            <LinearGradient
              colors={[TEAL, "#0098AA"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={fS.applyBtn}
            >
              <Text style={fS.applyText}>
                {activeCount > 0 ? `Show Results · ${activeCount} filter${activeCount > 1 ? "s" : ""}` : "Show All Results"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEARCH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const { cars } = useApp();
  const { colors } = useTheme();
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
      setQuickFilter("All"); setQuery("");
    }
  }, [brandParam]);

  useEffect(() => {
    if (category) {
      const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
      setQuickFilter(qf); setQuery(q); setActiveFilters(null);
    }
  }, [category]);

  // ── Shared helpers ─────────────────────────────────────────────────────────
  const matchesQuery = React.useCallback((car: Car) => {
    const q = query.toLowerCase();
    return !q
      || car.brand.toLowerCase().includes(q)
      || car.model.toLowerCase().includes(q)
      || car.location.toLowerCase().includes(q)
      || car.condition.toLowerCase().includes(q)
      || (car.category?.toLowerCase().includes(q) ?? false);
  }, [query]);

  const matchesModalFilters = React.useCallback((car: Car) => {
    if (!activeFilters) return true;
    const { brand, model, location, fuelType, transmission, condition, priceRange } = activeFilters;
    const minP = priceRange?.min ?? 0;
    const maxP = priceRange?.max ?? 9999999;
    return (
      (!brand || brand === "Any" || car.brand === brand) &&
      (!model || model === "Any" || car.model.toLowerCase().includes(model.toLowerCase())) &&
      (!location || location === "Any" || car.location === location) &&
      (!fuelType || fuelType === "Any" || car.fuelType === fuelType) &&
      (!transmission || transmission === "Any" || car.transmission === transmission) &&
      (!condition || condition === "Any" || car.condition === condition) &&
      car.price >= minP && car.price <= maxP
    );
  }, [activeFilters]);

  // ── Filtering logic ────────────────────────────────────────────────────────
  const filtered = cars.filter((car: Car) => {
    if (!matchesQuery(car)) return false;
    if (!matchesQuickFilter(car, quickFilter)) return false;
    return matchesModalFilters(car);
  });

  // ── Per-chip counts (query + modal filters applied, quick-filter per chip) ─
  const chipCounts = React.useMemo(() => {
    const result: Record<QuickFilterKey, number> = {} as Record<QuickFilterKey, number>;
    for (const { key } of QUICK_FILTERS) {
      result[key] = cars.filter((car: Car) =>
        matchesQuery(car) && matchesQuickFilter(car, key) && matchesModalFilters(car)
      ).length;
    }
    return result;
  }, [cars, matchesQuery, matchesModalFilters]);

  const listData = React.useMemo(() => {
    const seeded = filtered.map((car) => ({
      car, k: [...car.id].reduce((s, ch) => (s * 33 + ch.charCodeAt(0)) >>> 0, 13),
    }));
    seeded.sort((a, b) => a.k - b.k);
    return seeded.map((x) => ({ type: "car" as const, item: x.car }));
  }, [filtered]);

  const hasFilters = !!activeFilters && Object.entries(activeFilters).some(([k, v]) => {
    if (k === "priceRange") return v !== null;
    return v !== "Any";
  });

  return (
    <View style={[S.root, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
      <View style={[S.header, {
        paddingTop: topPad + 10,
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
      }]}>

        <View style={S.titleRow}>
          <View>
            <Text style={S.eyebrow}>WESTCARS</Text>
            <Text style={[S.title, { color: colors.text }]}>Search</Text>
          </View>
          <View style={S.countPill}>
            <Text style={S.countNum}>{filtered.length.toLocaleString()}</Text>
            <Text style={S.countLbl}>cars</Text>
          </View>
        </View>

        <View style={S.searchRow}>
          <View style={[S.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Feather name="search" size={17} color={colors.textTertiary} />
            <TextInput
              style={[S.input, { color: colors.text }]}
              placeholder="Make, model, keyword…"
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              selectionColor={TEAL}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={10}>
                <Feather name="x-circle" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
          <Pressable style={S.filterBtn} onPress={() => setFilterVisible(true)}>
            <Feather name="sliders" size={18} color="#fff" />
            {hasFilters && <View style={S.filterDot} />}
          </Pressable>
        </View>

        {/* Chip row — paddingHorizontal on contentContainerStyle stops edge clipping */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.chipRow}
        >
          {QUICK_FILTERS.map(({ key, label, color }) => {
            const active = quickFilter === key;
            const count = chipCounts[key] ?? 0;
            const isEmpty = count === 0 && key !== "All";
            return (
              <Pressable
                key={key}
                style={[
                  S.chip,
                  active
                    ? { backgroundColor: color }
                    : { backgroundColor: colors.inputBg, borderColor: colors.border, borderWidth: 1 },
                  isEmpty && !active && S.chipDimmed,
                ]}
                onPress={() => setQuickFilter(key)}
              >
                <Text style={[S.chipText, { color: active ? "#fff" : colors.textSecondary }]}>
                  {label}
                </Text>
                <View style={[S.chipBadge, active ? S.chipBadgeActive : S.chipBadgeInactive]}>
                  <Text style={[S.chipBadgeText, { color: active ? "#fff" : colors.textSecondary }]}>
                    {count >= 1000 ? `${Math.floor(count / 1000)}k` : count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

      </View>

      {/* ── Results ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.item.id}
        style={S.list}
        contentContainerStyle={S.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={S.empty}>
            <Feather name="search" size={40} color={colors.textTertiary} />
            <Text style={[S.emptyTitle, { color: colors.text }]}>No listings found</Text>
            <Text style={[S.emptySub, { color: colors.textSecondary }]}>Try adjusting your filters or search term</Text>
            {hasFilters && (
              <Pressable style={S.clearBtn} onPress={() => { setActiveFilters(null); setQuery(""); setQuickFilter("All"); }}>
                <Text style={S.clearBtnText}>Clear all filters</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          if (index % 2 === 1) return null;
          const next = listData[index + 1];
          return (
            <View style={S.row}>
              <CarCard car={item.item} style={S.cardStyle} />
              {next ? <CarCard car={next.item} style={S.cardStyle} /> : <View style={S.cardStyle} />}
            </View>
          );
        }}
      />

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(f) => setActiveFilters(f)}
      />
    </View>
  );
}

// ─── Styles (brand/layout only — theme colours applied inline) ────────────────
const S = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingBottom: 10,
    borderBottomWidth: 1,
  },

  titleRow: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 18, marginBottom: 12,
  },
  eyebrow: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    color: TEAL, letterSpacing: 1.5, marginBottom: 2,
  },
  title: { fontSize: 28, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5 },

  countPill: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 6,
    alignItems: "center", marginTop: 4,
  },
  countNum: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  countLbl: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },

  searchRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, gap: 10, marginBottom: 10,
  },
  searchInput: {
    flex: 1, flexDirection: "row", alignItems: "center",
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, height: 46, minHeight: 46, gap: 10,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  filterBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: ORANGE,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  filterDot: {
    position: "absolute", top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#fff",
    borderWidth: 1.5, borderColor: ORANGE,
  },

  chipRow: {
    flexDirection: "row", gap: 8,
    paddingLeft: 14, paddingRight: 60, paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  chipDimmed: {
    opacity: 0.38,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  chipBadge: {
    borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: "center",
  },
  chipBadgeActive:   { backgroundColor: "rgba(255,255,255,0.25)" },
  chipBadgeInactive: { backgroundColor: "rgba(255,255,255,0.08)" },
  chipBadgeText:     { fontSize: 10, fontFamily: "Inter_700Bold" },

  list:        { flex: 1 },
  listContent: { padding: 12, paddingBottom: 100 },
  row:         { flexDirection: "row", paddingHorizontal: 8, gap: 8, marginBottom: 8 },
  cardStyle:   { flex: 1 },

  empty: {
    flex: 1, alignItems: "center", justifyContent: "center",
    paddingTop: 80, gap: 10,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub:   { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  clearBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5, borderColor: TEAL,
  },
  clearBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: TEAL },
});

// ─── Filter modal styles (layout only) ───────────────────────────────────────
const fS = StyleSheet.create({
  root: { flex: 1, paddingTop: 12 },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: "center", marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 20, marginBottom: 4,
  },
  title: { fontSize: 22, fontFamily: "Manrope_800ExtraBold" },
  countPill: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  countPillText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  body: { paddingHorizontal: 20, paddingTop: 8 },

  sectionLabel: {
    fontSize: 11, fontFamily: "Inter_700Bold",
    letterSpacing: 1.2, marginTop: 20, marginBottom: 10,
  },

  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1.5,
  },
  pillText: { fontSize: 13, fontFamily: "Inter_500Medium" },

  priceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  priceCard: {
    width: (SCREEN_W - 60) / 2,
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1.5, gap: 2,
  },
  priceSub:  { fontSize: 10, fontFamily: "Inter_400Regular" },
  priceMain: { fontSize: 15, fontFamily: "Inter_700Bold" },

  footer: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 14, gap: 12,
    borderTopWidth: 1,
  },
  resetBtn: {
    flex: 1, height: 50, borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  resetText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  applyBtnWrap: { flex: 2 },
  applyBtn: {
    height: 50, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 20,
  },
  applyText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
