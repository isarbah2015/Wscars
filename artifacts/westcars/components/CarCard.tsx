import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { formatPrice } from "@/utils/ghanaData";

interface CarCardProps {
  car: Car;
  style?: object;
}

export function CarCard({ car, style }: CarCardProps) {
  const { toggleFavorite, isFavorite } = useApp();
  const { colors, isDark } = useTheme();
  const fav = isFavorite(car.id);
  const [imgError, setImgError] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  const nativeDriver = Platform.OS !== "web";

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: nativeDriver, speed: 80, bounciness: 0 }).start();

  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: nativeDriver, speed: 28, bounciness: 5 }).start();

  const isNew     = car.condition === "New";
  const isForeign = car.condition === "Foreign Used";
  const badgeLabel = isNew ? "New" : isForeign ? "Foreign" : null;
  const isSold = (car as any).isSold;

  if (car.isSponsored) {
    return (
      <Animated.View style={[sponsoredStyles.outerWrap, { transform: [{ scale }] }, style]}>
        {/* Golden gradient border */}
        <LinearGradient
          colors={["#FFB347", "#FF8C00", "#E8640A", "#FFB347"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={sponsoredStyles.gradientBorder}
        >
          <Pressable
            style={[
              sponsoredStyles.card,
              {
                backgroundColor: isDark ? "#1C1408" : "#FFFBF4",
                shadowColor: "#FF8C00",
              },
            ]}
            onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
            onPressIn={pressIn}
            onPressOut={pressOut}
            android_ripple={{ color: "rgba(255,140,0,0.10)", borderless: false }}
          >
            {/* ── Image block (taller for sponsored) ── */}
            <View style={sponsoredStyles.imageWrap}>
              {!imgError ? (
                <Image
                  source={{ uri: car.images[0] }}
                  style={sponsoredStyles.image}
                  resizeMode="cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <View style={[sponsoredStyles.image, styles.imgFallback, { backgroundColor: "#FFF0D6" }]}>
                  <Feather name="camera" size={28} color="#FF8C00" />
                  <Text style={{ color: "#FF8C00", fontSize: 11, marginTop: 4 }}>No photo</Text>
                </View>
              )}

              {/* Warm gradient scrim */}
              <LinearGradient
                colors={["transparent", "rgba(30,12,0,0.80)"]}
                style={styles.imageScrim}
                pointerEvents="none"
              />

              {/* SPONSORED badge — top-left, premium gold pill */}
              <LinearGradient
                colors={["#FF8C00", "#FFB347"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={sponsoredStyles.sponsoredBadge}
              >
                <Text style={sponsoredStyles.sponsoredStar}>★</Text>
                <Text style={sponsoredStyles.sponsoredBadgeText}>SPONSORED</Text>
              </LinearGradient>

              {/* Condition badge — top-right area (offset below heart) */}
              {badgeLabel && (
                <View style={[styles.condBadge, { backgroundColor: isNew ? "#FF6B00" : "#1565C0", top: 38 }]}>
                  <Text style={styles.condBadgeText}>{badgeLabel}</Text>
                </View>
              )}

              {/* Heart */}
              <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
                <View style={[styles.heartBg, fav && styles.heartBgActive]}>
                  <Feather name="heart" size={15} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
                </View>
              </Pressable>

              {/* Floating price — amber/gold gradient badge */}
              <LinearGradient
                colors={["#FF8C00", "#E8640A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={sponsoredStyles.priceBadge}
              >
                <Text style={sponsoredStyles.priceBadgeText}>{formatPrice(car.price)}</Text>
              </LinearGradient>

              {/* Views tag */}
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
            <View style={[sponsoredStyles.info, { backgroundColor: isDark ? "#1C1408" : "#FFFBF4" }]}>
              <Text style={[sponsoredStyles.carName, { color: colors.text }]} numberOfLines={1}>
                {car.brand} {car.model}
              </Text>
              <View style={styles.metaRow}>
                <View style={[styles.metaChip, { backgroundColor: "rgba(255,140,0,0.10)" }]}>
                  <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{car.year}</Text>
                </View>
                {car.mileage !== undefined && (
                  <View style={[styles.metaChip, { backgroundColor: "rgba(255,140,0,0.10)" }]}>
                    <Feather name="activity" size={9} color={colors.textTertiary} />
                    <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                      {car.mileage === 0 ? "Brand New" : `${(car.mileage / 1000).toFixed(0)}k km`}
                    </Text>
                  </View>
                )}
                {car.location && (
                  <View style={[styles.metaChip, styles.metaChipLoc, { backgroundColor: "rgba(255,140,0,0.10)" }]}>
                    <Feather name="map-pin" size={9} color={colors.textTertiary} />
                    <Text style={[styles.metaChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                      {car.location.split(",")[0]}
                    </Text>
                  </View>
                )}
              </View>

              {/* Seller row */}
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
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }, style]}>
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            shadowColor: isDark ? "#FF6B00" : "#0A1628",
            shadowOpacity: isDark ? 0.06 : 0.12,
          },
        ]}
        onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: "rgba(255,107,0,0.08)", borderless: false }}
      >
        {/* ── Image block ── */}
        <View style={styles.imageWrap}>
          {!imgError ? (
            <Image
              source={{ uri: car.images[0] }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={[styles.image, styles.imgFallback, { backgroundColor: colors.accentLight }]}>
              <Feather name="camera" size={28} color={colors.accent} />
              <Text style={{ color: colors.accent, fontSize: 11, marginTop: 4 }}>No photo</Text>
            </View>
          )}

          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.72)"]}
            style={styles.imageScrim}
            pointerEvents="none"
          />

          {badgeLabel && (
            <View style={[styles.condBadge, { backgroundColor: isNew ? "#FF6B00" : "#1565C0" }]}>
              <Text style={styles.condBadgeText}>{badgeLabel}</Text>
            </View>
          )}

          <Pressable style={styles.heartBtn} onPress={() => toggleFavorite(car.id)} hitSlop={10}>
            <View style={[styles.heartBg, fav && styles.heartBgActive]}>
              <Feather name="heart" size={15} color={fav ? "#fff" : "rgba(255,255,255,0.9)"} />
            </View>
          </Pressable>

          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{formatPrice(car.price)}</Text>
          </View>

          {car.views !== undefined && car.views > 0 && (
            <View style={styles.viewsTag}>
              <Feather name="eye" size={9} color="rgba(255,255,255,0.88)" />
              <Text style={styles.viewsText}>
                {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views}
              </Text>
            </View>
          )}

          {isSold && (
            <View style={styles.soldOverlay}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          )}
        </View>

        {/* ── Info block ── */}
        <View style={[styles.info, { backgroundColor: colors.card }]}>
          <Text style={[styles.carName, { color: colors.text }]} numberOfLines={1}>
            {car.brand} {car.model}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>{car.year}</Text>
            </View>
            {car.mileage !== undefined && (
              <View style={styles.metaChip}>
                <Feather name="activity" size={9} color={colors.textTertiary} />
                <Text style={[styles.metaChipText, { color: colors.textSecondary }]}>
                  {car.mileage === 0 ? "Brand New" : `${(car.mileage / 1000).toFixed(0)}k km`}
                </Text>
              </View>
            )}
            {car.location && (
              <View style={[styles.metaChip, styles.metaChipLoc]}>
                <Feather name="map-pin" size={9} color={colors.textTertiary} />
                <Text style={[styles.metaChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {car.location.split(",")[0]}
                </Text>
              </View>
            )}
          </View>
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginBottom: 2,
  },

  imageWrap: {
    position: "relative",
    height: 148,
    backgroundColor: "#1A2340",
  },
  image: { width: "100%", height: "100%" },
  imgFallback: {
    alignItems: "center",
    justifyContent: "center",
  },

  imageScrim: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
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
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },

  heartBtn: { position: "absolute", top: 6, right: 6 },
  heartBg: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartBgActive: {
    backgroundColor: "#E8192C",
  },

  priceBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    backgroundColor: "#0EB5CA",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  priceBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },

  viewsTag: {
    position: "absolute",
    bottom: 9,
    right: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewsText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 9,
    fontFamily: "Inter_500Medium",
  },

  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  soldText: {
    fontSize: 22,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
    letterSpacing: 5,
  },

  info: {
    paddingHorizontal: 9,
    paddingTop: 7,
    paddingBottom: 7,
    gap: 3,
  },
  carName: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "nowrap",
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(128,128,128,0.1)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    flexShrink: 0,
  },
  metaChipLoc: {
    flex: 1,
    minWidth: 0,
  },
  metaChipText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
    minWidth: 0,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  sellerName: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    flexShrink: 1,
    minWidth: 0,
  },
});

const sponsoredStyles = StyleSheet.create({
  outerWrap: {
    marginBottom: 2,
  },
  gradientBorder: {
    borderRadius: 17,
    padding: 1.5,
    shadowColor: "#FF8C00",
    shadowOpacity: 0.20,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  imageWrap: {
    position: "relative",
    height: 148,
    backgroundColor: "#2A1800",
  },
  image: { width: "100%", height: "100%" },

  sponsoredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#FF6B00",
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  sponsoredStar: {
    color: "#fff",
    fontSize: 9,
    lineHeight: 13,
  },
  sponsoredBadgeText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.0,
  },

  priceBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 5,
    shadowColor: "#FF6B00",
    shadowOpacity: 0.65,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  priceBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },

  info: {
    paddingHorizontal: 9,
    paddingTop: 7,
    paddingBottom: 7,
    gap: 3,
  },
  carName: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.1,
  },

  promoStrip: {
    marginTop: 6,
    borderRadius: 0,
    overflow: "hidden",
    marginHorizontal: -9,
  },
  promoStripInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  promoStripStar: {
    color: "#fff",
    fontSize: 9,
    lineHeight: 13,
  },
  promoStripText: {
    color: "#fff",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  promoStripDot: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
});
