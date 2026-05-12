// app/car/[id].tsx
// ─────────────────────────────────────────────────────────────
// Car Detail Screen — Westcars
// Navigation in  : router.push({ pathname: "/car/[id]", params: { id } })
// Navigation out : router.back() | /full-specs/[id] | /conversation/[id] | /user/[id]
// Data           : Firebase Firestore → AppContext (cars[]) → useApp()
//                  fallback → MOCK_CARS (utils/mockData.ts)
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef } from "react";
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
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useApp } from "@/hooks/useApp";

const { width } = Dimensions.get("window");
const STAGE_IMG_W = width - 32;

// ─── Equipment sections ──────────────────────────────────────
// Extend or pull from car.techSpecs when that data is available
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
  const { cars, toggleFavorite, isFavorite } = useApp();

  const [activeImg, setActiveImg] = useState(0);
  const [openSection, setOpenSection] = useState<string | null>("comfort");

  // ── Find car ──────────────────────────────────────────────
  const car = cars.find((c) => c.id === id);
  const isSaved = car ? isFavorite(car.id) : false;

  if (!car) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={40} color="#ccc" />
          <Text style={styles.notFoundText}>Car not found</Text>
          <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.back()}>
            <Text style={styles.notFoundBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Handlers ──────────────────────────────────────────────
  const handleCall = () => {
    const phone = car.seller?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = () => {
    const phone = car.seller?.phone?.replace(/\D/g, "");
    if (phone) Linking.openURL(`https://wa.me/${phone}`);
  };

  const handleChat = () => {
    router.push({ pathname: "/conversation/[id]", params: { id: car.sellerId } });
  };

  const handleSellerProfile = () => {
    router.push({ pathname: "/user/[id]", params: { id: car.sellerId } });
  };

  const handleFullSpecs = () => {
    router.push({ pathname: "/full-specs/[id]", params: { id: car.id } });
  };

  // ── Derived display values ────────────────────────────────
  const mileageLabel =
    car.mileage >= 1000
      ? `${(car.mileage / 1000).toFixed(0)}k km`
      : `${car.mileage} km`;

  const priceLabel = `GHS ${car.price.toLocaleString()}`;

  const specs = [
    {
      icon: "box" as const,
      label: "Body",
      val: car.techSpecs?.bodyType ?? car.category,
    },
    {
      icon: "settings" as const,
      label: "Gearbox",
      val: car.techSpecs?.gearbox ?? car.transmission,
    },
    {
      icon: "users" as const,
      label: "Seats",
      val: car.techSpecs?.seats ? String(car.techSpecs.seats) : "—",
    },
    {
      icon: "navigation" as const,
      label: "Drive",
      val: car.techSpecs?.drive ?? "—",
    },
    {
      icon: "user" as const,
      label: "Owners",
      val: car.techSpecs?.owners ? String(car.techSpecs.owners) : "—",
    },
    {
      icon: "map-pin" as const,
      label: "Location",
      val: car.location,
    },
  ];

  const images = car.images.length > 0 ? car.images : [];

  // ─── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f4f4" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={18} color="#111" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => toggleFavorite(car.id)}
            accessibilityLabel={isSaved ? "Remove from saved" : "Save car"}
          >
            <Feather
              name={isSaved ? "bookmark" : "bookmark"}
              size={18}
              color={isSaved ? "#E24B4A" : "#111"}
            />
          </TouchableOpacity>
        </View>

        {/* ── Image gallery ── */}
        <View style={styles.carStage}>
          {images.length > 0 ? (
            <>
              <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                data={images}
                keyExtractor={(_, i) => String(i)}
                onMomentumScrollEnd={(e) =>
                  setActiveImg(
                    Math.round(e.nativeEvent.contentOffset.x / STAGE_IMG_W)
                  )
                }
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item }}
                    style={[styles.carImg, { width: STAGE_IMG_W }]}
                    resizeMode="cover"
                  />
                )}
              />
              {/* Dot indicators */}
              {images.length > 1 && (
                <View style={styles.dotRow}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, i === activeImg && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
              {/* Image count */}
              <View style={styles.imgCount}>
                <Text style={styles.imgCountText}>
                  {activeImg + 1} / {images.length}
                </Text>
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
            <Text style={styles.badgeGrayText}>{car.year}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <Text style={styles.carName}>
          {car.brand} {car.model}
        </Text>
        <Text style={styles.carSub}>
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
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Feather name="activity" size={22} color="#555" />
            <Text style={styles.statVal}>{mileageLabel}</Text>
            <Text style={styles.statLabel}>Mileage</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Feather name="clock" size={22} color="#555" />
            <Text style={styles.statVal}>{car.year}</Text>
            <Text style={styles.statLabel}>Year</Text>
          </View>
          <View style={[styles.stat, styles.statBorder]}>
            <Feather name="zap" size={22} color="#555" />
            <Text style={styles.statVal}>
              {car.techSpecs?.horsepower ? `${car.techSpecs.horsepower}hp` : "—"}
            </Text>
            <Text style={styles.statLabel}>Power</Text>
          </View>
        </View>

        {/* ── Description ── */}
        {car.description ? (
          <>
            <Text style={styles.sectionHead}>About</Text>
            <Text style={styles.desc}>{car.description}</Text>
          </>
        ) : null}

        {/* ── Quick specs grid ── */}
        <Text style={styles.sectionHead}>Specs</Text>
        <View style={styles.specsGrid}>
          {specs.map((s, i) => (
            <View key={i} style={styles.specCard}>
              <Feather name={s.icon} size={16} color="#555" />
              <Text style={styles.specLabel}>{s.label}</Text>
              <Text style={styles.specVal} numberOfLines={1}>
                {s.val}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Full specs CTA ── */}
        <TouchableOpacity style={styles.fullSpecsBtn} onPress={handleFullSpecs}>
          <Text style={styles.fullSpecsBtnText}>View full specifications</Text>
          <Feather name="arrow-right" size={16} color="#111" />
        </TouchableOpacity>

        {/* ── Equipment accordion ── */}
        <Text style={styles.sectionHead}>Equipment</Text>
        {EQUIPMENT_SECTIONS.map((sec) => (
          <View key={sec.key} style={styles.accSection}>
            <TouchableOpacity
              style={styles.accRow}
              onPress={() =>
                setOpenSection(openSection === sec.key ? null : sec.key)
              }
              accessibilityRole="button"
              accessibilityState={{ expanded: openSection === sec.key }}
            >
              <View style={styles.accRowTitle}>
                <Feather name={sec.icon} size={16} color="#555" />
                <Text style={styles.accRowTitleText}>{sec.label}</Text>
              </View>
              <Feather
                name={openSection === sec.key ? "chevron-up" : "chevron-down"}
                size={16}
                color="#aaa"
              />
            </TouchableOpacity>

            {openSection === sec.key && (
              <View style={styles.accInner}>
                <View style={styles.eqList}>
                  {sec.items.map((item, i) => (
                    <View key={i} style={styles.eqTag}>
                      <Feather name="check" size={10} color="#3B6D11" />
                      <Text style={styles.eqTagText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* ── Seller card ── */}
        <Text style={styles.sectionHead}>Seller</Text>
        <TouchableOpacity
          style={styles.sellerCard}
          onPress={handleSellerProfile}
          accessibilityLabel="View seller profile"
        >
          <View style={styles.sellerAv}>
            <Text style={styles.sellerAvText}>
              {car.seller?.name?.slice(0, 2).toUpperCase() ?? "WC"}
            </Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName} numberOfLines={1}>
              {car.seller?.name ?? "Westcars Dealer"}
            </Text>
            <Text style={styles.sellerSub} numberOfLines={1}>
              {car.location} · Verified dealer
            </Text>
          </View>
          <View style={styles.sellerRating}>
            <Feather name="star" size={13} color="#BA7517" />
            <Text style={styles.sellerRatingText}>
              {car.rating?.overall?.toFixed(1) ?? "—"}
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Sticky bottom bar ──────────────────────────────────
           flex:1 + minWidth:0 on each button → equal width, no squeeze
           flexDirection:column → icon stacked above label
           numberOfLines={1}   → label never wraps
      ─────────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bBtn, styles.bCall]}
          onPress={handleCall}
          accessibilityLabel="Call seller"
        >
          <Feather name="phone" size={20} color="#fff" />
          <Text style={[styles.bLabel, { color: "#fff" }]} numberOfLines={1}>
            Call
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bBtn, styles.bWa]}
          onPress={handleWhatsApp}
          accessibilityLabel="WhatsApp seller"
        >
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={[styles.bLabel, { color: "#fff" }]} numberOfLines={1}>
            WhatsApp
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bBtn, styles.bChat]}
          onPress={handleChat}
          accessibilityLabel="Chat in app"
        >
          <Feather name="message-square" size={20} color="#111" />
          <Text style={[styles.bLabel, { color: "#111" }]} numberOfLines={1}>
            Chat
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Not-found state
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: { fontSize: 16, color: "#111", fontWeight: "600" },
  notFoundBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderRadius: 12,
  },
  notFoundBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
    }),
  },

  // Gallery / image stage
  carStage: {
    backgroundColor: "#fff",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  carImg: { height: 200 },
  imgPlaceholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8f8f8",
  },
  imgPlaceholderText: { fontSize: 13, color: "#ccc" },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#ddd" },
  dotActive: { width: 14, backgroundColor: "#111" },
  imgCount: {
    position: "absolute",
    bottom: 14,
    right: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  imgCountText: { color: "#fff", fontSize: 11 },

  // Badges
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen: { backgroundColor: "#EAF3DE" },
  badgeGreenText: { fontSize: 11, fontWeight: "600", color: "#3B6D11" },
  badgeBlue: { backgroundColor: "#E6F1FB" },
  badgeBlueText: { fontSize: 11, fontWeight: "600", color: "#185FA5" },
  badgeAmber: { backgroundColor: "#FAEEDA" },
  badgeAmberText: { fontSize: 11, fontWeight: "600", color: "#854F0B" },
  badgeGray: { backgroundColor: "#f0f0f0" },
  badgeGrayText: { fontSize: 11, fontWeight: "600", color: "#888" },

  // Car title
  carName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  carSub: { fontSize: 13, color: "#aaa", marginBottom: 12 },

  // Price
  priceBadge: {
    backgroundColor: "#111",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  priceNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: "#f0f0f0" },
  statVal: { fontSize: 16, fontWeight: "700", color: "#111", marginTop: 4 },
  statLabel: { fontSize: 11, color: "#aaa" },

  // Section headings
  sectionHead: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 10,
    marginTop: 6,
  },

  // Description
  desc: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 16 },

  // Specs grid
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  specCard: {
    width: "47.5%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  specLabel: { fontSize: 11, color: "#aaa", marginTop: 4 },
  specVal: { fontSize: 13, fontWeight: "700", color: "#111" },

  // Full specs button
  fullSpecsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  fullSpecsBtnText: { fontSize: 14, fontWeight: "600", color: "#111" },

  // Equipment accordion
  accSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 8,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  accRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  accRowTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  accRowTitleText: { fontSize: 14, fontWeight: "600", color: "#111" },
  accInner: { paddingHorizontal: 14, paddingBottom: 12 },
  eqList: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  eqTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
  },
  eqTagText: { fontSize: 12, color: "#555" },

  // Seller card
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },
  sellerAv: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sellerAvText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  sellerInfo: { flex: 1, minWidth: 0 },
  sellerName: { fontSize: 14, fontWeight: "700", color: "#111" },
  sellerSub: { fontSize: 12, color: "#aaa" },
  sellerRating: { flexDirection: "row", alignItems: "center", gap: 3 },
  sellerRatingText: { fontSize: 13, fontWeight: "700", color: "#111" },

  // ── Bottom action bar ─────────────────────────────────────
  // flex:1 + minWidth:0 = equal thirds, never overflow
  // flexDirection:column = icon above label
  // numberOfLines={1} on label = no wrapping ever
  bottomBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    backgroundColor: "#f4f4f4",
    borderTopWidth: 1,
    borderTopColor: "#e8e8e8",
  },
  bBtn: {
    flex: 1,
    minWidth: 0,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 4,
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  bLabel: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center",
  },
  bCall: { backgroundColor: "#111" },
  bWa: { backgroundColor: "#1DAB54" },
  bChat: {
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 2 },
    }),
  },
});
