import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef } from "react";
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
import { FEATURED_HERO_H } from "@/constants/listingGrid";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

type FeaturedListingCardProps = {
  car: Car;
  isDark?: boolean;
  showSeller?: boolean;
  style?: ViewStyle;
};

function usePressScale(toValue = 0.98) {
  const scale = useRef(new Animated.Value(1)).current;
  const nativeDriver = Platform.OS !== "web";
  const pressIn = () =>
    Animated.spring(scale, { toValue, useNativeDriver: nativeDriver, speed: 80, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: nativeDriver, speed: 28, bounciness: 5 }).start();
  return { scale, pressIn, pressOut };
}

function conditionBadge(car: Car): { label: string; color: string } | null {
  if (car.isSponsored) return null;
  if (car.isFeatured) return { label: "Featured", color: "#0EB5CA" };
  if (car.condition === "New") return { label: "New", color: "#0EB5CA" };
  if (car.condition === "Foreign Used") return { label: "Foreign", color: "#1565C0" };
  return null;
}

export function FeaturedListingCard({
  car,
  isDark: isDarkProp,
  showSeller = true,
  style,
}: FeaturedListingCardProps) {
  const { colors, isDark: themeDark } = useTheme();
  const isDark = isDarkProp ?? themeDark;
  const { scale, pressIn, pressOut } = usePressScale();
  const sponsored = car.isSponsored;
  const cond = conditionBadge(car);
  const photoCount = car.images?.length ?? 0;
  const chipBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  const openDetail = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push({ pathname: "/car/[id]", params: { id: car.id } });
  };

  const cardInner = (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: sponsored ? (isDark ? "#1C1408" : "#FFFBF4") : colors.card,
          borderColor: sponsored
            ? "transparent"
            : isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.07)",
          shadowColor: sponsored ? "#FF8C00" : isDark ? "#0EB5CA" : "#0A1628",
          shadowOpacity: sponsored ? 0.22 : isDark ? 0.08 : 0.12,
        },
      ]}
      onPress={openDetail}
      onPressIn={pressIn}
      onPressOut={pressOut}
      android_ripple={{ color: sponsored ? "rgba(255,140,0,0.10)" : "rgba(14,181,202,0.08)", borderless: false }}
    >
      <View style={styles.imgWrap}>
        {car.images?.[0] ? (
          <Image source={{ uri: car.images[0] }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, styles.imgFallback, { backgroundColor: isDark ? "#111827" : "#F8FAFC" }]}>
            <Feather name="camera" size={28} color={isDark ? "#94A3B8" : "#64748B"} />
          </View>
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.28)", "transparent", "transparent", "rgba(0,0,0,0.72)"]}
          locations={[0, 0.22, 0.55, 1]}
          style={styles.imgVignette}
          pointerEvents="none"
        />

        {sponsored ? (
          <LinearGradient
            colors={["#FF8C00", "#FFB347"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sponsoredBadge}
          >
            <Text style={styles.sponsoredStar}>★</Text>
            <Text style={styles.sponsoredText}>SPONSORED</Text>
          </LinearGradient>
        ) : cond ? (
          <View style={[styles.condBadge, { backgroundColor: cond.color }]}>
            <Text style={styles.condText}>{cond.label}</Text>
          </View>
        ) : null}

        {photoCount > 1 && (
          <View style={styles.photoPill}>
            <Feather name="image" size={10} color="#fff" />
            <Text style={styles.photoPillText}>{photoCount}</Text>
          </View>
        )}

        <LinearGradient
          colors={sponsored ? ["#FF8C00", "#E8640A"] : ["#0EB5CA", "#0891B2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.priceBadge, sponsored && styles.priceBadgeSponsored]}
        >
          <Text style={styles.priceText}>{formatPrice(car.price)}</Text>
        </LinearGradient>

        {car.views !== undefined && car.views > 0 && (
          <View style={styles.viewsTag}>
            <Feather name="eye" size={10} color="rgba(255,255,255,0.9)" />
            <Text style={styles.viewsText}>
              {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.info, sponsored && { backgroundColor: isDark ? "#1C1408" : "#FFFBF4" }]}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {car.brand} {car.model}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.chip, { backgroundColor: chipBg }]}>
            <Text style={[styles.chipText, { color: colors.textSecondary }]}>{car.year}</Text>
          </View>
          {car.mileage > 0 && (
            <View style={[styles.chip, { backgroundColor: chipBg }]}>
              <Feather name="activity" size={10} color={colors.textTertiary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                {(car.mileage / 1000).toFixed(0)}k km
              </Text>
            </View>
          )}
          {car.transmission ? (
            <View style={[styles.chip, { backgroundColor: chipBg }]}>
              <Feather name="settings" size={10} color={colors.textTertiary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {car.transmission}
              </Text>
            </View>
          ) : null}
          {car.fuelType ? (
            <View style={[styles.chip, { backgroundColor: chipBg }]}>
              <Feather name="droplet" size={10} color={colors.textTertiary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {car.fuelType}
              </Text>
            </View>
          ) : null}
          {car.location ? (
            <View style={[styles.chip, { backgroundColor: chipBg }]}>
              <Feather name="map-pin" size={10} color={colors.textTertiary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {car.location.split(",")[0]}
              </Text>
            </View>
          ) : null}
        </View>

        {showSeller && car.seller?.name ? (
          <View style={styles.sellerRow}>
            <Feather name="user" size={11} color={colors.textTertiary} />
            <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
              {car.seller.name}
            </Text>
            {car.seller?.isVerified ? (
              <Feather name="check-circle" size={11} color={colors.accent} />
            ) : null}
          </View>
        ) : null}

        <View style={styles.ctaRow}>
          <Text style={[styles.ctaText, { color: sponsored ? "#E8640A" : colors.accent }]}>
            View details
          </Text>
          <Feather name="chevron-right" size={14} color={sponsored ? "#E8640A" : colors.accent} />
        </View>
      </View>
    </Pressable>
  );

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      {sponsored ? (
        <LinearGradient
          colors={["#FFB347", "#FF8C00", "#E8640A", "#FFB347"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.goldFrame}
        >
          {cardInner}
        </LinearGradient>
      ) : (
        cardInner
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  goldFrame: {
    borderRadius: 20,
    padding: 2,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  imgWrap: {
    height: FEATURED_HERO_H,
    position: "relative",
    backgroundColor: "#1A2340",
  },
  img: { width: "100%", height: "100%" },
  imgFallback: { alignItems: "center", justifyContent: "center" },
  imgVignette: { ...StyleSheet.absoluteFillObject },
  sponsoredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    shadowColor: "#FF8C00",
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sponsoredStar: { color: "#fff", fontSize: 10, lineHeight: 13 },
  sponsoredText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  condBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  condText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  photoPill: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  photoPillText: { color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" },
  priceBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  priceBadgeSponsored: {
    shadowColor: "#FF8C00",
  },
  priceText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  viewsTag: {
    position: "absolute",
    bottom: 14,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  viewsText: { color: "rgba(255,255,255,0.92)", fontSize: 10, fontFamily: "Inter_500Medium" },
  info: { padding: 14, gap: 8 },
  title: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  metaRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, fontFamily: "Inter_500Medium", maxWidth: 120 },
  sellerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  sellerName: { fontSize: 12, fontFamily: "Inter_500Medium", flex: 1 },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
    marginTop: 2,
  },
  ctaText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});
