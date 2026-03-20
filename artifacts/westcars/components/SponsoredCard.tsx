import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

interface SponsoredCardProps {
  car: Car;
}

export function SponsoredCard({ car }: SponsoredCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
    >
      <Image source={{ uri: car.images[0] }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {car.brand} {car.model}
        </Text>
        <Text style={styles.price}>{formatPrice(car.price)}</Text>
        <View style={styles.meta}>
          <Feather name="map-pin" size={10} color={Colors.light.textTertiary} />
          <Text style={styles.metaText}>{car.location}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFF9F5",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#FFE0C8",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 80,
  },
  info: {
    flex: 1,
    padding: 10,
    gap: 3,
  },
  sponsoredBadge: {
    backgroundColor: Colors.primary + "22",
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  sponsoredText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
  title: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  price: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
});
