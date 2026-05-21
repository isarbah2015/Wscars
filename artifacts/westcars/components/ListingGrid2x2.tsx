import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { CarCard } from "@/components/CarCard";
import {
  LISTING_GRID,
  listingGridCardStyle,
  listingGridImageStyle,
  listingGridRowStyle,
} from "@/constants/listingGrid";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";
import {
  buildGridLayout,
  buildListingGridItems,
  GridLayoutRow,
  ListingGridItem,
} from "@/utils/buildListingGridItems";

type GridVariant = "profile" | "carcard";

function useCardPressScale(toValue = 0.96) {
  const scale = useRef(new Animated.Value(1)).current;
  const nativeDriver = Platform.OS !== "web";
  const pressIn = () =>
    Animated.spring(scale, { toValue, useNativeDriver: nativeDriver, speed: 80, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: nativeDriver, speed: 28, bounciness: 5 }).start();
  return { scale, pressIn, pressOut };
}

const listingCardShell = {
  borderRadius: LISTING_GRID.cardRadius,
  overflow: "hidden" as const,
  borderWidth: 1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

const featuredWideShell = {
  borderRadius: 18,
  overflow: "hidden" as const,
  borderWidth: 1,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
};

export function ProfileListingCard({
  car,
  isDark: isDarkProp,
  showBadge = false,
}: {
  car: Car;
  isDark?: boolean;
  showBadge?: boolean;
}) {
  const { colors, isDark: themeDark } = useTheme();
  const isDark = isDarkProp ?? themeDark;
  const { scale, pressIn, pressOut } = useCardPressScale();
  const img = car.images?.[0];
  const title = [car.year, car.brand, car.model].filter(Boolean).join(" ") || "Car";

  return (
    <Animated.View style={[listingGridCardStyle, { transform: [{ scale }] }]}>
      <Pressable
        style={[
          styles.listingCard,
          listingCardShell,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            shadowColor: isDark ? "#FF6B00" : "#0A1628",
            shadowOpacity: isDark ? 0.06 : 0.12,
          },
        ]}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,107,0,0.08)", borderless: false }}
      >
      {(showBadge || car.isFeatured || car.isSponsored) && (
        <View style={styles.badgeOverlay}>
          {showBadge && (
            <View style={[styles.badge, car.isSold ? styles.badgeSold : styles.badgeActive]}>
              <Text style={styles.badgeText}>{car.isSold ? "Sold" : "Active"}</Text>
            </View>
          )}
          {!showBadge && car.isSponsored && (
            <View style={styles.badgeSponsored}>
              <Text style={styles.badgeText}>Sponsored</Text>
            </View>
          )}
          {!showBadge && !car.isSponsored && car.isFeatured && (
            <View style={styles.badgeFeatured}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
        </View>
      )}
      {img ? (
        <Image source={{ uri: img }} style={listingGridImageStyle} resizeMode="cover" />
      ) : (
        <View style={[listingGridImageStyle, styles.imgPlaceholder, { backgroundColor: colors.accentLight }]}>
          <Feather name="truck" size={26} color={colors.accent} />
        </View>
      )}
      <View style={[styles.listingInfo, { backgroundColor: colors.card }]}>
        <Text style={[styles.listingTitle, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        {car.price !== undefined && (
          <Text style={styles.listingPrice}>GHS {Number(car.price).toLocaleString()}</Text>
        )}
        {showBadge && (
          <View style={styles.listingMeta}>
            <Feather name="eye" size={10} color={colors.textTertiary} />
            <Text style={[styles.listingMetaText, { color: colors.textTertiary }]}>{car.views ?? 0}</Text>
            <Feather name="message-circle" size={10} color={colors.textTertiary} />
            <Text style={[styles.listingMetaText, { color: colors.textTertiary }]}>
              {(car as Car & { chats?: number }).chats ?? 0}
            </Text>
          </View>
        )}
      </View>
      </Pressable>
    </Animated.View>
  );
}

interface ListingGrid2x2Props {
  cars: Car[];
  isDark?: boolean;
  showBadge?: boolean;
  variant?: GridVariant;
  injectPromotions?: boolean;
  promotionPool?: Car[];
  style?: ViewStyle;
}

export function FeaturedWideCard({ car, isDark: isDarkProp }: { car: Car; isDark?: boolean }) {
  const { colors, isDark: themeDark } = useTheme();
  const isDark = isDarkProp ?? themeDark;
  const { scale, pressIn, pressOut } = useCardPressScale(0.98);
  const img = car.images?.[0];
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.wideCard, featuredWideShell, {
          backgroundColor: colors.card,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          shadowColor: isDark ? "#FF6B00" : "#0A1628",
          shadowOpacity: isDark ? 0.06 : 0.12,
        }]}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,107,0,0.08)", borderless: false }}
      >
      <View style={styles.wideImgWrap}>
        {img ? (
          <Image source={{ uri: img }} style={styles.wideImg} resizeMode="cover" />
        ) : (
          <View style={[styles.wideImg, styles.imgPlaceholder, { backgroundColor: isDark ? "#111827" : "#F8FAFC" }]}>
            <Feather name="camera" size={28} color="#94A3B8" />
          </View>
        )}
        <LinearGradient colors={["transparent", "rgba(0,0,0,0.72)"]} style={styles.wideScrim} pointerEvents="none" />
        {car.isSponsored ? (
          <LinearGradient colors={["#FF8C00", "#FFB347"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.wideSponsoredBadge}>
            <Text style={styles.wideSponsoredText}>★ SPONSORED</Text>
          </LinearGradient>
        ) : (
          <View style={styles.wideFeaturedBadge}>
            <Text style={styles.wideFeaturedText}>FEATURED</Text>
          </View>
        )}
        <View style={styles.widePriceBadge}>
          <Text style={styles.widePriceText}>{formatPrice(car.price)}</Text>
        </View>
      </View>
      <View style={styles.wideInfo}>
        <Text style={[styles.wideTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={1}>
          {car.brand} {car.model} · {car.year}
        </Text>
        <View style={styles.wideMetaRow}>
          {car.location ? (
            <View style={styles.wideMetaChip}>
              <Feather name="map-pin" size={10} color="#64748B" />
              <Text style={styles.wideMetaText} numberOfLines={1}>{car.location.split(",")[0]}</Text>
            </View>
          ) : null}
          {car.mileage > 0 && (
            <View style={styles.wideMetaChip}>
              <Feather name="activity" size={10} color="#64748B" />
              <Text style={styles.wideMetaText}>{(car.mileage / 1000).toFixed(0)}k km</Text>
            </View>
          )}
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
}

function renderGridItem(
  item: ListingGridItem,
  variant: GridVariant,
  isDark: boolean,
  showBadge: boolean,
) {
  if (item.kind === "featured-wide") {
    return <FeaturedWideCard key={item.key} car={item.car} isDark={isDark} />;
  }
  if (variant === "profile") {
    return <ProfileListingCard key={item.key} car={item.car} isDark={isDark} showBadge={showBadge} />;
  }
  return <CarCard key={item.key} car={item.car} style={listingGridCardStyle} />;
}

export function ListingGridRow({
  items,
  variant = "profile",
  isDark = false,
  showBadge = false,
}: {
  items: ListingGridItem[];
  variant?: GridVariant;
  isDark?: boolean;
  showBadge?: boolean;
}) {
  return (
    <View style={listingGridRowStyle}>
      {items.map((item) => renderGridItem(item, variant, isDark, showBadge))}
      {items.length === 1 ? <View style={listingGridCardStyle} /> : null}
    </View>
  );
}

export function ListingGridLayoutRow({
  row,
  variant = "profile",
  isDark = false,
  showBadge = false,
}: {
  row: GridLayoutRow;
  variant?: GridVariant;
  isDark?: boolean;
  showBadge?: boolean;
}) {
  if (row.type === "wide") {
    return (
      <View style={styles.wideRow}>
        <FeaturedWideCard car={row.item.car} isDark={isDark} />
      </View>
    );
  }
  return (
    <ListingGridRow
      items={row.items}
      variant={variant}
      isDark={isDark}
      showBadge={showBadge}
    />
  );
}

function renderLayoutRow(
  row: GridLayoutRow,
  rowIndex: number,
  variant: GridVariant,
  isDark: boolean,
  showBadge: boolean,
) {
  return (
    <ListingGridLayoutRow
      key={row.type === "wide" ? `wide-${rowIndex}` : `pair-${rowIndex}`}
      row={row}
      variant={variant}
      isDark={isDark}
      showBadge={showBadge}
    />
  );
}

export function useListingGridLayout(
  cars: Car[],
  options?: {
    injectPromotions?: boolean;
    promotionPool?: Car[];
  },
) {
  return useMemo(() => {
    const items = buildListingGridItems(cars, options);
    return buildGridLayout(items);
  }, [cars, options?.injectPromotions, options?.promotionPool]);
}

export function ListingGrid2x2({
  cars,
  isDark = false,
  showBadge = false,
  variant = "profile",
  injectPromotions = false,
  promotionPool,
  style,
}: ListingGrid2x2Props) {
  const layout = useListingGridLayout(cars, { injectPromotions, promotionPool });

  return (
    <View style={style}>
      {layout.map((row, rowIndex) => renderLayoutRow(row, rowIndex, variant, isDark, showBadge))}
    </View>
  );
}

const styles = StyleSheet.create({
  listingCard: {},
  badgeOverlay: { position: "absolute", top: 6, left: 6, zIndex: 2, gap: 4 },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  badgeActive: { backgroundColor: "rgba(10,122,74,0.85)" },
  badgeSold: { backgroundColor: "rgba(0,0,0,0.55)" },
  badgeSponsored: { backgroundColor: "rgba(255,140,0,0.92)" },
  badgeFeatured: { backgroundColor: "rgba(14,181,202,0.92)" },
  badgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold", color: "#fff" },
  imgPlaceholder: { alignItems: "center", justifyContent: "center" },
  listingInfo: { padding: LISTING_GRID.infoPadding, gap: 3 },
  listingTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  listingPrice: { fontSize: 13, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  listingMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  listingMetaText: { fontSize: 10, color: "#94A3B8", fontFamily: "Inter_400Regular" },

  wideRow: { marginBottom: LISTING_GRID.rowMarginBottom },
  wideCard: {},
  wideImgWrap: { height: 230, position: "relative", backgroundColor: "#1A2340" },
  wideImg: { width: "100%", height: "100%" },
  wideScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 90 },
  wideSponsoredBadge: {
    position: "absolute", top: 10, left: 10,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  wideSponsoredText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  wideFeaturedBadge: {
    position: "absolute", top: 10, left: 10,
    backgroundColor: "#0EB5CA", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  wideFeaturedText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  widePriceBadge: {
    position: "absolute", bottom: 10, left: 10,
    backgroundColor: "#0EB5CA", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  widePriceText: { color: "#fff", fontSize: 13, fontFamily: "Manrope_800ExtraBold" },
  wideInfo: { padding: LISTING_GRID.infoPadding + 2, gap: 6 },
  wideTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  wideMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  wideMetaChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  wideMetaText: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#64748B" },
});
