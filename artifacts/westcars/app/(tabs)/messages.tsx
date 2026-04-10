import { Feather } from "@expo/vector-icons";
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

const WC_LOGO = require("@/assets/images/wc-logo.png");

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ConversationRow({ conv, colors, isDark }: { conv: Conversation; colors: any; isDark: boolean }) {
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
          <View style={[styles.verifiedDot, { backgroundColor: "#22C55E" }]}>
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
        <Text
          style={[
            styles.lastMessage,
            {
              color: conv.unreadCount > 0 ? colors.text : colors.textSecondary,
              fontFamily: conv.unreadCount > 0 ? "Manrope_600SemiBold" : "Manrope_400Regular",
            },
          ]}
          numberOfLines={1}
        >
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
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Header ── */}
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
        {/* Top row: user profile left + notification bell right */}
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.userProfileLeft}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <View style={[styles.userAvatarBox, { backgroundColor: "#000", overflow: "hidden" }]}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.userAvatarImg} />
              ) : currentUser?.name ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(14,181,202,0.16)" }}>
                  <Text style={[styles.userAvatarInitial, { color: "#0098AA" }]}>{currentUser.name[0].toUpperCase()}</Text>
                </View>
              ) : (
                <Image source={WC_LOGO} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
              )}
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
                Messages
              </Text>
              <Text style={[styles.headerSub, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                {currentUser?.name?.split(" ")[0] || "Guest"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable
              style={[styles.notifBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" }]}
              onPress={() => {}}
            >
              <Feather name="bell" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
              {totalUnread > 0 && (
                <View style={[styles.notifBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.notifBadgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>
      </View>

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
        <>
          <View style={[styles.sectionLabel, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionLabelText, { color: colors.textSecondary }]}>
              ALL CONVERSATIONS
            </Text>
            {totalUnread > 0 && (
              <Text style={[styles.sectionLabelUnread, { color: colors.accent }]}>
                {totalUnread} unread
              </Text>
            )}
          </View>
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConversationRow conv={item} colors={colors} isDark={isDark} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userProfileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  userAvatarBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  userAvatarImg: { width: 42, height: 42, borderRadius: 13 },
  userAvatarInitial: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
    marginTop: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notifBadgeText: {
    fontSize: 9,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
  },

  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionLabelText: {
    fontSize: 11,
    fontFamily: "Manrope_600SemiBold",
    letterSpacing: 0.8,
  },
  sectionLabelUnread: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
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
  participantName: { fontSize: 15, fontFamily: "Manrope_600SemiBold", flex: 1 },
  time: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  carName: { fontSize: 12, fontFamily: "Manrope_500Medium" },
  lastMessage: { fontSize: 13, lineHeight: 18 },
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
