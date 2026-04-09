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
import { LinearGradient } from "expo-linear-gradient";
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

        {/* ── Specifications Icon Grid ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Specs</Text>

          {/* Colorful icon cells — 3 per row */}
          <View style={[styles.iconSpecsGrid, { borderColor: colors.border, shadowColor: isDark ? "#000" : "#0A1628" }]}>
            {specCells.map((sc, idx) => (
              <View
                key={sc.label}
                style={[
                  styles.iconSpecCell,
                  { borderColor: colors.border },
                  idx % 3 === 2 && { borderRightWidth: 0 },
                  idx >= 3 && { borderBottomWidth: 0 },
                ]}
              >
                {/* Colored icon bubble */}
                <View style={[styles.specIconBubble, { backgroundColor: sc.iconBg }]}>
                  <Feather name={sc.icon as any} size={17} color={sc.iconColor} />
                </View>
                <Text style={[styles.iconSpecValue, { color: colors.text }]}>{sc.value}</Text>
                <Text style={[styles.iconSpecLabel, { color: colors.textTertiary }]}>{sc.label}</Text>
              </View>
            ))}
          </View>

          {/* Extra list-style specs */}
          <View style={[styles.extraSpecsList, { borderColor: colors.border, shadowColor: isDark ? "#000" : "#0A1628" }]}>
            {extraSpecs.map((sp, i) => (
              <View
                key={sp.label}
                style={[styles.extraSpecRow, { backgroundColor: colors.card },
                  i < extraSpecs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <Text style={[styles.extraSpecLabel, { color: colors.textSecondary }]}>{sp.label}</Text>
                <Text style={[styles.extraSpecValue, { color: colors.text },
                  sp.highlight && styles.extraSpecHighlight]}>
                  {sp.value}
                </Text>
              </View>
            ))}
          </View>

          {/* More details button */}
          <Pressable
            style={[styles.moreBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: "/full-specs/[id]", params: { id: car.id } })}
          >
            <Text style={[styles.moreBtnText, { color: colors.text }]}>More details →</Text>
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

        {/* ── Equipment Categories ── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Equipment</Text>
          <View style={styles.equipGrid}>
            {EQUIP_CATEGORIES.map((cat, i) => (
              <View key={cat.label} style={[styles.equipCell, { borderBottomColor: colors.border }]}>
                <Feather name={cat.icon as any} size={20} color={colors.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.equipCellLabel, { color: colors.text }]}>{cat.label}</Text>
                </View>
                <Text style={[styles.equipCellCount, { color: colors.text }]}>{cat.count}</Text>
              </View>
            ))}
          </View>
          <Pressable style={[styles.moreBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setShowEquipment(true)}>
            <Text style={[styles.moreBtnText, { color: colors.text }]}>All options</Text>
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
              {related.slice(0, 4).map((rc) => (
                <Pressable
                  key={rc.id}
                  style={[styles.recCell, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({ pathname: "/car/[id]", params: { id: rc.id } })
                  }
                >
                  <View style={styles.recImgWrap}>
                    <Image source={{ uri: rc.images[0] }} style={styles.recImg} resizeMode="cover" />
                    {(rc.condition === "New" || rc.condition === "Foreign Used") && (
                      <View style={styles.recBadge}>
                        <Text style={styles.recBadgeText}>
                          {rc.condition === "New" ? "New" : "Foreign"}
                        </Text>
                      </View>
                    )}
                    <View style={styles.recHeart}>
                      <Feather name="heart" size={16} color="rgba(255,255,255,0.9)" />
                    </View>
                    {rc.seller?.rating && rc.seller.rating >= 4.0 && (
                      <View style={styles.recRating}>
                        <Feather name="star" size={10} color="#F4B400" />
                        <Text style={styles.recRatingText}>{rc.seller.rating.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.recPrice, { color: colors.text }]}>
                    from {formatPrice(rc.price)}
                  </Text>
                  <Text style={[styles.recName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {rc.brand} {rc.model}
                  </Text>
                  <Text style={[styles.recYear, { color: colors.textTertiary }]}>{rc.year}</Text>
                </Pressable>
              ))}
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

      {/* ── Bottom Sticky Bar — green Call + green chat (auto.ru style) ── */}
      <View
        style={[
          styles.stickyBar,
          { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 28 : 8),
            backgroundColor: colors.card, borderTopColor: colors.border },
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

  // Icon specs grid — 3 per row, 2 rows
  iconSpecsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  iconSpecCell: {
    width: "33.33%",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    gap: 4,
  },
  specIconBubble: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  iconSpecValue: { fontSize: 13, fontFamily: "Manrope_700Bold", textAlign: "center" },
  iconSpecLabel: { fontSize: 11, fontFamily: "Manrope_400Regular", textAlign: "center" },

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
  },
  extraSpecBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  extraSpecLabel: { fontSize: 13, fontFamily: "Manrope_400Regular" },
  extraSpecValue: { fontSize: 13, fontFamily: "Manrope_500Medium" },
  extraSpecHighlight: { color: "#0EB5CA", fontFamily: "Manrope_700Bold" },

  moreBtn: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  moreBtnText: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },

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
  equipCellLabel: { fontSize: 14, fontFamily: "Manrope_400Regular", color: "#1A1A1A", flex: 1 },
  equipCellCount: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },

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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  recCell: { width: "47%", backgroundColor: "transparent" },
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
  recBadgeText: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: "#fff" },
  recHeart: { position: "absolute", top: 4, right: 6 },
  recRating: {
    position: "absolute", bottom: 6, right: 6,
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 4,
  },
  recRatingText: { fontSize: 10, color: "#fff", fontFamily: "Manrope_500Medium" },
  recPrice: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#1A1A1A", marginTop: 6 },
  recName: { fontSize: 13, fontFamily: "Manrope_400Regular", color: "#6B6B6B", marginTop: 2 },
  recYear: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#9E9E9E", marginTop: 1 },

  // Location
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationText: { fontSize: 14, color: "#1A1A1A", fontFamily: "Manrope_400Regular" },
  mapPlaceholder: {
    height: 120, backgroundColor: "#F5F5F5", borderRadius: 8,
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  mapPlaceholderText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },

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
  callBtnLabel: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#fff" },
  callBtnSub: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.85)" },
  chatBtn: {
    width: 52, height: 52,
    borderRadius: 10,
    backgroundColor: "#27AE60",
    alignItems: "center",
    justifyContent: "center",
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
