import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { MOCK_ADS, MOCK_USERS } from "@/utils/mockData";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars } = useApp();
  const insets = useSafeAreaInsets();

  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>User not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const userListings = cars.filter((c) => c.sellerId === user.id);

  const similarCars = cars
    .filter(
      (c) =>
        c.sellerId !== user.id &&
        userListings.some((u) => u.brand === c.brand || u.category === c.category)
    )
    .slice(0, 6);

  const ad = MOCK_ADS[0];

  const handleMessage = () => {
    const convId = `conv_${user.id}`;
    router.push({ pathname: "/conversation/[id]", params: { id: convId } });
  };

  const handleCall = () => {
    if (user.phone) Linking.openURL(`tel:${user.phone.replace(/\s/g, "")}`);
  };

  const handleWhatsApp = () => {
    if (user.phone) {
      const num = user.phone.replace(/\s|\+/g, "");
      Linking.openURL(`https://wa.me/${num}`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero header ── */}
      <LinearGradient
        colors={["#0EB5CA", "#007A8C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnInner}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </View>
        </Pressable>

        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={36} color="#FFFFFF" />
          </View>
        )}

        <Text style={styles.userName}>{user.name}</Text>

        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.metaText}>{user.location}</Text>
          <View style={styles.dot} />
          <Feather name="calendar" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.metaText}>Joined {user.memberSince.slice(0, 7)}</Text>
        </View>

        {user.isVerified && (
          <View style={styles.verifiedRow}>
            <VerifiedBadge />
          </View>
        )}

        <View style={styles.ratingRow}>
          <RatingStars rating={user.rating} size={14} />
          <Text style={styles.ratingNum}>{user.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({user.totalReviews} reviews)</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userListings.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalReviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Contact action buttons ── */}
      <View style={styles.actionCard}>
        <Pressable style={styles.msgBtn} onPress={handleMessage}>
          <Feather name="message-circle" size={18} color="#FFFFFF" />
          <Text style={styles.msgBtnText}>Message</Text>
        </Pressable>
        <Pressable style={styles.callBtn} onPress={handleCall}>
          <Feather name="phone" size={18} color="#0EB5CA" />
          <Text style={styles.callBtnText}>Call</Text>
        </Pressable>
        <Pressable style={styles.waBtn} onPress={handleWhatsApp}>
          <Feather name="message-square" size={18} color="#25D366" />
          <Text style={styles.waBtnText}>WhatsApp</Text>
        </Pressable>
      </View>

      {/* ── Ad Banner ── */}
      <Pressable
        onPress={() => router.push("/advertise")}
        style={styles.adWrap}
      >
        <LinearGradient
          colors={[ad.color, "#006F80"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.adBanner}
        >
          <View style={styles.adLeft}>
            <View style={styles.adBadge}>
              <Text style={styles.adBadgeText}>SPONSORED</Text>
            </View>
            <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
            <Text style={styles.adSub} numberOfLines={2}>{ad.subtitle}</Text>
            <View style={styles.adCta}>
              <Text style={styles.adCtaText}>{ad.ctaText}</Text>
              <Feather name="arrow-right" size={11} color="#FFFFFF" />
            </View>
          </View>
          <Image source={{ uri: ad.image }} style={styles.adImg} resizeMode="cover" />
        </LinearGradient>
      </Pressable>

      {/* ── Listings section ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccentBar} />
            <Text style={styles.sectionTitle}>
              Cars by {user.name.split(" ")[0]} ({userListings.length})
            </Text>
          </View>
        </View>

        {userListings.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="truck" size={36} color={Colors.light.textTertiary} />
            <Text style={styles.emptyText}>No active listings</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {userListings.map((car) => (
              <View key={car.id} style={styles.gridItem}>
                <CarCard car={car} />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Similar listings section ── */}
      {similarCars.length > 0 && (
        <View style={[styles.section, { marginTop: 10 }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionAccentBar, { backgroundColor: "#D97706" }]} />
              <Text style={styles.sectionTitle}>Similar Listings</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {similarCars.map((car) => (
              <View key={car.id} style={styles.gridItem}>
                <CarCard car={car} />
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 60 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },

  /* ── Hero ── */
  hero: {
    alignItems: "center",
    paddingBottom: 28,
    gap: 8,
  },
  backBtn: {
    position: "absolute",
    top: 60,
    left: 16,
  },
  backBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    marginTop: 8,
  },
  avatarPlaceholder: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.82)",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  verifiedRow: {
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingNum: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 28,
    gap: 28,
    marginTop: 6,
  },
  statItem: {
    alignItems: "center",
    minWidth: 48,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  /* ── Action buttons ── */
  actionCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#0A1628",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  msgBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0EB5CA",
  },
  msgBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  callBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#0EB5CA",
  },
  callBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#0EB5CA",
  },
  waBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#25D366",
  },
  waBtnText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#25D366",
  },

  /* ── Ad Banner ── */
  adWrap: {
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  adBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingLeft: 16,
    minHeight: 100,
  },
  adLeft: {
    flex: 1,
    gap: 4,
    paddingRight: 8,
  },
  adBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  adBadgeText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },
  adTitle: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  adSub: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.82)",
  },
  adCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  adCtaText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  adImg: {
    width: 110,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },

  /* ── Section card (matches home page) ── */
  section: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 18,
    shadowColor: "#0A1628",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionAccentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#0EB5CA",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: Colors.light.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontFamily: "Manrope_400Regular",
  },

  /* ── Misc ── */
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Manrope_600SemiBold",
    color: Colors.light.textSecondary,
  },
  backLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Manrope_600SemiBold",
  },
});
