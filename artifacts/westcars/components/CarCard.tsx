import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

interface CarCardProps {
  car: Car;
  style?: object;
}

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <View style={starStyles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather
          key={i}
          name="star"
          size={11}
          color={i <= Math.round(rating) ? "#FBBF24" : "#E5E7EB"}
        />
      ))}
      <Text style={starStyles.count}>({rating})</Text>
    </View>
  );
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const fav = isFavorite(car.id);
  const [imgError, setImgError] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const nativeDriver = Platform.OS !== "web";

  const pressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: nativeDriver, speed: 80, bounciness: 0 }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: nativeDriver, speed: 28, bounciness: 5 }).start();

  const isNew     = car.condition === "New";
  const isForeign = car.condition === "Foreign Used";
  const isSold    = (car as any).isSold;

  const condLabel = isNew ? "New" : isForeign ? "Tokunbo" : "Used";
  const condColor = isNew ? "#10B981" : isForeign ? "#F59E0B" : "#3B82F6";

  const handleFav = () => {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    toggleFavorite(car.id);
  };

  const cardBg  = isDark ? "#1C2438" : "#FFFFFF";
  const borderC = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const textPrimary   = isDark ? "#F1F5F9" : "#1F2937";
  const textSecondary = isDark ? "#94A3B8" : "#6B7280";

  // ─── Sponsored card ────────────────────────────────────────────────────────
  if (car.isSponsored) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <LinearGradient
          colors={["#FFB347", "#FF8C00", "#E8640A", "#FFB347"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={sStyles.gradBorder}
        >
          <Pressable
            style={[sStyles.card, { backgroundColor: isDark ? "#1C1408" : "#FFFBF4" }]}
            onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
            onPressIn={pressIn} onPressOut={pressOut}
            android_ripple={{ color: "rgba(255,140,0,0.10)", borderless: false }}
          >
            {/* Image */}
            <View style={sStyles.imageWrap}>
              {!imgError ? (
                <Image source={{ uri: car.images[0] }} style={sStyles.image} resizeMode="cover" onError={() => setImgError(true)} />
              ) : (
                <View style={[sStyles.image, styles.imgFallback, { backgroundColor: "#FFF0D6" }]}>
                  <Feather name="camera" size={22} color="#FF8C00" />
                </View>
              )}
              <LinearGradient colors={["#FF8C00", "#FFB347"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={sStyles.adBadge}>
                <Text style={sStyles.adStar}>★</Text>
                <Text style={sStyles.adText}>SPONSORED</Text>
              </LinearGradient>
              <Pressable style={styles.heartBtn} onPress={handleFav} hitSlop={10}>
                <View style={[styles.heartBg, fav && styles.heartBgActive]}>
                  <Feather name="heart" size={13} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
                </View>
              </Pressable>
              {isSold && <View style={styles.soldOverlay}><Text style={styles.soldText}>SOLD</Text></View>}
            </View>

            {/* Details */}
            <View style={sStyles.details}>
              <View style={styles.titlePriceRow}>
                <Text style={[styles.carTitle, { color: isDark ? "#F9E5C0" : "#7C3A00" }]} numberOfLines={1}>
                  {car.brand} {car.model}
                </Text>
                <Text style={[styles.price, { color: "#FF8C00" }]}>{formatPrice(car.price)}</Text>
              </View>
              <View style={styles.yearMileRow}>
                <Feather name="calendar" size={11} color="#9CA3AF" />
                <Text style={[styles.yearText, { color: textSecondary }]}>{car.year}</Text>
                {car.mileage > 0 && (
                  <>
                    <Text style={styles.dot}>·</Text>
                    <Feather name="activity" size={11} color="#9CA3AF" />
                    <Text style={[styles.yearText, { color: textSecondary }]}>
                      {(car.mileage / 1000).toFixed(0)}k km
                    </Text>
                  </>
                )}
              </View>
              <StarRating />
              <View style={styles.chipsRow}>
                {car.location && (
                  <View style={styles.infoChip}>
                    <Feather name="map-pin" size={10} color="#6B7280" />
                    <Text style={styles.infoChipText} numberOfLines={1}>{car.location.split(",")[0]}</Text>
                  </View>
                )}
                {(car as any).fuelType && (
                  <View style={styles.infoChip}>
                    <Feather name="droplet" size={10} color="#6B7280" />
                    <Text style={styles.infoChipText}>{(car as any).fuelType}</Text>
                  </View>
                )}
                {car.seller?.name && (
                  <View style={styles.infoChip}>
                    <Feather name="user" size={10} color="#6B7280" />
                    <Text style={styles.infoChipText} numberOfLines={1}>{car.seller.name}</Text>
                    {car.seller?.isVerified && <Feather name="check-circle" size={9} color="#1565C0" />}
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        </LinearGradient>
      </Animated.View>
    );
  }

  // ─── Regular card ──────────────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: borderC,
            shadowColor: isDark ? "#000" : "#0A1628",
            shadowOpacity: isDark ? 0.14 : 0.07,
          },
        ]}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn} onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,107,0,0.08)", borderless: false }}
      >
        {/* ── Left: Image (120×120) ── */}
        <View style={styles.imageWrap}>
          {!imgError ? (
            <Image source={{ uri: car.images[0] }} style={styles.image} resizeMode="cover" onError={() => setImgError(true)} />
          ) : (
            <View style={[styles.image, styles.imgFallback, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="camera" size={22} color={colors.accent} />
            </View>
          )}

          {/* Condition badge — bottom-left */}
          <View style={[styles.condBadge, { backgroundColor: condColor }]}>
            <Text style={styles.condBadgeText}>{condLabel}</Text>
          </View>

          {/* Heart — top-right */}
          <Pressable style={styles.heartBtn} onPress={handleFav} hitSlop={10}>
            <View style={[styles.heartBg, fav && styles.heartBgActive]}>
              <Feather name="heart" size={13} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
            </View>
          </Pressable>

          {/* Views */}
          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.88)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
            </View>
          )}

          {/* SOLD overlay */}
          {isSold && <View style={styles.soldOverlay}><Text style={styles.soldText}>SOLD</Text></View>}
        </View>

        {/* ── Right: Details ── */}
        <View style={styles.details}>

          {/* Title + Price */}
          <View style={styles.titlePriceRow}>
            <Text style={[styles.carTitle, { color: textPrimary }]} numberOfLines={1}>
              {car.brand} {car.model}
            </Text>
            <Text style={styles.price}>{formatPrice(car.price)}</Text>
          </View>

          {/* Year + Mileage */}
          <View style={styles.yearMileRow}>
            <Feather name="calendar" size={11} color="#9CA3AF" />
            <Text style={[styles.yearText, { color: textSecondary }]}>{car.year}</Text>
            {car.mileage > 0 && (
              <>
                <Text style={styles.dot}>·</Text>
                <Feather name="activity" size={11} color="#9CA3AF" />
                <Text style={[styles.yearText, { color: textSecondary }]}>
                  {(car.mileage / 1000).toFixed(0)}k km
                </Text>
              </>
            )}
          </View>

          {/* Star rating */}
          <StarRating />

          {/* Info chips */}
          <View style={styles.chipsRow}>
            {car.location && (
              <View style={styles.infoChip}>
                <Feather name="map-pin" size={10} color="#6B7280" />
                <Text style={styles.infoChipText} numberOfLines={1}>{car.location.split(",")[0]}</Text>
              </View>
            )}
            {(car as any).fuelType && (
              <View style={styles.infoChip}>
                <Feather name="droplet" size={10} color="#6B7280" />
                <Text style={styles.infoChipText}>{(car as any).fuelType}</Text>
              </View>
            )}
            {(car as any).transmission && (
              <View style={styles.infoChip}>
                <Feather name="settings" size={10} color="#6B7280" />
                <Text style={styles.infoChipText}>{(car as any).transmission}</Text>
              </View>
            )}
          </View>

          {/* Seller */}
          {car.seller?.name && (
            <View style={styles.sellerRow}>
              <Feather name="user" size={10} color="#9CA3AF" />
              <Text style={[styles.sellerName, { color: textSecondary }]} numberOfLines={1}>
                {car.seller.name}
              </Text>
              {car.seller?.isVerified && <Feather name="check-circle" size={10} color="#1565C0" />}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const starStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  count: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#9CA3AF", marginLeft: 3 },
});

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 2,
  },

  // ── Image (left side) ──
  imageWrap: {
    width: 120,
    height: 120,
    position: "relative",
    backgroundColor: "#1A2340",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  imgFallback: { alignItems: "center", justifyContent: "center" },

  condBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.4,
  },

  heartBtn: { position: "absolute", top: 6, right: 6 },
  heartBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBgActive: { backgroundColor: "#E8192C" },

  viewsTag: {
    position: "absolute",
    top: 7,
    left: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  viewsText: { color: "rgba(255,255,255,0.9)", fontSize: 9, fontFamily: "Inter_500Medium" },

  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.60)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 4 },

  // ── Details (right side) ──
  details: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    justifyContent: "space-between",
    gap: 2,
  },

  titlePriceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
  },
  carTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  price: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#FF6B00",
    letterSpacing: -0.3,
    flexShrink: 0,
  },

  yearMileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  yearText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  dot: { color: "#D1D5DB", fontSize: 12 },

  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  infoChipText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
    maxWidth: 70,
  },

  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  sellerName: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
  },
});

// ─── Sponsored styles ───────────────────────────────────────────────────────

const sStyles = StyleSheet.create({
  gradBorder: {
    borderRadius: 17,
    padding: 1.5,
    shadowColor: "#FF8C00",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginBottom: 2,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
  },
  imageWrap: {
    width: 120,
    height: 120,
    position: "relative",
    backgroundColor: "#2A1800",
    flexShrink: 0,
  },
  image: { width: "100%", height: "100%" },
  adBadge: {
    position: "absolute",
    top: 7,
    left: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  adStar: { color: "#fff", fontSize: 8, lineHeight: 12 },
  adText: { color: "#fff", fontSize: 8, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  details: {
    flex: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    gap: 3,
  },
});
