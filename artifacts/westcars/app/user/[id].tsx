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
      <LinearGradient
        colors={["#FF6B00", "#FF8C42"]}
        style={[
          styles.header,
          {
            paddingTop:
              (insets.top || (Platform.OS === "web" ? 67 : 0)) + 16,
          },
        ]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>

        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={36} color="#fff" />
          </View>
        )}
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>{user.location}</Text>
          <View style={styles.dot} />
          <Feather name="calendar" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.metaText}>Joined {user.memberSince.slice(0, 7)}</Text>
        </View>

        {user.isVerified && <VerifiedBadge />}

        <View style={styles.ratingRow}>
          <RatingStars rating={user.rating} size={14} />
          <Text style={styles.ratingNum}>{user.rating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({user.totalReviews} reviews)</Text>
        </View>

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
        </View>
      </LinearGradient>

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
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_400Regular",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingNum: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  ratingCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
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
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
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
    borderColor: Colors.primary,
  },
  messageBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  followBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  followBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  listingsSection: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
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
    fontFamily: "Inter_400Regular",
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
