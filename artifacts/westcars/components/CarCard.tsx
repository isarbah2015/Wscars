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
  horizontal?: boolean;
}

export function CarCard({ car, style, horizontal }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const fav = isFavorite(car.id);
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.975, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 3 }).start();

  if (horizontal) {
    return (
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        <Pressable
          style={styles.hCard}
          onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
          onPressIn={pressIn}
          onPressOut={pressOut}
        >
          <Image source={{ uri: car.images[0] }} style={styles.hImage} />
          {car.isSponsored && <View style={styles.adTag}><Text style={styles.adTagText}>Ad</Text></View>}
          <View style={styles.hInfo}>
            <Text style={styles.hTitle} numberOfLines={1}>
              {car.brand} {car.model}
            </Text>
            <Text style={styles.hMeta}>{car.year} · {Math.round(car.mileage / 1000)}k km</Text>
            <Text style={styles.hPrice}>{formatPrice(car.price)}</Text>
            <Text style={styles.hLocation}>{car.location}</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

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
          <Pressable style={styles.favBtn} onPress={() => toggleFavorite(car.id)} hitSlop={8}>
            <Feather name="heart" size={14} color={fav ? Colors.danger : "rgba(255,255,255,0.95)"} />
          </Pressable>
          {car.isSponsored && (
            <View style={styles.adTag}><Text style={styles.adTagText}>Ad</Text></View>
          )}
          {car.views !== undefined && (
            <View style={styles.viewTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.85)" />
              <Text style={styles.viewTagText}>{car.views >= 1000 ? `${(car.views/1000).toFixed(1)}k` : car.views}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          <Text style={styles.meta}>
            {car.year} · {Math.round(car.mileage / 1000)}k km
          </Text>
          <Text style={styles.price}>{formatPrice(car.price)}</Text>

          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Feather name="map-pin" size={10} color={Colors.light.textTertiary} />
              <Text style={styles.location}>{car.location}</Text>
            </View>
            {car.condition !== "Ghana Used" && (
              <View style={[
                styles.condBadge,
                { backgroundColor: car.condition === "New" ? "#E8F5E9" : "#E3F2FD" }
              ]}>
                <Text style={[
                  styles.condText,
                  { color: car.condition === "New" ? "#2E7D32" : "#0066CC" }
                ]}>
                  {car.condition === "Foreign Used" ? "Foreign" : car.condition}
                </Text>
              </View>
            )}
          </View>

          {/* Seller row */}
          <View style={styles.sellerRow}>
            {car.seller?.avatar
              ? <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
              : <View style={styles.sellerAvatarFallback}><Feather name="user" size={9} color={Colors.light.textTertiary} /></View>
            }
            <Text style={styles.sellerName} numberOfLines={1}>{car.seller?.name || "Private Seller"}</Text>
            {car.seller?.isVerified && <Feather name="check-circle" size={10} color={Colors.primary} />}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 1 },
  card: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  imageWrap: { position: "relative", height: 150 },
  image: { width: "100%", height: "100%" },
  favBtn: {
    position: "absolute", top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center", justifyContent: "center",
  },
  adTag: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  adTagText: { color: "#fff", fontSize: 9, fontFamily: "Inter_600SemiBold" },
  viewTag: {
    position: "absolute", bottom: 6, left: 8,
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  viewTagText: { color: "rgba(255,255,255,0.9)", fontSize: 9, fontFamily: "Inter_400Regular" },
  info: { paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10, gap: 3 },
  title: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.light.text },
  meta: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  price: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#0066CC", marginTop: 1 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 3 },
  location: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  condBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  condText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  sellerRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    marginTop: 6, paddingTop: 6,
    borderTopWidth: 1, borderTopColor: Colors.light.border,
  },
  sellerAvatar: { width: 16, height: 16, borderRadius: 8 },
  sellerAvatarFallback: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.light.backgroundTertiary,
    alignItems: "center", justifyContent: "center",
  },
  sellerName: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary, flex: 1 },

  // Horizontal card
  hCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  hImage: { width: "100%", height: 120, resizeMode: "cover" },
  hInfo: { padding: 10, gap: 2 },
  hTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.light.text },
  hMeta: { fontSize: 11, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  hPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#0066CC", marginTop: 2 },
  hLocation: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
});
