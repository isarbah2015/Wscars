import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
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
import { EquipmentModal } from "@/components/EquipmentModal";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
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
  { icon: "shield", label: "Safety", count: 14 },
  { icon: "star", label: "Comfort", count: 20 },
  { icon: "sun", label: "Interior", count: 14 },
  { icon: "music", label: "Multimedia", count: 7 },
  { icon: "eye", label: "Visibility", count: 6 },
  { icon: "layers", label: "Exterior", count: 3 },
  { icon: "lock", label: "Anti-theft", count: 2 },
  { icon: "more-horizontal", label: "Other", count: 1 },
];

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars, toggleFavorite, isFavorite, startConversation, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const [activeImg, setActiveImg] = useState(0);
  const [message, setMessage] = useState("");
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);

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

  // Icon-based spec cells (2-column grid, auto.ru style)
  const specCells = [
    { icon: "calendar", value: String(car.year), label: "Year" },
    { icon: "activity", value: `${Math.round(car.mileage / 1000)}k km`, label: "Mileage" },
    { icon: "zap", value: car.fuelType, label: "Fuel" },
    { icon: "settings", value: car.transmission, label: "Gearbox" },
    { icon: "navigation-2", value: "All-wheel", label: "Drive" },
    { icon: "droplet", value: car.condition === "New" ? "White" : "Silver", label: "Color" },
  ];

  // Row-based additional specs
  const extraSpecs = [
    { label: "Trim", value: car.brand + " Standard", highlight: true },
    { label: "Body type", value: car.category || "SUV" },
    { label: "Owners", value: car.condition === "New" ? "0" : "1" },
    { label: "Annual tax", value: `GHS ${Math.round(car.price * 0.002).toLocaleString()}` },
  ];

  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top Bar ── */}
        <View style={[styles.topBar, { paddingTop: topPad + 6 }]}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color="#1A1A1A" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.topTitle} numberOfLines={1}>
              {car.brand} {car.model}, {car.year}
            </Text>
            <Text style={styles.topPrice}>{formatPrice(car.price)}</Text>
          </View>
          <Pressable style={styles.iconBtn} onPress={() => toggleFavorite(car.id)}>
            <Feather name="heart" size={20} color={fav ? "#E8192C" : "#1A1A1A"} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Feather name="more-vertical" size={20} color="#1A1A1A" />
          </Pressable>
        </View>

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
              <Image
                source={{ uri: item }}
                style={{ width, height: 256 }}
                resizeMode="cover"
              />
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

        {/* ── Main Info ── */}
        <View style={styles.mainCard}>
          {/* Title + rating */}
          <Text style={styles.carTitle}>{car.brand} {car.model}, {car.year}</Text>
          <View style={styles.ratingLine}>
            <Text style={styles.ratingText}>Model rating</Text>
            <Feather name="star" size={13} color="#F4B400" />
            <Text style={styles.ratingNum}>
              {car.seller?.rating?.toFixed(1) || "4.2"}
            </Text>
            <Text style={styles.ratingCount}>
              ({car.seller?.totalReviews || 1})
            </Text>
          </View>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.bigPrice}>{formatPrice(car.price)}</Text>
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
          <View style={styles.historyBanner}>
            <View style={styles.historyIcon}>
              <Feather name="check-square" size={18} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.historyTitle}>Car history — free</Text>
              <Text style={styles.historySub}>Contact seller and we'll send a full report</Text>
            </View>
          </View>

          {/* Date + views */}
          <View style={styles.metaRow}>
            <Text style={styles.metaDate}>Listed in {car.location}</Text>
            <View style={styles.metaViews}>
              <Feather name="eye" size={12} color={Colors.light.textTertiary} />
              <Text style={styles.metaViewsText}>
                {car.views || 0} ({Math.floor((car.views || 0) * 0.08)} today)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Specifications Icon Grid ── */}
        <View style={styles.card}>
          <View style={styles.iconSpecsGrid}>
            {specCells.map((s) => (
              <View key={s.label} style={styles.iconSpecCell}>
                <Feather name={s.icon as any} size={22} color="#6B6B6B" style={{ marginBottom: 4 }} />
                <Text style={styles.iconSpecValue}>{s.value}</Text>
                <Text style={styles.iconSpecLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Extra list-style specs */}
          <View style={styles.extraSpecsList}>
            {extraSpecs.map((s, i) => (
              <View
                key={s.label}
                style={[styles.extraSpecRow, i < extraSpecs.length - 1 && styles.extraSpecBorder]}
              >
                <Text style={styles.extraSpecLabel}>{s.label}</Text>
                <Text style={[styles.extraSpecValue, s.highlight && styles.extraSpecHighlight]}>
                  {s.value}
                </Text>
              </View>
            ))}
          </View>

          {/* More details button */}
          <Pressable style={styles.moreBtn} onPress={() => setShowAllSpecs(!showAllSpecs)}>
            <Text style={styles.moreBtnText}>
              {showAllSpecs ? "Show less" : "More details"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sep} />

        {/* ── Ask the Seller ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ask the seller</Text>

          <View style={styles.messageBox}>
            <TextInput
              style={styles.messageInput}
              placeholder="Hello, can you send the car report?"
              placeholderTextColor="#BDBDBD"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <Pressable style={styles.sendBtn} onPress={() => handleMessage(message)}>
              <Feather name="send" size={18} color="#0066CC" />
            </Pressable>
          </View>

          {/* Quick reply chips */}
          <View style={styles.quickChips}>
            {QUICK_QUESTIONS.map((q) => (
              <Pressable
                key={q}
                style={[styles.quickChip, message === q && styles.quickChipActive]}
                onPress={() => setMessage(q)}
              >
                <Text style={[styles.quickChipText, message === q && styles.quickChipTextActive]}>
                  {q}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Equipment Categories ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipment</Text>
          <View style={styles.equipGrid}>
            {EQUIP_CATEGORIES.map((cat) => (
              <View key={cat.label} style={styles.equipCell}>
                <Feather name={cat.icon as any} size={20} color="#1A1A1A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.equipCellLabel}>{cat.label}</Text>
                </View>
                <Text style={styles.equipCellCount}>{cat.count}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.moreBtn} onPress={() => setShowEquipment(true)}>
            <Text style={styles.moreBtnText}>All options</Text>
          </Pressable>
        </View>

        <View style={styles.sep} />

        {/* ── Description ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>
        </View>

        <View style={styles.sep} />

        {/* ── Seller Info ── */}
        {car.seller && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seller</Text>
            <Pressable
              style={styles.sellerRow}
              onPress={() => router.push({ pathname: "/user/[id]", params: { id: car.seller!.id } })}
            >
              {car.seller.avatar ? (
                <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
              ) : (
                <View style={styles.sellerAvatarFallback}>
                  <Feather name="user" size={22} color={Colors.light.textTertiary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={styles.sellerName}>{car.seller.name}</Text>
                  {car.seller.isVerified && (
                    <Feather name="check-circle" size={13} color="#0066CC" />
                  )}
                </View>
                <Text style={styles.sellerType}>
                  {car.seller.isVerified ? "Dealer" : "Private seller"} · Usually replies fast
                </Text>
                <View style={styles.sellerStars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Feather
                      key={s}
                      name="star"
                      size={12}
                      color={s <= Math.round(car.seller!.rating) ? "#F4B400" : "#E0E0E0"}
                    />
                  ))}
                  <Text style={styles.sellerRatingText}>
                    {car.seller.rating.toFixed(1)} · {car.seller.totalReviews} reviews
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#BDBDBD" />
            </Pressable>
          </View>
        )}

        <View style={styles.sep} />

        {/* ── Recommendations 2×2 Grid ── */}
        {related.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>We recommend</Text>
            <View style={styles.recsGrid}>
              {related.slice(0, 4).map((rc) => (
                <Pressable
                  key={rc.id}
                  style={styles.recCell}
                  onPress={() =>
                    router.push({ pathname: "/car/[id]", params: { id: rc.id } })
                  }
                >
                  <View style={styles.recImgWrap}>
                    <Image source={{ uri: rc.images[0] }} style={styles.recImg} resizeMode="cover" />
                    {/* Condition badge */}
                    {(rc.condition === "New" || rc.condition === "Foreign Used") && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>
                          {rc.condition === "New" ? "New" : "Foreign"}
                        </Text>
                      </View>
                    )}
                    {/* Heart */}
                    <View style={styles.recHeart}>
                      <Feather name="heart" size={16} color="rgba(255,255,255,0.9)" />
                    </View>
                    {/* Rating if exists */}
                    {rc.seller?.rating && rc.seller.rating >= 4.0 && (
                      <View style={styles.recRating}>
                        <Feather name="star" size={10} color="#F4B400" />
                        <Text style={styles.recRatingText}>{rc.seller.rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recPrice}>
                    from {formatPrice(rc.price)}
                  </Text>
                  <Text style={styles.recName} numberOfLines={1}>
                    {rc.brand} {rc.model}
                  </Text>
                  <Text style={styles.recYear}>{rc.year}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.sep} />

        {/* ── Location ── */}
        <View style={styles.card}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#0066CC" />
            <Text style={styles.locationText}>{car.location}, Ghana</Text>
          </View>
          <View style={styles.mapPlaceholder}>
            <Feather name="map" size={32} color="#BDBDBD" />
            <Text style={styles.mapPlaceholderText}>Map</Text>
          </View>
        </View>

        <View style={{ height: 100 + (insets.bottom || 0) }} />
      </ScrollView>

      {/* Equipment full-list modal */}
      <EquipmentModal
        visible={showEquipment}
        trimName={`${car.brand} Standard`}
        onClose={() => setShowEquipment(false)}
      />

      {/* ── Bottom Sticky Bar — green Call + green chat (auto.ru style) ── */}
      <View
        style={[
          styles.stickyBar,
          { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 28 : 8) },
        ]}
      >
        <Pressable style={styles.callBtn} onPress={handleCall}>
          <Text style={styles.callBtnLabel}>Call</Text>
          <Text style={styles.callBtnSub}>9:00 – 21:00</Text>
        </Pressable>
        <Pressable style={styles.chatBtn} onPress={() => handleMessage()}>
          <Feather name="message-circle" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  notFoundText: { fontSize: 16, color: Colors.light.textSecondary, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 14, color: "#0066CC", fontFamily: "Inter_500Medium" },

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
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A1A",
    lineHeight: 18,
  },
  topPrice: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B6B6B",
  },

  // Gallery
  imgCounter: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  imgCounterText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  dots: {
    position: "absolute", bottom: 12, alignSelf: "center",
    flexDirection: "row", gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 16 },

  // Main info
  mainCard: { backgroundColor: "#fff", padding: 16, gap: 10 },
  carTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1A1A1A", letterSpacing: -0.3 },
  ratingLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: { fontSize: 13, color: "#6B6B6B", fontFamily: "Inter_400Regular" },
  ratingNum: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  ratingCount: { fontSize: 12, color: "#9E9E9E", fontFamily: "Inter_400Regular" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bigPrice: {
    fontSize: 28, fontFamily: "Inter_700Bold",
    color: "#1A1A1A", letterSpacing: -0.5,
  },
  fairBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 4,
  },
  fairBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#2E7D32" },
  creditLine: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_500Medium" },
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
  historyTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  historySub: { fontSize: 11, color: "#6B6B6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaDate: { fontSize: 12, color: "#6B6B6B", fontFamily: "Inter_400Regular" },
  metaViews: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaViewsText: { fontSize: 12, color: "#6B6B6B", fontFamily: "Inter_400Regular" },

  sep: { height: 8, backgroundColor: "#F5F5F5" },
  card: { backgroundColor: "#fff", padding: 16, gap: 14 },
  cardTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1A1A1A" },

  // Icon specs grid — 3 per row, 2 rows
  iconSpecsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  iconSpecCell: {
    width: "33.33%",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
  },
  iconSpecValue: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  iconSpecLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9E9E9E", marginTop: 1 },

  // Extra row specs
  extraSpecsList: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
  },
  extraSpecRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  extraSpecBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  extraSpecLabel: { fontSize: 13, color: "#6B6B6B", fontFamily: "Inter_400Regular" },
  extraSpecValue: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#1A1A1A" },
  extraSpecHighlight: { color: "#0066CC", fontFamily: "Inter_500Medium" },

  moreBtn: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  moreBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },

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
    fontFamily: "Inter_400Regular",
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
  quickChipText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#1A1A1A" },
  quickChipTextActive: { color: "#fff", fontFamily: "Inter_500Medium" },

  // Equipment grid — 2 col
  equipGrid: { gap: 0 },
  equipCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  equipCellLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#1A1A1A", flex: 1 },
  equipCellCount: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },

  // Description
  description: { fontSize: 14, color: "#6B6B6B", fontFamily: "Inter_400Regular", lineHeight: 22 },

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
  sellerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  sellerType: { fontSize: 12, color: "#6B6B6B", fontFamily: "Inter_400Regular", marginTop: 1 },
  sellerStars: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  sellerRatingText: { fontSize: 12, color: "#6B6B6B", fontFamily: "Inter_400Regular", marginLeft: 4 },

  // Recommendations 2×2 grid
  recsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  recCell: { width: "47%", backgroundColor: "#fff" },
  recImgWrap: {
    position: "relative",
    height: 120,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
  },
  recImg: { width: "100%", height: "100%" },
  recBadge: {
    position: "absolute", top: 6, left: 6,
    backgroundColor: "#27AE60",
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  recBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  recHeart: { position: "absolute", top: 4, right: 6 },
  recRating: {
    position: "absolute", bottom: 6, right: 6,
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  recRatingText: { fontSize: 10, color: "#fff", fontFamily: "Inter_500Medium" },
  recPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#1A1A1A", marginTop: 6 },
  recName: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B6B6B", marginTop: 2 },
  recYear: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9E9E9E", marginTop: 1 },

  // Location
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationText: { fontSize: 14, color: "#1A1A1A", fontFamily: "Inter_400Regular" },
  mapPlaceholder: {
    height: 120, backgroundColor: "#F5F5F5", borderRadius: 8,
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  mapPlaceholderText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Inter_400Regular" },

  // Bottom bar — auto.ru green style
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  callBtn: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: "#27AE60",
    alignItems: "center",
    justifyContent: "center",
  },
  callBtnLabel: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  callBtnSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.85)" },
  chatBtn: {
    width: 52, height: 52,
    borderRadius: 10,
    backgroundColor: "#27AE60",
    alignItems: "center",
    justifyContent: "center",
  },
});
