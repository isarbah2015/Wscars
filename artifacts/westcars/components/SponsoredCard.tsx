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
          {/* Left: image */}
          <View style={styles.imageCol}>
            {!imgError ? (
              <Image
                source={{ uri: car.images[0] }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.image, styles.imgFallback]}>
                <Feather name="camera" size={22} color="#FF8C00" />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(30,12,0,0.60)"]}
              style={styles.imageScrim}
              pointerEvents="none"
            />
            <LinearGradient
              colors={["#FF8C00", "#E8640A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceBadge}
            >
              <Text style={styles.priceText}>{formatPrice(car.price)}</Text>
            </LinearGradient>
          </View>

          {/* Right: info */}
          <View style={styles.infoCol}>
            <LinearGradient
              colors={["#FF8C00", "#FFB347"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sponsoredPill}
            >
              <Text style={styles.sponsoredStar}>★</Text>
              <Text style={styles.sponsoredLabel}>SPONSORED</Text>
            </LinearGradient>

            <Text style={[styles.carName, { color: colors.text }]} numberOfLines={2}>
              {car.brand} {car.model}
            </Text>

            <View style={styles.metaRow}>
              <View style={[styles.chip, { backgroundColor: "rgba(255,140,0,0.12)" }]}>
                <Text style={[styles.chipText, { color: colors.textSecondary }]}>{car.year}</Text>
              </View>
              {car.mileage !== undefined && (
                <View style={[styles.chip, { backgroundColor: "rgba(255,140,0,0.12)" }]}>
                  <Feather name="activity" size={8} color={colors.textTertiary} />
                  <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                    {car.mileage === 0 ? "New" : `${(car.mileage / 1000).toFixed(0)}k km`}
                  </Text>
                </View>
              )}
              {car.location && (
                <View style={[styles.chip, styles.chipFlex, { backgroundColor: "rgba(255,140,0,0.12)" }]}>
                  <Feather name="map-pin" size={8} color={colors.textTertiary} />
                  <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {car.location.split(",")[0]}
                  </Text>
                </View>
              )}
            </View>

            {car.seller?.name && (
              <View style={styles.sellerRow}>
                <Feather name="user" size={9} color={colors.textTertiary} />
                <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
                  {car.seller.name}
                </Text>
                {car.seller?.isVerified && (
                  <Feather name="check-circle" size={9} color="#1565C0" />
                )}
              </View>
            )}

            <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
              <View style={[styles.heartBg, fav && styles.heartBgActive]}>
                <Feather name="heart" size={12} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
              </View>
            </Pressable>
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 17,
    padding: 1.5,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#FF8C00",
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    height: 116,
  },

  imageCol: {
    width: 116,
    position: "relative",
    backgroundColor: "#2A1800",
  },
  image: { width: "100%", height: "100%" },
  imgFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0D6",
  },
  imageScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  priceBadge: {
    position: "absolute",
    bottom: 7,
    left: 7,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  priceText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },

  infoCol: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 8,
    gap: 4,
    position: "relative",
  },

  sponsoredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sponsoredStar: { color: "#fff", fontSize: 8, lineHeight: 11 },
  sponsoredLabel: {
    color: "#fff",
    fontSize: 8,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.8,
  },

  carName: {
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.05,
    lineHeight: 17,
  },

  metaRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "nowrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  chipFlex: { flex: 1, minWidth: 0, flexShrink: 1 },
  chipText: {
    fontSize: 9,
    fontFamily: "Manrope_500Medium",
    flexShrink: 1,
    minWidth: 0,
  },

  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerName: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    flex: 1,
  },

  heartBtn: { position: "absolute", top: 8, right: 8 },
  heartBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBgActive: { backgroundColor: "#E8192C" },
});
