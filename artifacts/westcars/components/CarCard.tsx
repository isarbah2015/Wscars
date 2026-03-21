import { Feather } from "@expo/vector-icons";
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
} from "react-native";
import { useApp } from "@/context/AppContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

interface CarCardProps {
  car: Car;
  style?: object;
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(car.id);

  const scale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 80, bounciness: 0 }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 28, bounciness: 4 }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const isNew     = car.condition === "New";
  const isForeign = car.condition === "Foreign Used";
  const badgeLabel = isNew ? "New" : isForeign ? "Foreign" : null;
  const badgeColor = isNew ? "#00B050" : "#1565C0";

  const isSold = (car as any).isSold;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
      >
        {/* Press glow overlay */}
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.pressOverlay, { opacity: overlayOpacity }]}
          pointerEvents="none"
        />

        {/* ── Image block ── */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: car.images[0] }} style={styles.image} resizeMode="cover" />

          {/* Gradient scrim at bottom of image */}
          <View style={styles.imageScrim} pointerEvents="none" />

          {/* Condition badge top-left */}
          {badgeLabel && (
            <View style={[styles.condBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.condBadgeText}>{badgeLabel}</Text>
            </View>
          )}

          {/* Heart top-right */}
          <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
            <View style={styles.heartBg}>
              <Feather name="heart" size={15} color={fav ? "#E8192C" : "rgba(255,255,255,0.9)"} />
            </View>
          </Pressable>

          {/* Sponsored / Ad badge bottom-left */}
          {car.isSponsored && (
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Ad</Text>
            </View>
          )}

          {/* Views tag bottom-right */}
          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.88)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
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
        <View style={styles.info}>
          <Text style={styles.price}>from {formatPrice(car.price)}</Text>
          <Text style={styles.carName} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.year}>{car.year}</Text>
            {car.mileage !== undefined && car.mileage > 0 && (
              <Text style={styles.mileage}>{(car.mileage / 1000).toFixed(0)}k km</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#0A1628",
    shadowOpacity: 0.13,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 2,
  },
  pressOverlay: {
    backgroundColor: "rgba(0,0,0,0.04)",
    zIndex: 10,
    borderRadius: 14,
  },

  imageWrap: {
    position: "relative",
    height: 150,
    backgroundColor: "#EAECF0",
  },
  image: { width: "100%", height: "100%" },

  imageScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "transparent",
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
    letterSpacing: 0.3,
  },

  heartBtn: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  heartBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  adBadge: {
    position: "absolute",
    bottom: 6,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.50)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 9,
    fontFamily: "Manrope_600SemiBold",
    letterSpacing: 0.5,
  },

  viewsTag: {
    position: "absolute",
    bottom: 6,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.42)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewsText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
    fontFamily: "Manrope_400Regular",
  },

  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldText: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 4,
  },

  info: {
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 11,
    gap: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: "#0A1628",
    letterSpacing: -0.3,
  },
  carName: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: "#4A5568",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 1,
  },
  year: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: "#8A9BB4",
  },
  mileage: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: "#8A9BB4",
  },
});
