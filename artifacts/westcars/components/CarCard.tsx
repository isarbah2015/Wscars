import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Image,
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

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const { colors, isDark } = useTheme();
  const fav = isFavorite(car.id);
  const [imgError, setImgError] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 80, bounciness: 0 }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 5 }).start();

  const isNew     = car.condition === "New";
  const isForeign = car.condition === "Foreign Used";
  const badgeLabel = isNew ? "New" : isForeign ? "Foreign" : null;
  const isSold = (car as any).isSold;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={[
          styles.card,
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
        {/* ── Image block ── */}
        <View style={styles.imageWrap}>
          {!imgError ? (
            <Image
              source={{ uri: car.images[0] }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imgFallback, { backgroundColor: colors.accentLight }]}>
              <Feather name="camera" size={28} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 11, marginTop: 4 }}>No photo</Text>
            </View>
          )}

          {/* Gradient scrim — transparent top → dark bottom */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.72)"]}
            style={styles.imageScrim}
            pointerEvents="none"
          />

          {/* Condition badge top-left */}
          {badgeLabel && (
            <View style={[styles.condBadge, { backgroundColor: isNew ? "#FF6B00" : "#1565C0" }]}>
              <Text style={styles.condBadgeText}>{badgeLabel}</Text>
            </View>
          )}

          {/* Heart top-right */}
          <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
            <View style={[styles.heartBg, fav && styles.heartBgActive]}>
              <Feather name="heart" size={15} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
            </View>
          </Pressable>

          {/* Floating price badge — bottom-left on image */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{formatPrice(car.price)}</Text>
          </View>

          {/* Views tag bottom-right */}
          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.88)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
            </View>
          )}

          {/* Sponsored badge */}
          {car.isSponsored && (
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>AD</Text>
            </View>
          )}

          {/* SOLD overlay */}
          {isSold && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          )}
        </View>

        {/* ── Info block ── */}
        <View style={[styles.info, { backgroundColor: colors.card }]}>
          <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{car.year}</Text>
            </View>
            {car.mileage !== undefined && car.mileage > 0 && (
              <View style={styles.metaChip}>
                <Feather name="activity" size={9} color={colors.textTertiary} />
                <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                  {(car.mileage / 1000).toFixed(0)}k km
                </Text>
              </View>
            )}
            {car.location && (
              <View style={styles.metaChip}>
                <Feather name="map-pin" size={9} color={colors.textTertiary} />
                <Text style={[styles.metaChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {car.location.split(",")[0]}
                </Text>
              </View>
            )}
          </View>
          {car.seller?.isVerified && (
            <View style={styles.verifiedRow}>
              <Feather name="check-circle" size={11} color="#1565C0" />
              <Text style={styles.verifiedText}>Verified seller</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 2,
  },

  imageWrap: {
    position: "relative",
    height: 155,
    backgroundColor: "#1A2340",
  },
  image: { width: "100%", height: "100%" },
  imgFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  imageScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },

  condBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.5,
  },

  heartBtn: { position: "absolute", top: 6, right: 6 },
  heartBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBgActive: {
    backgroundColor: "#E8192C",
  },

  priceBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    backgroundColor: "#0EB5CA",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  priceBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.3,
  },

  adBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,107,0,0.85)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.8,
  },

  viewsTag: {
    position: "absolute",
    bottom: 9,
    right: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewsText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
    fontFamily: "Manrope_500Medium",
  },

  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldText: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 5,
  },

  info: {
    paddingHorizontal: 11,
    paddingTop: 9,
    paddingBottom: 10,
    gap: 5,
  },
  carName: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(128,128,128,0.1)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  metaChipText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: "#1565C0",
  },
});
