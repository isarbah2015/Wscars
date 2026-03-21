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

  // Animations
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const pressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.965,
        useNativeDriver: true,
        speed: 80,
        bounciness: 0,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 28,
        bounciness: 5,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isNew = car.condition === "New";
  const isForeign = car.condition === "Foreign Used";
  const badgeLabel = isNew ? "New" : isForeign ? "Foreign" : null;
  const badgeColor = isNew ? "#27AE60" : "#1565C0";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
      >
        {/* Press overlay for iOS/web */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.pressOverlay,
            { opacity: overlayOpacity },
          ]}
          pointerEvents="none"
        />

        {/* Image */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: car.images[0] }} style={styles.image} resizeMode="cover" />

          {/* Condition badge — green/blue pill top-left */}
          {badgeLabel && (
            <View style={[styles.condBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.condBadgeText}>{badgeLabel}</Text>
            </View>
          )}

          {/* Heart — top-right, white, no background */}
          <Pressable
            style={styles.heart}
            onPress={() => toggleFavorite(car.id)}
            hitSlop={10}
          >
            <Feather
              name={fav ? "heart" : "heart"}
              size={20}
              color={fav ? "#E8192C" : "rgba(255,255,255,0.92)"}
            />
          </Pressable>

          {/* Sponsored badge */}
          {car.isSponsored && (
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>Ad</Text>
            </View>
          )}

          {/* Views count */}
          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.88)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
            </View>
          )}
        </View>

        {/* Info block — minimal auto.ru style */}
        <View style={styles.info}>
          <Text style={styles.price}>from {formatPrice(car.price)}</Text>
          <Text style={styles.carName} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.year}>{car.year}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    backgroundColor: "#fff",
    overflow: "hidden",
    borderRadius: 2,
  },
  pressOverlay: {
    backgroundColor: "rgba(0,0,0,0.04)",
    zIndex: 10,
    borderRadius: 2,
  },
  imageWrap: {
    position: "relative",
    height: 155,
    backgroundColor: "#F0F0F0",
  },
  image: { width: "100%", height: "100%" },

  condBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
  },

  heart: {
    position: "absolute",
    top: 6,
    right: 8,
    padding: 4,
  },

  adBadge: {
    position: "absolute",
    bottom: 6,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  adBadgeText: {
    color: "rgba(255,255,255,0.9)",
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
    backgroundColor: "rgba(0,0,0,0.38)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewsText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
    fontFamily: "Manrope_400Regular",
  },

  info: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
    letterSpacing: -0.2,
  },
  carName: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "#6B6B6B",
  },
  year: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "#9E9E9E",
  },
});
