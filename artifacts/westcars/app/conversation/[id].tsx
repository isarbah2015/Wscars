import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportModal } from "@/components/ReportModal";
import { SafetyTipsModal } from "@/components/SafetyTipsModal";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Message } from "@/types";
import { MOCK_USERS } from "@/utils/mockData";

// Phone number pattern — detects GH formats (+233, 0xx)
const PHONE_RE = /(?:\+233|0)[0-9]{9}/g;

function timeStr(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

function MessageBubble({
  msg, isOwn, sellerPhone, onDelete,
}: {
  msg: Message; isOwn: boolean; sellerPhone?: string; onDelete: () => void;
}) {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  if (msg.isDeletedForSelf) return null;

  // Detect phone mismatch
  const phones = msg.text.match(PHONE_RE);
  const hasMismatch = phones && sellerPhone &&
    phones.some((p) => p.replace(/\s/g, "") !== sellerPhone.replace(/\s/g, ""));

  return (
    <View style={{ marginVertical: 2 }}>
      {hasMismatch && (
        <View style={styles.phoneWarn}>
          <Feather name="alert-triangle" size={14} color="#D97706" />
          <Text style={styles.phoneWarnText}>
            Different number detected — only use the seller's registered number or in-app chat.
          </Text>
        </View>
      )}
      <View style={[
        styles.bubbleContainer,
        isOwn ? styles.bubbleContainerOwn : styles.bubbleContainerOther,
      ]}>
        <Pressable
          onLongPress={() => isOwn && setShowActions(true)}
          style={[styles.bubble, isOwn ? styles.bubbleOwn : { ...styles.bubbleOther, backgroundColor: colors.card }]}
        >
          {/* Media image */}
          {msg.mediaType === "image" && msg.mediaUrl && (
            <Image source={{ uri: msg.mediaUrl }} style={styles.mediaImg} resizeMode="cover" />
          )}

          {msg.text ? (
            <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : { color: colors.text }]}>
              {msg.text}
            </Text>
          ) : null}

          <View style={styles.bubbleMeta}>
            <Text style={[styles.bubbleTime, { color: isOwn ? "rgba(255,255,255,0.65)" : colors.textTertiary }]}>
              {timeStr(msg.timestamp)}
            </Text>
            {isOwn && (
              <Feather
                name={msg.isRead ? "check-circle" : "check"}
                size={10}
                color={msg.isRead ? "#4ADE80" : "rgba(255,255,255,0.6)"}
              />
            )}
          </View>
        </Pressable>

        {/* Long-press actions */}
        {showActions && (
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => { onDelete(); setShowActions(false); }}>
              <Feather name="trash-2" size={14} color="#E53935" />
              <Text style={styles.actionText}>Delete</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => setShowActions(false)}>
              <Feather name="x" size={14} color="#9E9E9E" />
              <Text style={[styles.actionText, { color: "#9E9E9E" }]}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, messages, sendMessage, deleteMessage, markMessagesRead,
          currentUser, blockUser, isBlocked, reportItem } = useApp();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [text,          setText]         = useState("");
  const [showSafety,    setShowSafety]   = useState(true);
  const [typingVisible, setTypingVisible] = useState(false);
  const [showReport,    setShowReport]   = useState(false);
  const [showActions,   setShowActions]  = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const conv = conversations.find((c) => c.id === id);
  const convMessages = (messages[id] || []).filter((m) => !m.isDeletedForSelf);
  const participantId = conv?.participantId || "";
  const blocked = isBlocked(participantId);
  const participantFull = MOCK_USERS.find((u) => u.id === participantId);
  const [profileExpanded, setProfileExpanded] = useState(false);

  // Mark messages read on open
  useEffect(() => {
    markMessagesRead(id);
  }, [id, messages[id]?.length]);

  // Simulate typing indicator on reply
  useEffect(() => {
    const lastMsg = convMessages[convMessages.length - 1];
    if (lastMsg?.senderId === currentUser?.id) {
      setTypingVisible(true);
      typingTimer.current = setTimeout(() => setTypingVisible(false), 1800);
    }
    return () => clearTimeout(typingTimer.current);
  }, [convMessages.length]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, [convMessages.length]);

  const handleSend = () => {
    if (!text.trim() || blocked) return;
    sendMessage(id, text.trim());
    setText("");
  };

  const handlePickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow access to your photos to send images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      sendMessage(id, "", result.assets[0].uri, "image");
    }
  };

  const handleBlock = () => {
    Alert.alert(
      "Block User",
      `Block ${conv?.participant.name}? They will not be able to message you and their listings will be hidden.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: () => { blockUser(participantId); setShowActions(false); },
        },
      ]
    );
  };

  if (showSafety) {
    return (
      <SafetyTipsModal
        visible={showSafety}
        onContinue={() => setShowSafety(false)}
        onCancel={() => router.back()}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: colors.card,
        borderBottomColor: colors.border,
        paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 10,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <Pressable
          style={styles.headerInfo}
          onPress={() => setProfileExpanded((v) => !v)}
        >
          <View style={{ position: "relative" }}>
            {conv?.participant.avatar ? (
              <Image source={{ uri: conv.participant.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatarPlaceholder, { backgroundColor: colors.backgroundSecondary }]}>
                <Feather name="user" size={18} color={colors.textTertiary} />
              </View>
            )}
            {conv?.participant.isVerified && (
              <View style={styles.headerVerifiedDot}>
                <Feather name="check" size={7} color="#fff" />
              </View>
            )}
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={[styles.headerName, { color: colors.text }]}>
                {conv?.participant.name || "Seller"}
              </Text>
              <Feather
                name={profileExpanded ? "chevron-up" : "chevron-down"}
                size={13}
                color={colors.textTertiary}
              />
            </View>
            <Text style={[styles.headerSub, { color: colors.accent }]} numberOfLines={1}>
              {conv?.car.brand} {conv?.car.model}
            </Text>
          </View>
        </Pressable>

        <Pressable style={[styles.moreBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => setShowActions(true)}>
          <Feather name="more-vertical" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* More actions dropdown */}
      {showActions && (
        <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={styles.dropItem}
            onPress={() => {
              setShowActions(false);
              router.push({ pathname: "/user/[id]", params: { id: participantId } });
            }}
          >
            <Feather name="user" size={16} color={colors.accent} />
            <Text style={[styles.dropText, { color: colors.accent }]}>View Profile</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={() => { setShowActions(false); setShowReport(true); }}>
            <Feather name="flag" size={16} color="#E53935" />
            <Text style={styles.dropText}>Report User</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={handleBlock}>
            <Feather name="slash" size={16} color="#E53935" />
            <Text style={styles.dropText}>{blocked ? "Unblock User" : "Block User"}</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={() => setShowActions(false)}>
            <Feather name="x" size={16} color="#9E9E9E" />
            <Text style={[styles.dropText, { color: "#9E9E9E" }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Client Profile Card (expandable) */}
      {profileExpanded && conv && (
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.profileCardInner}>
            {/* Avatar + info */}
            <View style={styles.profileLeft}>
              <View style={{ position: "relative" }}>
                {conv.participant.avatar ? (
                  <Image source={{ uri: conv.participant.avatar }} style={styles.profileAvatar} />
                ) : (
                  <View style={[styles.profileAvatarPlaceholder, { backgroundColor: colors.accentLight }]}>
                    <Feather name="user" size={28} color={colors.accent} />
                  </View>
                )}
                {conv.participant.isVerified && (
                  <View style={[styles.profileVerifiedBadge, { backgroundColor: "#22C55E" }]}>
                    <Feather name="check" size={9} color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.profileName, { color: colors.text }]}>
                    {conv.participant.name}
                  </Text>
                  {conv.participant.isVerified && (
                    <View style={[styles.verifiedTag, { backgroundColor: "rgba(34,197,94,0.12)" }]}>
                      <Text style={styles.verifiedTagText}>Verified</Text>
                    </View>
                  )}
                </View>
                {participantFull && (
                  <>
                    <View style={styles.profileMetaRow}>
                      <Feather name="map-pin" size={11} color={colors.textTertiary} />
                      <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                        {participantFull.location}
                      </Text>
                    </View>
                    <View style={styles.profileMetaRow}>
                      <Feather name="calendar" size={11} color={colors.textTertiary} />
                      <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                        Member since {participantFull.memberSince?.slice(0, 7) || "2023"}
                      </Text>
                    </View>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather
                          key={star}
                          name={star <= Math.round(participantFull.rating) ? "star" : "star"}
                          size={12}
                          color={star <= Math.round(participantFull.rating) ? "#F59E0B" : colors.border}
                        />
                      ))}
                      <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                        {participantFull.rating.toFixed(1)} · {participantFull.totalReviews} reviews
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.profileActions}>
              {conv.participant.phone && (
                <Pressable
                  style={[styles.profileActionBtn, { backgroundColor: colors.accentLight }]}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      const { Linking } = require("react-native");
                      Linking.openURL(`tel:${conv.participant.phone}`);
                    }
                  }}
                >
                  <Feather name="phone" size={16} color={colors.accent} />
                </Pressable>
              )}
              <Pressable
                style={[styles.profileActionBtn, { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  setProfileExpanded(false);
                  router.push({ pathname: "/user/[id]", params: { id: participantId } });
                }}
              >
                <Feather name="external-link" size={16} color={colors.text} />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[styles.viewFullProfileBtn, { backgroundColor: colors.accent }]}
            onPress={() => {
              setProfileExpanded(false);
              router.push({ pathname: "/user/[id]", params: { id: participantId } });
            }}
          >
            <Feather name="user" size={14} color="#fff" />
            <Text style={styles.viewFullProfileText}>View Full Profile & Listings</Text>
            <Feather name="chevron-right" size={14} color="#fff" />
          </Pressable>
        </View>
      )}

      {/* Car reference banner */}
      {conv && (
        <Pressable style={[styles.carBanner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={() => router.push({ pathname: "/car/[id]", params: { id: conv.carId } })}>
          <Image source={{ uri: conv.car.images[0] }} style={styles.carBannerImage} />
          <View style={styles.carBannerInfo}>
            <Text style={[styles.carBannerTitle, { color: colors.text }]} numberOfLines={1}>
              {conv.car.brand} {conv.car.model}
            </Text>
            <Text style={[styles.carBannerPrice, { color: colors.accent }]}>
              GHS {conv.car.price.toLocaleString()}
              {conv.car.isSold && <Text style={styles.soldTag}> · SOLD</Text>}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textTertiary} />
        </Pressable>
      )}

      {/* Blocked notice */}
      {blocked && (
        <View style={styles.blockedBanner}>
          <Feather name="slash" size={14} color="#E53935" />
          <Text style={styles.blockedText}>You have blocked this user.</Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={convMessages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble
            msg={item}
            isOwn={item.senderId === currentUser?.id || item.senderId === "currentUser"}
            sellerPhone={conv?.participant.phone}
            onDelete={() => deleteMessage(id, item.id)}
          />
        )}
        contentContainerStyle={[
          styles.messageList,
          convMessages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Feather name="message-circle" size={40} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Say hello! Ask the seller about this car.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {typingVisible && (
        <View style={[styles.typingRow, { backgroundColor: colors.background }]}>
          <View style={[styles.typingBubble, { backgroundColor: colors.card }]}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.typingDot, { opacity: 0.5 + i * 0.2 }]} />
            ))}
          </View>
          <Text style={[styles.typingLabel, { color: colors.textTertiary }]}>
            {conv?.participant.name?.split(" ")[0]} is typing…
          </Text>
        </View>
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, {
        backgroundColor: colors.card,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 10),
      }]}>
        <Pressable style={styles.attachBtn} onPress={handlePickImage} hitSlop={8}>
          <Feather name="image" size={22} color={colors.accent} />
        </Pressable>

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          value={text}
          onChangeText={setText}
          placeholder={blocked ? "Messaging blocked" : "Type a message…"}
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={500}
          editable={!blocked}
        />
        <Pressable
          style={[styles.sendBtn, (!text.trim() || blocked) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || blocked}
        >
          <Feather name="send" size={18} color="#fff" />
        </Pressable>
      </View>

      <ReportModal
        visible={showReport}
        targetId={participantId}
        targetType="user"
        targetName={conv?.participant.name}
        onClose={() => setShowReport(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingBottom: 12, gap: 12,
    borderBottomWidth: 1,
  },
  headerBackBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerVerifiedDot: {
    position: "absolute", bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#22C55E",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#fff",
  },
  headerName: { fontSize: 15, fontFamily: "Manrope_600SemiBold" },
  headerSub:  { fontSize: 12, fontFamily: "Manrope_400Regular" },
  moreBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },

  profileCard: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  profileCardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  profileLeft: { flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 },
  profileAvatar: { width: 58, height: 58, borderRadius: 29 },
  profileAvatarPlaceholder: {
    width: 58, height: 58, borderRadius: 29,
    alignItems: "center", justifyContent: "center",
  },
  profileVerifiedBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#fff",
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontFamily: "Manrope_700Bold" },
  verifiedTag: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: "#16A34A" },
  profileMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  profileMeta: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  profileActions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  profileActionBtn: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  viewFullProfileBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 10, borderRadius: 12, marginBottom: 12,
  },
  viewFullProfileText: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#fff" },

  dropdown: {
    position: "absolute", top: 100, right: 14, zIndex: 99,
    borderRadius: 14, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
    minWidth: 180, overflow: "hidden",
  },
  dropItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 13 },
  dropText: { fontSize: 14, fontFamily: "Manrope_500Medium", color: "#E53935" },

  carBanner: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10, gap: 10, borderBottomWidth: 1,
  },
  carBannerImage: { width: 52, height: 40, borderRadius: 8 },
  carBannerInfo: { flex: 1 },
  carBannerTitle: { fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  carBannerPrice: { fontSize: 12, fontFamily: "Manrope_500Medium" },
  soldTag: { color: "#E53935", fontFamily: "Manrope_700Bold" },

  blockedBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#FECACA",
  },
  blockedText: { fontSize: 13, fontFamily: "Manrope_500Medium", color: "#E53935" },

  messageList: { padding: 14, gap: 4 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyMessages: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyText: { fontSize: 14, fontFamily: "Manrope_400Regular", textAlign: "center" },

  bubbleContainer: { maxWidth: "80%", marginVertical: 2 },
  bubbleContainerOwn: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleContainerOther: { alignSelf: "flex-start", alignItems: "flex-start" },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn: {
    backgroundColor: "#0066CC",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  bubbleText: { fontSize: 14, fontFamily: "Manrope_400Regular", lineHeight: 20 },
  bubbleTextOwn: { color: "#fff" },
  bubbleMeta: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3 },
  bubbleTime: { fontSize: 10, fontFamily: "Manrope_400Regular" },
  mediaImg: { width: 200, height: 140, borderRadius: 10, marginBottom: 4 },

  actions: {
    flexDirection: "row", gap: 8, marginTop: 4,
    backgroundColor: "#FFF5F5", borderRadius: 10, padding: 8,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 4 },
  actionText: { fontSize: 12, fontFamily: "Manrope_500Medium", color: "#E53935" },

  phoneWarn: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: "#FFFBEB", borderRadius: 10,
    padding: 10, marginHorizontal: 4, marginBottom: 4,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  phoneWarnText: { flex: 1, fontSize: 12, fontFamily: "Manrope_500Medium", color: "#92400E", lineHeight: 17 },

  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 6 },
  typingBubble: {
    flexDirection: "row", gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 18, borderBottomLeftRadius: 4,
  },
  typingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#9E9E9E" },
  typingLabel: { fontSize: 12, fontFamily: "Manrope_400Regular" },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 14, paddingTop: 10, gap: 10, borderTopWidth: 1,
  },
  attachBtn: { width: 40, height: 42, alignItems: "center", justifyContent: "center" },
  input: {
    flex: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, fontFamily: "Manrope_400Regular", maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#0066CC", alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#C0C0C0" },
});
