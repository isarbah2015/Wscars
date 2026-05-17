import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { CAR_BRANDS, CONDITIONS, GHANA_CITIES, TRANSMISSIONS } from "@/utils/ghanaData";

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
  // ── Chinese brands ──────────────────────────────────────
  BYD:          ["Atto 3","Han","Tang","Song Plus","Seal","Dolphin","e6","F3","F0","S6","Yuan Plus"],
  Chery:        ["Tiggo 4","Tiggo 7","Tiggo 8","Arrizo 5","Arrizo 6","QQ","Omoda 5","Exeed TXL"],
  Geely:        ["Emgrand","Atlas","Coolray","Azkarra","Okavango","Tugella","Preface","GX3 Pro"],
  Haval:        ["H6","H9","H2","Jolion","F7","F7x","Dargo","Big Dog","Raptor"],
  MG:           ["ZS","HS","RX5","MG3","MG5","MG6","One","Extender","VS","EZS"],
  JAC:          ["S2","S3","S4","S7","T6","T8","J7","Refine S4","iEV7S"],
  BAIC:         ["X55","X25","BJ40","BJ80","EU5","EX5","Senova X35","Senova X55"],
  Changan:      ["CS35 Plus","CS55 Plus","CS75 Plus","CS85","UNI-T","UNI-K","Alsvin","Eado"],
  Lifan:        ["X60","X70","X80","820","520","330","Myway"],
  SAIC:         ["Roewe RX5","Roewe i5","Maxus T60","Maxus G10","Maxus D90"],
  GAC:          ["GS4","GS5","GS8","GA4","GA6","GM6","Empow","GS3"],
  "Great Wall":  ["Poer","Tank 300","Tank 500","Cannon","Wingle"],
  Dongfeng:     ["AX7","AX5","A60","Fengon 500","Fengon 580","Fengon 600"],
  FAW:          ["Besturn B70","Besturn X40","Besturn X80","Jilin"],
  Foton:        ["Tunland","Gratour","Aumark","Toano","Sauvana"],
  Zotye:        ["T600","T700","T800","Z560","SR7"],
  "King Long":   ["Minivan","MPV 7-seater","Bus 15-seater","Bus 35-seater"],
  Yutong:       ["Bus 18-seater","Bus 25-seater","Bus 35-seater","Bus 55-seater"],
  Higer:        ["Bus 20-seater","Bus 30-seater","Bus 45-seater","Coach"],
  Sinotruck:    ["Howo","Sitrak C7H","Hohan","Golden Prince","Light Truck"],
  Shacman:      ["F3000","X3000","H3000","M3000","L3000"],
  // ── Other popular in Ghana ───────────────────────────────
  Opel:         ["Astra","Insignia","Corsa","Mokka","Zafira","Vectra"],
  Fiat:         ["500","Punto","Tipo","Bravo","Doblo","Panda"],
  "Alfa Romeo": ["Giulia","Stelvio","Giulietta","147","156","159"],
  Dacia:        ["Duster","Sandero","Logan","Spring"],
  Skoda:        ["Octavia","Superb","Kodiaq","Karoq","Kamiq","Fabia"],
  SEAT:         ["Ibiza","Leon","Ateca","Arona","Tarraco"],
  Citroen:      ["C3","C4","C5","Berlingo","Jumper","Xsara"],
  Ram:          ["1500","2500","3500","ProMaster"],
  Hummer:       ["H1","H2","H3","EV"],
  Lincoln:      ["Navigator","Aviator","Corsair","MKZ","Continental"],
  Genesis:      ["GV80","GV70","G80","G70","G90"],
  Tesla:        ["Model S","Model 3","Model X","Model Y","Cybertruck"],
  Rivian:       ["R1T","R1S"],
  Polestar:     ["2","3","4"],
};

// ─── All brands (extends CAR_BRANDS with any not already listed) ──────────────
const EXTENDED_BRANDS: string[] = [
  ...new Set([
    ...CAR_BRANDS,
    "BYD","Chery","Geely","Haval","MG","JAC","BAIC","Changan","Lifan","SAIC",
    "GAC","Great Wall","Dongfeng","FAW","Foton","Zotye","King Long","Yutong",
    "Higer","Sinotruck","Shacman","Opel","Fiat","Alfa Romeo","Dacia","Skoda",
    "SEAT","Citroen","Ram","Hummer","Lincoln","Genesis","Tesla","Rivian","Polestar",
  ]),
].sort();

// ─── Price + slider constants ─────────────────────────────
const PRICE_MIN  = 0;
const PRICE_MAX  = 500_000;
const PRICE_STEP = 5_000;
const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear() + 1;
const YEAR_STEP = 1;
const ALL_BRANDS = EXTENDED_BRANDS;
const BODY_TYPES = ["SUV", "Sedan", "Pickup", "Truck", "Bus", "Heavy", "Moto"];

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

const TEAL   = "#0EB5CA";
const ORANGE = "#F97316";

const CHIP_ROW_PADDING_LEFT = 14;
const CHIP_ROW_GAP          = 8;

