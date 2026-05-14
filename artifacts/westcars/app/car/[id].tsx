// app/car/[id].tsx
// ─────────────────────────────────────────────────────────────
// Car Detail Screen — Westcars
// Navigation in  : router.push({ pathname: "/car/[id]", params: { id } })
// Navigation out : router.back() | /full-specs/[id] | /conversation/[id] | /user/[id]
// Data           : Firebase Firestore → AppContext (cars[]) → useApp()
//                  fallback → MOCK_CARS (utils/mockData.ts)
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");
const STAGE_IMG_W = width - 32;

// ─── Equipment sections ──────────────────────────────────────
const EQUIPMENT_SECTIONS = [
  {
    key: "comfort",
    label: "Comfort & Convenience",
    icon: "wind" as const,
    items: [
      "Heated seats",
      "Sunroof / Moonroof",
      "Keyless entry",
      "Auto climate control",
      "Electric park assist",
    ],
  },
  {
    key: "tech",
    label: "Tech & Infotainment",
    icon: "smartphone" as const,
    items: [
      "Apple CarPlay",
      "Android Auto",
      "Wireless charging",
      "Premium audio",
      "Head-up display",
    ],
  },
  {
    key: "safety",
    label: "Safety",
    icon: "shield" as const,
    items: [
      "Lane-keep assist",
      "Blind-spot monitor",
      "Autonomous emergency braking",
      "360° surround camera",
      "Traction control",
    ],
  },
];

