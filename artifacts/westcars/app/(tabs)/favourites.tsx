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
        <Pressable
          style={[styles.authBtn, { backgroundColor: "#0EB5CA" }]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={[styles.authBtnText, { color: "#FFFFFF" }]}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 14,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          Saved Cars
        </Text>
        {favCars.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favCars.length}</Text>
          </View>
        )}
      </View>

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
                  pressed && { opacity: 0.93 },
                ]}
                onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
              >
                {/* ── Image (top, full width) ── */}
                <View style={styles.favImgWrap}>
                  <Image
                    source={{ uri: car.images[0] }}
                    style={styles.favImg}
                    resizeMode="cover"
                  />

                  {/* Gradient scrim at bottom of image */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.45)"]}
                    style={styles.imgScrim}
                  />

                  {/* Condition badge */}
                  {badgeLabel && (
                    <View style={[styles.condBadge, { backgroundColor: badgeColor }]}>
                      <Text style={styles.condBadgeText}>{badgeLabel}</Text>
                    </View>
                  )}

                  {/* Sold overlay */}
                  {(car as any).isSold && (
                    <View style={styles.soldOverlay}>
                      <Text style={styles.soldText}>SOLD</Text>
                    </View>
                  )}

                  {/* Heart button — top right */}
                  <Pressable
                    style={styles.heartBtn}
                    hitSlop={12}
                    onPress={() => toggleFavorite(car.id)}
                  >
                    <Feather name="heart" size={18} color="#E8192C" />
                  </Pressable>

                  {/* Price overlay at bottom of image */}
                  <View style={styles.priceOverlay}>
                    <Text style={styles.priceOverlayText}>{formatPrice(car.price)}</Text>
                    {car.isSponsored && (
                      <View style={styles.adBadge}>
                        <Text style={styles.adBadgeText}>Ad</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* ── Details (below image) ── */}
                <View style={styles.favDetails}>
                  {/* Car name — full width */}
                  <Text style={[styles.favName, { color: colors.text }]} numberOfLines={1}>
                    {car.brand} {car.model}
                  </Text>

                  {/* Year · Mileage · Location — consistent with CarCard */}
                  <View style={styles.metaChips}>
                    <View style={[styles.metaChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                      <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{car.year}</Text>
                    </View>
                    {car.mileage > 0 && (
                      <View style={[styles.metaChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                        <Feather name="activity" size={11} color={colors.textTertiary} />
                        <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                          {(car.mileage / 1000).toFixed(0)}k km
                        </Text>
                      </View>
                    )}
                    {car.location && (
                      <View style={[styles.metaChip, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
                        <Feather name="map-pin" size={11} color={colors.textTertiary} />
                        <Text style={[styles.metaChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {car.location.split(",")[0]}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Seller name + action button */}
                  <View style={styles.sellerActionRow}>
                    {car.seller?.name ? (
                      <View style={styles.sellerInner}>
                        <Feather name="user" size={12} color={colors.textTertiary} />
                        <Text style={[styles.sellerName, { color: colors.textSecondary }]} numberOfLines={1}>
                          {car.seller.name}
                        </Text>
                        {car.seller?.isVerified && (
                          <Feather name="check-circle" size={12} color="#1565C0" />
                        )}
                      </View>
                    ) : (
                      <View />
                    )}
                    <Pressable
                      style={[styles.contactBtn, { backgroundColor: colors.accent }]}
                      onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
                    >
                      <Text style={styles.contactBtnText}>View</Text>
                      <Feather name="arrow-right" size={12} color="#fff" />
                    </Pressable>
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
    justifyContent: "space-between",
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },

  list: { padding: 14, gap: 16 },
  countLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    marginBottom: 4,
  },

  favCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  /* ── Image section ── */
  favImgWrap: {
    width: "100%",
    height: 220,
    position: "relative",
  },
  favImg: { width: "100%", height: "100%" },
  imgScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  condBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  condBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
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
    letterSpacing: 5,
  },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  priceOverlay: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceOverlayText: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: -0.3,
  },
  adBadge: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adBadgeText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },

  /* ── Details section ── */
  favDetails: {
    padding: 14,
    gap: 8,
  },
  favName: {
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
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
    paddingVertical: 4,
    borderRadius: 7,
  },
  metaChipText: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
  },
  sellerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sellerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  sellerName: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    flex: 1,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  contactBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#fff",
  },

  /* ── Empty state ── */
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

  /* ── Auth wall ── */
  authWall: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  iconRing: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  authText: { fontSize: 14, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
  authBtn: { borderRadius: 14, marginTop: 8, width: "80%", paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  authGradient: { paddingVertical: 14, alignItems: "center" },
  authBtnText: { fontSize: 16, fontFamily: "Manrope_600SemiBold", color: "#fff", textAlign: "center" },
});
