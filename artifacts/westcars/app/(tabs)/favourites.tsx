import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice } from "@/utils/ghanaData";

export default function FavouritesScreen() {
  const { cars, favorites, toggleFavorite, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;

  const favCars = cars.filter((c) => favorites.includes(c.id));

  if (!isAuthenticated) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad + 40, backgroundColor: colors.background }]}>
        <View style={[styles.iconRing, { backgroundColor: colors.accentLight }]}>
          <Feather name="heart" size={38} color={colors.accent} />
        </View>
        <Text style={[styles.authTitle, { color: colors.text }]}>Save Your Favourites</Text>
        <Text style={[styles.authText, { color: colors.textSecondary }]}>
          Sign in to keep track of cars you love.
        </Text>
        <Pressable style={styles.authBtn} onPress={() => router.push("/auth/login")}>
          <LinearGradient colors={["#0066CC", "#3385D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authGradient}>
            <Text style={styles.authBtnText}>Sign In</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#111827"] : ["#0A1628", "#0066CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 14 }]}
      >
        <Text style={styles.headerTitle}>Saved Cars</Text>
        {favCars.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favCars.length}</Text>
          </View>
        )}
      </LinearGradient>

      {favCars.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconRing, { backgroundColor: colors.accentLight }]}>
            <Feather name="heart" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved cars yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Tap the heart on any car to save it here.
          </Text>
          <Pressable
            style={[styles.browseBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.browseBtnText}>Browse Cars</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: 110 + insets.bottom }]}
        >
          <Text style={[styles.countLabel, { color: colors.textTertiary }]}>
            {favCars.length} saved car{favCars.length !== 1 ? "s" : ""}
          </Text>

          {favCars.map((car) => {
            const isNew = car.condition === "New";
            const isForeign = car.condition === "Foreign Used";
            const badgeLabel = isNew ? "New" : isForeign ? "Tokunbo" : null;
            const badgeColor = isNew ? "#00B050" : "#1565C0";

            return (
              <Pressable
                key={car.id}
                style={({ pressed }) => [
                  styles.favCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.9 },
                ]}
                onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
              >
                {/* Image */}
                <View style={styles.favImgWrap}>
                  <Image
                    source={{ uri: car.images[0] }}
                    style={styles.favImg}
                    resizeMode="cover"
                  />
                  {badgeLabel && (
                    <View style={[styles.condBadge, { backgroundColor: badgeColor }]}>
                      <Text style={styles.condBadgeText}>{badgeLabel}</Text>
                    </View>
                  )}
                  {(car as any).isSold && (
                    <View style={styles.soldOverlay}>
                      <Text style={styles.soldText}>SOLD</Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.favDetails}>
                  <View style={styles.favTop}>
                    <Text style={[styles.favPrice, { color: colors.text }]}>
                      {formatPrice(car.price)}
                    </Text>
                    <Pressable
                      hitSlop={10}
                      onPress={() => toggleFavorite(car.id)}
                    >
                      <Feather name="heart" size={20} color="#E8192C" />
                    </Pressable>
                  </View>

                  <Text style={[styles.favName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {car.brand} {car.model}
                  </Text>

                  <View style={styles.metaChips}>
                    <View style={[styles.metaChip, { backgroundColor: colors.accentLight }]}>
                      <Feather name="calendar" size={11} color={colors.accent} />
                      <Text style={[styles.metaChipText, { color: colors.accent }]}>{car.year}</Text>
                    </View>
                    {car.mileage > 0 && (
                      <View style={[styles.metaChip, { backgroundColor: isDark ? "#1C2F1C" : "#DCFCE7" }]}>
                        <Feather name="activity" size={11} color="#22C55E" />
                        <Text style={[styles.metaChipText, { color: "#22C55E" }]}>
                          {(car.mileage / 1000).toFixed(0)}k km
                        </Text>
                      </View>
                    )}
                    <View style={[styles.metaChip, { backgroundColor: isDark ? "#2A1F0A" : "#FFF3E0" }]}>
                      <Feather name="zap" size={11} color="#F59E0B" />
                      <Text style={[styles.metaChipText, { color: "#F59E0B" }]}>{car.fuelType}</Text>
                    </View>
                  </View>

                  <View style={styles.favFooter}>
                    <View style={styles.locationRow}>
                      <Feather name="map-pin" size={12} color={colors.textTertiary} />
                      <Text style={[styles.locationText, { color: colors.textTertiary }]}>{car.location}</Text>
                    </View>
                    {car.isSponsored && (
                      <View style={[styles.adPill, { backgroundColor: colors.accentLight }]}>
                        <Text style={[styles.adPillText, { color: colors.accent }]}>Ad</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
  },

  list: { padding: 14, gap: 12 },
  countLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    marginBottom: 2,
  },

  favCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  favImgWrap: {
    width: 130,
    height: 120,
    position: "relative",
    flexShrink: 0,
  },
  favImg: { width: "100%", height: "100%" },

  condBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldText: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 4,
  },

  favDetails: {
    flex: 1,
    padding: 12,
    gap: 5,
    justifyContent: "space-between",
  },
  favTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  favPrice: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.3,
  },
  favName: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
  },
  metaChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
  },
  favFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
  },
  adPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adPillText: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 40,
  },
  emptyIconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  browseBtnText: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#fff" },

  authWall: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  iconRing: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  authText: { fontSize: 14, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
  authBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8, width: "80%" },
  authGradient: { paddingVertical: 14, alignItems: "center" },
  authBtnText: { fontSize: 16, fontFamily: "Manrope_600SemiBold", color: "#fff" },
});
