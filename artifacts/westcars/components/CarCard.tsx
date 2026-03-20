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

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(car.id);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.962,
      useNativeDriver: true,
      speed: 60,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 5,
    }).start();
  };

  const conditionColor =
    car.condition === "New"
      ? "#00873E"
      : car.condition === "Foreign Used"
      ? "#1D4ED8"
      : "#6D28D9";

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* ── Image ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: car.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Top badges row */}
          <View style={styles.topBadges}>
            <View style={[styles.conditionBadge, { backgroundColor: conditionColor }]}>
              <Text style={styles.conditionText}>{car.condition}</Text>
            </View>
            {car.isSponsored && (
              <View style={styles.featuredBadge}>
                <Feather name="zap" size={9} color="#FFD700" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>

          {/* Favorite button */}
          <Pressable
            style={styles.favButton}
            onPress={() => toggleFavorite(car.id)}
            hitSlop={8}
          >
            <Feather
              name="heart"
              size={15}
              color={fav ? "#FF4444" : "rgba(255,255,255,0.92)"}
            />
          </Pressable>

          {/* Views counter */}
          <View style={styles.viewsBadge}>
            <Feather name="eye" size={9} color="rgba(255,255,255,0.9)" />
            <Text style={styles.viewsText}>{formatViews(car.views || 0)} views</Text>
          </View>
        </View>

        {/* ── Info ── */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {car.year} {car.brand} {car.model}
          </Text>

          <Text style={styles.price}>{formatPrice(car.price)}</Text>

          {/* Km & Location chips */}
          <View style={styles.chipsRow}>
            <View style={styles.chip}>
              <Feather name="activity" size={10} color={Colors.primary} />
              <Text style={styles.chipText}>
                {(car.mileage / 1000).toFixed(0)}k km
              </Text>
            </View>
            <View style={styles.chip}>
              <Feather name="map-pin" size={10} color={Colors.primary} />
              <Text style={styles.chipText}>{car.location}</Text>
            </View>
          </View>

          {/* Seller */}
          <View style={styles.sellerRow}>
            {car.seller?.avatar ? (
              <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
            ) : (
              <View style={styles.sellerAvatarFallback}>
                <Feather name="user" size={9} color={Colors.light.textTertiary} />
              </View>
            )}
            <Text style={styles.sellerName} numberOfLines={1}>
              {car.seller?.name || "Private Seller"}
            </Text>
            {car.seller?.isVerified && (
              <Feather name="check-circle" size={11} color={Colors.verified} />
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#003D1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  imageContainer: {
    position: "relative",
    height: 148,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topBadges: {
    position: "absolute",
    top: 9,
    left: 9,
    flexDirection: "row",
    gap: 5,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  conditionText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.2,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  featuredText: {
    color: "#FFD700",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.40)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  viewsBadge: {
    position: "absolute",
    bottom: 8,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.48)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  viewsText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  info: {
    padding: 11,
    gap: 5,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  price: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    letterSpacing: -0.4,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipText: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_500Medium",
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  sellerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sellerAvatarFallback: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
    flex: 1,
  },
});
