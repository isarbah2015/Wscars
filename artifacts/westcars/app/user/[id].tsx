import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { LinearGradient } from "expo-linear-gradient";
import { CarCard } from "@/components/CarCard";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { MOCK_USERS } from "@/utils/mockData";

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

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16,
            backgroundColor: "#FFFFFF",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0,0,0,0.07)",
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#0F172A" />
        </Pressable>

        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={36} color="#2D4500" />
          </View>
        )}
        <Text style={[styles.userName, { color: "#0F172A" }]}>{user.name}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color="#64748B" />
          <Text style={[styles.metaText, { color: "#64748B" }]}>{user.location}</Text>
          <View style={[styles.dot, { backgroundColor: "#CBD5E1" }]} />
          <Feather name="calendar" size={12} color="#64748B" />
          <Text style={[styles.metaText, { color: "#64748B" }]}>Joined {user.memberSince.slice(0, 7)}</Text>
        </View>

        {user.isVerified && <VerifiedBadge />}

        <View style={styles.ratingRow}>
          <RatingStars rating={user.rating} size={14} />
          <Text style={[styles.ratingNum, { color: "#0F172A" }]}>{user.rating.toFixed(1)}</Text>
          <Text style={[styles.ratingCount, { color: "#64748B" }]}>({user.totalReviews} reviews)</Text>
        </View>

        <View style={[styles.statsRow, { backgroundColor: "rgba(0,0,0,0.04)", borderColor: "rgba(0,0,0,0.06)" }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0F172A" }]}>{userListings.length}</Text>
            <Text style={[styles.statLabel, { color: "#64748B" }]}>Listings</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: "rgba(0,0,0,0.1)" }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: "#0F172A" }]}>{user.totalReviews}</Text>
            <Text style={[styles.statLabel, { color: "#64748B" }]}>Reviews</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={styles.messageBtn}
          onPress={() => {
            if (userListings.length > 0) {
              const convId = `conv_${user.id}`;
              router.push({
                pathname: "/conversation/[id]",
                params: { id: convId },
              });
            }
          }}
        >
          <Feather name="mail" size={18} color={Colors.primary} />
          <Text style={styles.messageBtnText}>Message</Text>
        </Pressable>
        <Pressable style={styles.followBtn}>
          <Feather name="plus" size={18} color="#fff" />
          <Text style={styles.followBtnText}>Follow</Text>
        </Pressable>
      </View>

      {/* Listings */}
      <View style={styles.listingsSection}>
        <Text style={styles.sectionTitle}>
          Cars by {user.name.split(" ")[0]} ({userListings.length})
        </Text>
        {userListings.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="truck" size={36} color={Colors.light.textTertiary} />
            <Text style={styles.emptyText}>No active listings</Text>
          </View>
        ) : (
          <View style={styles.gridRow}>
            {userListings.map((car) => (
              <CarCard key={car.id} car={car} style={styles.halfCard} />
            ))}
          </View>
        )}
      </View>

      <View style={{ height: 60 + insets.bottom }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
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
    borderColor: "#BFFF00",
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(191,255,0,0.12)",
    borderWidth: 3,
    borderColor: "#BFFF00",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Manrope_700Bold",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingNum: {
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
  },
  ratingCount: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
  },
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
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Manrope_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
  },
  messageBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(191,255,0,0.6)",
  },
  messageBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#2D4500",
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#BFFF00",
  },
  followBtnText: {
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    color: "#2D4500",
  },
  listingsSection: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Manrope_700Bold",
    color: Colors.light.text,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  halfCard: {
    width: "47%",
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
