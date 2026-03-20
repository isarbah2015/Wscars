import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { formatMileage, formatPrice } from "@/utils/ghanaData";

const { width } = Dimensions.get("window");

function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars, toggleFavorite, isFavorite, startConversation, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const car = cars.find((c) => c.id === id);
  if (!car) {
    return (
      <View style={styles.notFound}>
        <Feather name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Car not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const fav = isFavorite(car.id);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveImageIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleMessage = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to message the seller.", [
        { text: "Sign In", onPress: () => router.push("/auth/login") },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    const convId = startConversation(car);
    router.push({ pathname: "/conversation/[id]", params: { id: convId } });
  };

  const handleCall = () => {
    const phone = car.seller?.phone || "+233000000000";
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() =>
      Alert.alert("Could not open phone dialler.")
    );
  };

  const handleWhatsApp = () => {
    const raw = car.seller?.phone?.replace(/[\s+\-()]/g, "") || "233000000000";
    const phone = raw.startsWith("0") ? "233" + raw.slice(1) : raw;
    const msg = encodeURIComponent(
      `Hi ${car.seller?.name || "there"}, I'm interested in your ${car.year} ${car.brand} ${car.model} listed on Westcars. Is it still available?`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`)
    );
  };

  const relatedCars = cars
    .filter((c) => c.id !== car.id && (c.brand === car.brand || c.category === car.category))
    .slice(0, 4);

  const specItems = [
    { icon: "calendar", label: "Year", value: String(car.year) },
    { icon: "activity", label: "Mileage", value: formatMileage(car.mileage) },
    { icon: "zap", label: "Fuel", value: car.fuelType },
    { icon: "settings", label: "Gearbox", value: car.transmission },
    { icon: "shield", label: "Condition", value: car.condition },
    { icon: "map-pin", label: "Location", value: car.location },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">

        {/* ── Image Carousel ── */}
        <View style={styles.carousel}>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.carImage} />
            )}
          />

          {/* Floating back */}
          <Pressable
            style={[
              styles.floatBtn,
              { top: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 12, left: 14 },
            ]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={19} color="#fff" />
          </Pressable>

          {/* Floating favourite */}
          <Pressable
            style={[
              styles.floatBtn,
              { top: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 12, right: 14 },
              fav && styles.floatBtnFav,
            ]}
            onPress={() => toggleFavorite(car.id)}
          >
            <Feather name="heart" size={19} color={fav ? "#FF4444" : "#fff"} />
          </Pressable>

          {/* Image counter */}
          <View style={styles.imgCounter}>
            <Feather name="image" size={11} color="rgba(255,255,255,0.9)" />
            <Text style={styles.imgCounterText}>
              {activeImageIndex + 1} / {car.images.length}
            </Text>
          </View>

          {/* Dots */}
          {car.images.length > 1 && (
            <View style={styles.dots}>
              {car.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImageIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── Main Info Card ── */}
        <View style={styles.mainCard}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.carTitle}>
                {car.year} {car.brand} {car.model}
              </Text>
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.conditionTag,
                    {
                      backgroundColor:
                        car.condition === "Foreign Used"
                          ? "#1D4ED820"
                          : car.condition === "New"
                          ? "#00873E20"
                          : "#6D28D920",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.conditionTagText,
                      {
                        color:
                          car.condition === "Foreign Used"
                            ? "#1D4ED8"
                            : car.condition === "New"
                            ? "#00873E"
                            : "#6D28D9",
                      },
                    ]}
                  >
                    {car.condition}
                  </Text>
                </View>
                <View style={styles.viewsChip}>
                  <Feather name="eye" size={11} color={Colors.light.textTertiary} />
                  <Text style={styles.viewsChipText}>{formatViews(car.views || 0)} views</Text>
                </View>
              </View>
            </View>
            {car.isSponsored && (
              <View style={styles.featuredPill}>
                <Feather name="zap" size={12} color="#D97706" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>

          <Text style={styles.price}>{formatPrice(car.price)}</Text>
        </View>

        {/* ── Specs Grid ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specItems.map((s) => (
              <View key={s.label} style={styles.specCell}>
                <View style={styles.specIconWrap}>
                  <Feather name={s.icon as any} size={16} color={Colors.primary} />
                </View>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>
        </View>

        {/* ── Seller Card ── */}
        {car.seller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <Pressable
              style={styles.sellerCard}
              onPress={() =>
                router.push({ pathname: "/user/[id]", params: { id: car.seller!.id } })
              }
            >
              <View style={styles.sellerLeft}>
                {car.seller.avatar ? (
                  <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
                ) : (
                  <View style={styles.sellerAvatarFallback}>
                    <Feather name="user" size={22} color={Colors.light.textTertiary} />
                  </View>
                )}
                <View style={styles.sellerOnlineDot} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{car.seller.name}</Text>
                  {car.seller.isVerified && <VerifiedBadge size="small" />}
                </View>
                <View style={styles.sellerMetaRow}>
                  <Feather name="map-pin" size={11} color={Colors.light.textTertiary} />
                  <Text style={styles.sellerMetaText}>{car.seller.location}</Text>
                  <Text style={styles.sellerMetaDot}>·</Text>
                  <Feather name="calendar" size={11} color={Colors.light.textTertiary} />
                  <Text style={styles.sellerMetaText}>
                    Since {car.seller.memberSince.slice(0, 7)}
                  </Text>
                </View>
                <Text style={styles.sellerPhone}>{car.seller.phone}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        )}

        {/* ── Related Cars ── */}
        {relatedCars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Cars</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.relatedRow}>
                {relatedCars.map((rc) => (
                  <Pressable
                    key={rc.id}
                    style={styles.relatedCard}
                    onPress={() =>
                      router.push({ pathname: "/car/[id]", params: { id: rc.id } })
                    }
                  >
                    <Image
                      source={{ uri: rc.images[0] }}
                      style={styles.relatedImage}
                      resizeMode="cover"
                    />
                    {rc.isSponsored && (
                      <View style={styles.relatedFeaturedBadge}>
                        <Text style={styles.relatedFeaturedText}>Featured</Text>
                      </View>
                    )}
                    <View style={styles.relatedInfo}>
                      <Text style={styles.relatedTitle} numberOfLines={1}>
                        {rc.year} {rc.brand} {rc.model}
                      </Text>
                      <Text style={styles.relatedPrice}>{formatPrice(rc.price)}</Text>
                      <Text style={styles.relatedKm}>
                        {(rc.mileage / 1000).toFixed(0)}k km · {rc.location}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 130 + insets.bottom }} />
      </ScrollView>

      {/* ── Professional Action Bar ── */}
      <View
        style={[
          styles.actionBar,
          { paddingBottom: insets.bottom || (Platform.OS === "web" ? 28 : 16) },
        ]}
      >
        {/* Call Button */}
        <Pressable
          style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.85 }]}
          onPress={handleCall}
        >
          <View style={styles.callBtnIconWrap}>
            <Feather name="phone" size={20} color="#fff" />
          </View>
          <View style={styles.callBtnText}>
            <Text style={styles.callBtnLabel}>Call Seller</Text>
            <Text style={styles.callBtnPhone} numberOfLines={1}>
              {car.seller?.phone || "N/A"}
            </Text>
          </View>
        </Pressable>

        {/* Divider */}
        <View style={styles.actionDivider} />

        {/* WhatsApp Button */}
        <Pressable
          style={({ pressed }) => [styles.whatsappBtn, pressed && { opacity: 0.85 }]}
          onPress={handleWhatsApp}
        >
          <View style={styles.waIconWrap}>
            <Feather name="message-circle" size={20} color="#fff" />
          </View>
          <Text style={styles.waBtnText}>WhatsApp</Text>
        </Pressable>

        {/* Message Button */}
        <Pressable
          style={({ pressed }) => [styles.msgBtn, pressed && { opacity: 0.85 }]}
          onPress={handleMessage}
        >
          <LinearGradient
            colors={["#005F2B", "#00873E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.msgBtnGradient}
          >
            <Feather name="mail" size={18} color="#fff" />
            <Text style={styles.msgBtnText}>Message</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // Carousel
  carousel: { height: 290, position: "relative" },
  carImage: { width, height: 290, resizeMode: "cover" },
  floatBtn: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.48)",
    alignItems: "center",
    justifyContent: "center",
  },
  floatBtnFav: { backgroundColor: "rgba(0,0,0,0.55)" },
  imgCounter: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  imgCounterText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  dots: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { backgroundColor: "#fff", width: 18 },

  // Main info card
  mainCard: {
    padding: 18,
    paddingBottom: 16,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.backgroundSecondary,
    gap: 8,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  carTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.4,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  conditionTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  conditionTagText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  viewsChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsChipText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  featuredPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D9770618",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  featuredText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#D97706" },
  price: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    letterSpacing: -0.8,
  },

  // Section
  section: {
    padding: 18,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.backgroundSecondary,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.2,
  },

  // Specs grid
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specCell: {
    width: "30%",
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  specIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary + "14",
    alignItems: "center",
    justifyContent: "center",
  },
  specLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  specValue: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.text, textAlign: "center" },

  // Description
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },

  // Seller card
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sellerLeft: { position: "relative" },
  sellerAvatar: { width: 56, height: 56, borderRadius: 28 },
  sellerAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerOnlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: "#fff",
  },
  sellerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sellerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sellerMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  sellerMetaText: { fontSize: 12, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  sellerMetaDot: { fontSize: 12, color: Colors.light.textTertiary },
  sellerPhone: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    marginTop: 4,
  },

  // Related
  relatedRow: { flexDirection: "row", gap: 12 },
  relatedCard: {
    width: 170,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  relatedImage: { width: "100%", height: 105 },
  relatedFeaturedBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(217,119,6,0.88)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  relatedFeaturedText: { fontSize: 9, color: "#fff", fontFamily: "Inter_700Bold" },
  relatedInfo: { padding: 10, gap: 3 },
  relatedTitle: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.light.text },
  relatedPrice: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.primary },
  relatedKm: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },

  // Action bar
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    paddingHorizontal: 14,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 14,
  },
  callBtn: {
    flex: 1.6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  callBtnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#00873E",
    alignItems: "center",
    justifyContent: "center",
  },
  callBtnText: { gap: 1 },
  callBtnLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.light.textTertiary },
  callBtnPhone: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.text },
  actionDivider: { width: 8 },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#25D36615",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#25D36640",
  },
  waIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
  },
  waBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#25D366" },
  msgBtn: {
    flex: 1.2,
    borderRadius: 14,
    overflow: "hidden",
    marginLeft: 8,
  },
  msgBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
  },
  msgBtnText: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },

  // Not found
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary },
  backLink: { fontSize: 14, color: Colors.primary, fontFamily: "Inter_600SemiBold" },
});
