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
import { CAR_BRANDS, CONDITIONS, FUEL_TYPES, GHANA_CITIES, TRANSMISSIONS } from "@/utils/ghanaData";
import { BRAND_LOGOS } from "@/utils/brandLogos";

const { width: SCREEN_W } = Dimensions.get("window");

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
  { key: "All",     label: "All",     icon: "grid",         color: "#0EB5CA" },
  { key: "SUV",     label: "SUV",     icon: "box",          color: "#6366F1" },
  { key: "Sedan",   label: "Sedan",   icon: "minus-circle", color: "#EC4899" },
  { key: "Tokunbo", label: "Tokunbo", icon: "package",      color: "#22C55E" },
  { key: "Budget",  label: "Budget",  icon: "tag",          color: "#F59E0B" },
  { key: "Luxury",  label: "Luxury",  icon: "award",        color: "#A855F7" },
  { key: "Pickup",  label: "Pickup",  icon: "truck",        color: "#F97316" },
  { key: "Truck",   label: "Truck",   icon: "truck",        color: "#DC2626" },
  { key: "Bus",     label: "Bus",     icon: "users",        color: "#0284C7" },
  { key: "Heavy",   label: "Heavy",   icon: "tool",         color: "#92400E" },
  { key: "Moto",    label: "Moto",    icon: "navigation-2", color: "#0F766E" },
  { key: "New",     label: "New",     icon: "star",         color: "#7C3AED" },
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

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM FILTER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function FilterModal({ visible, onClose, onApply }: {
  visible: boolean; onClose: () => void; onApply: (f: any) => void;
}) {
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

  const activeCount = [
    brand !== "Any", model !== "Any", location !== "Any", fuelType !== "Any",
    transmission !== "Any", condition !== "Any", priceRange.label !== "Any Price",
  ].filter(Boolean).length;
  const hasFilters = activeCount > 0;

  // Reusable filter card section
  const FilterCard = ({ icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
    <View style={fStyles.card}>
      <View style={fStyles.cardHeader}>
        <View style={fStyles.cardIconRing}>
          <Feather name={icon} size={14} color="#0EB5CA" />
        </View>
        <Text style={fStyles.cardLabel}>{label}</Text>
      </View>
      {children}
    </View>
  );

  // Pill chip grid (wraps)
  const PillGrid = ({ options, selected, onSelect }: {
    options: string[]; selected: string; onSelect: (v: string) => void;
  }) => (
    <View style={fStyles.pillGrid}>
      {["Any", ...options].map((opt) => {
        const active = selected === opt;
        return (
          <Pressable key={opt} onPress={() => onSelect(opt)}
            style={[fStyles.pill, active && fStyles.pillActive]}>
            <Text style={[fStyles.pillText, active && fStyles.pillTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  // Horizontal scroll chips (for long lists like locations)
  const ChipScroll = ({ options, selected, onSelect }: {
    options: string[]; selected: string; onSelect: (v: string) => void;
  }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
      <View style={{ flexDirection: "row", gap: 8, paddingRight: 8 }}>
        {["Any", ...options].map((opt) => {
          const active = selected === opt;
          return (
            <Pressable key={opt} onPress={() => onSelect(opt)}
              style={[fStyles.pill, active && fStyles.pillActive]}>
              <Text style={[fStyles.pillText, active && fStyles.pillTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  // Brand row with logos
  const BrandRow = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }}>
      <View style={{ flexDirection: "row", gap: 10, paddingRight: 8 }}>
        {[{ name: "Any", logo: null }, ...CAR_BRANDS.map(b => ({ name: b, logo: BRAND_LOGOS[b] ?? null }))].map(({ name: b, logo }) => {
          const active = brand === b;
          return (
            <Pressable key={b} onPress={() => handleBrandSelect(b)}
              style={[fStyles.brandItem, active && fStyles.brandItemActive]}>
              <View style={[fStyles.brandLogoCircle, active && fStyles.brandLogoCircleActive]}>
                {b === "Any"
                  ? <Feather name="layers" size={16} color={active ? "#fff" : "#64748B"} />
                  : logo
                    ? <Image source={{ uri: logo }} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    : <Text style={{ fontSize: 13, fontFamily: "Manrope_800ExtraBold", color: active ? "#fff" : "#475569" }}>{b.charAt(0)}</Text>
                }
              </View>
              <Text style={[fStyles.brandName, active && fStyles.brandNameActive]} numberOfLines={1}>{b}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  // 2-col price cards
  const PriceGrid = () => (
    <View style={fStyles.priceGrid}>
      {PRICE_RANGES.map((pr) => {
        const active = priceRange.label === pr.label;
        return (
          <Pressable key={pr.label} onPress={() => setPriceRange(pr)}
            style={[fStyles.priceCard, active && fStyles.priceCardActive]}>
            {active
              ? <LinearGradient colors={["#0EB5CA", "#0098AA"]} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:1}} />
              : null
            }
            <Feather name={pr.icon} size={15} color={active ? "#fff" : "#0EB5CA"} />
            <Text style={[fStyles.priceCardText, active && fStyles.priceCardTextActive]}>{pr.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={fStyles.safeArea} edges={["top","bottom"]}>

        {/* Header */}
        <View style={fStyles.header}>
          <Pressable style={fStyles.backBtn} onPress={onClose}>
            <Feather name="arrow-left" size={20} color="#0F172A" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={fStyles.headerTitle}>Refine Search</Text>
            {activeCount > 0 && (
              <Text style={fStyles.headerSub}>{activeCount} filter{activeCount > 1 ? "s" : ""} active</Text>
            )}
          </View>
          <Pressable
            style={[fStyles.resetBtn, !hasFilters && { opacity: 0.35 }]}
            onPress={reset} disabled={!hasFilters}>
            <Text style={fStyles.resetText}>Reset</Text>
          </Pressable>
        </View>

        {/* Body */}
        <ScrollView style={fStyles.body} contentContainerStyle={fStyles.bodyContent} showsVerticalScrollIndicator={false}>

          <FilterCard icon="layers" label="Brand">
            <BrandRow />
          </FilterCard>

          {brand !== "Any" && BRAND_MODELS[brand] && (
            <FilterCard icon="tag" label={`${brand} Model`}>
              <ChipScroll options={BRAND_MODELS[brand]} selected={model} onSelect={setModel} />
            </FilterCard>
          )}

          <FilterCard icon="map-pin" label="Location">
            <ChipScroll options={GHANA_CITIES} selected={location} onSelect={setLocation} />
          </FilterCard>

          <FilterCard icon="zap" label="Fuel Type">
            <PillGrid options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />
          </FilterCard>

          <FilterCard icon="settings" label="Transmission">
            <PillGrid options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />
          </FilterCard>

          <FilterCard icon="check-circle" label="Condition">
            <PillGrid options={CONDITIONS} selected={condition} onSelect={setCondition} />
          </FilterCard>

          <FilterCard icon="dollar-sign" label="Price Range">
            <PriceGrid />
          </FilterCard>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Footer */}
        <View style={fStyles.footer}>
          <Pressable
            style={fStyles.applyBtn}
            onPress={() => { onApply({ brand, model, location, fuelType, transmission, condition, priceRange }); onClose(); }}
          >
            <LinearGradient colors={["#0EB5CA", "#0098AA"]} start={{x:0,y:0}} end={{x:1,y:0}} style={fStyles.applyGrad}>
              <Feather name="check-circle" size={18} color="#fff" />
              <Text style={fStyles.applyText}>
                {hasFilters ? `Show Results · ${activeCount} filter${activeCount > 1 ? "s" : ""}` : "Show All Results"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

      </SafeAreaView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SEARCH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
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
      setQuickFilter("All"); setQuery("");
    }
  }, [brandParam]);

  useEffect(() => {
    if (category) {
      const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
      setQuickFilter(qf); setQuery(q); setActiveFilters(null);
    }
  }, [category]);

  const filtered = cars.filter((car: Car) => {
    const q = query.toLowerCase();
    const matchQuery = !q
      || car.brand.toLowerCase().includes(q)
      || car.model.toLowerCase().includes(q)
      || car.location.toLowerCase().includes(q)
      || car.condition.toLowerCase().includes(q)
      || (car.category?.toLowerCase().includes(q) ?? false);
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
      car.price >= priceRange.min && car.price <= priceRange.max
    );
  });

  const listData = React.useMemo(() => {
    const seeded = filtered.map((car) => ({
      car, k: [...car.id].reduce((s, ch) => (s * 33 + ch.charCodeAt(0)) >>> 0, 13),
    }));
    seeded.sort((a, b) => a.k - b.k);
    return seeded.map((x) => ({ type: "car" as const, item: x.car }));
  }, [filtered]);

  const headerBg  = isDark ? "#111827" : "#FFFFFF";
  const bodyBg    = isDark ? colors.background : "#F0F4F8";

  return (
    <View style={[S.root, { backgroundColor: bodyBg }]}>

      {/* ── Premium Header ── */}
      <View style={[S.header, { paddingTop: topPad + 12, backgroundColor: headerBg }]}>

        {/* Title row */}
        <View style={S.titleRow}>
          <View>
            <Text style={[S.eyebrow, { color: "#0EB5CA" }]}>WESTCARS</Text>
            <Text style={[S.title, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Search</Text>
          </View>
          {filtered.length > 0 && (
            <View style={S.countBubble}>
              <LinearGradient colors={["#0EB5CA","#0098AA"]} style={S.countBubbleGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
                <Text style={S.countNum}>{filtered.length}</Text>
                <Text style={S.countLbl}>found</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Search bar */}
        <View style={[S.searchBar, {
          backgroundColor: isDark ? "#1E293B" : "#F4F7FA",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#DDE3EC",
        }]}>
          <Feather name="search" size={18} color="#0EB5CA" />
          <TextInput
            style={[S.searchInput, { color: isDark ? "#F1F5F9" : "#0F172A" }]}
            placeholder="Brand, model, location..."
            placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Feather name="x-circle" size={17} color="#94A3B8" />
            </Pressable>
          )}
          <Pressable onPress={() => setFilterVisible(true)} style={S.filterTrigger}>
            <LinearGradient colors={["#0EB5CA","#0098AA"]} style={S.filterGrad} start={{x:0,y:0}} end={{x:1,y:1}}>
              <Feather name="sliders" size={16} color="#fff" />
              {activeFilters && <View style={S.filterDot} />}
            </LinearGradient>
          </Pressable>
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.chipScroll} contentContainerStyle={S.chipRow}>
          {QUICK_FILTERS.map(({ key, label, icon, color }) => {
            const active = quickFilter === key;
            return (
              <Pressable key={key} onPress={() => setQuickFilter(key)} style={S.chipWrap}>
                {active
                  ? <LinearGradient colors={[color, color + "BB"]} style={S.chipInner} start={{x:0,y:0}} end={{x:1,y:1}}>
                      <Feather name={icon} size={12} color="#fff" />
                      <Text style={S.chipLabelActive}>{label}</Text>
                    </LinearGradient>
                  : <View style={[S.chipInner, {
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                    }]}>
                      <View style={[S.chipIconCircle, { backgroundColor: color + "18" }]}>
                        <Feather name={icon} size={12} color={color} />
                      </View>
                      <Text style={[S.chipLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>{label}</Text>
                    </View>
                }
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Active filter badge */}
        {activeFilters && (
          <View style={S.filterBadgeRow}>
            <View style={[S.filterBadge, { backgroundColor: "rgba(14,181,202,0.10)", borderColor: "rgba(14,181,202,0.22)" }]}>
              <Feather name="filter" size={11} color="#0EB5CA" />
              <Text style={S.filterBadgeText}>Filters active</Text>
              <Pressable onPress={() => setActiveFilters(null)} hitSlop={10}>
                <Feather name="x" size={12} color="#0EB5CA" />
              </Pressable>
            </View>
          </View>
        )}

      </View>

      {/* ── Results grid ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.item.id}
        renderItem={({ item, index }) => {
          if (index % 2 === 1) return null;
          const next = listData[index + 1];
          return (
            <View style={S.row}>
              <CarCard car={item.item} style={S.half} />
              {next ? <CarCard car={next.item} style={S.half} /> : <View style={S.half} />}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={S.empty}>
            <LinearGradient colors={["rgba(14,181,202,0.12)","rgba(0,152,170,0.06)"]} style={S.emptyCircle}>
              <Feather name="search" size={36} color="#0EB5CA" />
            </LinearGradient>
            <Text style={[S.emptyTitle, { color: colors.text }]}>No vehicles found</Text>
            <Text style={[S.emptyText, { color: colors.textTertiary }]}>Try adjusting your search or filters</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 + insets.bottom }} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 10 }}
      />

      <FilterModal visible={filterVisible} onClose={() => setFilterVisible(false)} onApply={setActiveFilters} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH SCREEN STYLES
// ─────────────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },

  titleRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  eyebrow: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 2.5 },
  title: { fontSize: 26, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5, lineHeight: 30 },

  countBubble: { borderRadius: 16, overflow: "hidden", marginBottom: 2 },
  countBubbleGrad: { paddingHorizontal: 14, paddingVertical: 8, alignItems: "center" },
  countNum: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", color: "#fff", lineHeight: 22 },
  countLbl: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.80)", letterSpacing: 1 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    padding: 0,
  },
  filterTrigger: { borderRadius: 12, overflow: "hidden" },
  filterGrad: {
    width: 38, height: 38,
    alignItems: "center", justifyContent: "center",
  },
  filterDot: {
    position: "absolute", top: 4, right: 4,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: "#EF4444", borderWidth: 1.5, borderColor: "#fff",
  },

  chipScroll: { flexGrow: 0 },
  chipRow: { flexDirection: "row", gap: 7, paddingHorizontal: 2, paddingBottom: 2 },
  chipWrap: { borderRadius: 20, overflow: "hidden" },
  chipInner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  chipIconCircle: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  chipLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  chipLabelActive: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },

  filterBadgeRow: { flexDirection: "row" },
  filterBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  filterBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },

  row: { flexDirection: "row", paddingHorizontal: 8, gap: 8 },
  half: { flex: 1, marginBottom: 10 },

  empty: { alignItems: "center", paddingVertical: 80, gap: 16 },
  emptyCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.3 },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});

// ─────────────────────────────────────────────────────────────────────────────
// FILTER MODAL STYLES
// ─────────────────────────────────────────────────────────────────────────────
const fStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F4F8" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#E8EEF4",
    gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", color: "#0F172A", letterSpacing: -0.4 },
  headerSub: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#0EB5CA", marginTop: 1 },
  resetBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#0EB5CA",
  },
  resetText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16, gap: 12 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#0A1628",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  cardIconRing: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  cardLabel: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#64748B", letterSpacing: 1, textTransform: "uppercase" },

  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  pillActive: {
    backgroundColor: "#0EB5CA", borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 8, elevation: 5,
  },
  pillText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#475569" },
  pillTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },

  brandItem: {
    alignItems: "center", gap: 6,
    paddingHorizontal: 4, paddingBottom: 4,
  },
  brandItemActive: {},
  brandLogoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#F1F5F9", borderWidth: 1.5, borderColor: "#E2E8F0",
    alignItems: "center", justifyContent: "center",
  },
  brandLogoCircleActive: {
    backgroundColor: "#0EB5CA", borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  brandName: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#64748B", textAlign: "center", maxWidth: 56 },
  brandNameActive: { color: "#0EB5CA", fontFamily: "Inter_700Bold" },

  priceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  priceCard: {
    width: (SCREEN_W - 32 - 36 - 20) / 2,
    flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 18,
    borderRadius: 16, overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  priceCardActive: {
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30, shadowRadius: 8, elevation: 5,
  },
  priceCardText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#475569", textAlign: "center" },
  priceCardTextActive: { color: "#fff" },

  footer: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E8EEF4",
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 6,
  },
  applyBtn: { borderRadius: 18, overflow: "hidden" },
  applyGrad: {
    height: 58, borderRadius: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  applyText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.2 },
});
