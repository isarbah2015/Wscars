import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

interface SponsoredCardProps {
  car: Car;
}

export function SponsoredCard({ car }: SponsoredCardProps) {
  const { colors, isDark } = useTheme();
  const [imgError, setImgError] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? "rgba(255,255,255,0.07)" : "#FFE0C8",
        },
        pressed && { opacity: 0.92 },
      ]}
      onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
    >
      {/* Thumbnail */}
      <View style={styles.imgWrap}>
        {!imgError ? (
          <Image
            source={{ uri: car.images[0] }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.image, styles.imgFallback, { backgroundColor: colors.accentLight }]}>
            <Feather name="camera" size={20} color={colors.accent} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.sponsoredBadge}>
          <Text style={[styles.sponsoredText, { color: colors.accent }]}>Sponsored</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {car.brand} {car.model}
        </Text>

        <Text style={[styles.price, { color: colors.accent }]}>
          {formatPrice(car.price)}
        </Text>

        {/* Year · Mileage · Location — same order as CarCard */}
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
            <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{car.year}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
            <Feather name="activity" size={9} color={colors.textTertiary} />
            <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
              {car.mileage === 0 ? "Brand New" : `${(car.mileage / 1000).toFixed(0)}k km`}
            </Text>
          </View>
          {car.location && (
            <View style={[styles.metaChip, styles.metaChipLoc, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
              <Feather name="map-pin" size={9} color={colors.textTertiary} />
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {car.location.split(",")[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Seller name */}
        {car.seller?.name && (
          <View style={styles.sellerRow}>
            <Feather name="user" size={10} color={colors.textTertiary} />
            <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
              {car.seller.name}
            </Text>
            {car.seller?.isVerified && (
              <Feather name="check-circle" size={10} color="#1565C0" />
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    height: 116,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  imgWrap: {
    width: 116,
    height: 116,
    flexShrink: 0,
  },
  image: { width: 116, height: 116 },
  imgFallback: { alignItems: "center", justifyContent: "center", flex: 1 },

  info: {
    flex: 1,
    padding: 10,
    gap: 3,
    minWidth: 0,
  },
  sponsoredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: "rgba(14,181,202,0.12)",
    marginBottom: 2,
  },
  sponsoredText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
  },
  title: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
  },
  price: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "nowrap",
    overflow: "hidden",
    marginTop: 1,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexShrink: 0,
  },
  metaChipLoc: {
    flexShrink: 1,
    minWidth: 0,
  },
  metaChipText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    flexShrink: 1,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  sellerName: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    flex: 1,
  },
});
