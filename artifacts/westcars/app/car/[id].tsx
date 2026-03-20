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
import { RatingBar } from "@/components/RatingBar";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { formatMileage, formatPrice, PAYMENT_METHODS, RATING_CATEGORIES } from "@/utils/ghanaData";

const { width } = Dimensions.get("window");

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars, toggleFavorite, isFavorite, startConversation, isAuthenticated, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`);
  };

  const handleWhatsApp = () => {
    const phone = car.seller?.phone?.replace(/[\s+]/g, "") || "233000000000";
    Linking.openURL(
      `whatsapp://send?phone=${phone}&text=Hello, I'm interested in your ${car.brand} ${car.model} listed on Westcars.`
    );
  };

  const relatedCars = cars.filter(
    (c) => c.id !== car.id && (c.brand === car.brand || c.category === car.category)
  ).slice(0, 4);

  const ratingItems = RATING_CATEGORIES.map((cat) => ({
    ...cat,
    value: (car.rating as any)[cat.id] || 0,
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Image Carousel */}
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

          {/* Back button */}
          <Pressable
            style={[styles.backBtn, { top: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 12 }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="#fff" />
          </Pressable>

          {/* Favorite */}
          <Pressable
            style={[styles.favBtn, { top: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 12 }]}
            onPress={() => toggleFavorite(car.id)}
          >
            <Feather
              name="heart"
              size={20}
              color={fav ? Colors.danger : "#fff"}
            />
          </Pressable>

          {/* Dots */}
          {car.images.length > 1 && (
            <View style={styles.imageDots}>
              {car.images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.imageDot, i === activeImageIndex && styles.imageDotActive]}
                />
              ))}
            </View>
          )}

          {/* Image count */}
          <View style={styles.imageCount}>
            <Feather name="image" size={12} color="#fff" />
            <Text style={styles.imageCountText}>
              {activeImageIndex + 1}/{car.images.length}
            </Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.carTitle}>
                {car.brand} {car.model}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{car.year}</Text>
                <View style={styles.dot} />
                <Text style={styles.meta}>{formatMileage(car.mileage)}</Text>
                <View style={styles.dot} />
                <Feather name="map-pin" size={11} color={Colors.light.textTertiary} />
                <Text style={styles.meta}>{car.location}</Text>
              </View>
            </View>
            <View style={[styles.conditionTag, car.condition === "New" ? styles.tagNew : styles.tagUsed]}>
              <Text style={styles.conditionTagText}>{car.condition}</Text>
            </View>
          </View>

          <Text style={styles.price}>{formatPrice(car.price)}</Text>

          {/* Quick specs */}
          <View style={styles.specsGrid}>
            <SpecItem icon="zap" label="Fuel" value={car.fuelType} />
            <SpecItem icon="settings" label="Trans." value={car.transmission} />
            <SpecItem icon="activity" label="Mileage" value={`${(car.mileage / 1000).toFixed(0)}k km`} />
            <SpecItem icon="calendar" label="Year" value={String(car.year)} />
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ratings</Text>
            <View style={styles.overallRating}>
              <RatingStars rating={car.rating.overall} size={14} />
              <Text style={styles.ratingNum}>{car.rating.overall.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({car.rating.totalRatings} reviews)</Text>
            </View>
          </View>
          {ratingItems.map((r) => (
            <RatingBar
              key={r.id}
              label={r.label}
              icon={r.icon}
              value={r.value}
            />
          ))}

          {/* Rate this car */}
          {isAuthenticated && !ratingSubmitted && (
            <Pressable
              style={styles.rateBtn}
              onPress={() => {
                Alert.alert(
                  "Rate This Car",
                  "How would you rate this car? (After purchase/interaction)",
                  [
                    {
                      text: "Leave Rating",
                      onPress: () => {
                        setRatingSubmitted(true);
                        Alert.alert("Thank you!", "Your rating has been submitted.");
                      },
                    },
                    { text: "Cancel", style: "cancel" },
                  ]
                );
              }}
            >
              <Feather name="star" size={16} color={Colors.star} />
              <Text style={styles.rateBtnText}>Leave a Rating</Text>
            </Pressable>
          )}
          {ratingSubmitted && (
            <View style={styles.ratedBadge}>
              <Feather name="check-circle" size={14} color={Colors.verified} />
              <Text style={styles.ratedText}>Rating submitted</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{car.description}</Text>
        </View>

        {/* Seller Card */}
        {car.seller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seller</Text>
            <Pressable
              style={styles.sellerCard}
              onPress={() =>
                router.push({
                  pathname: "/user/[id]",
                  params: { id: car.seller!.id },
                })
              }
            >
              {car.seller.avatar ? (
                <Image source={{ uri: car.seller.avatar }} style={styles.sellerAvatar} />
              ) : (
                <View style={styles.sellerAvatarPlaceholder}>
                  <Feather name="user" size={24} color={Colors.light.textTertiary} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{car.seller.name}</Text>
                  {car.seller.isVerified && <VerifiedBadge size="small" />}
                </View>
                <View style={styles.sellerMeta}>
                  <Feather name="map-pin" size={11} color={Colors.light.textTertiary} />
                  <Text style={styles.sellerMetaText}>{car.seller.location}</Text>
                  <View style={styles.dot} />
                  <Feather name="calendar" size={11} color={Colors.light.textTertiary} />
                  <Text style={styles.sellerMetaText}>
                    Since {car.seller.memberSince.slice(0, 7)}
                  </Text>
                </View>
                <View style={styles.sellerRating}>
                  <RatingStars rating={car.seller.rating} size={11} />
                  <Text style={styles.sellerRatingNum}>{car.seller.rating.toFixed(1)}</Text>
                  <Text style={styles.sellerRatingCount}>
                    ({car.seller.totalReviews} reviews)
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.light.textTertiary} />
            </Pressable>
          </View>
        )}

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentGrid}>
            {PAYMENT_METHODS.map((pm) => (
              <View key={pm.id} style={styles.paymentItem}>
                <Feather name={pm.icon as any} size={18} color={Colors.primary} />
                <Text style={styles.paymentLabel}>{pm.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Related Cars */}
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
                    <Image source={{ uri: rc.images[0] }} style={styles.relatedImage} />
                    <View style={styles.relatedInfo}>
                      <Text style={styles.relatedTitle} numberOfLines={1}>
                        {rc.brand} {rc.model}
                      </Text>
                      <Text style={styles.relatedPrice}>{formatPrice(rc.price)}</Text>
                      {rc.isSponsored && (
                        <View style={styles.sponsoredTag}>
                          <Text style={styles.sponsoredTagText}>Sponsored</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 120 + insets.bottom }} />
      </ScrollView>

      {/* Action Bar */}
      <View
        style={[
          styles.actionBar,
          {
            paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 16),
          },
        ]}
      >
        <Pressable style={styles.callBtn} onPress={handleCall}>
          <Feather name="phone" size={20} color={Colors.primary} />
          <Text style={styles.callBtnText}>Call</Text>
        </Pressable>
        <Pressable style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <Feather name="message-circle" size={20} color="#25D366" />
          <Text style={styles.whatsappBtnText}>WhatsApp</Text>
        </Pressable>
        <Pressable style={styles.messageBtn} onPress={handleMessage}>
          <LinearGradient
            colors={["#FF6B00", "#FF8C42"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.messageBtnGradient}
          >
            <Feather name="mail" size={20} color="#fff" />
            <Text style={styles.messageBtnText}>Message</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={specStyles.item}>
      <Feather name={icon as any} size={18} color={Colors.primary} />
      <Text style={specStyles.label}>{label}</Text>
      <Text style={specStyles.value}>{value}</Text>
    </View>
  );
}

const specStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  value: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  carousel: {
    height: 280,
    position: "relative",
  },
  carImage: {
    width,
    height: 280,
    resizeMode: "cover",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  favBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageDots: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  imageDotActive: {
    backgroundColor: "#fff",
    width: 16,
  },
  imageCount: {
    position: "absolute",
    bottom: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  imageCountText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  mainInfo: {
    padding: 18,
    gap: 10,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.backgroundSecondary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  carTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexWrap: "wrap",
  },
  meta: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.textTertiary,
  },
  conditionTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 2,
  },
  tagNew: { backgroundColor: Colors.success + "20" },
  tagUsed: { backgroundColor: Colors.info + "20" },
  conditionTagText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  price: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  specsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  section: {
    padding: 18,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.backgroundSecondary,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingNum: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  ratingCount: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.star + "15",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  rateBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.star,
  },
  ratedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  ratedText: {
    fontSize: 13,
    color: Colors.verified,
    fontFamily: "Inter_500Medium",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
  },
  sellerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sellerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.backgroundTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sellerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sellerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  sellerMetaText: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  sellerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  sellerRatingNum: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sellerRatingCount: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  paymentGrid: {
    gap: 10,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  relatedRow: {
    flexDirection: "row",
    gap: 12,
  },
  relatedCard: {
    width: 160,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  relatedImage: {
    width: "100%",
    height: 100,
    resizeMode: "cover",
  },
  relatedInfo: {
    padding: 10,
    gap: 2,
  },
  relatedTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  relatedPrice: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  sponsoredTag: {
    backgroundColor: Colors.primary + "15",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  sponsoredTagText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  actionBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  callBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#25D366",
  },
  whatsappBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#25D366",
  },
  messageBtn: {
    flex: 1.5,
    borderRadius: 14,
    overflow: "hidden",
  },
  messageBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
  },
  messageBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
