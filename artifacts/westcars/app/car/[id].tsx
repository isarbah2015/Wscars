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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { CarGenomics } from "@/components/CarGenomics";
import { EquipmentModal } from "@/components/EquipmentModal";
import { LocationMap } from "@/components/LocationMap";
import { ReportModal } from "@/components/ReportModal";
import { TrustScore } from "@/components/TrustScore";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice } from "@/utils/ghanaData";

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
  { icon: "eye",             label: "Visibility", count: 6,  iconColor: "#FF6B00", iconBg: "#FFF1E5",
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
  const flatListRef = useRef<FlatList>(null);
  const [message, setMessage] = useState("");
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
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Car not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const fav = isFavorite(car.id);
  const s = car.techSpecs;

  const handleCarouselScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (width || 400));
    if (idx >= 0 && idx !== activeImg) setActiveImg(idx);
  };

  const handleMessage = async (text?: string) => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to message the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    const convId = await startConversation(car);
    router.push({ pathname: "/conversation/[id]", params: { id: convId } });
  };

  const handleCall = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to contact the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    const phone = car.seller?.phone || "+233000000000";
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() =>
      Alert.alert("Cannot open phone dialler.")
    );
  };

  const handleWhatsApp = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to contact the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
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
    .slice(0, 6);

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);
  const bottomPad = (insets.bottom || 0) + (Platform.OS === "web" ? 20 : 8);

  // 4 main spec cells matching reference design
  const mainSpecs = [
    { icon: "activity",  value: `${Math.round(car.mileage / 1000)}k km`, label: "Mileage" },
    { icon: "zap",       value: car.fuelType,                             label: "Fuel" },
    { icon: "settings",  value: (s?.gearbox || car.transmission).split(" ")[0], label: "Gearbox" },
    { icon: "users",     value: `${s?.seats ?? 5}`,                      label: "Seats" },
  ];

  const bg = isDark ? colors.background : "#F5F5F5";
  const card = isDark ? colors.card : "#FFFFFF";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Top Bar ── */}
        <View style={[styles.topBar, { paddingTop: topPad + 6, backgroundColor: card, borderBottomColor: isDark ? colors.border : "#F0F0F0" }]}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <Text style={[styles.topBarTitle, { color: colors.text }]} numberOfLines={1}>
              {car.brand} {car.model}
            </Text>
            <Text style={[styles.topBarSub, { color: colors.textTertiary }]} numberOfLines={1}>
              {car.year} · {car.location}
            </Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => toggleFavorite(car.id)} hitSlop={8}>
            <Feather name="heart" size={20} color={fav ? "#E8192C" : colors.textSecondary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setShowMore(v => !v)} hitSlop={8}>
            <Feather name="more-vertical" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* ── More Dropdown ── */}
        {showMore && (
          <View style={[styles.moreDropdown, { backgroundColor: card, borderColor: isDark ? colors.border : "#EEEEEE" }]}>
            {currentUser?.id === car.sellerId && !car.isSold && (
              <Pressable style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                Alert.alert("Mark as Sold", "Mark this listing as sold?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Mark Sold", onPress: () => markAsSold(car.id) },
                ]);
              }}>
                <Feather name="check-circle" size={16} color="#22C55E" />
                <Text style={[styles.moreItemText, { color: "#22C55E" }]}>Mark as Sold</Text>
              </Pressable>
            )}
            {currentUser?.id === car.sellerId && (
              <Pressable style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                renewListing(car.id);
                Alert.alert("Listing Renewed", "Your listing is active for another 30 days.");
              }}>
                <Feather name="refresh-cw" size={16} color="#0066CC" />
                <Text style={[styles.moreItemText, { color: "#0066CC" }]}>Renew Listing</Text>
              </Pressable>
            )}
            {currentUser?.id !== car.sellerId && (
              <Pressable style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => { setShowMore(false); setShowReport(true); }}>
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

        {/* ── Sold Banner ── */}
        {car.isSold && (
          <View style={styles.soldBanner}>
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.soldBannerText}>This car has been sold</Text>
          </View>
        )}

        {/* ── Image Gallery ── */}
        <View style={{ backgroundColor: isDark ? "#0B1120" : "#EFEFEF" }}>
          <FlatList
            ref={flatListRef}
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onScroll={handleCarouselScroll}
            onMomentumScrollEnd={handleCarouselScroll}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: 270 }} resizeMode="cover" />
            )}
          />

          {/* Arrows + counter + dots */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            {activeImg > 0 && (
              <Pressable style={styles.arrowLeft} onPress={() => {
                const n = activeImg - 1; setActiveImg(n);
                flatListRef.current?.scrollToIndex({ index: n, animated: true });
              }}>
                <View style={styles.arrowBg}><Feather name="chevron-left" size={20} color="#fff" /></View>
              </Pressable>
            )}
            {activeImg < car.images.length - 1 && (
              <Pressable style={styles.arrowRight} onPress={() => {
                const n = activeImg + 1; setActiveImg(n);
                flatListRef.current?.scrollToIndex({ index: n, animated: true });
              }}>
                <View style={styles.arrowBg}><Feather name="chevron-right" size={20} color="#fff" /></View>
              </Pressable>
            )}
            {/* Counter pill */}
            <View style={styles.imgCounter}>
              <Feather name="image" size={11} color="#fff" />
              <Text style={styles.imgCounterText}>{activeImg + 1}/{car.images.length}</Text>
            </View>
            {/* Dots */}
            {car.images.length > 1 && (
              <View style={styles.dots}>
                {car.images.map((_, i) => (
                  <Pressable key={i} hitSlop={8} onPress={() => {
                    setActiveImg(i);
                    flatListRef.current?.scrollToIndex({ index: i, animated: true });
                  }}>
                    <View style={[styles.dot, i === activeImg && styles.dotActive]} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ── Title + Stars + Condition tags ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          {/* Condition tags */}
          <View style={styles.tagRow}>
            <View style={styles.tagDark}>
              <Feather name="trending-down" size={11} color="#fff" />
              <Text style={styles.tagDarkText}>Fair price</Text>
            </View>
            <View style={[styles.tagOutline, { borderColor: isDark ? colors.border : "#DDDDDD" }]}>
              <Text style={[styles.tagOutlineText, { color: colors.textSecondary }]}>{car.condition}</Text>
            </View>
          </View>

          {/* Brand · Year */}
          <Text style={[styles.brandYear, { color: colors.textTertiary }]}>
            {car.brand.toUpperCase()} · {car.year}
          </Text>

          {/* Model name — large bold */}
          <Text style={[styles.modelName, { color: colors.text }]}>
            {car.model} {s?.drive?.split(" ")[0] || ""}
          </Text>

          {/* Star rating */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Feather
                key={n}
                name="star"
                size={16}
                color={n <= Math.round(car.seller?.rating ?? 4) ? "#FF6B00" : (isDark ? "#333" : "#E0E0E0")}
              />
            ))}
            <Text style={[styles.ratingNum, { color: colors.text }]}>
              {(car.seller?.rating ?? 4.2).toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: colors.textTertiary }]}>
              ({car.seller?.totalReviews ?? 1} reviews)
            </Text>
          </View>

          {/* ── 4 Spec cells ── */}
          <View style={[styles.specStrip, { borderColor: isDark ? colors.border : "#F0F0F0" }]}>
            {mainSpecs.map((spec, i) => (
              <View
                key={spec.label}
                style={[
                  styles.specCell,
                  i < mainSpecs.length - 1 && { borderRightWidth: 1, borderRightColor: isDark ? colors.border : "#F0F0F0" },
                ]}
              >
                <Feather name={spec.icon as any} size={22} color={colors.text} style={{ marginBottom: 6 }} />
                <Text style={[styles.specValue, { color: colors.text }]}>{spec.value}</Text>
                <Text style={[styles.specLabel, { color: colors.textTertiary }]}>{spec.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Price Section ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          {/* Price + badge */}
          <View style={styles.priceRow}>
            <Text style={[styles.bigPrice, { color: colors.text }]}>{formatPrice(car.price)}</Text>
            <View style={styles.fairBadge}>
              <Feather name="trending-down" size={12} color="#fff" />
              <Text style={styles.fairBadgeText}>Fair price</Text>
            </View>
          </View>

          {/* Credit line */}
          <Text style={styles.creditLine}>
            Credit from GHS {Math.round(car.price / 60).toLocaleString()}/month
          </Text>

          {/* Negotiable + views row */}
          <View style={styles.metaRow}>
            <View style={[styles.negotiableTag, { borderColor: isDark ? colors.border : "#CCCCCC" }]}>
              <Text style={[styles.negotiableText, { color: colors.textSecondary }]}>Negotiable</Text>
            </View>
            <View style={styles.viewsRow}>
              <Feather name="eye" size={13} color={colors.textTertiary} />
              <Text style={[styles.viewsText, { color: colors.textTertiary }]}>
                {(car.views || 0).toLocaleString()} views · {Math.floor((car.views || 0) * 0.08)} today
              </Text>
            </View>
          </View>

          {/* History banner */}
          <Pressable
            style={[styles.historyBanner, { backgroundColor: isDark ? "#1E293B" : "#F8F8F8" }]}
            onPress={() => handleMessage("Hi, can you send the car history report?")}
          >
            <View style={styles.historyIconWrap}>
              <Feather name="check-square" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>Car history — free</Text>
              <Text style={[styles.historySub, { color: colors.textTertiary }]}>Contact seller and we'll send a full report</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Full Specs / CarGenomics ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Full specifications</Text>
          <CarGenomics brand={car.brand} model={car.model} />
          <Pressable
            style={styles.specsBtn}
            onPress={() => router.push({ pathname: "/full-specs/[id]", params: { id: car.id } })}
          >
            <Text style={styles.specsBtnText}>View all specifications</Text>
            <Feather name="chevron-right" size={16} color="#0EB5CA" />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Ask the Seller ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ask the seller</Text>
          <View style={[styles.messageBox, { backgroundColor: isDark ? colors.background : "#F8F8F8", borderColor: isDark ? colors.border : "#EEEEEE" }]}>
            <TextInput
              style={[styles.messageInput, { color: colors.text }]}
              placeholder="Hello, can you send the car report?"
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Pressable
              style={styles.sendBtn}
              onPress={() => { if (message.trim()) handleMessage(message); }}
            >
              <View style={styles.sendBtnInner}>
                <Feather name="send" size={16} color="#fff" />
              </View>
            </Pressable>
          </View>
          <View style={styles.quickChips}>
            {QUICK_QUESTIONS.map((q) => (
              <Pressable
                key={q}
                style={[
                  styles.quickChip,
                  { borderColor: message === q ? colors.text : (isDark ? colors.border : "#DDDDDD") },
                  message === q && { backgroundColor: colors.text },
                ]}
                onPress={() => setMessage(q)}
              >
                <Text style={[styles.quickChipText, { color: message === q ? card : colors.textSecondary }]}>
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Equipment Accordion ── */}
        <View style={[styles.section, { backgroundColor: card, paddingHorizontal: 0, paddingVertical: 0 }]}>
          <View style={{ paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12 }}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipment</Text>
          </View>
          {EQUIP_CATEGORIES.map((cat, idx) => {
            const isOpen = expandedEquip === cat.label;
            const maxH = equipAnimVals[cat.label].interpolate({
              inputRange: [0, 1], outputRange: [0, cat.count * 44 + 20],
            });
            return (
              <View key={cat.label} style={{ borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: isDark ? colors.border : "#F0F0F0" }}>
                <Pressable
                  style={[styles.equipHeader, isOpen && { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#FAFAFA" }]}
                  onPress={() => toggleEquip(cat.label)}
                  android_ripple={{ color: "rgba(0,0,0,0.04)" }}
                >
                  <View style={[styles.equipIconWrap, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : cat.iconBg }]}>
                    <Feather name={cat.icon as any} size={18} color={cat.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.equipCatLabel, { color: colors.text }]}>{cat.label}</Text>
                    <Text style={[styles.equipCatCount, { color: cat.iconColor }]}>{cat.count} items</Text>
                  </View>
                  <View style={[styles.equipBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : cat.iconBg }]}>
                    <Text style={[styles.equipBadgeText, { color: cat.iconColor }]}>{cat.count}</Text>
                  </View>
                  <Animated.View style={{
                    marginLeft: 10,
                    transform: [{ rotate: equipAnimVals[cat.label].interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }],
                  }}>
                    <Feather name="chevron-down" size={16} color={colors.textTertiary} />
                  </Animated.View>
                </Pressable>
                <Animated.View style={{ maxHeight: maxH, overflow: "hidden" }}>
                  <View style={{ paddingHorizontal: 18, paddingVertical: 6, borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#F5F5F5" }}>
                    {cat.items.map((item, i) => (
                      <View key={item} style={[styles.equipItem, i < cat.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F8F8F8" }]}>
                        <View style={[styles.equipItemCheck, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : cat.iconBg }]}>
                          <Feather name="check" size={10} color={cat.iconColor} />
                        </View>
                        <Text style={[styles.equipItemText, { color: colors.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </View>
            );
          })}
          <Pressable style={styles.allEquipBtn} onPress={() => setShowEquipment(true)}>
            <Feather name="list" size={15} color="#0EB5CA" />
            <Text style={styles.allEquipBtnText}>
              All options ({EQUIP_CATEGORIES.reduce((a, c) => a + c.count, 0)} items)
            </Text>
            <Feather name="chevron-right" size={15} color="#0EB5CA" />
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Description ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{car.description}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Seller Card ── */}
        {car.seller && (
          <View style={[styles.section, { backgroundColor: card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Seller</Text>
            <Pressable
              style={styles.sellerRow}
              onPress={() => router.push({ pathname: "/user/[id]", params: { id: car.seller!.id } })}
              android_ripple={{ color: "rgba(0,0,0,0.04)" }}
            >
              {car.seller.avatar ? (
                <Image source={{ uri: car.seller.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: isDark ? "#1E293B" : "#F0F0F0" }]}>
                  <Feather name="user" size={22} color={colors.textTertiary} />
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.sellerName, { color: colors.text }]}>{car.seller.name}</Text>
                  {car.seller.isDealer && (
                    <View style={styles.dealerBadge}>
                      <Text style={styles.dealerBadgeText}>Dealer</Text>
                    </View>
                  )}
                </View>
                <VerificationBadges user={car.seller} size="sm" />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Feather key={n} name="star" size={11} color={n <= Math.round(car.seller!.rating) ? "#F4B400" : (isDark ? "#333" : "#E0E0E0")} />
                  ))}
                  <Text style={[styles.sellerRating, { color: colors.textTertiary }]}>
                    {car.seller.rating.toFixed(1)} · {car.seller.totalReviews} reviews
                  </Text>
                </View>
                <Text style={[styles.sellerReply, { color: colors.textTertiary }]}>Usually replies fast</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textTertiary} />
            </Pressable>
            <TrustScore score={getSellerTrustScore(car.seller)} size="md" />
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── You May Also Like ── */}
        {related.length > 0 && (
          <View style={[styles.section, { backgroundColor: card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>You may also like</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -18 }}
              contentContainerStyle={{ paddingHorizontal: 18, gap: 10, paddingBottom: 4 }}
            >
              {related.map((rec) => (
                <CarCard key={rec.id} car={rec} style={{ width: 182 }} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: bg }]} />

        {/* ── Location ── */}
        <View style={[styles.section, { backgroundColor: card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
          <LocationMap location={car.location} />
        </View>

      </ScrollView>

      {/* ── Modals ── */}
      <EquipmentModal
        visible={showEquipment}
        trimName={`${car.brand} Standard`}
        onClose={() => setShowEquipment(false)}
      />
      <ReportModal
        visible={showReport}
        targetId={car.id}
        targetType="listing"
        targetName={`${car.brand} ${car.model}`}
        onClose={() => setShowReport(false)}
      />

      {/* ── Bottom Sticky Bar — 3 buttons ── */}
      <View style={[styles.stickyBar, { paddingBottom: bottomPad, backgroundColor: card, borderTopColor: isDark ? colors.border : "#EEEEEE" }]}>
        {/* Call */}
        <Pressable
          style={({ pressed }) => [styles.stickyBtn, styles.callBtn, pressed && { opacity: 0.88 }]}
          onPress={handleCall}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Feather name="phone" size={18} color="#fff" />
          <View style={styles.btnTextBlock}>
            <Text style={styles.stickyBtnLabel}>Call</Text>
            <Text style={styles.stickyBtnSub}>9am – 9pm</Text>
          </View>
        </Pressable>

        {/* WhatsApp */}
        <Pressable
          style={({ pressed }) => [styles.stickyBtn, styles.whatsappBtn, pressed && { opacity: 0.88 }]}
          onPress={handleWhatsApp}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Feather name="message-square" size={18} color="#fff" />
          <View style={styles.btnTextBlock}>
            <Text style={styles.stickyBtnLabel}>WhatsApp</Text>
            <Text style={styles.stickyBtnSub}>Quick reply</Text>
          </View>
        </Pressable>

        {/* Chat */}
        <Pressable
          style={({ pressed }) => [styles.stickyBtn, styles.chatBtn, pressed && { opacity: 0.88 }]}
          onPress={() => handleMessage()}
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        >
          <Feather name="message-circle" size={18} color="#fff" />
          <View style={styles.btnTextBlock}>
            <Text style={styles.stickyBtnLabel}>Chat</Text>
            <Text style={styles.stickyBtnSub}>In-app</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 14, color: "#0EB5CA", fontFamily: "Inter_500Medium" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20,
  },
  topBarTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", lineHeight: 18 },
  topBarSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  // More dropdown
  moreDropdown: {
    position: "absolute",
    top: 72,
    right: 12,
    zIndex: 100,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    minWidth: 180,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  moreItemText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  // Sold
  soldBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#22C55E",
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: "center",
  },
  soldBannerText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },

  // Gallery
  arrowLeft: { position: "absolute", left: 10, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 },
  arrowRight: { position: "absolute", right: 10, top: 0, bottom: 0, justifyContent: "center", zIndex: 10 },
  arrowBg: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.38)",
    alignItems: "center", justifyContent: "center",
  },
  imgCounter: {
    position: "absolute", bottom: 12, right: 12,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.52)",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  imgCounterText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  dots: {
    position: "absolute", bottom: 14,
    alignSelf: "center",
    flexDirection: "row", gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 18, borderRadius: 3 },

  // Section wrapper
  section: { paddingHorizontal: 18, paddingVertical: 18, gap: 12 },
  divider: { height: 8 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },

  // Tags
  tagRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  tagDark: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20,
  },
  tagDarkText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tagOutline: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  tagOutlineText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  // Title block
  brandYear: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.4, textTransform: "uppercase",
    marginTop: 4,
  },
  modelName: {
    fontSize: 30, fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.8, lineHeight: 36,
  },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingNum: { fontSize: 14, fontFamily: "Inter_700Bold", marginLeft: 4 },
  ratingCount: { fontSize: 13, fontFamily: "Inter_400Regular" },

  // 4 spec cells
  specStrip: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },
  specCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  specValue: { fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center" },
  specLabel: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },

  // Price
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bigPrice: { fontSize: 34, fontFamily: "Manrope_800ExtraBold", letterSpacing: -1 },
  fairBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  fairBadgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  creditLine: { fontSize: 14, color: "#FF6B00", fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  negotiableTag: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  negotiableText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  viewsRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  viewsText: { fontSize: 12, fontFamily: "Inter_400Regular" },

  // History banner
  historyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 14,
  },
  historyIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: "#1A1A1A",
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  historyTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  historySub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  // Full specs
  specsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EB5CA",
  },
  specsBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },

  // Ask seller
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  messageInput: {
    flex: 1,
    fontSize: 14, fontFamily: "Inter_400Regular",
    minHeight: 40, maxHeight: 100,
  },
  sendBtn: {},
  sendBtnInner: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#0EB5CA",
    alignItems: "center", justifyContent: "center",
  },
  quickChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5,
  },
  quickChipText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  // Equipment
  equipHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  equipIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  equipCatLabel: { fontSize: 14, fontFamily: "Inter_700Bold" },
  equipCatCount: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 1 },
  equipBadge: {
    minWidth: 28, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, alignItems: "center",
  },
  equipBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  equipItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, gap: 12,
  },
  equipItemCheck: {
    width: 24, height: 24, borderRadius: 7,
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  equipItemText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  allEquipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 18,
    marginBottom: 16,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#0EB5CA",
  },
  allEquipBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },

  // Description
  description: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },

  // Seller
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarFallback: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: "center", justifyContent: "center",
  },
  sellerName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  dealerBadge: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6,
  },
  dealerBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  sellerRating: { fontSize: 12, fontFamily: "Inter_400Regular", marginLeft: 4 },
  sellerReply: { fontSize: 11, fontFamily: "Inter_400Regular" },

  // Bottom sticky — 3 buttons
  stickyBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  stickyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  callBtn: {
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  whatsappBtn: {
    backgroundColor: "#25D366",
    shadowColor: "#25D366",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  chatBtn: {
    backgroundColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnTextBlock: { alignItems: "flex-start" },
  stickyBtnLabel: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  stickyBtnSub: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontFamily: "Inter_400Regular" },
});
