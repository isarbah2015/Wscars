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
import { ChineseSellerCard } from "@/components/ChineseSellerCard";
import { getPriceChange } from "@/utils/priceChange";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { getCarTechSpecs } from "@/utils/buildTechSpecs";
import { isChinaListingLocation } from "@/utils/ghanaData";

const { width } = Dimensions.get("window");
const HERO_H = 280;

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
  const { requireAuth } = useAuthGuard();
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
  const requireAuthAction = (action: () => void, message?: string) => {
    requireAuth(action, message ?? 'Please sign in to contact the seller.');
  };

  const handleCall = () =>
    requireAuthAction(() => {
      const phone = car.seller?.phone || "+233000000000";
      Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() =>
        Alert.alert("Cannot open phone dialler.")
      );
    });

  const handleWhatsApp = () =>
    requireAuthAction(() => {
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
    requireAuthAction(async () => {
      const convId = await startConversation(car);
      router.push({ pathname: "/conversation/[id]", params: { id: convId } });
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
  const priceChange = getPriceChange(car);
  const techSpecs = getCarTechSpecs(car);

  const listedLabel = (() => {
    const created = new Date(car.createdAt);
    if (Number.isNaN(created.getTime())) return null;
    const days = Math.floor((Date.now() - created.getTime()) / 86_400_000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return car.createdAt;
  })();

  const locationShort = car.location?.split(",")[0] ?? car.location;

  const detailStats: {
    icon: React.ComponentProps<typeof Feather>["name"];
    label: string;
    val: string;
  }[] = [
    { icon: "activity", label: "Mileage", val: mileageLabel },
    { icon: "droplet", label: "Fuel", val: car.fuelType || "—" },
    { icon: "settings", label: "Transmission", val: car.transmission || "—" },
    { icon: "tag", label: "Condition", val: car.condition || "—" },
    { icon: "truck", label: "Body", val: car.category || "—" },
    { icon: "map-pin", label: "Location", val: locationShort || "—" },
    {
      icon: "zap",
      label: "Power",
      val: techSpecs.horsepower ? `${techSpecs.horsepower} hp` : "—",
    },
    ...(car.color?.trim()
      ? [{ icon: "circle" as const, label: "Colour", val: car.color.trim() }]
      : []),
  ];

  const specs = [
    { icon: "box"        as const, label: "Body",     val: techSpecs.bodyType ?? car.category },
    { icon: "settings"   as const, label: "Gearbox",  val: techSpecs.gearbox  ?? car.transmission },
    { icon: "users"      as const, label: "Seats",    val: techSpecs.seats ? String(techSpecs.seats) : "—" },
    { icon: "navigation" as const, label: "Drive",    val: techSpecs.drive ?? "—" },
    { icon: "user"       as const, label: "Owners",   val: techSpecs.owners ? String(techSpecs.owners) : "—" },
    { icon: "map-pin"    as const, label: "Location", val: car.location },
  ];

  const images      = car.images.length > 0 ? car.images : [];
  const isOwner     = currentUser?.id === car.sellerId;
  const bottomPad   = insets.bottom || (Platform.OS === "ios" ? 24 : 12);

  const bg   = isDark ? colors.background : "#f4f4f4";
  const card = isDark ? colors.card       : "#ffffff";

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={[styles.safe, { backgroundColor: bg }]}>

      {/* ── Full-bleed image hero with overlay controls ── */}
      <View style={styles.heroWrap}>
        {images.length > 0 ? (
          <>
            <FlatList
              horizontal
              pagingEnabled
              bounces={false}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              data={images}
              keyExtractor={(_, i) => String(i)}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              snapToInterval={width}
              snapToAlignment="start"
              disableIntervalMomentum
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) =>
                setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))
              }
              onScroll={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImg((prev) => (prev === idx ? prev : idx));
              }}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={{ width, height: HERO_H }}
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
          <View style={[styles.imgPlaceholder, { height: HERO_H }]}>
            <Feather name="truck" size={64} color="#ccc" />
            <Text style={styles.imgPlaceholderText}>No photos yet</Text>
          </View>
        )}

        <View style={[styles.topBarOverlay, { paddingTop: insets.top + 8 }]}>
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
              onPress={() => requireAuth(() => toggleFavorite(car.id), 'Please sign in to save favourites.')}
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

        {showMore && (
          <View style={[styles.moreDropdown, { top: insets.top + 52, backgroundColor: card, borderColor: isDark ? colors.border : "#EEEEEE" }]}>
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
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sold banner ── */}
        {car.isSold && (
          <View style={styles.soldBanner}>
            <Feather name="check-circle" size={14} color="#fff" />
            <Text style={styles.soldBannerText}>This car has been sold</Text>
          </View>
        )}

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

        {/* ── Title + price (right: listing meta) ── */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
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
            <View style={styles.priceRow}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceNum}>{priceLabel}</Text>
              </View>
            </View>
            {priceChange ? (
              <View
                style={[
                  styles.priceChangePill,
                  priceChange.direction === "down" ? styles.priceChangeDown : styles.priceChangeUp,
                ]}
              >
                <Feather
                  name={priceChange.direction === "down" ? "trending-down" : "trending-up"}
                  size={12}
                  color={priceChange.direction === "down" ? "#16A34A" : "#DC2626"}
                />
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                    color: priceChange.direction === "down" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {priceChange.direction === "down" ? "Reduced" : "Increased"} · Was GHS{" "}
                  {priceChange.previousPrice.toLocaleString()}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={[styles.titleRight, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC" }]}>
            <Text style={[styles.metaYear, { color: colors.text }]}>{car.year}</Text>
            {listedLabel ? (
              <View style={styles.metaLine}>
                <Feather name="clock" size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{listedLabel}</Text>
              </View>
            ) : null}
            {car.views != null && car.views > 0 ? (
              <View style={styles.metaLine}>
                <Feather name="eye" size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views} views
                </Text>
              </View>
            ) : null}
            {locationShort ? (
              <View style={styles.metaLine}>
                <Feather name="map-pin" size={11} color={colors.textTertiary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>
                  {locationShort}
                </Text>
              </View>
            ) : null}
            {car.negotiable ? (
              <View style={styles.metaNegotiable}>
                <Text style={styles.metaNegotiableText}>Negotiable</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Vehicle details (icon row under price — same style as before) ── */}
        <View style={[styles.statsRow, { backgroundColor: card }]}>
          {detailStats.map((item, i) => (
            <View
              key={item.label}
              style={[
                styles.stat,
                i % 3 !== 0 && styles.statBorder,
                { borderLeftColor: isDark ? colors.border : "#f0f0f0" },
              ]}
            >
              <Feather name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={[styles.statVal, { color: colors.text }]} numberOfLines={1}>
                {item.val}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Description ── */}
        {car.description ? (
          <>
            <Text style={[styles.sectionHead, { color: colors.text }]}>About</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{car.description}</Text>
          </>
        ) : null}

        {isChinaListingLocation(car.location) && (
          <View style={[styles.chinaOriginBanner, { backgroundColor: isDark ? "rgba(220,38,38,0.12)" : "#FEF2F2" }]}>
            <Text style={styles.chinaOriginText}>
              🇨🇳 Import / China-origin listing — confirm shipping and customs with the seller before payment.
            </Text>
          </View>
        )}

        {car.seller?.chineseSellerProfile?.isChineseSeller ? (
          <>
            <Text style={[styles.sectionHead, { color: colors.text }]}>Importer profile</Text>
            <ChineseSellerCard profile={car.seller.chineseSellerProfile} />
          </>
        ) : null}

        {/* ── Quick specs grid ── */}
        <Text style={[styles.sectionHead, { color: colors.text }]}>Technical specs</Text>
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },

  heroWrap: {
    position: "relative",
    width: "100%",
    backgroundColor: "#1A2340",
  },
  topBarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 20,
  },

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

  // Top bar (legacy — overlay uses topBarOverlay)
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
    position: "absolute", right: 16, zIndex: 100,
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
  dotRow:             { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5 },
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

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  titleLeft: {
    flex: 1,
    minWidth: 0,
  },
  titleRight: {
    width: 108,
    borderRadius: 12,
    padding: 10,
    gap: 6,
    alignItems: "flex-start",
  },
  metaYear: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 26,
  },
  metaLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  metaNegotiable: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 2,
  },
  metaNegotiableText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#16A34A",
  },

  // Car title
  carName: { fontSize: 22, fontWeight: "800", letterSpacing: 0.5, marginBottom: 4 },
  carSub:  { fontSize: 13, marginBottom: 10 },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  // Price
  priceBadge: {
    backgroundColor: "#0EB5CA", borderRadius: 14,
    paddingHorizontal: 18, paddingVertical: 10,
    alignSelf: "flex-start",
  },
  priceNum: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  priceChangePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  priceChangeDown: { backgroundColor: "rgba(22,163,74,0.1)" },
  priceChangeUp: { backgroundColor: "rgba(220,38,38,0.1)" },

  // Stats row — 3 columns, wraps with vehicle details
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 16,
    paddingVertical: 6,
    marginBottom: 16,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 } },
      android: { elevation: 1 },
    }),
  },
  stat: {
    width: "33.333%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 12,
  },
  statBorder: { borderLeftWidth: 1 },
  statVal:    { fontSize: 14, fontWeight: "700", marginTop: 4, textAlign: "center", paddingHorizontal: 4 },
  statLabel:  { fontSize: 10, textAlign: "center" },

  // Section headings
  sectionHead: { fontSize: 18, fontWeight: "700", marginBottom: 10, marginTop: 6 },
  chinaOriginBanner: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.2)",
  },
  chinaOriginText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#B91C1C",
    lineHeight: 18,
  },

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