// ─── Component ───────────────────────────────────────────────
export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    cars,
    toggleFavorite,
    isFavorite,
    isAuthenticated,
    startConversation,
    currentUser,
    markAsSold,
    renewListing,
    reportItem,
  } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [activeImg, setActiveImg]     = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("comfort");
  const [showMore, setShowMore]       = useState(false);

  // ── Find car ──────────────────────────────────────────────
  const car    = cars.find((c) => c.id === id);
  const isSaved = car ? isFavorite(car.id) : false;

  if (!car) {
    return (
      <View style={[styles.safe, { backgroundColor: isDark ? colors.background : "#f4f4f4" }]}>
        <View style={[styles.notFound, { paddingTop: insets.top }]}>
          <Feather name="alert-circle" size={40} color="#ccc" />
          <Text style={[styles.notFoundText, { color: colors.text }]}>Car not found</Text>
          <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.back()}>
            <Text style={styles.notFoundBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Auth guard helper ──────────────────────────────────────
  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to contact the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    action();
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleCall = () =>
    requireAuth(() => {
      const phone = car.seller?.phone || "+233000000000";
      Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() =>
        Alert.alert("Cannot open phone dialler.")
      );
    });

  const handleWhatsApp = () =>
    requireAuth(() => {
      const raw   = car.seller?.phone?.replace(/[\s+\-()]/g, "") || "233000000000";
      const phone = raw.startsWith("0") ? "233" + raw.slice(1) : raw;
      const msg   = encodeURIComponent(
        `Hi, I'm interested in your ${car.year} ${car.brand} ${car.model} on Westcars. Still available?`
      );
      Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
        Linking.openURL(`https://wa.me/${phone}?text=${msg}`)
      );
    });

  const handleChat = () =>
    requireAuth(async () => {
      try {
        const convId = await startConversation(car);
        router.push({ pathname: "/conversation/[id]", params: { id: convId } });
      } catch (err: any) {
        console.error('[handleChat]', err?.message ?? err);
        Alert.alert('Error', 'Could not open chat. Please try again.');
      }
    });

  const handleSellerProfile = () =>
    router.push({ pathname: "/user/[id]", params: { id: car.sellerId } });

  const handleFullSpecs = () =>
    router.push({ pathname: "/full-specs/[id]", params: { id: car.id } });

  // ── Derived display values ────────────────────────────────
  const mileageLabel =
    car.mileage >= 1000
      ? `${(car.mileage / 1000).toFixed(0)}k km`
      : `${car.mileage} km`;

  const priceLabel = `GHS ${car.price.toLocaleString()}`;

  const specs = [
    { icon: "box"        as const, label: "Body",     val: car.techSpecs?.bodyType ?? car.category },
    { icon: "settings"   as const, label: "Gearbox",  val: car.techSpecs?.gearbox  ?? car.transmission },
    { icon: "users"      as const, label: "Seats",    val: car.techSpecs?.seats    ? String(car.techSpecs.seats)  : "—" },
    { icon: "navigation" as const, label: "Drive",    val: car.techSpecs?.drive    ?? "—" },
    { icon: "user"       as const, label: "Owners",   val: car.techSpecs?.owners   ? String(car.techSpecs.owners) : "—" },
    { icon: "map-pin"    as const, label: "Location", val: car.location },
  ];

  const images      = car.images.length > 0 ? car.images : [];
  const isOwner     = currentUser?.id === car.sellerId;
  const bottomPad   = insets.bottom || (Platform.OS === "ios" ? 24 : 12);

  const bg   = isDark ? colors.background : "#f4f4f4";
  const card = isDark ? colors.card       : "#ffffff";

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={[styles.safe, { backgroundColor: bg, paddingTop: insets.top }]}>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: card }]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.topBarRight}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: card }]}
              onPress={() => toggleFavorite(car.id)}
              accessibilityLabel={isSaved ? "Remove from saved" : "Save car"}
            >
              <Feather
                name="heart"
                size={18}
                color={isSaved ? "#E8192C" : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: card }]}
              onPress={() => setShowMore(v => !v)}
              accessibilityLabel="More options"
            >
              <Feather name="more-vertical" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── More dropdown ── */}
        {showMore && (
          <View style={[styles.moreDropdown, { backgroundColor: card, borderColor: isDark ? colors.border : "#EEEEEE" }]}>
            {isOwner && !car.isSold && (
              <TouchableOpacity style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                Alert.alert("Mark as Sold", "Mark this listing as sold?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Mark Sold", onPress: () => markAsSold(car.id) },
                ]);
              }}>
                <Feather name="check-circle" size={15} color="#22C55E" />
                <Text style={[styles.moreItemText, { color: "#22C55E" }]}>Mark as Sold</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                renewListing(car.id);
                Alert.alert("Listing Renewed", "Your listing is active for another 30 days.");
              }}>
                <Feather name="refresh-cw" size={15} color="#0066CC" />
                <Text style={[styles.moreItemText, { color: "#0066CC" }]}>Renew Listing</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity style={[styles.moreItem, { borderBottomColor: isDark ? colors.border : "#F5F5F5", borderBottomWidth: 1 }]} onPress={() => {
                setShowMore(false);
                Alert.alert("Report Listing", "Are you sure you want to report this listing?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Report", style: "destructive", onPress: () => reportItem({ reporterId: currentUser?.id ?? "", targetId: car.id, targetType: "listing", reason: "Inappropriate listing" }) },
                ]);
              }}>
                <Feather name="flag" size={15} color="#E53935" />
                <Text style={[styles.moreItemText, { color: "#E53935" }]}>Report Listing</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.moreItem} onPress={() => setShowMore(false)}>
              <Feather name="x" size={15} color={colors.textTertiary} />
              <Text style={[styles.moreItemText, { color: colors.textTertiary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Sold banner ── */}
        {car.isSold && (
          <View style={styles.soldBanner}>
            <Feather name="check-circle" size={14} color="#fff" />
            <Text style={styles.soldBannerText}>This car has been sold</Text>
          </View>
        )}

        {/* ── Image gallery ── */}
        <View style={[styles.carStage, { backgroundColor: card }]}>
          {images.length > 0 ? (
            <>
              <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(_, i) => String(i)}
                onMomentumScrollEnd={(e) =>
                  setActiveImg(Math.round(e.nativeEvent.contentOffset.x / STAGE_IMG_W))
                }
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={[styles.carImg, { width: STAGE_IMG_W }]}
                    resizeMode="cover"
                  />
                )}
              />
              {images.length > 1 && (
                <View style={styles.dotRow}>
                  {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
                  ))}
                </View>
              )}
              <View style={styles.imgCount}>
                <Text style={styles.imgCountText}>{activeImg + 1} / {images.length}</Text>
              </View>
            </>
          ) : (
            <View style={styles.imgPlaceholder}>
              <Feather name="truck" size={64} color="#ccc" />
              <Text style={styles.imgPlaceholderText}>No photos yet</Text>
            </View>
          )}
        </View>

        {/* ── Badges ── */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={styles.badgeGreenText}>{car.condition}</Text>
          </View>
          {car.isFeatured && (
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeBlueText}>Featured</Text>
            </View>
          )}
          {car.isSponsored && (
            <View style={[styles.badge, styles.badgeAmber]}>
              <Text style={styles.badgeAmberText}>Sponsored</Text>
            </View>
          )}
          <View style={[styles.badge, styles.badgeGray]}>
            <Text style={[styles.badgeGrayText, { color: isDark ? "#aaa" : "#888" }]}>{car.year}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <Text style={[styles.carName, { color: colors.text }]}>
          {car.brand} {car.model}
        </Text>
        <Text style={[styles.carSub, { color: colors.textTertiary }]}>
          {[
            car.techSpecs?.trim ?? car.category,
            car.fuelType,
            car.transmission,
            car.techSpecs?.color,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>

        {/* ── Price ── */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceNum}>{priceLabel}</Text>
        </View>

        {/* ── Stats row ── */}
        <View style={[styles.statsRow, { backgroundColor: card }]}>
          <View style={styles.stat}>
            <Feather name="activity" size={22} color={colors.textSecondary} />
            <Text style={[styles.statVal, { color: colors.text }]}>{mileageLabel}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Mileage</Text>
          </View>
          <View style={[styles.stat, styles.statBorder, { borderLeftColor: isDark ? colors.border : "#f0f0f0" }]}>
            <Feather name="clock" size={22} color={colors.textSecondary} />
            <Text style={[styles.statVal, { color: colors.text }]}>{car.year}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Year</Text>
          </View>
          <View style={[styles.stat, styles.statBorder, { borderLeftColor: isDark ? colors.border : "#f0f0f0" }]}>
            <Feather name="zap" size={22} color={colors.textSecondary} />
            <Text style={[styles.statVal, { color: colors.text }]}>
              {car.techSpecs?.horsepower ? `${car.techSpecs.horsepower}hp` : "—"}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Power</Text>
          </View>
        </View>

        {/* ── Description ── */}
        {car.description ? (
          <>
            <Text style={[styles.sectionHead, { color: colors.text }]}>About</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{car.description}</Text>
          </>
        ) : null}

        {/* ── Quick specs grid ── */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Specs</Text>
        <View style={styles.specsGrid}>
          {specs.map((s, i) => (
            <View key={i} style={[styles.specCard, { backgroundColor: card }]}>
              <Feather name={s.icon} size={16} color={colors.textSecondary} />
              <Text style={[styles.specLabel, { color: colors.textTertiary }]}>{s.label}</Text>
              <Text style={[styles.specVal, { color: colors.text }]} numberOfLines={1}>{s.val}</Text>
            </View>
          ))}
        </View>

        {/* ── Full specs CTA ── */}
        <TouchableOpacity style={[styles.fullSpecsBtn, { backgroundColor: card }]} onPress={handleFullSpecs}>
          <Text style={[styles.fullSpecsBtnText, { color: colors.text }]}>View full specifications</Text>
          <Feather name="arrow-right" size={16} color={colors.text} />
        </TouchableOpacity>

        {/* ── Equipment accordion ── */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Equipment</Text>
        {EQUIPMENT_SECTIONS.map((sec) => (
          <View key={sec.key} style={[styles.accSection, { backgroundColor: card }]}>
            <TouchableOpacity
              style={styles.accRow}
              onPress={() => setOpenSection(openSection === sec.key ? null : sec.key)}
              accessibilityRole="button"
              accessibilityState={{ expanded: openSection === sec.key }}
            >
              <View style={styles.accRowTitle}>
                <Feather name={sec.icon} size={16} color={colors.textSecondary} />
                <Text style={[styles.accRowTitleText, { color: colors.text }]}>{sec.label}</Text>
              </View>
              <Feather
                name={openSection === sec.key ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            {openSection === sec.key && (
              <View style={styles.accInner}>
                <View style={styles.eqList}>
                  {sec.items.map((item, i) => (
                    <View key={i} style={[styles.eqTag, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#f4f4f4" }]}>
                      <Feather name="check" size={10} color="#3B6D11" />
                      <Text style={[styles.eqTagText, { color: colors.textSecondary }]}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* ── Seller card ── */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Seller</Text>
        <TouchableOpacity
          style={[styles.sellerCard, { backgroundColor: card }]}
          onPress={handleSellerProfile}
          accessibilityLabel="View seller profile"
        >
          {car.seller?.avatar ? (
            <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvImg} />
          ) : (
            <View style={styles.sellerAv}>
              <Text style={styles.sellerAvText}>
                {car.seller?.name?.slice(0, 2).toUpperCase() ?? "WC"}
              </Text>
            </View>
          )}
          <View style={styles.sellerInfo}>
            <Text style={[styles.sellerName, { color: colors.text }]} numberOfLines={1}>
              {car.seller?.name ?? "Westcars Dealer"}
            </Text>
            <Text style={[styles.sellerSub, { color: colors.textTertiary }]} numberOfLines={1}>
              {car.location} · {car.seller?.isDealer ? "Dealer" : "Private seller"}
            </Text>
          </View>
          <View style={styles.sellerRatingWrap}>
            <Feather name="star" size={13} color="#BA7517" />
            <Text style={[styles.sellerRatingText, { color: colors.text }]}>
              {car.seller?.rating?.toFixed(1) ?? "—"}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textTertiary} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

      </ScrollView>

      {/* ── Sticky bottom bar ──────────────────────────────────
           flex:1 + minWidth:0 on each button → equal width, no squeeze
           flexDirection:column → icon stacked above label
           numberOfLines={1}   → label never wraps
      ─────────────────────────────────────────────────────── */}
      <View style={[
        styles.bottomBar,
        {
          paddingBottom: bottomPad,
          backgroundColor: bg,
          borderTopColor: isDark ? colors.border : "#e8e8e8",
        },
      ]}>
        <TouchableOpacity
          style={[styles.bBtn, styles.bCall]}
          onPress={handleCall}
          accessibilityLabel="Call seller"
        >
          <Feather name="phone" size={20} color="#fff" />
          <Text style={[styles.bLabel, { color: "#fff" }]} numberOfLines={1}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bBtn, styles.bWa]}
          onPress={handleWhatsApp}
          accessibilityLabel="WhatsApp seller"
        >
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={[styles.bLabel, { color: "#fff" }]} numberOfLines={1}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bBtn, styles.bChat, { backgroundColor: card }]}
          onPress={handleChat}
          accessibilityLabel="Chat in app"
        >
          <Feather name="message-square" size={20} color={colors.text} />
          <Text style={[styles.bLabel, { color: colors.text }]} numberOfLines={1}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:          { flex: 1 },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },

  // Not-found state
  notFound: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 12,
  },
  notFoundText: { fontSize: 16, fontWeight: "600" },
  notFoundBtn: {
    marginTop: 4, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: "#0EB5CA", borderRadius: 12,
  },
  notFoundBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 2 },
    }),
  },

  // More dropdown
  moreDropdown: {
    position: "absolute", top: 64, right: 16, zIndex: 100,
    borderRadius: 14, borderWidth: 1,
    overflow: "hidden", minWidth: 180,
    shadowColor: "#000", shadowOpacity: 0.12,
    shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  moreItem: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  moreItemText: { fontSize: 14, fontWeight: "500" },

  // Sold banner
  soldBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#22C55E",
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, marginBottom: 10, justifyContent: "center",
  },
  soldBannerText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  // Gallery / image stage
  carStage: {
    borderRadius: 24, overflow: "hidden", marginBottom: 14,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  carImg:             { height: 220 },
  imgPlaceholder:     { height: 220, alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#f8f8f8" },
  imgPlaceholderText: { fontSize: 13, color: "#ccc" },
  dotRow:             { flexDirection: "row", justifyContent: "center", gap: 5, paddingVertical: 10 },
  dot:                { width: 5, height: 5, borderRadius: 3, backgroundColor: "#ddd" },
  dotActive:          { width: 14, backgroundColor: "#0EB5CA" },
  imgCount: {
    position: "absolute", bottom: 14, right: 14,
    backgroundColor: "rgba(0,0,0,0.4)", borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  imgCountText: { color: "#fff", fontSize: 11 },

  // Badges
  badgeRow:       { flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap" },
  badge:          { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen:     { backgroundColor: "#EAF3DE" },
  badgeGreenText: { fontSize: 11, fontWeight: "600", color: "#3B6D11" },
  badgeBlue:      { backgroundColor: "#E6F1FB" },
  badgeBlueText:  { fontSize: 11, fontWeight: "600", color: "#185FA5" },
  badgeAmber:     { backgroundColor: "#FAEEDA" },
  badgeAmberText: { fontSize: 11, fontWeight: "600", color: "#854F0B" },
  badgeGray:      { backgroundColor: "#f0f0f0" },
  badgeGrayText:  { fontSize: 11, fontWeight: "600" },

  // Car title
  carName: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  carSub:  { fontSize: 13, marginBottom: 12 },

  // Price
  priceBadge: {
    backgroundColor: "#0EB5CA", borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 10,
    alignSelf: "flex-start", marginBottom: 16,
  },
  priceNum: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },

  // Stats row
  statsRow: {
    flexDirection: "row", borderRadius: 16, paddingVertical: 14, marginBottom: 16,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  stat:       { flex: 1, alignItems: "center", gap: 4 },
  statBorder: { borderLeftWidth: 1 },
  statVal:    { fontSize: 16, fontWeight: "700", marginTop: 4 },
  statLabel:  { fontSize: 11 },

  // Section headings
  sectionHead: { fontSize: 18, fontWeight: "700", marginBottom: 10, marginTop: 6 },

  // Description
  desc: { fontSize: 14, lineHeight: 22, marginBottom: 16 },

  // Specs grid
  specsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  specCard: {
    width: "47.5%", borderRadius: 12, padding: 12, gap: 4,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  specLabel: { fontSize: 11, marginTop: 4 },
  specVal:   { fontSize: 13, fontWeight: "700" },

  // Full specs button
  fullSpecsBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 12, padding: 14, marginBottom: 20,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  fullSpecsBtnText: { fontSize: 14, fontWeight: "600" },

  // Equipment accordion
  accSection: {
    borderRadius: 16, marginBottom: 8, overflow: "hidden",
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  accRow:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  accRowTitle:     { flexDirection: "row", alignItems: "center", gap: 8 },
  accRowTitleText: { fontSize: 14, fontWeight: "600" },
  accInner:        { paddingHorizontal: 14, paddingBottom: 12 },
  eqList:          { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eqTag:           { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  eqTagText:       { fontSize: 12 },

  // Seller card
  sellerCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 8,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  sellerAvImg: { width: 42, height: 42, borderRadius: 21 },
  sellerAv: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: "#0EB5CA", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  sellerAvText:    { color: "#fff", fontSize: 13, fontWeight: "700" },
  sellerInfo:      { flex: 1, minWidth: 0 },
  sellerName:      { fontSize: 14, fontWeight: "700" },
  sellerSub:       { fontSize: 12 },
  sellerRatingWrap:{ flexDirection: "row", alignItems: "center", gap: 3 },
  sellerRatingText:{ fontSize: 13, fontWeight: "700" },

  // ── Bottom action bar ─────────────────────────────────────
  bottomBar: {
    flexDirection: "row", gap: 8,
    paddingHorizontal: 16, paddingTop: 10,
    borderTopWidth: 1,
  },
  bBtn: {
    flex: 1, minWidth: 0,
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 4,
    flexDirection: "column", alignItems: "center", gap: 4,
  },
  bLabel: { fontSize: 11, fontWeight: "700", flexShrink: 1, textAlign: "center" },
  bCall:  { backgroundColor: "#0EB5CA" },
  bWa:    { backgroundColor: "#1DAB54" },
  bChat: {
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 2 },
    }),
  },
});
