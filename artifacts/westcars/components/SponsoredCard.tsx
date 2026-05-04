import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
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

const SCREEN_W = Dimensions.get("window").width;

interface SponsoredCardProps {
  car: Car;
  style?: object;
}

export function SponsoredCard({ car, style }: SponsoredCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const { colors, isDark } = useTheme();
  const fav = isFavorite(car.id);
  const [imgError, setImgError] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 80, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 4 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <LinearGradient
        colors={["#FFB347", "#FF8C00", "#E8640A", "#FFB347"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <Pressable
          style={[styles.card, { backgroundColor: isDark ? "#1C1408" : "#FFFBF4" }]}
          onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
          onPressIn={pressIn}
          onPressOut={pressOut}
          android_ripple={{ color: "rgba(255,140,0,0.10)", borderless: false }}
        >
          {/* ── Large image block ── */}
          <View style={styles.imageWrap}>
            {!imgError ? (
              <Image
                source={{ uri: car.images[0] }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.image, styles.imgFallback]}>
                <Feather name="camera" size={32} color="#FF8C00" />
              </View>
            )}

            {/* Scrim at bottom of image */}
            <LinearGradient
              colors={["transparent", "rgba(20,8,0,0.72)"]}
              style={styles.scrim}
              pointerEvents="none"
            />

            {/* ★ SPONSORED pill — top-left */}
            <LinearGradient
              colors={["#FF8C00", "#FFB347"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sponsoredPill}
            >
              <Text style={styles.sponsoredStar}>★</Text>
              <Text style={styles.sponsoredLabel}>SPONSORED</Text>
            </LinearGradient>

            {/* Favourite — top-right */}
            <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={12}>
              <View style={[styles.heartBg, fav && styles.heartBgActive]}>
                <Feather name="heart" size={14} color={fav ? "#fff" : "rgba(255,255,255,0.92)"} />
              </View>
            </Pressable>

            {/* Price badge — bottom-right overlaid on image */}
            <LinearGradient
              colors={["#FF8C00", "#E8640A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceBadge}
            >
              <Text style={styles.priceText}>{formatPrice(car.price)}</Text>
            </LinearGradient>
          </View>

          {/* ── Info bar below image ── */}
          <View style={styles.infoRow}>
            {/* Left: name + chips */}
            <View style={styles.infoLeft}>
              <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>
                {car.brand} {car.model}
              </Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: isDark ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.10)" }]}>
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>{car.year}</Text>
                </View>
                {car.mileage !== undefined && (
                  <View style={[styles.chip, { backgroundColor: isDark ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.10)" }]}>
                    <Feather name="activity" size={9} color={colors.textTertiary} />
                    <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                      {car.mileage === 0 ? "New" : `${(car.mileage / 1000).toFixed(0)}k km`}
                    </Text>
                  </View>
                )}
                {car.location && (
                  <View style={[styles.chip, { backgroundColor: isDark ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.10)" }]}>
                    <Feather name="map-pin" size={9} color={colors.textTertiary} />
                    <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {car.location.split(",")[0]}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Right: view detail arrow */}
            <View style={styles.arrowWrap}>
              <LinearGradient
                colors={["#FF8C00", "#E8640A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.arrowBtn}
              >
                <Feather name="arrow-right" size={15} color="#fff" />
              </LinearGradient>
            </View>
          </View>

          {/* ── Footer strip ── */}
          <View style={[styles.footerStrip, { borderTopColor: isDark ? "rgba(255,140,0,0.18)" : "rgba(255,140,0,0.14)" }]}>
            <Feather name="star" size={10} color="#FF8C00" />
            <Text style={styles.footerText}>Featured Listing · Promoted by Seller</Text>
            {car.seller?.isVerified && (
              <>
                <View style={styles.footerDot} />
                <Feather name="check-circle" size={10} color="#1565C0" />
                <Text style={[styles.footerText, { color: "#1565C0" }]}>Verified</Text>
              </>
            )}
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 18,
    padding: 1.5,
    marginHorizontal: 14,
    marginBottom: 14,
    shadowColor: "#FF8C00",
    shadowOpacity: 0.26,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  card: {
    borderRadius: 17,
    overflow: "hidden",
  },

  imageWrap: {
    width: "100%",
    height: 190,
    backgroundColor: "#2A1800",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imgFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0D6",
  },
  scrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },

  sponsoredPill: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sponsoredStar: { color: "#fff", fontSize: 9, lineHeight: 12 },
  sponsoredLabel: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 1,
  },

  heartBtn: { position: "absolute", top: 10, right: 10 },
  heartBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBgActive: { backgroundColor: "#E8192C" },

  priceBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: -0.3,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 9,
    gap: 10,
  },
  infoLeft: {
    flex: 1,
    gap: 6,
  },
  carName: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: 0.05,
  },
  chipRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "nowrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
  },

  arrowWrap: {},
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  footerStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#FF8C00",
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 1,
  },
});
