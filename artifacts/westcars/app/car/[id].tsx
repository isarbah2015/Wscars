import { Feather } from "@expo/vector-icons";
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

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars, toggleFavorite, isFavorite, startConversation, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const [activeImg, setActiveImg] = useState(0);

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

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setActiveImg(viewableItems[0].index);
  }).current;

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
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() => Alert.alert("Cannot open phone dialler."));
  };

  const handleWhatsApp = () => {
    const raw = car.seller?.phone?.replace(/[\s+\-()]/g, "") || "233000000000";
    const phone = raw.startsWith("0") ? "233" + raw.slice(1) : raw;
    const msg = encodeURIComponent(
      `Hi, I'm interested in your ${car.year} ${car.brand} ${car.model} listed on Westcars. Is it still available?`
    );
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${msg}`).catch(() =>
      Linking.openURL(`https://wa.me/${phone}?text=${msg}`)
    );
  };

  const related = cars.filter((c) => c.id !== car.id && (c.brand === car.brand || c.category === car.category)).slice(0, 5);

  const specs = [
    { label: "Mileage", value: formatMileage(car.mileage) },
    { label: "Fuel type", value: car.fuelType },
    { label: "Year", value: String(car.year) },
    { label: "Transmission", value: car.transmission },
    { label: "Condition", value: car.condition },
    { label: "Location", value: car.location },
  ];

  const equipment = [
    "Air conditioning",
    "Power steering",
    "Airbags",
    "ABS brakes",
    "Alloy wheels",
    "Bluetooth",
    "Reverse camera",
  ];

  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header bar ── */}
        <View style={[styles.topBar, { paddingTop: topPad + 6 }]}>
          <Pressable style={styles.topBarBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={Colors.light.text} />
          </Pressable>
          <Text style={styles.topBarTitle} numberOfLines={1}>
            {car.brand} {car.model}, {car.year}
          </Text>
          <View style={styles.topBarRight}>
            <Pressable style={styles.topBarBtn} onPress={() => toggleFavorite(car.id)}>
              <Feather name="heart" size={20} color={fav ? Colors.danger : Colors.light.textSecondary} />
            </Pressable>
            <Pressable style={styles.topBarBtn}>
              <Feather name="share-2" size={20} color={Colors.light.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* ── Image Gallery ── */}
        <View style={styles.gallery}>
          <FlatList
            data={car.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: 260, resizeMode: "cover" }} />
            )}
          />
          {/* Counter */}
          <View style={styles.imgCounter}>
            <Feather name="image" size={11} color="#fff" />
            <Text style={styles.imgCounterText}>{activeImg + 1}/{car.images.length}</Text>
          </View>
          {/* Dots */}
          {car.images.length > 1 && (
            <View style={styles.dots}>
              {car.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImg && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        {/* ── Main Info ── */}
        <View style={styles.mainCard}>
          <View style={styles.titleRow}>
            <Text style={styles.carTitle}>{car.brand} {car.model}, {car.year}</Text>
            {car.isSponsored && (
              <View style={styles.adPill}><Text style={styles.adPillText}>Ad</Text></View>
            )}
          </View>

          <Text style={styles.bigPrice}>{formatPrice(car.price)}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.negotiable}>Negotiable</Text>
            <Text style={styles.monthlyCalc}>from GHS {Math.round(car.price / 60).toLocaleString()}/month</Text>
          </View>

          <View style={styles.metaChips}>
            <View style={styles.chip}>
              <Feather name="activity" size={11} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>{Math.round(car.mileage / 1000)}k km</Text>
            </View>
            <View style={styles.chip}>
              <Feather name="zap" size={11} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>{car.fuelType}</Text>
            </View>
            <View style={styles.chip}>
              <Feather name="settings" size={11} color={Colors.light.textSecondary} />
              <Text style={styles.chipText}>{car.transmission}</Text>
            </View>
            {car.views !== undefined && (
              <View style={styles.chip}>
                <Feather name="eye" size={11} color={Colors.light.textSecondary} />
                <Text style={styles.chipText}>
                  {car.views >= 1000 ? `${(car.views / 1000).toFixed(1)}k` : car.views} views
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Technical Specifications ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Specifications</Text>
          <View style={styles.specsGrid}>
            {specs.map((s, i) => (
              <View key={s.label} style={[styles.specRow, i % 2 === 0 && styles.specRowLeft]}>
                <Text style={styles.specLabel}>{s.label}</Text>
                <Text style={styles.specValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Equipment ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Equipment & Features</Text>
          <View style={styles.equipGrid}>
            {equipment.map((eq) => (
              <View key={eq} style={styles.equipItem}>
                <Feather name="check" size={13} color="#0066CC" />
                <Text style={styles.equipText}>{eq}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Description ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>
        </View>

        <View style={styles.sep} />

        {/* ── Seller Info ── */}
        {car.seller && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Seller Information</Text>

            <View style={styles.sellerBlock}>
              <Pressable
                style={styles.sellerTop}
                onPress={() => router.push({ pathname: "/user/[id]", params: { id: car.seller!.id } })}
              >
                {car.seller.avatar
                  ? <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
                  : <View style={styles.sellerAvatarFallback}>
                      <Feather name="user" size={24} color={Colors.light.textTertiary} />
                    </View>
                }
                <View style={{ flex: 1 }}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{car.seller.name}</Text>
                    {car.seller.isVerified && (
                      <View style={styles.verBadge}>
                        <Feather name="check-circle" size={11} color="#0066CC" />
                        <Text style={styles.verText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sellerType}>
                    {car.seller.isVerified ? "Dealer" : "Private seller"}
                  </Text>
                  <View style={styles.sellerMeta}>
                    <Feather name="clock" size={11} color={Colors.light.textTertiary} />
                    <Text style={styles.sellerMetaText}>Usually replies within 1 hour</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={Colors.light.textTertiary} />
              </Pressable>

              {/* Rating stars – only on seller card */}
              <View style={styles.sellerRating}>
                <View style={styles.ratingStars}>
                  {[1,2,3,4,5].map((s) => (
                    <Feather key={s} name="star" size={14}
                      color={s <= Math.round(car.seller!.rating) ? Colors.star : "#E0E0E0"} />
                  ))}
                </View>
                <Text style={styles.ratingVal}>{car.seller.rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({car.seller.totalReviews} reviews)</Text>
              </View>

              {/* Contact actions */}
              <View style={styles.sellerActions}>
                <Pressable style={styles.contactBtn} onPress={handleCall}>
                  <Text style={styles.contactBtnText}>Contact seller</Text>
                </Pressable>
                <Pressable style={styles.callBtn} onPress={handleCall}>
                  <Feather name="phone" size={16} color="#0066CC" />
                  <Text style={styles.callBtnText}>{car.seller.phone}</Text>
                </Pressable>
                <Pressable style={styles.msgLink} onPress={handleMessage}>
                  <Feather name="message-square" size={14} color="#0066CC" />
                  <Text style={styles.msgLinkText}>Write message</Text>
                </Pressable>
                <Pressable style={styles.waLink} onPress={handleWhatsApp}>
                  <Feather name="message-circle" size={14} color="#25D366" />
                  <Text style={styles.waLinkText}>WhatsApp</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <View style={styles.sep} />

        {/* ── Location ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#0066CC" />
            <Text style={styles.locationText}>{car.location}, Ghana</Text>
          </View>
          <View style={styles.mapPlaceholder}>
            <Feather name="map" size={32} color="#BDBDBD" />
            <Text style={styles.mapPlaceholderText}>Map view</Text>
          </View>
        </View>

        <View style={styles.sep} />

        {/* ── Similar Listings ── */}
        {related.length > 0 && (
          <View style={[styles.card, { paddingBottom: 4 }]}>
            <View style={styles.sectionRow}>
              <Text style={styles.cardTitle}>Similar cars</Text>
              <Pressable onPress={() => router.push("/(tabs)/search")}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.relatedRow}>
                {related.map((rc) => (
                  <Pressable
                    key={rc.id}
                    style={styles.relatedCard}
                    onPress={() => router.push({ pathname: "/car/[id]", params: { id: rc.id } })}
                  >
                    <Image source={{ uri: rc.images[0] }} style={styles.relatedImage} resizeMode="cover" />
                    <View style={styles.relatedInfo}>
                      <Text style={styles.relatedTitle} numberOfLines={1}>
                        {rc.brand} {rc.model}
                      </Text>
                      <Text style={styles.relatedMeta}>{rc.year} · {Math.round(rc.mileage / 1000)}k km</Text>
                      <Text style={styles.relatedPrice}>{formatPrice(rc.price)}</Text>
                      <Text style={styles.relatedLoc}>{rc.location}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 + (insets.bottom || 0) }} />
      </ScrollView>

      {/* ── Bottom Sticky Bar ── */}
      <View
        style={[
          styles.stickyBar,
          { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 28 : 8) },
        ]}
      >
        <Pressable style={styles.favSticky} onPress={() => toggleFavorite(car.id)}>
          <Feather name="heart" size={22} color={fav ? Colors.danger : Colors.light.textTertiary} />
          <Text style={styles.favStickyText}>Save</Text>
        </Pressable>
        <Pressable style={styles.contactSticky} onPress={handleCall}>
          <Feather name="phone" size={18} color="#fff" />
          <Text style={styles.contactStickyText}>Contact seller</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff" },
  notFoundText: { fontSize: 16, color: Colors.light.textSecondary, fontFamily: "Inter_500Medium" },
  backLink: { fontSize: 14, color: "#0066CC", fontFamily: "Inter_500Medium" },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    gap: 6,
  },
  topBarBtn: {
    width: 40, height: 40,
    alignItems: "center", justifyContent: "center",
    borderRadius: 20,
  },
  topBarTitle: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.light.text },
  topBarRight: { flexDirection: "row" },

  // Gallery
  gallery: { position: "relative" },
  imgCounter: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
  },
  imgCounterText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  dots: {
    position: "absolute", bottom: 12, alignSelf: "center",
    flexDirection: "row", gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#fff", width: 16 },

  // Main info card
  mainCard: {
    backgroundColor: "#fff",
    padding: 16,
    gap: 8,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  carTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.light.text, flex: 1, letterSpacing: -0.3 },
  adPill: {
    backgroundColor: "#9E9E9E22",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
  },
  adPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.light.textSecondary },
  bigPrice: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#0066CC", letterSpacing: -0.5 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  negotiable: { fontSize: 13, color: "#43A047", fontFamily: "Inter_600SemiBold" },
  monthlyCalc: { fontSize: 12, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  metaChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  chipText: { fontSize: 12, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },

  // Generic card
  card: { backgroundColor: "#fff", padding: 16, gap: 14 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.light.text },
  sep: { height: 8, backgroundColor: "#F5F5F5" },
  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: -2,
  },
  seeAll: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_500Medium" },

  // Specs
  specsGrid: { gap: 0, borderWidth: 1, borderColor: "#E0E0E0", borderRadius: 8, overflow: "hidden" },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  specRowLeft: { backgroundColor: "#fff" },
  specLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.light.textSecondary },
  specValue: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.light.text },

  // Equipment
  equipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  equipItem: { flexDirection: "row", alignItems: "center", gap: 6, width: "47%" },
  equipText: { fontSize: 13, color: Colors.light.text, fontFamily: "Inter_400Regular" },

  // Description
  description: { fontSize: 14, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular", lineHeight: 22 },

  // Seller block
  sellerBlock: { gap: 14 },
  sellerTop: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  sellerAvatar: { width: 52, height: 52, borderRadius: 26 },
  sellerAvatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  sellerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sellerName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.light.text },
  verBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verText: { fontSize: 11, color: "#0066CC", fontFamily: "Inter_500Medium" },
  sellerType: { fontSize: 13, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  sellerMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  sellerMetaText: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },

  sellerRating: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#E0E0E0",
  },
  ratingStars: { flexDirection: "row", gap: 2 },
  ratingVal: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.light.text },
  ratingCount: { fontSize: 12, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },

  sellerActions: { gap: 10 },
  contactBtn: {
    backgroundColor: "#0066CC",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  contactBtnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  callBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    height: 48, borderRadius: 8, borderWidth: 1.5, borderColor: "#0066CC",
    justifyContent: "center",
  },
  callBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#0066CC" },
  msgLink: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", paddingVertical: 4 },
  msgLinkText: { fontSize: 14, color: "#0066CC", fontFamily: "Inter_400Regular" },
  waLink: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center", paddingVertical: 4 },
  waLinkText: { fontSize: 14, color: "#25D366", fontFamily: "Inter_400Regular" },

  // Location
  locationRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  locationText: { fontSize: 14, color: Colors.light.text, fontFamily: "Inter_400Regular" },
  mapPlaceholder: {
    height: 120, backgroundColor: "#F5F5F5", borderRadius: 8,
    alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  mapPlaceholderText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Inter_400Regular" },

  // Related
  relatedRow: { flexDirection: "row", gap: 12, paddingRight: 16, paddingBottom: 12 },
  relatedCard: {
    width: 160,
    borderRadius: 8, overflow: "hidden",
    borderWidth: 1, borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  relatedImage: { width: "100%", height: 100 },
  relatedInfo: { padding: 8, gap: 2 },
  relatedTitle: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.light.text },
  relatedMeta: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  relatedPrice: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#0066CC" },
  relatedLoc: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },

  // Sticky bottom bar
  stickyBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  favSticky: { alignItems: "center", gap: 3, paddingHorizontal: 4 },
  favStickyText: { fontSize: 11, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  contactSticky: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, backgroundColor: "#0066CC",
    height: 48, borderRadius: 8,
  },
  contactStickyText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