// ─── Animated count badge ─────────────────────────────────
function AnimatedCount({
  value,
  style,
}: {
  value: number | string;
  style?: StyleProp<TextStyle>;
}) {
  const opacity   = useRef(new Animated.Value(1)).current;
  const displayed = useRef(value);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (value === displayed.current) return;
    const fadeOut = Animated.timing(opacity, {
      toValue: 0, duration: 90, useNativeDriver: true,
    });
    let fadeIn: Animated.CompositeAnimation | null = null;
    fadeOut.start(({ finished }) => {
      if (!finished) return;
      displayed.current = value;
      setShown(value);
      fadeIn = Animated.timing(opacity, { toValue: 1, duration: 110, useNativeDriver: true });
      fadeIn.start();
    });
    return () => { fadeOut.stop(); fadeIn?.stop(); };
  }, [value]);

  return <Animated.Text style={[style, { opacity }]}>{shown}</Animated.Text>;
}

function PriceRangeSelector({
  min,
  max,
  onMinChange,
  onMaxChange,
  format,
}: {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  format: (value: number) => string;
}) {
  const minPct = ((min - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((max - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  const clampMin = (value: number) => {
    const next = Math.min(value, max - PRICE_STEP);
    onMinChange(Math.max(PRICE_MIN, next));
  };

  const clampMax = (value: number) => {
    const next = Math.max(value, min + PRICE_STEP);
    onMaxChange(Math.min(PRICE_MAX, next));
  };

  return (
    <View style={fS.rangeWrap}>
      <View style={fS.rangeLabels}>
        <View style={fS.rangeValuePill}>
          <Text style={fS.rangeValueLabel}>Min</Text>
          <Text style={fS.rangeValueText}>{format(min)}</Text>
        </View>
        <View style={fS.rangeValuePill}>
          <Text style={fS.rangeValueLabel}>Max</Text>
          <Text style={fS.rangeValueText}>{max >= PRICE_MAX ? "Any" : format(max)}</Text>
        </View>
      </View>
      <View style={fS.trackShell}>
        <View style={fS.trackBase} />
        <View
          style={[
            fS.trackActive,
            { left: `${minPct}%`, right: `${100 - maxPct}%` },
          ]}
        />
        <Slider
          style={fS.rangeSlider}
          minimumValue={PRICE_MIN}
          maximumValue={PRICE_MAX}
          step={PRICE_STEP}
          value={min}
          onValueChange={clampMin}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={TEAL}
        />
        <Slider
          style={fS.rangeSlider}
          minimumValue={PRICE_MIN}
          maximumValue={PRICE_MAX}
          step={PRICE_STEP}
          value={max}
          onValueChange={clampMax}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#004D5A"
        />
      </View>
      <View style={fS.rangeEnds}>
        <Text style={fS.rangeEndText}>{format(PRICE_MIN)}</Text>
        <Text style={fS.rangeEndText}>{format(PRICE_MAX)}</Text>
      </View>
    </View>
  );
}

function YearRangeSelector({
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const minPct = ((min - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;
  const maxPct = ((max - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100;

  const clampMin = (value: number) => {
    const next = Math.min(value, max - YEAR_STEP);
    onMinChange(Math.max(YEAR_MIN, Math.round(next)));
  };

  const clampMax = (value: number) => {
    const next = Math.max(value, min + YEAR_STEP);
    onMaxChange(Math.min(YEAR_MAX, Math.round(next)));
  };

  return (
    <View style={fS.rangeWrap}>
      <View style={fS.rangeLabels}>
        <View style={fS.rangeValuePill}>
          <Text style={fS.rangeValueLabel}>From</Text>
          <Text style={fS.rangeValueText}>{min}</Text>
        </View>
        <View style={fS.rangeValuePill}>
          <Text style={fS.rangeValueLabel}>To</Text>
          <Text style={fS.rangeValueText}>{max >= YEAR_MAX ? "Any" : max}</Text>
        </View>
      </View>
      <View style={fS.trackShell}>
        <View style={fS.trackBase} />
        <View style={[fS.trackActive, { left: `${minPct}%`, right: `${100 - maxPct}%` }]} />
        <Slider
          style={fS.rangeSlider}
          minimumValue={YEAR_MIN}
          maximumValue={YEAR_MAX}
          step={YEAR_STEP}
          value={min}
          onValueChange={clampMin}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={TEAL}
        />
        <Slider
          style={fS.rangeSlider}
          minimumValue={YEAR_MIN}
          maximumValue={YEAR_MAX}
          step={YEAR_STEP}
          value={max}
          onValueChange={clampMax}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="#004D5A"
        />
      </View>
      <View style={fS.rangeEnds}>
        <Text style={fS.rangeEndText}>{YEAR_MIN}</Text>
        <Text style={fS.rangeEndText}>{YEAR_MAX}</Text>
      </View>
    </View>
  );
}

function mapCategoryToFilter(cat: string): { quickFilter: QuickFilterKey; query: string } {
  const l = cat.toLowerCase();
  if (l.includes("suv") || l.includes("4x4") || l.includes("4×4"))             return { quickFilter: "SUV",    query: "" };
  if (l.includes("sedan"))                                                        return { quickFilter: "Sedan",  query: "" };
  if (l.includes("pickup"))                                                       return { quickFilter: "Pickup", query: "" };
  if (l.includes("cargo truck") || l.includes("tipper") || l.includes("flatbed") ||
      l.includes("tanker") || l.includes("box truck"))                           return { quickFilter: "Truck",  query: "" };
  if (l.includes("bus") || l.includes("minibus") || l.includes("coach"))        return { quickFilter: "Bus",    query: "" };
  if (l.includes("excavator") || l.includes("bulldozer") || l.includes("crane") ||
      l.includes("forklift") || l.includes("loader") || l.includes("grader") ||
      l.includes("compactor") || l.includes("mixer") || l.includes("tractor") ||
      l.includes("harvester") || l.includes("ambulance") || l.includes("fire")) return { quickFilter: "Heavy",  query: "" };
  if (l.includes("motorcycle") || l.includes("scooter") || l.includes("atv") ||
      l.includes("dirt bike") || l.includes("quad"))                             return { quickFilter: "Moto",   query: "" };
  if (l.includes("hatchback"))                                                    return { quickFilter: "All",    query: "hatchback" };
  if (l.includes("van") || l.includes("station wagon"))                          return { quickFilter: "All",    query: l };
  return { quickFilter: "All", query: cat };
}

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
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE
// ─────────────────────────────────────────────────────────────────────────────
interface FilterState {
  priceMin:      number;
  priceMax:      number;
  yearMin:       number;
  yearMax:       number;
  bodyTypes:     string[];
  brands:        string[];
  models:        string[];
  transmissions: string[];
  conditions:    string[];
  cities:        string[];
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: PRICE_MIN, priceMax: PRICE_MAX,
  yearMin: YEAR_MIN, yearMax: YEAR_MAX,
  bodyTypes: [], brands: [], models: [], transmissions: [], conditions: [], cities: [],
};

function parseStoredFilters(raw: string | null): FilterState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FilterState>;
    const next: FilterState = {
      priceMin: typeof parsed.priceMin === "number" ? parsed.priceMin : PRICE_MIN,
      priceMax: typeof parsed.priceMax === "number" ? parsed.priceMax : PRICE_MAX,
      yearMin: typeof parsed.yearMin === "number" ? parsed.yearMin : YEAR_MIN,
      yearMax: typeof parsed.yearMax === "number" ? parsed.yearMax : YEAR_MAX,
      bodyTypes: Array.isArray(parsed.bodyTypes) ? parsed.bodyTypes.filter((v): v is string => typeof v === "string") : [],
      brands: Array.isArray(parsed.brands) ? parsed.brands.filter((v): v is string => typeof v === "string") : [],
      models: Array.isArray(parsed.models) ? parsed.models.filter((v): v is string => typeof v === "string") : [],
      transmissions: Array.isArray(parsed.transmissions) ? parsed.transmissions.filter((v): v is string => typeof v === "string") : [],
      conditions: Array.isArray(parsed.conditions) ? parsed.conditions.filter((v): v is string => typeof v === "string") : [],
      cities: Array.isArray(parsed.cities) ? parsed.cities.filter((v): v is string => typeof v === "string") : [],
    };
    const active =
      next.brands.length > 0 || next.models.length > 0 ||
      next.bodyTypes.length > 0 ||
      next.transmissions.length > 0 || next.conditions.length > 0 ||
      next.cities.length > 0 ||
      next.priceMin !== PRICE_MIN || next.priceMax !== PRICE_MAX ||
      next.yearMin !== YEAR_MIN || next.yearMax !== YEAR_MAX;
    return active ? next : null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER MODAL
// ─────────────────────────────────────────────────────────────────────────────
function FilterModal({
  visible, onClose, onApply, initial,
}: {
  visible: boolean; onClose: () => void; onApply: (f: FilterState) => void; initial: FilterState;
}) {
  const [priceMin,      setPriceMin]      = React.useState(initial.priceMin);
  const [priceMax,      setPriceMax]      = React.useState(initial.priceMax);
  const [yearMin,       setYearMin]       = React.useState(initial.yearMin);
  const [yearMax,       setYearMax]       = React.useState(initial.yearMax);
  const [bodyTypes,     setBodyTypes]     = React.useState<string[]>(initial.bodyTypes);
  const [brands,        setBrands]        = React.useState<string[]>(initial.brands);
  const [models,        setModels]        = React.useState<string[]>(initial.models);
  const [transmissions, setTransmissions] = React.useState<string[]>(initial.transmissions);
  const [conditions,    setConditions]    = React.useState<string[]>(initial.conditions);
  const [cities,        setCities]        = React.useState<string[]>(initial.cities);
  const [showAllBrands, setShowAllBrands] = React.useState(false);
  const [citySearch,    setCitySearch]    = React.useState("");

  React.useEffect(() => {
    if (visible) {
      setPriceMin(initial.priceMin); setPriceMax(initial.priceMax);
      setYearMin(initial.yearMin); setYearMax(initial.yearMax);
      setBodyTypes(initial.bodyTypes);
      setBrands(initial.brands); setTransmissions(initial.transmissions);
      setConditions(initial.conditions); setCities(initial.cities);
      setModels(initial.models); setShowAllBrands(false); setCitySearch("");
    }
  }, [visible]);

  const fmt = (v: number) => v >= 1000 ? `GHS ${(v / 1000).toFixed(0)}k` : `GHS ${v}`;
  const toggle = (arr: string[], set: (a: string[]) => void, val: string) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  const reset = () => {
    setPriceMin(PRICE_MIN); setPriceMax(PRICE_MAX);
    setYearMin(YEAR_MIN); setYearMax(YEAR_MAX); setBodyTypes([]);
    setBrands([]); setTransmissions([]); setConditions([]); setCities([]); setModels([]);
  };
  const apply = () => {
    onApply({ priceMin, priceMax, yearMin, yearMax, bodyTypes, brands, models, transmissions, conditions, cities });
    onClose();
  };

  const visibleBrands = showAllBrands ? ALL_BRANDS : ALL_BRANDS.slice(0, 15);
  const visibleCities = GHANA_CITIES.filter((city) =>
    city.toLowerCase().includes(citySearch.trim().toLowerCase())
  );
  const activeCount =
    bodyTypes.length + brands.length + models.length + transmissions.length +
    conditions.length + cities.length +
    (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX ? 1 : 0) +
    (yearMin !== YEAR_MIN || yearMax !== YEAR_MAX ? 1 : 0);

  const PRESETS = [
    { label: "GHS 0–30k",     min: 0,       max: 30_000  },
    { label: "GHS 30k–100k",  min: 30_000,  max: 100_000 },
    { label: "GHS 100k–300k", min: 100_000, max: 300_000 },
    { label: "GHS 300k+",     min: 300_000, max: 500_000 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={fS.overlay}>
        <TouchableOpacity style={fS.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={fS.sheet}>
          <View style={fS.handle} />
          <View style={fS.header}>
            <View style={fS.headerSpacer} />
            <Text style={fS.title}>Filters</Text>
            <TouchableOpacity onPress={reset} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={fS.resetTxt}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fS.scroll}>

            {/* ── Price range ── */}
            <View style={fS.section}>
              <Text style={fS.secLabel}>Price range (GHS)</Text>

              <View style={fS.priceSummary}>
                <Text style={fS.priceSummaryLabel}>Selected range</Text>
                <Text style={fS.priceSummaryValue}>
                  {fmt(priceMin)} – {priceMax >= PRICE_MAX ? "Any" : fmt(priceMax)}
                </Text>
              </View>

              <PriceRangeSelector
                min={priceMin}
                max={priceMax}
                onMinChange={setPriceMin}
                onMaxChange={setPriceMax}
                format={fmt}
              />

              <View style={fS.presetsRow}>
                {PRESETS.map(p => {
                  const active = priceMin === p.min && priceMax === p.max;
                  return (
                    <TouchableOpacity key={p.label} style={[fS.presetChip, active && fS.chipActive]}
                      onPress={() => { setPriceMin(p.min); setPriceMax(p.max); }}>
                      <Text style={[fS.chipTxt, active && fS.chipTxtActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={fS.divider} />

            <View style={fS.section}>
              <Text style={fS.secLabel}>Year Range</Text>
              <YearRangeSelector
                min={yearMin}
                max={yearMax}
                onMinChange={setYearMin}
                onMaxChange={setYearMax}
              />
            </View>
            <View style={fS.divider} />

            <View style={fS.section}>
              <Text style={fS.secLabel}>Body Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fS.horizontalChipsRow}>
                {BODY_TYPES.map(type => {
                  const active = bodyTypes.includes(type);
                  return (
                    <TouchableOpacity key={type} style={[fS.chip, active && fS.chipActive]}
                      onPress={() => toggle(bodyTypes, setBodyTypes, type)}>
                      <Text style={[fS.chipTxt, active && fS.chipTxtActive]}>{type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <View style={fS.divider} />

            {/* ── Brand ── */}
            <View style={fS.section}>
              <Text style={fS.secLabel}>Brand</Text>
              <View style={fS.brandGrid}>
                {visibleBrands.map(b => (
                  <TouchableOpacity key={b} style={[fS.brandItem, brands.includes(b) && fS.brandActive]}
                    onPress={() => toggle(brands, setBrands, b)}>
                    <Text style={[fS.brandTxt, brands.includes(b) && fS.brandTxtActive]} numberOfLines={1}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {!showAllBrands && ALL_BRANDS.length > 15 && (
                <TouchableOpacity style={fS.showMore} onPress={() => setShowAllBrands(true)}>
                  <Text style={fS.showMoreTxt}>+ {ALL_BRANDS.length - 15} more brands</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={fS.divider} />

            {brands.length === 1 && BRAND_MODELS[brands[0]] && (
              <>
                <View style={fS.section}>
                  <Text style={fS.secLabel}>Model — {brands[0]}</Text>
                  <View style={fS.chipsRow}>
                    {BRAND_MODELS[brands[0]].map(model => {
                      const active = models.includes(model);
                      return (
                        <TouchableOpacity key={model} style={[fS.chip, active && fS.chipActive]}
                          onPress={() => toggle(models, setModels, model)}>
                          <Text style={[fS.chipTxt, active && fS.chipTxtActive]}>{model}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {models.length > 0 && (
                    <TouchableOpacity onPress={() => setModels([])}>
                      <Text style={{ color: TEAL, fontSize: 12, marginTop: 6 }}>Clear model</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={fS.divider} />
              </>
            )}

            {/* ── Transmission ── */}
            <View style={fS.section}>
              <Text style={fS.secLabel}>Transmission</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fS.horizontalChipsRow}>
                {TRANSMISSIONS.map(t => (
                  <TouchableOpacity key={t} style={[fS.chip, transmissions.includes(t) && fS.chipActive]}
                    onPress={() => toggle(transmissions, setTransmissions, t)}>
                    <Text style={[fS.chipTxt, transmissions.includes(t) && fS.chipTxtActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={fS.divider} />

            {/* ── Condition ── */}
            <View style={fS.section}>
              <Text style={fS.secLabel}>Condition</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fS.horizontalChipsRow}>
                {CONDITIONS.map(c => (
                  <TouchableOpacity key={c} style={[fS.chip, conditions.includes(c) && fS.chipActive]}
                    onPress={() => toggle(conditions, setConditions, c)}>
                    <Text style={[fS.chipTxt, conditions.includes(c) && fS.chipTxtActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={fS.divider} />

            {/* ── Location ── */}
            <View style={fS.section}>
              <Text style={fS.secLabel}>City / Region</Text>
              <View style={fS.citySearchBox}>
                <Feather name="search" size={15} color="#94A3B8" />
                <TextInput
                  style={fS.citySearchInput}
                  placeholder="Search all regions"
                  placeholderTextColor="#94A3B8"
                  value={citySearch}
                  onChangeText={setCitySearch}
                />
              </View>
              <View style={fS.cityList}>
                {visibleCities.map(city => (
                  <TouchableOpacity key={city} style={[fS.cityItem, cities.includes(city) && fS.cityItemActive]}
                    onPress={() => toggle(cities, setCities, city)}>
                    <Text style={[fS.cityTxt, cities.includes(city) && fS.cityTxtActive]}>{city}</Text>
                    {cities.includes(city) && <Feather name="check" size={15} color={TEAL} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

          </ScrollView>

          <View style={fS.bottom}>
            <TouchableOpacity style={fS.closeBtn} onPress={onClose}>
              <Text style={fS.closeTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={fS.applyBtn} onPress={apply}>
              <Text style={fS.applyTxt}>{activeCount > 0 ? `Apply ${activeCount} Filters` : "Apply Filters"}</Text>
            </TouchableOpacity>
          </View>
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

  const { category, brand: brandParam, openFilter } = useLocalSearchParams<{ category?: string; brand?: string; openFilter?: string }>();

  const [query,         setQuery]         = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [quickFilter,   setQuickFilter]   = useState<QuickFilterKey>("All");

  const chipScrollRef = useRef<ScrollView>(null);
  const chipLayouts   = useRef<Partial<Record<QuickFilterKey, { x: number; width: number }>>>({});
  const hasHydrated   = useRef(false);
  const QUICK_FILTER_STORAGE_KEY = "westcars:quickFilter";
  const MODAL_FILTER_STORAGE_KEY = "westcars:modalFilters";

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      AsyncStorage.getItem(QUICK_FILTER_STORAGE_KEY),
      AsyncStorage.getItem(MODAL_FILTER_STORAGE_KEY),
    ]).then(([savedQuickFilter, savedModalFilters]) => {
      if (cancelled) return;

      let nextQuickFilter: QuickFilterKey = "All";
      if (savedQuickFilter && QUICK_FILTERS.some((f) => f.key === savedQuickFilter)) {
        nextQuickFilter = savedQuickFilter as QuickFilterKey;
      }

      let nextQuery = "";
      let nextActiveFilters = parseStoredFilters(savedModalFilters);

      if (category) {
        const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
        nextQuickFilter = qf;
        nextQuery = q;
      }

      if (brandParam) {
        nextQuickFilter = "All";
        nextQuery = "";
        nextActiveFilters = {
          ...(nextActiveFilters ?? DEFAULT_FILTERS),
          brands: [brandParam],
        };
      }

      setQuickFilter(nextQuickFilter);
      setQuery(nextQuery);
      setActiveFilters(nextActiveFilters);
    }).catch(() => {}).finally(() => {
      if (!cancelled) hasHydrated.current = true;
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (openFilter === "1") setFilterVisible(true);
  }, [openFilter]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    AsyncStorage.setItem(QUICK_FILTER_STORAGE_KEY, quickFilter).catch(() => {});
  }, [quickFilter]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    if (activeFilters) {
      AsyncStorage.setItem(MODAL_FILTER_STORAGE_KEY, JSON.stringify(activeFilters)).catch(() => {});
    } else {
      AsyncStorage.removeItem(MODAL_FILTER_STORAGE_KEY).catch(() => {});
    }
  }, [activeFilters]);

  useEffect(() => {
    if (!hasHydrated.current || !brandParam) return;
    setActiveFilters((prev) => ({ ...(prev ?? DEFAULT_FILTERS), brands: [brandParam] }));
    setQuickFilter("All");
    setQuery("");
  }, [brandParam]);

  useEffect(() => {
    if (!hasHydrated.current || !category) return;
    const { quickFilter: qf, query: q } = mapCategoryToFilter(category as string);
    setQuickFilter(qf);
    setQuery(q);
  }, [category]);

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
    const { brands, models, transmissions, conditions, cities, bodyTypes, priceMin, priceMax, yearMin, yearMax } = activeFilters;
    const matchesBodyTypes = bodyTypes.length === 0 || bodyTypes.some((type) =>
      matchesQuickFilter(car, type as QuickFilterKey)
    );
    return (
      matchesBodyTypes &&
      (brands.length        === 0 || brands.includes(car.brand)) &&
      (models.length        === 0 || models.includes(car.model)) &&
      (transmissions.length === 0 || transmissions.includes(car.transmission ?? "")) &&
      (conditions.length    === 0 || conditions.includes(car.condition)) &&
      (cities.length        === 0 || cities.includes(car.location)) &&
      car.price >= priceMin && car.price <= priceMax &&
      car.year >= yearMin && car.year <= yearMax
    );
  }, [activeFilters]);

  const filtered = cars.filter((car: Car) =>
    matchesQuery(car) && matchesQuickFilter(car, quickFilter) && matchesModalFilters(car)
  );

  const chipCounts = React.useMemo(() => {
    const result: Record<QuickFilterKey, number> = {} as Record<QuickFilterKey, number>;
    for (const { key } of QUICK_FILTERS) {
      result[key] = cars.filter((car: Car) =>
        matchesQuery(car) && matchesQuickFilter(car, key) && matchesModalFilters(car)
      ).length;
    }
    return result;
  }, [cars, matchesQuery, matchesModalFilters]);

  const sortedFilters = React.useMemo(() => {
    const [allChip, ...rest] = QUICK_FILTERS;
    return [allChip, ...[...rest].sort((a, b) => (chipCounts[b.key] ?? 0) - (chipCounts[a.key] ?? 0))];
  }, [chipCounts]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!chipScrollRef.current) return;
      let x = CHIP_ROW_PADDING_LEFT;
      for (const { key } of sortedFilters) {
        if (key === quickFilter) break;
        x += (chipLayouts.current[key]?.width ?? 0) + CHIP_ROW_GAP;
      }
      chipScrollRef.current.scrollTo({ x: Math.max(0, x - 12), animated: true });
    }, 0);
    return () => clearTimeout(id);
  }, [quickFilter, sortedFilters]);

  const listData = React.useMemo(() => {
    const seeded = filtered.map((car) => ({
      car, k: [...car.id].reduce((s, ch) => (s * 33 + ch.charCodeAt(0)) >>> 0, 13),
    }));
    seeded.sort((a, b) => a.k - b.k);
    return seeded.map((x) => ({ type: "car" as const, item: x.car }));
  }, [filtered]);

  const hasFilters = !!activeFilters && (
    activeFilters.brands.length > 0 || activeFilters.models.length > 0 ||
    activeFilters.bodyTypes.length > 0 ||
    activeFilters.transmissions.length > 0 ||
    activeFilters.conditions.length > 0 || activeFilters.cities.length > 0 ||
    activeFilters.priceMin !== PRICE_MIN || activeFilters.priceMax !== PRICE_MAX ||
    activeFilters.yearMin !== YEAR_MIN || activeFilters.yearMax !== YEAR_MAX
  );

  const activeFilterChips = React.useMemo(() => {
    if (!activeFilters) return [];
    const chips: { key: string; label: string }[] = [];
    const { brands, models, transmissions, conditions, cities, bodyTypes, priceMin, priceMax, yearMin, yearMax } = activeFilters;
    if (bodyTypes.length === 1)          chips.push({ key: "bodyTypes",     label: bodyTypes[0] });
    else if (bodyTypes.length > 1)       chips.push({ key: "bodyTypes",     label: `${bodyTypes.length} body types` });
    if (brands.length === 1)             chips.push({ key: "brands",        label: brands[0] });
    else if (brands.length > 1)          chips.push({ key: "brands",        label: `${brands.length} brands` });
    if (models.length === 1)             chips.push({ key: "models",        label: models[0] });
    else if (models.length > 1)          chips.push({ key: "models",        label: `${models.length} models` });
    if (transmissions.length === 1)      chips.push({ key: "transmissions", label: transmissions[0] });
    else if (transmissions.length > 1)   chips.push({ key: "transmissions", label: `${transmissions.length} transmissions` });
    if (conditions.length === 1)         chips.push({ key: "conditions",    label: conditions[0] });
    else if (conditions.length > 1)      chips.push({ key: "conditions",    label: `${conditions.length} conditions` });
    if (cities.length === 1)             chips.push({ key: "cities",        label: cities[0] });
    else if (cities.length > 1)          chips.push({ key: "cities",        label: `${cities.length} cities` });
    if (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX) {
      const lo = `GHS ${priceMin.toLocaleString()}`;
      const hi = priceMax >= PRICE_MAX ? "Any" : `GHS ${priceMax.toLocaleString()}`;
      chips.push({ key: "price", label: `${lo} – ${hi}` });
    }
    if (yearMin !== YEAR_MIN || yearMax !== YEAR_MAX) {
      chips.push({ key: "year", label: `${yearMin} – ${yearMax >= YEAR_MAX ? "Any" : yearMax}` });
    }
    return chips;
  }, [activeFilters]);

  const removeFilter = React.useCallback((key: string) => {
    setActiveFilters((prev) => {
      if (!prev) return prev;
      let next: FilterState;
      if (key === "brands")             next = { ...prev, brands: [], models: [] };
      else if (key === "models")        next = { ...prev, models: [] };
      else if (key === "bodyTypes")     next = { ...prev, bodyTypes: [] };
      else if (key === "transmissions") next = { ...prev, transmissions: [] };
      else if (key === "conditions")    next = { ...prev, conditions: [] };
      else if (key === "cities")        next = { ...prev, cities: [] };
      else if (key === "year")          next = { ...prev, yearMin: YEAR_MIN, yearMax: YEAR_MAX };
      else                              next = { ...prev, priceMin: PRICE_MIN, priceMax: PRICE_MAX };
      const stillActive =
        next.brands.length > 0 || next.models.length > 0 || next.bodyTypes.length > 0 || next.transmissions.length > 0 ||
        next.conditions.length > 0 || next.cities.length > 0 ||
        next.priceMin !== PRICE_MIN || next.priceMax !== PRICE_MAX ||
        next.yearMin !== YEAR_MIN || next.yearMax !== YEAR_MAX;
      return stillActive ? next : null;
    });
  }, []);

  return (
    <View style={[S.root, { backgroundColor: "#EDF4F7" }]}>

      {/* ── Header ── */}
      <View style={[S.header, { paddingTop: topPad + 10, backgroundColor: "#FFFFFF", borderBottomColor: "#E2E8F0" }]}>
        <View style={S.titleRow}>
          <View>
            <Text style={S.eyebrow}>WESTCARS</Text>
            <Text style={[S.title, { color: colors.text }]}>Search</Text>
          </View>
          <View style={S.countPill}>
            <AnimatedCount value={filtered.length.toLocaleString()} style={S.countNum} />
            <Text style={S.countLbl}>cars</Text>
          </View>
        </View>

        <View style={S.searchRow}>
          <View style={[S.searchInput, { backgroundColor: "#F5FBFC", borderColor: "#E2E8F0" }]}>
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

        {activeFilterChips.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.activeChipRow}>
            {activeFilterChips.map(({ key, label }) => (
              <View key={key} style={[S.activeChip, { backgroundColor: colors.accentLight, borderColor: TEAL }]}>
                <Text style={[S.activeChipText, { color: TEAL }]}>{label}</Text>
                <Pressable onPress={() => removeFilter(key)} hitSlop={8}>
                  <Feather name="x" size={13} color={TEAL} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <ScrollView ref={chipScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.chipRow}>
          {sortedFilters.map(({ key, label, color }) => {
            const active  = quickFilter === key;
            const count   = chipCounts[key] ?? 0;
            const isEmpty = count === 0 && key !== "All";
            return (
              <Pressable
                key={key}
                onLayout={(e) => { chipLayouts.current[key] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width }; }}
                style={[
                  S.chip,
                  active
                    ? { backgroundColor: color }
                    : { backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderWidth: 1 },
                  isEmpty && !active && S.chipDimmed,
                ]}
                onPress={() => setQuickFilter(key)}
              >
                <Text style={[S.chipText, { color: active ? "#fff" : colors.textSecondary }]}>{label}</Text>
                <View style={[S.chipBadge, active ? S.chipBadgeActive : S.chipBadgeInactive]}>
                  <AnimatedCount
                    value={count >= 1000 ? `${Math.floor(count / 1000)}k` : count}
                    style={[S.chipBadgeText, { color: active ? "#fff" : colors.textSecondary }]}
                  />
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
        initial={activeFilters ?? DEFAULT_FILTERS}
      />
    </View>
  );
}

// ─── Search screen styles ─────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:   { flex: 1 },
  header: { paddingBottom: 10, borderBottomWidth: 1 },

  titleRow:  { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 18, marginBottom: 12 },
  eyebrow:   { fontSize: 11, fontFamily: "Inter_600SemiBold", color: TEAL, letterSpacing: 1.5, marginBottom: 2 },
  title:     { fontSize: 28, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.5 },

  countPill: { backgroundColor: TEAL, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center", marginTop: 4 },
  countNum:  { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  countLbl:  { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },

  searchRow:   { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10, marginBottom: 10 },
  searchInput: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, height: 46, minHeight: 46, gap: 10 },
  input:       { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },

  filterBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  filterDot: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff", borderWidth: 1.5, borderColor: TEAL },

  activeChipRow: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingBottom: 8 },
  activeChip:    { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1.5 },
  activeChipText:{ fontSize: 12, fontFamily: "Inter_600SemiBold" },

  chipRow:      { flexDirection: "row", gap: CHIP_ROW_GAP, paddingLeft: CHIP_ROW_PADDING_LEFT, paddingRight: 60, paddingBottom: 2 },
  chip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6 },
  chipDimmed:   { opacity: 0.38 },
  chipText:     { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chipBadge:    { borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, minWidth: 20, alignItems: "center" },
  chipBadgeActive:   { backgroundColor: "rgba(255,255,255,0.25)" },
  chipBadgeInactive: { backgroundColor: "rgba(255,255,255,0.08)" },
  chipBadgeText:     { fontSize: 10, fontFamily: "Inter_700Bold" },

  list:        { flex: 1 },
  listContent: { padding: 12, paddingBottom: 100 },
  row:         { flexDirection: "row", paddingHorizontal: 8, gap: 8, marginBottom: 8 },
  cardStyle:   { flex: 1 },

  empty:      { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub:   { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 40 },
  clearBtn:   { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: TEAL },
  clearBtnText:{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: TEAL },
});

// ─── Filter modal styles ──────────────────────────────────────────────────────
const fS = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.36)" },
  sheet:    { backgroundColor: "#EDF4F7", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "92%", overflow: "hidden" },
  handle:   { width: 36, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1", alignSelf: "center", marginTop: 12 },
  header:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  headerSpacer: { width: 48 },
  title:    { flex: 1, textAlign: "center", fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#0F172A" },
  resetTxt: { width: 48, textAlign: "right", fontSize: 14, color: TEAL, fontFamily: "Inter_600SemiBold" },
  scroll:   { paddingBottom: 8 },
  section:  { paddingHorizontal: 20, paddingVertical: 16 },
  secLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  divider:  { height: 1, backgroundColor: "#E2E8F0", marginHorizontal: 20 },

  priceInputRow:  { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 12 },
  priceInputBox:  { flex: 1 },
  priceCaption:   { fontSize: 11, color: "#8E8E93", fontFamily: "Inter_400Regular", marginBottom: 4 },
  priceDash:      { fontSize: 18, color: "#8E8E93", marginBottom: 10, alignSelf: "flex-end" },
  priceInput:     { height: 44, borderWidth: 1, borderColor: "#E5E5EA", borderRadius: 10, paddingHorizontal: 12, fontSize: 15, fontFamily: "Inter_500Medium", color: "#1C1C1E", backgroundColor: "#F9F9F9" },

  priceSummary:      { marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: "#F5FBFC", borderWidth: 1, borderColor: "#E2E8F0" },
  priceSummaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#8E8E93", marginBottom: 4 },
  priceSummaryValue: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },

  rangeWrap: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8FDFF",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.16)",
    marginBottom: 12,
  },
  rangeLabels: { flexDirection: "row", gap: 10, marginBottom: 18 },
  rangeValuePill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rangeValueLabel: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.5 },
  rangeValueText: { fontSize: 15, fontFamily: "Manrope_800ExtraBold", color: "#004D5A", marginTop: 2 },
  trackShell: { height: 42, justifyContent: "center", position: "relative" },
  trackBase: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#D9EEF3",
  },
  trackActive: {
    position: "absolute",
    height: 7,
    borderRadius: 99,
    backgroundColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  rangeSlider: {
    position: "absolute",
    left: -12,
    right: -12,
    height: 42,
  },
  rangeEnds: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  rangeEndText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#94A3B8" },

  presetsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  presetChip: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },

  brandGrid:      { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  brandItem:      { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
  brandActive:    { backgroundColor: TEAL, borderColor: TEAL },
  brandTxt:       { fontSize: 12, fontFamily: "Inter_500Medium", color: "#334155" },
  brandTxtActive: { color: "#fff" },

  showMore:    { marginTop: 10, alignItems: "center", paddingVertical: 6 },
  showMoreTxt: { fontSize: 13, color: TEAL, fontFamily: "Inter_600SemiBold" },

  chipsRow:     { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  horizontalChipsRow: { flexDirection: "row", gap: 8, paddingRight: 20 },
  chip:         { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
  chipActive:   { backgroundColor: TEAL, borderColor: TEAL },
  chipTxt:      { fontSize: 13, fontFamily: "Inter_500Medium", color: "#334155" },
  chipTxtActive:{ color: "#fff" },

  citySearchBox: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  citySearchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#0F172A" },
  cityList: { borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
  cityItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  cityItemActive: { backgroundColor: "#F0FCFE" },
  cityTxt: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#334155" },
  cityTxtActive: { color: "#004D5A", fontFamily: "Inter_700Bold" },

  bottom:   { flexDirection: "row", gap: 10, padding: 16, paddingBottom: 32, borderTopWidth: 1, borderTopColor: "#E2E8F0", backgroundColor: "#FFFFFF" },
  closeBtn: { flex: 1, height: 54, borderRadius: 14, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  closeTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#334155" },
  applyBtn: { flex: 2, height: 54, borderRadius: 14, backgroundColor: TEAL, alignItems: "center", justifyContent: "center", shadowColor: TEAL, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
  applyTxt: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
