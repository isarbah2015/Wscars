import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useTheme } from "@/context/ThemeContext";
import { isFirebaseReady } from "@/lib/firebase";
import { getUser } from "@/services/firebase";
import { User } from "@/types";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    // First: check if seller data is already embedded in any car listing (fast, no network)
    const fromCar = cars.find((c) => c.sellerId === id)?.seller as User | undefined;
    if (fromCar) { setUser(fromCar); setLoading(false); return; }
    // Second: fetch from Firestore when Firebase is active
    if (isFirebaseReady()) {
      getUser(id)
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, cars]);

  if (loading) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#0EB5CA" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>User not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const userListings = cars.filter((c) => c.sellerId === user.id);

  // Similar cars: same brand as any of the seller's cars, but not from this seller
  const sellerBrands = [...new Set(userListings.map((c) => c.brand))];
  const similarCars = cars
    .filter((c) => c.sellerId !== user.id && sellerBrands.includes(c.brand))
    .slice(0, 6);

  const handleCall = () => {
    if (user.phone) Linking.openURL(`tel:${user.phone}`);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi ${user.name.split(" ")[0]}, I found your profile on Westcars and I'm interested in your listings.`);
    Linking.openURL(`https://wa.me/${(user.phone || "").replace(/\D/g, "")}?text=${msg}`);
  };

  const handleChat = () => {
    if (userListings.length > 0) {
      const convId = `conv_${user.id}`;
      router.push({ pathname: "/conversation/[id]", params: { id: convId } });
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentLight }]}>
            <Feather name="user" size={36} color={colors.accent} />
          </View>
        )}

        <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>{user.location}</Text>
          <View style={[styles.dot, { backgroundColor: colors.border }]} />
          <Feather name="calendar" size={12} color={colors.textSecondary} />
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>Joined {user.memberSince.slice(0, 7)}</Text>
        </View>

        {user.isVerified && <VerifiedBadge />}

        <View style={styles.ratingRow}>
          <RatingStars rating={user.rating} size={14} />
          <Text style={[styles.ratingNum, { color: colors.text }]}>{user.rating.toFixed(1)}</Text>
          <Text style={[styles.ratingCount, { color: colors.textSecondary }]}>({user.totalReviews} reviews)</Text>
        </View>

        <View style={[styles.statsRow, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{userListings.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Listings</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{user.totalReviews}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reviews</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.accent }]}>{user.rating.toFixed(1)}★</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
        </View>
      </View>

      {/* ── Professional Action Buttons ── */}
      <View style={[styles.actionSection, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>CONTACT SELLER</Text>
        <View style={styles.actionRow}>
          {/* Call */}
          <Pressable style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
            <View style={styles.callIconRing}>
              <Feather name="phone" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.callBtnText}>Call</Text>
          </Pressable>

          {/* WhatsApp */}
          <Pressable style={[styles.actionBtn, styles.waBtn]} onPress={handleWhatsApp}>
            <View style={styles.waIconRing}>
              <Feather name="message-circle" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.waBtnText}>WhatsApp</Text>
          </Pressable>

          {/* Chat */}
          <Pressable
            style={[styles.actionBtn, styles.chatBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: isDark ? "rgba(14,181,202,0.3)" : "rgba(14,181,202,0.35)" }]}
            onPress={handleChat}
          >
            <View style={styles.chatIconRing}>
              <Feather name="mail" size={20} color="#0EB5CA" />
            </View>
            <Text style={[styles.chatBtnText, { color: colors.text }]}>Chat</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Seller's Listings ── */}
      <View style={[styles.listingsSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Cars by {user.name.split(" ")[0]} ({userListings.length})
        </Text>
        {userListings.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="truck" size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active listings</Text>
          </View>
        ) : (
          <View style={styles.gridRow}>
            {userListings.map((car) => (
              <CarCard key={car.id} car={car} style={styles.halfCard} />
            ))}
          </View>
        )}
      </View>

      {/* ── Similar Listings ── */}
      {similarCars.length > 0 && (
        <View style={[styles.listingsSection, { backgroundColor: colors.background }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: colors.accent }]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Similar Cars</Text>
          </View>
          <View style={styles.gridRow}>
            {similarCars.map((car) => (
              <CarCard key={car.id} car={car} style={styles.halfCard} />
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 24 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    alignItems: "center",
    paddingBottom: 24,
    gap: 8,
  },
  backBtn: {
    position: "absolute",
    top: 60,
    left: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#0EB5CA",
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#0EB5CA",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  dot: { width: 4, height: 4, borderRadius: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingNum: { fontSize: 14, fontFamily: "Manrope_700Bold" },
  ratingCount: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 32,
    gap: 32,
    marginTop: 4,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontFamily: "Manrope_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Manrope_400Regular" },
  statDivider: { width: 1, height: 30 },

  // Action buttons section
  actionSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    gap: 10,
  },
  contactLabel: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  actionRow: { flexDirection: "row", gap: 10 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 6,
  },

  // Call button — teal gradient-like solid
  callBtn: { backgroundColor: "#0EB5CA" },
  callIconRing: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  callBtnText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: "#FFFFFF" },

  // WhatsApp button — green
  waBtn: { backgroundColor: "#25D366" },
  waIconRing: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  waBtnText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: "#FFFFFF" },

  // Chat button — outline style
  chatBtn: { borderWidth: 1.5 },
  chatIconRing: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  chatBtnText: { fontSize: 12, fontFamily: "Manrope_700Bold" },

  // Listings
  listingsSection: { padding: 16, gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontFamily: "Manrope_700Bold" },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  halfCard: { width: "47%" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 15, fontFamily: "Manrope_400Regular" },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 18, fontFamily: "Manrope_600SemiBold" },
  backLink: { fontSize: 14, color: Colors.primary, fontFamily: "Manrope_600SemiBold" },
});
