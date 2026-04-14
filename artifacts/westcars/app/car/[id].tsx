import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { CarCard } from "@/components/CarCard";
import { EquipmentModal } from "@/components/EquipmentModal";
import { LocationMap } from "@/components/LocationMap";
import { ReportModal } from "@/components/ReportModal";
import { TrustScore } from "@/components/TrustScore";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { formatMileage, formatPrice } from "@/utils/ghanaData";

const { width } = Dimensions.get("window");

const QUICK_QUESTIONS = [
  "Still available?",
  "Trade-in possible?",
  "Can you discount?",
  "Test drive?",
  "Send more photos?",
];

const EQUIP_CATEGORIES = [
  { icon: "shield",          label: "Safety",     count: 14, iconColor: "#E53935", iconBg: "#FCE4EC",
    items: ["ABS", "Front airbags", "Side airbags", "Curtain airbags", "Hill start assist", "Electronic stability control", "Emergency brake assist", "Traction control", "Rear parking sensors", "Front parking sensors", "Collision warning", "Lane departure warning", "Blind spot monitoring", "Emergency call"] },
  { icon: "star",            label: "Comfort",    count: 20, iconColor: "#1565C0", iconBg: "#E3F2FD",
    items: ["Adaptive cruise control", "Dual-zone climate control", "Power windows", "Electric mirrors", "Heated front seats", "Heated rear seats", "Seat ventilation", "Memory seat", "Sunroof / panoramic", "Keyless entry & start", "Auto-folding mirrors", "Wireless charging", "Auto parking assist", "HUD display", "Power tailgate", "Soft-close doors", "Ambient lighting", "Heated steering wheel", "360° camera", "Rain-sensing wipers"] },
  { icon: "sun",             label: "Interior",   count: 14, iconColor: "#F59E0B", iconBg: "#FFF3E0",
    items: ["Leather upholstery", "3-spoke wheel", "Aluminium pedals", "Wood trim accents", "Leather dashboard", "Panoramic glass roof", "Rear window shade", "Power-adjust front seats", "Lumbar support", "Flat-fold rear seats", "Centre armrest", "Rear centre armrest", "Illuminated door sills", "Grab handles"] },
  { icon: "music",           label: "Multimedia", count: 7,  iconColor: "#7B1FA2", iconBg: "#F3E5F5",
    items: ["10.1\" touchscreen", "Apple CarPlay", "Android Auto", "Built-in GPS", "Bluetooth audio", "USB ports (2×)", "8-speaker premium system"] },
  { icon: "eye",             label: "Visibility", count: 6,  iconColor: "#0EB5CA", iconBg: "#E0F8FB",
    items: ["LED headlights", "LED daytime running", "LED rear lights", "Front fog lights", "Auto headlight", "High-beam assist"] },
  { icon: "layers",          label: "Exterior",   count: 3,  iconColor: "#2E7D32", iconBg: "#E8F5E9",
    items: ["18\" alloy wheels", "Rear roof spoiler", "Roof rails"] },
  { icon: "lock",            label: "Anti-theft", count: 2,  iconColor: "#37474F", iconBg: "#ECEFF1",
    items: ["Immobiliser", "Perimeter alarm"] },
  { icon: "more-horizontal", label: "Other",      count: 9,  iconColor: "#E65100", iconBg: "#FBE9E7",
    items: ["Tow hook", "Full-size spare wheel", "Car cover", "First aid kit", "Fire extinguisher", "Warning triangle set", "Vehicle tool kit", "GPS tracker", "Jump-start cables"] },
];

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars, toggleFavorite, isFavorite, startConversation, isAuthenticated,
          markAsSold, renewListing, reportItem, currentUser, getSellerTrustScore } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeImg, setActiveImg] = useState(0);
  const [message, setMessage] = useState("");
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [expandedEquip, setExpandedEquip] = useState<string | null>(null);

  const equipAnimVals = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(EQUIP_CATEGORIES.map((c) => [c.label, new Animated.Value(0)]))
  ).current;

  const toggleEquip = (label: string) => {
    const isOpen = expandedEquip === label;
    EQUIP_CATEGORIES.forEach((c) => {
      if (c.label !== label) {
        Animated.timing(equipAnimVals[c.label], { toValue: 0, duration: 160, useNativeDriver: false }).start();
      }
    });
    Animated.timing(equipAnimVals[label], {
      toValue: isOpen ? 0 : 1, duration: 200, useNativeDriver: false,
    }).start();
    setExpandedEquip(isOpen ? null : label);
  };

  const car = cars.find((c) => c.id === id);
  if (!car) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Car not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const fav = isFavorite(car.id);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) setActiveImg(viewableItems[0].index);
    }
  ).current;

  const handleMessage = (text?: string) => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to message the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    const convId = startConversation(car);
    router.push({ pathname: "/conversation/[id]", params: { id: convId } });
  };

  const handleCall = () => {
    const phone = car.seller?.phone || "+233000000000";
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() =>
      Alert.alert("Cannot open phone dialler.")
    );
  };

  const handleWhatsApp = () => {
    const raw = car.seller?.phone?.replace(/[\s+\-()]/g, "") || "233000000000";
    const phone = raw.startsWith("0") ? "233" + raw.slice(1) : raw;
    const msg = encodeURIComponent(
      `Hi, I'm interested in your ${car.year} ${car.brand} ${car.model} on Westcars. Still available?`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`)
    );
  };

  const related = cars
    .filter((c) => c.id !== car.id && (c.brand === car.brand || c.category === car.category))
    .slice(0, 4);

  const s = car.techSpecs;

  // Icon-based spec cells with color coding
  const specCells = [
    { icon: "calendar",     value: String(car.year),                              label: "Year",    iconColor: "#3B9EFF", iconBg: isDark ? "#1A2D44" : "#EDF4FF" },
    { icon: "activity",     value: `${Math.round(car.mileage / 1000)}k km`,       label: "Mileage", iconColor: "#22C55E", iconBg: isDark ? "#132313" : "#DCFCE7" },
    { icon: "zap",          value: car.fuelType,                                  label: "Fuel",    iconColor: "#F59E0B", iconBg: isDark ? "#2A1F0A" : "#FFF3E0" },
    { icon: "settings",     value: s?.gearbox?.split(" ")[0] || car.transmission, label: "Gearbox", iconColor: "#8B5CF6", iconBg: isDark ? "#1E1435" : "#F3E8FF" },
    { icon: "navigation-2", value: s?.drive?.split(" ")[0] || "AWD",              label: "Drive",   iconColor: "#0891B2", iconBg: isDark ? "#0A2030" : "#E0F2FE" },
    { icon: "droplet",      value: s?.color?.split(" ")[0] || "White",            label: "Color",   iconColor: "#EC4899", iconBg: isDark ? "#2A0A1A" : "#FCE7F3" },
  ];

  // Row-based additional specs — from real techSpecs
  const extraSpecs = [
    { label: "Trim", value: s?.trim || `${car.brand} Standard`, highlight: true },
    { label: "Body type", value: s?.bodyType || car.category || "SUV" },
    { label: "Owners", value: String(s?.owners ?? (car.condition === "New" ? 0 : 1)) },
    { label: "Annual tax", value: `GHS ${(s?.annualTax ?? Math.round(car.price * 0.002)).toLocaleString()}` },
  ];

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top Bar ── */}
        <View style={[styles.topBar, { paddingTop: topPad + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.background }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.topTitle, { color: colors.text }]} numberOfLines={1}>
              {car.brand} {car.model}, {car.year}
            </Text>
            <Text style={[styles.topPrice, { color: colors.textSecondary }]}>{formatPrice(car.price)}</Text>
          </View>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.background }]} onPress={() => toggleFavorite(car.id)}>
            <Feather name="heart" size={20} color={fav ? "#E8192C" : colors.textSecondary} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { backgroundColor: colors.background }]} onPress={() => setShowMore(true)}>
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* ── More Actions Dropdown ── */}
        {showMore && (
          <View style={[styles.moreDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {currentUser?.id === car.sellerId && !car.isSold && (
              <Pressable style={[styles.moreItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                Alert.alert("Mark as Sold", "Mark this listing as sold? Buyers will see it's no longer available.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Mark Sold", onPress: () => markAsSold(car.id) },
                ]);
              }}>
                <Feather name="check-circle" size={16} color="#22C55E" />
                <Text style={[styles.moreItemText, { color: "#22C55E" }]}>Mark as Sold</Text>
              </Pressable>
            )}
            {currentUser?.id === car.sellerId && (
              <Pressable style={[styles.moreItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                renewListing(car.id);
                Alert.alert("Listing Renewed", "Your listing is now active for another 30 days.");
              }}>
                <Feather name="refresh-cw" size={16} color="#0066CC" />
                <Text style={[styles.moreItemText, { color: "#0066CC" }]}>Renew Listing</Text>
              </Pressable>
            )}
            {currentUser?.id !== car.sellerId && (
              <Pressable style={[styles.moreItem, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => { setShowMore(false); setShowReport(true); }}>
                <Feather name="flag" size={16} color="#E53935" />
                <Text style={[styles.moreItemText, { color: "#E53935" }]}>Report Listing</Text>
              </Pressable>
            )}
            <Pressable style={styles.moreItem} onPress={() => setShowMore(false)}>
              <Feather name="x" size={16} color={colors.textTertiary} />
              <Text style={[styles.moreItemText, { color: colors.textTertiary }]}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* ── Image Gallery ── */}
        <View>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <View style={{ width, height: 256, backgroundColor: "#EDF4F7" }}>
                <Image
                  source={{ uri: item }}
                  style={{ width, height: 256 }}
                  resizeMode="cover"
                />
              </View>
            )}
          />
          {/* Counter */}
          <View style={styles.imgCounter}>
            <Feather name="image" size={11} color="#fff" />
            <Text style={styles.imgCounterText}>{activeImg + 1}/{car.images.length}</Text>
          </View>
          {/* Dots */}
          {car.images.length > 1 && (
            <View style={styles.dots}>
              {car.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* ── Auto.ru-style Key Specs Strip ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.keySpecsStrip, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        >
          <View style={styles.keySpecsRow}>
            {[
              { icon: "calendar",     label: "Year",     value: String(car.year) },
              { icon: "activity",     label: "Mileage",  value: `${Math.round(car.mileage / 1000)}k km` },
              { icon: "zap",          label: "Fuel",     value: car.fuelType },
              { icon: "settings",     label: "Gearbox",  value: (s?.gearbox || car.transmission).split(" ")[0] },
              { icon: "navigation-2", label: "Drive",    value: (s?.drive || "AWD").split(" ")[0] },
              { icon: "grid",         label: "Body",     value: s?.bodyType || car.category || "SUV" },
              { icon: "droplet",      label: "Color",    value: (s?.color || "White").split(" ")[0] },
              { icon: "users",        label: "Owners",   value: `${s?.owners ?? 1}` },
            ].map((spec, i, arr) => (
              <View key={spec.label} style={[styles.keySpecChip, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
                <View style={[styles.keySpecIconBubble, { backgroundColor: isDark ? "rgba(14,181,202,0.12)" : "rgba(14,181,202,0.08)" }]}>
                  <Feather name={spec.icon as any} size={13} color="#0EB5CA" />
                </View>
                <View>
                  <Text style={[styles.keySpecValue, { color: colors.text }]}>{spec.value}</Text>
                  <Text style={[styles.keySpecLabel, { color: colors.textTertiary }]}>{spec.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* ── Main Info ── */}
        <View style={[styles.mainCard, { backgroundColor: colors.card }]}>
          {/* Title + rating */}
          <Text style={[styles.carTitle, { color: colors.text }]}>{car.brand} {car.model}, {car.year}</Text>
          <View style={styles.ratingLine}>
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>Model rating</Text>
            <Feather name="star" size={13} color="#F4B400" />
            <Text style={[styles.ratingNum, { color: colors.text }]}>
              {car.seller?.rating?.toFixed(1) || "4.2"}
            </Text>
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              ({car.seller?.totalReviews || 1})
            </Text>
          </View>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={[styles.bigPrice, { color: colors.text }]}>{formatPrice(car.price)}</Text>
            <Feather name="trending-down" size={16} color="#43A047" style={{ marginLeft: 4 }} />
            <View style={styles.fairBadge}>
              <Text style={styles.fairBadgeText}>Fair price</Text>
            </View>
          </View>

          {/* Credit line */}
          <Text style={styles.creditLine}>
            Credit from GHS {Math.round(car.price / 60).toLocaleString()}/month
          </Text>

          {/* Car history banner */}
          <View style={[styles.historyBanner, { backgroundColor: isDark ? "rgba(14,181,202,0.10)" : "rgba(14,181,202,0.08)", borderColor: isDark ? "rgba(14,181,202,0.25)" : "rgba(14,181,202,0.22)" }]}>
            <View style={styles.historyIcon}>
              <Feather name="check-square" size={18} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>Car history — free</Text>
              <Text style={[styles.historySub, { color: colors.textSecondary }]}>Contact seller and we'll send a full report</Text>
            </View>
          </View>

          {/* Date + views */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaDate, { color: colors.textSecondary }]}>Listed in {car.location}</Text>
            <View style={styles.metaViews}>
              <Feather name="eye" size={12} color={colors.textTertiary} />
              <Text style={[styles.metaViewsText, { color: colors.textSecondary }]}>
                {car.views || 0} ({Math.floor((car.views || 0) * 0.08)} today)
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Specifications ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>

          {/* Section header */}
          <View style={styles.specHeader}>
            <View style={[styles.specHeaderAccent, { backgroundColor: "#0EB5CA" }]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Specifications</Text>
          </View>

          {/* 2-column premium stat cards — explicit rows (no flexWrap) for native */}
          {([0, 2, 4] as const).map((rowStart) => (
            <View key={rowStart} style={styles.specRow}>
              {specCells.slice(rowStart, rowStart + 2).map((sc) => (
                <View
                  key={sc.label}
                  style={[styles.specCard, {
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#fff",
                    borderColor: isDark ? "rgba(255,255,255,0.08)" : sc.iconBg,
                  }]}
                >
                  {/* Colored bottom accent */}
                  <View style={[styles.specCardBottomAccent, { backgroundColor: sc.iconColor }]} />
                  {/* Icon bubble */}
                  <View style={[styles.specCardIconWrap, { backgroundColor: sc.iconBg }]}>
                    <Feather name={sc.icon as any} size={22} color={sc.iconColor} />
                  </View>
                  {/* Value */}
                  <Text style={[styles.specCardValue, { color: colors.text }]} numberOfLines={1}>
                    {sc.value}
                  </Text>
                  {/* Label */}
                  <Text style={[styles.specCardLabel, { color: colors.textTertiary }]}>
                    {sc.label.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {/* Mileage visual bar */}
          <View style={[styles.mileageBarWrap, {
            backgroundColor: isDark ? "rgba(14,181,202,0.07)" : "rgba(14,181,202,0.05)",
            borderColor: isDark ? "rgba(14,181,202,0.15)" : "rgba(14,181,202,0.16)",
          }]}>
            <View style={styles.mileageBarHeader}>
              <Feather name="activity" size={13} color="#22C55E" />
              <Text style={[styles.mileageBarLabel, { color: colors.textSecondary }]}>Mileage overview</Text>
              <Text style={[styles.mileageBarValue, { color: "#22C55E" }]}>{formatMileage(car.mileage)}</Text>
            </View>
            <View style={[styles.mileageTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)" }]}>
              <LinearGradient
                colors={["#22C55E", "#0EB5CA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.mileageFill,
                  { width: Math.max(8, (width - 80) * Math.min(car.mileage / 300000, 1)) },
                ]}
              />
            </View>
            <View style={styles.mileageScale}>
              <Text style={[styles.mileageScaleText, { color: colors.textTertiary }]}>0</Text>
              <Text style={[styles.mileageScaleText, { color: colors.textTertiary }]}>150k km</Text>
              <Text style={[styles.mileageScaleText, { color: colors.textTertiary }]}>300k km</Text>
            </View>
          </View>

          {/* Key-value detail table */}
          <View style={[styles.detailTable, { borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(14,181,202,0.12)" }]}>
            {extraSpecs.map((sp, i) => (
              <View
                key={sp.label}
                style={[
                  styles.detailRow,
                  i < extraSpecs.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(14,181,202,0.10)" },
                ]}
              >
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{sp.label}</Text>
                {sp.highlight ? (
                  <View style={styles.detailBadge}>
                    <Text style={styles.detailBadgeText}>{sp.value}</Text>
                  </View>
                ) : (
                  <Text style={[styles.detailValue, { color: colors.text }]}>{sp.value}</Text>
                )}
              </View>
            ))}
          </View>

          {/* Full specs CTA */}
          <Pressable
            style={styles.fullSpecsBtn}
            onPress={() => router.push({ pathname: "/full-specs/[id]", params: { id: car.id } })}
          >
            <LinearGradient
              colors={["#0EB5CA", "#0098AA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fullSpecsBtnGradient}
            >
              <Text style={styles.fullSpecsBtnText}>View Full Specifications</Text>
              <Feather name="chevron-right" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Ask the Seller ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ask the seller</Text>

          <View style={[styles.messageBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.messageInput, { color: colors.text }]}
              placeholder="Hello, can you send the car report?"
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Pressable style={styles.sendBtn} onPress={() => handleMessage(message)}>
              <Feather name="send" size={18} color={colors.accent} />
            </Pressable>
          </View>

          {/* Quick reply chips */}
          <View style={styles.quickChips}>
            {QUICK_QUESTIONS.map((q) => (
              <Pressable
                key={q}
                style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border },
                  message === q && { backgroundColor: colors.text, borderColor: colors.text }]}
                onPress={() => setMessage(q)}
              >
                <Text style={[styles.quickChipText, { color: colors.text },
                  message === q && { color: colors.card }]}>
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Equipment ── */}
        <View style={[styles.card, { backgroundColor: colors.card, paddingHorizontal: 0, paddingVertical: 0, overflow: "hidden" }]}>
          {/* Section header */}
          <View style={[styles.specHeader, { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }]}>
            <View style={[styles.specHeaderAccent, { backgroundColor: "#0EB5CA" }]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Equipment</Text>
          </View>

          {/* Animated accordion categories */}
          {EQUIP_CATEGORIES.map((cat, idx) => {
            const isOpen = expandedEquip === cat.label;
            const maxH = equipAnimVals[cat.label].interpolate({
              inputRange: [0, 1],
              outputRange: [0, cat.count * 44 + 20],
            });
            const opac = equipAnimVals[cat.label];
            return (
              <View key={cat.label} style={[styles.equipAccordionBlock, idx === 0 && styles.equipAccordionFirst]}>
                <Pressable
                  style={[styles.equipAccordionHeader, isOpen && { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#FAFEFF" }]}
                  onPress={() => toggleEquip(cat.label)}
                  android_ripple={{ color: "rgba(0,0,0,0.04)" }}
                >
                  <View style={[styles.equipAccordionIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : cat.iconBg }]}>
                    <Feather name={cat.icon as any} size={19} color={cat.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.equipAccordionLabel, { color: colors.text }]}>{cat.label}</Text>
                    <Text style={[styles.equipAccordionCount, { color: cat.iconColor }]}>{cat.count} items</Text>
                  </View>
                  <View style={[styles.equipAccordionBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : cat.iconBg }]}>
                    <Text style={[styles.equipAccordionBadgeText, { color: cat.iconColor }]}>{cat.count}</Text>
                  </View>
                  <Animated.View style={{
                    marginLeft: 10,
                    transform: [{
                      rotate: equipAnimVals[cat.label].interpolate({
                        inputRange: [0, 1], outputRange: ["0deg", "180deg"],
                      }),
                    }],
                  }}>
                    <Feather name="chevron-down" size={17} color={colors.textTertiary} />
                  </Animated.View>
                </Pressable>

                <Animated.View style={{ maxHeight: maxH, opacity: opac, overflow: "hidden" }}>
                  <View style={[styles.equipItemsList, { borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "#F0F0F0" }]}>
                    {cat.items.map((item, i) => (
                      <View
                        key={item}
                        style={[
                          styles.equipItemRow,
                          i < cat.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#F5F5F5" },
                        ]}
                      >
                        <View style={[styles.equipItemCheck, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : cat.iconBg }]}>
                          <Feather name="check" size={11} color={cat.iconColor} />
                        </View>
                        <Text style={[styles.equipItemText, { color: colors.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </View>
            );
          })}

          {/* All Options gradient CTA */}
          <Pressable style={[styles.fullSpecsBtn, { marginHorizontal: 16, marginBottom: 16, marginTop: 12 }]} onPress={() => setShowEquipment(true)}>
            <LinearGradient
              colors={["#0EB5CA", "#0098AA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fullSpecsBtnGradient}
            >
              <Feather name="list" size={16} color="#fff" />
              <Text style={styles.fullSpecsBtnText}>All Options ({EQUIP_CATEGORIES.reduce((a, c) => a + c.count, 0)} items)</Text>
              <Feather name="chevron-right" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Description ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{car.description}</Text>
        </View>

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Sold Banner ── */}
        {car.isSold && (
          <View style={styles.soldBanner}>
            <Feather name="check-circle" size={18} color="#fff" />
            <Text style={styles.soldBannerText}>This car has been sold</Text>
          </View>
        )}

        {/* ── Seller Info ── */}
        {car.seller && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Seller</Text>
            <Pressable
              style={styles.sellerRow}
              onPress={() => router.push({ pathname: "/user/[id]", params: { id: car.seller!.id } })}
            >
              {car.seller.avatar ? (
                <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
              ) : (
                <View style={[styles.sellerAvatarFallback, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Feather name="user" size={22} color={colors.textTertiary} />
                </View>
              )}
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.sellerName, { color: colors.text }]}>{car.seller.name}</Text>
                </View>
                <VerificationBadges user={car.seller} size="sm" />
                <Text style={[styles.sellerType, { color: colors.textSecondary }]}>
                  {car.seller.isDealer ? "Dealer" : "Private seller"} · Usually replies fast
                </Text>
                <View style={styles.sellerStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Feather
                      key={s}
                      name="star"
                      size={12}
                      color={s <= Math.round(car.seller!.rating) ? "#F4B400" : colors.border}
                    />
                  ))}
                  <Text style={[styles.sellerRatingText, { color: colors.textSecondary }]}>
                    {car.seller.rating.toFixed(1)} · {car.seller.totalReviews} reviews
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textTertiary} />
            </Pressable>

            {/* Trust Score */}
            <View style={styles.trustScoreWrap}>
              <TrustScore score={getSellerTrustScore(car.seller)} size="md" />
            </View>
          </View>
        )}

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Recommendations 2×2 Grid ── */}
        {related.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>We recommend</Text>
            <View style={styles.recsGrid}>
              {Array.from({ length: Math.ceil(Math.min(related.length, 4) / 2) }, (_, i) => {
                const left = related[i * 2];
                const right = related[i * 2 + 1];
                return (
                  <View key={i} style={styles.recsRow}>
                    <CarCard car={left} style={styles.recCarCard} />
                    {right
                      ? <CarCard car={right} style={styles.recCarCard} />
                      : <View style={styles.recCarCard} />
                    }
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={[styles.sep, { backgroundColor: colors.background }]} />

        {/* ── Location ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Location</Text>
          <LocationMap location={car.location} />
        </View>

        <View style={{ height: 100 + (insets.bottom || 0) }} />
      </ScrollView>

      {/* Equipment full-list modal */}
      <EquipmentModal
        visible={showEquipment}
        trimName={`${car.brand} Standard`}
        onClose={() => setShowEquipment(false)}
      />

      {/* Report modal */}
      <ReportModal
        visible={showReport}
        targetId={car.id}
        targetType="listing"
        targetName={`${car.brand} ${car.model}`}
        onClose={() => setShowReport(false)}
      />

      {/* ── Bottom Sticky Bar ── */}
      <View
        style={[
          styles.stickyBar,
          {
            paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 28 : 8),
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        ]}
      >
        {/* Call button */}
        <Pressable
          style={({ pressed }) => [styles.stickyBtn, styles.callBtn, pressed && { opacity: 0.88 }]}
          onPress={handleCall}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <View style={styles.stickyBtnIcon}>
            <Feather name="phone" size={18} color="#fff" />
          </View>
          <View style={styles.stickyBtnText}>
            <Text style={styles.stickyBtnLabel}>Call Seller</Text>
            <Text style={styles.stickyBtnSub}>9:00 – 21:00</Text>
          </View>
        </Pressable>

        {/* Chat button */}
        <Pressable
          style={({ pressed }) => [styles.stickyBtn, styles.chatBtn, pressed && { opacity: 0.88 }]}
          onPress={() => handleMessage()}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <View style={styles.stickyBtnIcon}>
            <Feather name="message-circle" size={18} color="#fff" />
          </View>
          <View style={styles.stickyBtnText}>
            <Text style={styles.stickyBtnLabel}>Chat</Text>
            <Text style={styles.stickyBtnSub}>Usually fast</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  notFoundText: { fontSize: 16, color: Colors.light.textSecondary, fontFamily: "Manrope_500Medium" },
  backLink: { fontSize: 14, color: "#0066CC", fontFamily: "Manrope_500Medium" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    gap: 4,
  },
  iconBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20,
  },
  topTitle: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#1A1A1A",
    lineHeight: 18,
  },
  topPrice: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#6B6B6B",
  },

  // Gallery
  imgCounter: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  imgCounterText: { color: "#fff", fontSize: 12, fontFamily: "Manrope_500Medium" },
  dots: {
    position: "absolute", bottom: 12, alignSelf: "center",
    flexDirection: "row", gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 16 },

  // Main info
  mainCard: { backgroundColor: "#fff", padding: 16, gap: 10 },
  carTitle: { fontSize: 20, fontFamily: "Manrope_700Bold", color: "#1A1A1A", letterSpacing: -0.3 },
  ratingLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: { fontSize: 13, color: "#6B6B6B", fontFamily: "Manrope_400Regular" },
  ratingNum: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  ratingCount: { fontSize: 12, color: "#9E9E9E", fontFamily: "Manrope_400Regular" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bigPrice: {
    fontSize: 28, fontFamily: "Manrope_700Bold",
    color: "#1A1A1A", letterSpacing: -0.5,
  },
  fairBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 4,
  },
  fairBadgeText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: "#2E7D32" },
  creditLine: { fontSize: 13, color: "#0066CC", fontFamily: "Manrope_500Medium" },
  historyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFDE7",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FFF9C4",
  },
  historyIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F3E8FF",
    alignItems: "center", justifyContent: "center",
  },
  historyTitle: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  historySub: { fontSize: 11, color: "#6B6B6B", fontFamily: "Manrope_400Regular", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaDate: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular" },
  metaViews: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaViewsText: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular" },

  sep: { height: 8 },
  card: {
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontFamily: "Manrope_700Bold" },

  // ── Specs redesign ──
  specHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  specHeaderAccent: { width: 4, height: 22, borderRadius: 2 },

  // Explicit rows — no flexWrap for native reliability
  specRow: { flexDirection: "row", gap: 10, marginBottom: 10 },

  // Vertical premium stat card
  specCard: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 8,
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
    gap: 6,
    elevation: 3,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  specCardBottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  specCardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  specCardValue: { fontSize: 16, fontFamily: "Manrope_700Bold", textAlign: "center" },
  specCardLabel: { fontSize: 9, fontFamily: "Manrope_600SemiBold", letterSpacing: 1.2, textAlign: "center" },

  // Mileage bar
  mileageBarWrap: { borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 12, borderWidth: 1 },
  mileageBarHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  mileageBarLabel: { flex: 1, fontSize: 12, fontFamily: "Manrope_500Medium" },
  mileageBarValue: { fontSize: 13, fontFamily: "Manrope_700Bold" },
  mileageTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  mileageFill: { height: 8, borderRadius: 4 },
  mileageScale: { flexDirection: "row", justifyContent: "space-between" },
  mileageScaleText: { fontSize: 9, fontFamily: "Manrope_400Regular" },

  // Detail table
  detailTable: { borderRadius: 14, overflow: "hidden", marginBottom: 14, borderWidth: 1 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  detailLabel: { fontSize: 13, fontFamily: "Manrope_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  detailBadge: {
    backgroundColor: "rgba(14,181,202,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  detailBadgeText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: "#0098AA" },

  // Full specs button
  fullSpecsBtn: { borderRadius: 14, overflow: "hidden" },
  fullSpecsBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    gap: 8,
  },
  fullSpecsBtnText: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#fff", letterSpacing: 0.2 },

  // Ask seller
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  messageInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    color: "#1A1A1A",
    minHeight: 40,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36, height: 36,
    alignItems: "center", justifyContent: "center",
  },
  quickChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  quickChipActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  quickChipText: { fontSize: 13, fontFamily: "Manrope_400Regular", color: "#1A1A1A" },
  quickChipTextActive: { color: "#fff", fontFamily: "Manrope_500Medium" },

  // ── Key Specs Strip (auto.ru style) ──
  keySpecsStrip: { borderBottomWidth: 1 },
  keySpecsRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 4 },
  keySpecChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  keySpecIconBubble: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  keySpecValue: { fontSize: 13, fontFamily: "Manrope_700Bold" },
  keySpecLabel: { fontSize: 10, fontFamily: "Manrope_400Regular", marginTop: 1 },

  // ── Equipment accordion ──
  equipAccordionBlock: {
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  equipAccordionFirst: {
    borderTopWidth: 0,
  },
  equipAccordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 13,
  },
  equipAccordionIcon: {
    width: 44, height: 44, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  equipAccordionLabel: { fontSize: 14, fontFamily: "Manrope_700Bold" },
  equipAccordionCount: { fontSize: 11, fontFamily: "Manrope_500Medium", marginTop: 2 },
  equipAccordionBadge: {
    minWidth: 28, paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 10, alignItems: "center",
  },
  equipAccordionBadgeText: { fontSize: 12, fontFamily: "Manrope_700Bold" },
  equipItemsList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  equipItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 13,
  },
  equipItemCheck: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  equipItemText: { flex: 1, fontSize: 13, fontFamily: "Manrope_500Medium", lineHeight: 18 },

  // Description
  description: { fontSize: 14, color: "#6B6B6B", fontFamily: "Manrope_400Regular", lineHeight: 22 },

  // Seller
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: { width: 52, height: 52, borderRadius: 26 },
  sellerAvatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  sellerName: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  sellerType: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular", marginTop: 1 },
  sellerStars: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  sellerRatingText: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular", marginLeft: 4 },

  // Recommendations 2×2 grid
  recsGrid: {
    marginHorizontal: -16,
    gap: 0,
  },
  recsRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 8,
  },
  recCarCard: { flex: 1, marginBottom: 10 },

  // Location
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationText: { fontSize: 14, color: "#1A1A1A", fontFamily: "Manrope_400Regular" },
  mapPlaceholder: {
    height: 120, backgroundColor: "#F5F5F5", borderRadius: 8,
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  mapPlaceholderText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },

  // Bottom sticky bar
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  // Shared base for both buttons — flex:1 makes them equal width
  stickyBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 14,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  callBtn: {
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
  },
  chatBtn: {
    backgroundColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
  },
  stickyBtnIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  stickyBtnText: { gap: 1 },
  stickyBtnLabel: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
    letterSpacing: 0.1,
  },
  stickyBtnSub: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.80)",
  },

  // More dropdown
  moreDropdown: {
    position: "absolute", top: 55, right: 8, zIndex: 99,
    backgroundColor: "#fff",
    borderRadius: 14, borderWidth: 1, borderColor: "#E8E8E8",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
    minWidth: 180, overflow: "hidden",
  },
  moreItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  moreItemText: { fontSize: 14, fontFamily: "Manrope_500Medium" },

  // Sold banner
  soldBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#22C55E",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  soldBannerText: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#fff" },

  // Trust score wrapper inside seller card
  trustScoreWrap: {
    marginTop: 8, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#F0F0F0",
  },
});
