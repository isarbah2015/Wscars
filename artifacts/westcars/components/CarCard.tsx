import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
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
import { RatingStars } from "./RatingStars";

interface CarCardProps {
  car: Car;
  style?: object;
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(car.id);

  const handlePress = () => {
    router.push({ pathname: "/car/[id]", params: { id: car.id } });
  };

  const miniRatings = [
    { icon: "wind", val: car.rating.comfort, label: "C" },
    { icon: "zap", val: car.rating.performance, label: "P" },
    { icon: "shield", val: car.rating.safety, label: "S" },
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && { opacity: 0.93, transform: [{ scale: 0.98 }] },
      ]}
      onPress={handlePress}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: car.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Badges */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.conditionBadge,
              car.condition === "New"
                ? styles.badgeNew
                : car.condition === "Foreign Used"
                ? styles.badgeForeign
                : styles.badgeGhana,
            ]}
          >
            <Text style={styles.conditionText}>{car.condition}</Text>
          </View>
          {car.isSponsored && (
            <View style={styles.sponsoredBadge}>
              <Text style={styles.sponsoredText}>Ad</Text>
            </View>
          )}
        </View>
        {/* Favorite */}
        <Pressable
          style={styles.favButton}
          onPress={() => toggleFavorite(car.id)}
          hitSlop={8}
        >
          <Feather
            name={fav ? "heart" : "heart"}
            size={16}
            color={fav ? Colors.danger : "#fff"}
          />
        </Pressable>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          {car.seller?.isVerified && (
            <Feather name="check-circle" size={13} color={Colors.verified} />
          )}
        </View>

        {/* Year & location */}
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{car.year}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Feather name="map-pin" size={10} color={Colors.light.textTertiary} />
          <Text style={styles.meta}>{car.location}</Text>
        </View>

        {/* Price */}
        <Text style={styles.price}>{formatPrice(car.price)}</Text>

        {/* Rating section */}
        {car.rating.overall > 0 && (
          <View style={styles.ratingSection}>
            <View style={styles.overallRating}>
              <RatingStars rating={car.rating.overall} size={10} />
              <Text style={styles.ratingCount}>({car.rating.totalRatings})</Text>
            </View>
            <View style={styles.miniRatings}>
              {miniRatings.map((r) => (
                <View key={r.icon} style={styles.miniRatingItem}>
                  <Feather
                    name={r.icon as any}
                    size={9}
                    color={Colors.primary}
                  />
                  <Text style={styles.miniRatingVal}>
                    {r.val.toFixed(1)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  imageContainer: {
    position: "relative",
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  topRow: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 6,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeNew: { backgroundColor: Colors.success },
  badgeForeign: { backgroundColor: "#2563EB" },
  badgeGhana: { backgroundColor: "#7C3AED" },
  conditionText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  sponsoredBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sponsoredText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  favButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    padding: 10,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  meta: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  metaDot: {
    fontSize: 11,
    color: Colors.light.textTertiary,
  },
  price: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    marginTop: 2,
  },
  ratingSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 4,
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingCount: {
    fontSize: 10,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  miniRatings: {
    flexDirection: "row",
    gap: 8,
  },
  miniRatingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  miniRatingVal: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_500Medium",
  },
});
