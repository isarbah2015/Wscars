import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";
import { useApp } from "@/context/AppContext";

interface CarCardProps {
  car: Car;
  style?: object;
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(car.id);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.972, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 3 }).start();

  const isNew = car.condition === "New" || car.condition === "Foreign Used";
  const badgeLabel = car.condition === "New" ? "New" : car.condition === "Foreign Used" ? "Foreign" : null;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        {/* Image */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: car.images[0] }} style={styles.image} resizeMode="cover" />

          {/* Condition badge — green pill top-left */}
          {badgeLabel && (
            <View style={styles.condBadge}>
              <Text style={styles.condBadgeText}>{badgeLabel}</Text>
            </View>
          )}

          {/* Heart — top-right, white outline, no circle bg */}
          <Pressable style={styles.heart} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
            <Feather
              name="heart"
              size={20}
              color={fav ? Colors.danger : "rgba(255,255,255,0.9)"}
            />
          </Pressable>

          {/* Views */}
          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.85)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
            </View>
          )}
        </View>

        {/* Info — minimal, like auto.ru */}
        <View style={styles.info}>
          {/* Price first — bold black */}
          <Text style={styles.price}>
            from {formatPrice(car.price)}
          </Text>
          {/* Car name — gray */}
          <Text style={styles.carName} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          {/* Year — lighter gray */}
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
  },
  imageWrap: {
    position: "relative",
    height: 160,
    backgroundColor: "#F0F0F0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  condBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#27AE60",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  heart: {
    position: "absolute",
    top: 6,
    right: 8,
    padding: 4,
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
    fontFamily: "Inter_400Regular",
  },
  info: {
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 2,
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -0.2,
  },
  carName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B6B6B",
  },
  year: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9E9E9E",
  },
});
