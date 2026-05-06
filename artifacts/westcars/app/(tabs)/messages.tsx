import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

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

function ConversationRow({
  conv, colors, isDark, onDelete,
}: {
  conv: Conversation; colors: any; isDark: boolean; onDelete: () => void;
}) {
  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={onDelete}>
      <Feather name="trash-2" size={22} color="#fff" />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40} overshootRight={false}>
      <Pressable
        style={({ pressed }) => [
          styles.convRow,
          { backgroundColor: isDark ? "#111827" : "#FFFFFF" },
          pressed && { opacity: 0.88 },
        ]}
        onPress={() =>
          router.push({ pathname: "/conversation/[id]", params: { id: conv.id } })
        }
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {conv.participant.avatar ? (
            <Image source={{ uri: conv.participant.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.avatarInitial, { color: colors.accent }]}>
                {(conv.participant.name[0] || "?").toUpperCase()}
              </Text>
            </View>
          )}
          {/* Online indicator */}
          <View style={[styles.onlineDot, { borderColor: isDark ? "#111827" : "#FFFFFF" }]} />
        </View>

        {/* Text content */}
        <View style={styles.convContent}>
          <View style={styles.convTop}>
            <Text
              style={[styles.participantName, { color: isDark ? "#F1F5F9" : "#0F172A" }]}
              numberOfLines={1}
            >
              {conv.participant.name}
            </Text>
            <Text style={[styles.time, { color: isDark ? "#64748B" : "#94A3B8" }]}>
              {timeAgo(conv.lastMessageTime)}
            </Text>
          </View>
          <Text style={[styles.carName, { color: colors.accent }]} numberOfLines={1}>
            {conv.car.brand} {conv.car.model}
          </Text>
          <Text
            style={[
              styles.lastMessage,
              {
                color: conv.unreadCount > 0
                  ? (isDark ? "#F1F5F9" : "#111827")
                  : (isDark ? "#64748B" : "#94A3B8"),
                fontFamily: conv.unreadCount > 0 ? "Inter_600SemiBold" : "Inter_400Regular",
              },
            ]}
            numberOfLines={1}
          >
            {conv.lastMessage || "No messages yet"}
          </Text>
        </View>

        {/* Unread badge */}
        {conv.unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{conv.unreadCount}</Text>
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
}

export default function MessagesScreen() {
  const { conversations, isAuthenticated, currentUser } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;
  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  const [search, setSearch] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const filteredConversations = conversations.filter((c) => {
    if (deletedIds.has(c.id)) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.participant.name.toLowerCase().includes(q) ||
      `${c.car.brand} ${c.car.model}`.toLowerCase().includes(q) ||
      (c.lastMessage || "").toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => new Set(prev).add(id));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>

      {/* ── Header ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 14,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.userProfileLeft}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <View style={[styles.userAvatarBox, { overflow: "hidden" }]}>
              {currentUser?.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.userAvatarImg} />
              ) : currentUser?.name ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(14,181,202,0.14)" }}>
                  <Text style={[styles.userAvatarInitial, { color: "#0EB5CA" }]}>
                    {currentUser.name[0].toUpperCase()}
                  </Text>
                </View>
              ) : (
                <Image source={WC_LOGO} style={{ width: "100%", height: "100%" }} resizeMode="contain" tintColor="#0EB5CA" />
              )}
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
                Messages
              </Text>
              {totalUnread > 0 && (
                <Text style={[styles.headerSub, { color: colors.accent }]}>
                  {totalUnread} unread
                </Text>
              )}
            </View>
          </Pressable>

          <View
            style={[styles.notifBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" }]}
          >
            <Feather name="bell" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            {totalUnread > 0 && (
              <View style={[styles.notifBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.notifBadgeText}>{totalUnread > 9 ? "9+" : totalUnread}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search bar */}
        {isAuthenticated && conversations.length > 0 && (
          <View style={[styles.searchBar, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9" }]}>
            <Feather name="search" size={16} color={isDark ? "#64748B" : "#94A3B8"} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? "#F1F5F9" : "#0F172A" }]}
              value={search}
              onChangeText={setSearch}
              placeholder="Search conversations…"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        )}
      </View>

      {/* ── Body ── */}
      {!isAuthenticated ? (
        <View style={[styles.emptyState, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
            <Feather name="message-circle" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>No messages yet</Text>
          <Text style={[styles.emptyText, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            Sign in to message sellers and manage conversations.
          </Text>
          <Pressable
            style={[styles.signInBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/auth/login")}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
            <Feather name="message-circle" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
            {search ? "No results" : "No conversations"}
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {search
              ? `No conversations matching "${search}"`
              : "Message a seller on any car listing to start chatting."}
          </Text>
          {!search && (
            <Pressable
              style={[styles.signInBtn, { backgroundColor: colors.accent }]}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.signInText}>Browse Cars</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationRow
              conv={item}
              colors={colors}
              isDark={isDark}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }]} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,181,202,0.1)",
  },
  userAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  userAvatarInitial: { fontSize: 17, fontFamily: "Inter_700Bold" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", letterSpacing: -0.3 },
  headerSub: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 1 },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  notifBadgeText: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 0,
  },

  /* Conversation row */
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 13,
  },
  separator: { height: 1, marginLeft: 82 },

  /* Avatar */
  avatarContainer: { position: "relative" },
  avatar: { width: 54, height: 54, borderRadius: 27 },
  avatarPlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 20, fontFamily: "Inter_700Bold" },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
  },

  /* Content */
  convContent: { flex: 1, gap: 3 },
  convTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantName: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  carName: { fontSize: 12, fontFamily: "Inter_500Medium" },
  lastMessage: { fontSize: 13, lineHeight: 18 },

  /* Badge */
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },

  /* Swipe delete */
  deleteAction: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 76,
  },

  /* Empty state */
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
  emptyTitle: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.3 },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
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
  signInText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "center" },
});
