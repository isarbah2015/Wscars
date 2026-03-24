import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Conversation } from "@/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ConversationRow({ conv, colors }: { conv: Conversation; colors: any }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.convRow,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
      onPress={() =>
        router.push({ pathname: "/conversation/[id]", params: { id: conv.id } })
      }
    >
      <View style={styles.avatarContainer}>
        {conv.participant.avatar ? (
          <Image source={{ uri: conv.participant.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentLight }]}>
            <Feather name="user" size={20} color={colors.accent} />
          </View>
        )}
        {conv.participant.isVerified && (
          <View style={[styles.verifiedDot, { backgroundColor: colors.success }]}>
            <Feather name="check" size={8} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.convContent}>
        <View style={styles.convTop}>
          <Text style={[styles.participantName, { color: colors.text }]} numberOfLines={1}>
            {conv.participant.name}
          </Text>
          <Text style={[styles.time, { color: colors.textTertiary }]}>{timeAgo(conv.lastMessageTime)}</Text>
        </View>
        <Text style={[styles.carName, { color: colors.accent }]} numberOfLines={1}>
          Re: {conv.car.brand} {conv.car.model}
        </Text>
        <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
          {conv.lastMessage || "No messages yet"}
        </Text>
      </View>

      {conv.unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent }]}>
          <Text style={styles.badgeText}>{conv.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { conversations, isAuthenticated, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;
  const isAdmin = currentUser?.isAdmin === true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.title, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          {isAdmin ? "Support Inbox" : "Messages"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isAdmin && (
            <View style={styles.adminHeaderBadge}>
              <Feather name="shield" size={11} color="#FFFFFF" />
              <Text style={[styles.adminHeaderBadgeText, { color: "#FFFFFF" }]}>ADMIN</Text>
            </View>
          )}
          {conversations.length > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{conversations.length}</Text>
            </View>
          )}
        </View>
      </View>

      {isAdmin && (
        <View style={[styles.adminBanner, { backgroundColor: isDark ? "#1A2744" : "#EBF4FF", borderColor: isDark ? "#2A3F6B" : "#BFDBFF" }]}>
          <Feather name="info" size={14} color={colors.accent} />
          <Text style={[styles.adminBannerText, { color: colors.accent }]}>
            Viewing all {conversations.length} user conversation{conversations.length !== 1 ? "s" : ""}
          </Text>
        </View>
      )}

      {!isAuthenticated ? (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
            <Feather name="message-circle" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Sign in to message sellers and manage conversations.
          </Text>
          <Pressable
            style={[styles.signInBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      ) : conversations.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
            <Feather name="message-circle" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Message a seller on any car listing to start chatting.
          </Text>
          <Pressable
            style={[styles.signInBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.signInText}>Browse Cars</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ConversationRow conv={item} colors={colors} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  title: {
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.3,
  },
  headerBadge: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
  },
  adminHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(14,181,202,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0EB5CA",
  },
  adminHeaderBadgeText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    letterSpacing: 0.5,
  },
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  adminBannerText: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  avatarContainer: { position: "relative" },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  convContent: { flex: 1, gap: 2 },
  convTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantName: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    flex: 1,
  },
  time: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  carName: { fontSize: 12, fontFamily: "Manrope_500Medium" },
  lastMessage: { fontSize: 13, fontFamily: "Manrope_400Regular" },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontFamily: "Manrope_700Bold", color: "#fff" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 20, fontFamily: "Manrope_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  signInBtn: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 180,
  },
  signInText: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#fff", textAlign: "center" },
});
