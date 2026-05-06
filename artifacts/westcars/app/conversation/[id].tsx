import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// expo-audio hooks — real on native, harmless stubs on web so hooks are
// always called the same number of times (no React rules-of-hooks violation).
const STUB_PLAYER = { play: () => {}, pause: () => {}, playing: false, currentTime: 0, duration: 0 };
const STUB_RECORDER = { record: async () => {}, stop: async () => {}, uri: null as string | null };

let AudioModule: any  = { requestRecordingPermissionsAsync: async () => ({ granted: false }) };
let RecordingPresets: any = { HIGH_QUALITY: {} };
let useAudioPlayer: (src: any) => any   = () => STUB_PLAYER;
let useAudioPlayerStatus: (p: any) => any = (p) => p;
let useAudioRecorder: (opts: any) => any  = () => STUB_RECORDER;

if (Platform.OS !== "web") {
  try {
    const mod = require("expo-audio");
    AudioModule         = mod.AudioModule;
    RecordingPresets    = mod.RecordingPresets;
    useAudioPlayer      = mod.useAudioPlayer;
    useAudioPlayerStatus = mod.useAudioPlayerStatus;
    useAudioRecorder    = mod.useAudioRecorder;
  } catch { /* expo-audio not available — stubs already set */ }
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReportModal } from "@/components/ReportModal";
import { SafetyTipsModal } from "@/components/SafetyTipsModal";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { Message } from "@/types";

// Phone number pattern — detects GH formats (+233, 0xx)
const PHONE_RE = /(?:\+233|0)[0-9]{9}/g;

const BRAND = "#0EB5CA";
const BRAND_DARK = "#0098AA";

function timeStr(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}

// ── Audio Player bubble ───────────────────────────────────────────────────────
function AudioBubble({ uri, isOwn }: { uri: string; isOwn: boolean }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const toggle = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const pct = (status.duration ?? 0) > 0
    ? (status.currentTime ?? 0) / (status.duration ?? 1)
    : 0;
  const remaining = Math.max(0, (status.duration ?? 0) - (status.currentTime ?? 0));
  const secs = Math.round(remaining);
  const timeLabel = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <Pressable onPress={toggle} style={[styles.audioBubble, isOwn && styles.audioBubbleOwn]}>
      <View style={[styles.audioPlayBtn, isOwn && styles.audioPlayBtnOwn]}>
        <Feather name={status.playing ? "pause" : "play"} size={16} color={isOwn ? BRAND : "#fff"} />
      </View>
      <View style={styles.audioWaveWrap}>
        {Array.from({ length: 22 }).map((_, i) => {
          const h = 6 + Math.sin(i * 0.9) * 6 + Math.cos(i * 1.7) * 4;
          const filled = i / 22 <= pct;
          return (
            <View
              key={i}
              style={[
                styles.audioBar,
                {
                  height: h,
                  backgroundColor: filled
                    ? (isOwn ? "rgba(255,255,255,0.92)" : BRAND)
                    : (isOwn ? "rgba(255,255,255,0.32)" : "#CBD5E1"),
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.audioDuration, isOwn && { color: "rgba(255,255,255,0.8)" }]}>{timeLabel}</Text>
    </Pressable>
  );
}

function MessageBubble({
  msg, isOwn, sellerPhone, onDelete, participantAvatar,
}: {
  msg: Message; isOwn: boolean; sellerPhone?: string; onDelete: () => void; participantAvatar?: string;
}) {
  const { colors, isDark } = useTheme();
  const [showActions, setShowActions] = useState(false);

  if (msg.isDeletedForSelf) return null;

  const phones = msg.text?.match(PHONE_RE);
  const hasMismatch = phones && sellerPhone &&
    phones.some((p) => p.replace(/\s/g, "") !== sellerPhone.replace(/\s/g, ""));

  const receivedBg = isDark ? "#1E2940" : "#FFFFFF";

  return (
    <View style={{ marginVertical: 3 }}>
      {hasMismatch && (
        <View style={styles.phoneWarn}>
          <Feather name="alert-triangle" size={14} color="#D97706" />
          <Text style={styles.phoneWarnText}>
            Different number detected — only use the seller's registered number or in-app chat.
          </Text>
        </View>
      )}

      <View style={[
        styles.bubbleRow,
        isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther,
      ]}>
        {/* Avatar for received messages */}
        {!isOwn && (
          <View style={styles.receivedAvatarWrap}>
            {participantAvatar ? (
              <Image source={{ uri: participantAvatar }} style={styles.receivedAvatar} />
            ) : (
              <View style={[styles.receivedAvatarPlaceholder, { backgroundColor: colors.accentLight }]}>
                <Feather name="user" size={12} color={colors.accent} />
              </View>
            )}
          </View>
        )}

        <View style={[
          styles.bubbleContainer,
          isOwn ? styles.bubbleContainerOwn : styles.bubbleContainerOther,
        ]}>
          {/* Audio message */}
          {msg.mediaType === "audio" && msg.mediaUrl ? (
            <Pressable onLongPress={() => isOwn && setShowActions(true)}>
              <AudioBubble uri={msg.mediaUrl} isOwn={isOwn} />
            </Pressable>
          ) : (
            <Pressable
              onLongPress={() => isOwn && setShowActions(true)}
              style={[
                styles.bubble,
                isOwn
                  ? styles.bubbleOwn
                  : [styles.bubbleOther, { backgroundColor: receivedBg }],
              ]}
            >
              {/* Image */}
              {msg.mediaType === "image" && msg.mediaUrl && (
                <Image source={{ uri: msg.mediaUrl }} style={styles.mediaImg} resizeMode="cover" />
              )}

              {/* Video thumbnail */}
              {msg.mediaType === "video" && msg.mediaUrl && (
                <View style={styles.videoThumb}>
                  <Image source={{ uri: msg.mediaUrl }} style={styles.mediaImg} resizeMode="cover" />
                  <View style={styles.videoPlayOverlay}>
                    <View style={styles.videoPlayCircle}>
                      <Feather name="play" size={22} color="#fff" />
                    </View>
                  </View>
                </View>
              )}

              {msg.text ? (
                <Text style={[
                  styles.bubbleText,
                  isOwn ? styles.bubbleTextOwn : { color: isDark ? "#F1F5F9" : "#111827" },
                ]}>
                  {msg.text}
                </Text>
              ) : null}

              <View style={styles.bubbleMeta}>
                <Text style={[styles.bubbleTime, { color: isOwn ? "rgba(255,255,255,0.68)" : colors.textTertiary }]}>
                  {timeStr(msg.timestamp)}
                </Text>
                {isOwn && (
                  <Feather
                    name={msg.isRead ? "check-circle" : "check"}
                    size={10}
                    color={msg.isRead ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)"}
                  />
                )}
              </View>
            </Pressable>
          )}

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
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, messages, sendMessage, deleteMessage, markMessagesRead,
          currentUser, blockUser, isBlocked, reportItem, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [text,          setText]         = useState("");
  const [showSafety,    setShowSafety]   = useState(true);
  const [typingVisible, setTypingVisible] = useState(false);
  const [showReport,    setShowReport]   = useState(false);
  const [showActions,   setShowActions]  = useState(false);
  const [showAttach,    setShowAttach]   = useState(false);
  const [isRecording,   setIsRecording]  = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const flatListRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const conv = conversations.find((c) => c.id === id);
  const convMessages = (messages[id] || []).filter((m) => !m.isDeletedForSelf);
  const participantId = conv?.participantId || "";
  const blocked = isBlocked(participantId);
  const participantFull = conv?.participant ?? null;
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
    setShowAttach(false);
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

  const handlePickVideo = async () => {
    setShowAttach(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow access to your gallery to send videos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      quality: 0.7,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      sendMessage(id, "", result.assets[0].uri, "video");
    }
  };

  const handleStartRecording = async () => {
    setShowAttach(false);
    try {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Allow microphone access to send voice messages.");
        return;
      }
      await audioRecorder.record();
      setIsRecording(true);
    } catch {
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };

  const handleStopRecording = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setIsRecording(false);
      if (uri) {
        sendMessage(id, "", uri, "audio");
      }
    } catch {
      setIsRecording(false);
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

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 }]}>
        <Feather name="lock" size={48} color={colors.accent} />
        <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: colors.text, textAlign: "center" }}>
          Sign in required
        </Text>
        <Text style={{ fontSize: 14, fontFamily: "Inter_400Regular", color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
          You need to be signed in to view this conversation.
        </Text>
        <Pressable
          style={{ backgroundColor: colors.accent, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14, marginTop: 4 }}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  if (showSafety) {
    return (
      <SafetyTipsModal
        visible={showSafety}
        onContinue={() => setShowSafety(false)}
        onCancel={() => router.back()}
      />
    );
  }

  const headerBg = isDark ? "#111827" : "#FFFFFF";
  const headerBorderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? "#0F172A" : "#F0F4F8" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Header ── */}
      <View style={[styles.header, {
        backgroundColor: headerBg,
        borderBottomColor: headerBorderColor,
        paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 10,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
          <Feather name="arrow-left" size={22} color={isDark ? "#F1F5F9" : "#0F172A"} />
        </Pressable>

        <Pressable
          style={styles.headerInfo}
          onPress={() => setProfileExpanded((v) => !v)}
        >
          {/* Avatar with online dot */}
          <View style={{ position: "relative" }}>
            {conv?.participant.avatar ? (
              <Image source={{ uri: conv.participant.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatarPlaceholder, { backgroundColor: isDark ? "#1E2940" : "#EFF6FF" }]}>
                <Feather name="user" size={18} color={BRAND} />
              </View>
            )}
            {/* Online indicator */}
            <View style={styles.headerOnlineDot} />
          </View>
          <View>
            <Text style={[styles.headerName, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
              {conv?.participant.name || "Seller"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={styles.headerOnlineDotSmall} />
              <Text style={[styles.headerOnlineText, { color: "#22C55E" }]}>Online</Text>
            </View>
          </View>
        </Pressable>

        {/* Right actions: phone, video, more */}
        <View style={styles.headerActions}>
          {conv?.participant.phone && (
            <Pressable
              style={[styles.headerActionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}
              onPress={() => {
                if (conv.participant.phone) {
                  Linking.openURL(`tel:${conv.participant.phone}`).catch(() => {});
                }
              }}
            >
              <Feather name="phone-call" size={17} color={BRAND} />
            </Pressable>
          )}
          <Pressable
            style={[styles.headerActionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}
            onPress={() => Alert.alert("Video Call", "Video calls are coming soon!")}
          >
            <Feather name="video" size={17} color={isDark ? "#94A3B8" : "#64748B"} />
          </Pressable>
          <Pressable
            style={[styles.headerActionBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }]}
            onPress={() => setShowActions(true)}
          >
            <Feather name="more-vertical" size={17} color={isDark ? "#94A3B8" : "#64748B"} />
          </Pressable>
        </View>
      </View>

      {/* More actions dropdown */}
      {showActions && (
        <View style={[styles.dropdown, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]}>
          <Pressable
            style={styles.dropItem}
            onPress={() => {
              setShowActions(false);
              router.push({ pathname: "/user/[id]", params: { id: participantId } });
            }}
          >
            <Feather name="user" size={16} color={BRAND} />
            <Text style={[styles.dropText, { color: BRAND }]}>View Profile</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={() => { setShowActions(false); setShowReport(true); }}>
            <Feather name="flag" size={16} color="#E53935" />
            <Text style={[styles.dropText, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Report User</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={handleBlock}>
            <Feather name="slash" size={16} color="#E53935" />
            <Text style={[styles.dropText, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{blocked ? "Unblock User" : "Block User"}</Text>
          </Pressable>
          <Pressable style={styles.dropItem} onPress={() => setShowActions(false)}>
            <Feather name="x" size={16} color="#9E9E9E" />
            <Text style={[styles.dropText, { color: "#9E9E9E" }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Client Profile Card (expandable) */}
      {profileExpanded && conv && (
        <View style={[styles.profileCard, { backgroundColor: isDark ? "#111827" : "#FFFFFF", borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
          <View style={styles.profileCardInner}>
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

            <View style={styles.profileActions}>
              {conv.participant.phone && (
                <Pressable
                  style={[styles.profileActionBtn, { backgroundColor: colors.accentLight }]}
                  onPress={() => {
                    if (Platform.OS !== "web") {
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
            style={[styles.viewFullProfileBtn, { backgroundColor: BRAND }]}
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
        <Pressable
          style={[styles.carBanner, { backgroundColor: isDark ? "#111827" : "#FFFFFF", borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}
          onPress={() => router.push({ pathname: "/car/[id]", params: { id: conv.carId } })}
        >
          <Image source={{ uri: conv.car.images[0] }} style={styles.carBannerImage} />
          <View style={styles.carBannerInfo}>
            <Text style={[styles.carBannerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={1}>
              {conv.car.brand} {conv.car.model}
            </Text>
            <Text style={[styles.carBannerPrice, { color: BRAND }]}>
              GHS {conv.car.price.toLocaleString()}
              {conv.car.isSold && <Text style={styles.soldTag}> · SOLD</Text>}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={isDark ? "#475569" : "#94A3B8"} />
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
            participantAvatar={conv?.participant.avatar}
          />
        )}
        contentContainerStyle={[
          styles.messageList,
          convMessages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Feather name="message-circle" size={40} color={isDark ? "#334155" : "#CBD5E1"} />
            <Text style={[styles.emptyText, { color: isDark ? "#475569" : "#94A3B8" }]}>
              Say hello! Ask the seller about this car.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {typingVisible && (
        <View style={[styles.typingRow, { backgroundColor: isDark ? "#0F172A" : "#F0F4F8" }]}>
          <View style={[styles.typingBubble, { backgroundColor: isDark ? "#1E2940" : "#FFFFFF" }]}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.typingDot, { opacity: 0.5 + i * 0.2, backgroundColor: BRAND }]} />
            ))}
          </View>
          <Text style={[styles.typingLabel, { color: isDark ? "#64748B" : "#94A3B8" }]}>
            {conv?.participant.name?.split(" ")[0]} is typing…
          </Text>
        </View>
      )}

      {/* Attachment picker tray */}
      {showAttach && !blocked && (
        <View style={[styles.attachTray, { backgroundColor: isDark ? "#111827" : "#FFFFFF", borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0" }]}>
          <Pressable style={styles.attachOption} onPress={handlePickImage}>
            <View style={[styles.attachIcon, { backgroundColor: "#EFF6FF" }]}>
              <Feather name="image" size={20} color="#2563EB" />
            </View>
            <Text style={[styles.attachLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>Photo</Text>
          </Pressable>
          <Pressable style={styles.attachOption} onPress={handlePickVideo}>
            <View style={[styles.attachIcon, { backgroundColor: "#FFF7ED" }]}>
              <Feather name="video" size={20} color="#EA580C" />
            </View>
            <Text style={[styles.attachLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>Video</Text>
          </Pressable>
          <Pressable
            style={styles.attachOption}
            onPress={isRecording ? handleStopRecording : handleStartRecording}
          >
            <View style={[styles.attachIcon, { backgroundColor: isRecording ? "#FEF2F2" : "#F0FDF4" }]}>
              <Feather name="mic" size={20} color={isRecording ? "#DC2626" : "#16A34A"} />
            </View>
            <Text style={[styles.attachLabel, { color: isRecording ? "#DC2626" : (isDark ? "#94A3B8" : "#64748B") }]}>
              {isRecording ? "Stop" : "Audio"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Recording in progress banner */}
      {isRecording && (
        <View style={styles.recordingBanner}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Recording… tap Audio to stop</Text>
          <Pressable onPress={handleStopRecording}>
            <Feather name="stop-circle" size={20} color="#DC2626" />
          </Pressable>
        </View>
      )}

      {/* Input bar */}
      <View style={[styles.inputBar, {
        backgroundColor: isDark ? "#111827" : "#FFFFFF",
        borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
        paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 10),
      }]}>
        <Pressable
          style={[styles.attachBtn, { backgroundColor: showAttach ? "rgba(14,181,202,0.12)" : "transparent" }]}
          onPress={() => setShowAttach((v) => !v)}
          hitSlop={8}
        >
          <Feather name={showAttach ? "x" : "plus"} size={22} color={BRAND} />
        </Pressable>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: isDark ? "#1E2940" : "#F1F5F9", color: isDark ? "#F1F5F9" : "#0F172A", borderColor: "transparent" },
          ]}
          value={text}
          onChangeText={setText}
          onFocus={() => setShowAttach(false)}
          placeholder={blocked ? "Messaging blocked" : "Message…"}
          placeholderTextColor={isDark ? "#475569" : "#94A3B8"}
          multiline
          maxLength={500}
          editable={!blocked}
        />

        <Pressable
          style={[styles.sendBtn, (!text.trim() || blocked) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || blocked}
        >
          <Feather name="send" size={17} color="#fff" />
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

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: { width: 42, height: 42, borderRadius: 21 },
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerName: { fontSize: 15, fontFamily: "Inter_700Bold" },
  headerOnlineDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22C55E",
  },
  headerOnlineText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Dropdown */
  dropdown: {
    position: "absolute",
    top: 100,
    right: 12,
    zIndex: 99,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 190,
    overflow: "hidden",
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropText: { fontSize: 14, fontFamily: "Inter_500Medium" },

  /* Profile card */
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
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  profileVerifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  verifiedTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  verifiedTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#16A34A" },
  profileMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  profileMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  profileActions: { flexDirection: "row", gap: 8, marginLeft: 8 },
  profileActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  viewFullProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  viewFullProfileText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },

  /* Car banner */
  carBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  carBannerImage: { width: 52, height: 40, borderRadius: 8 },
  carBannerInfo: { flex: 1 },
  carBannerTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  carBannerPrice: { fontSize: 12, fontFamily: "Inter_500Medium" },
  soldTag: { color: "#E53935", fontFamily: "Inter_700Bold" },

  /* Blocked */
  blockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FECACA",
  },
  blockedText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#E53935" },

  /* Message list */
  messageList: { paddingHorizontal: 12, paddingVertical: 16, gap: 2 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyMessages: { alignItems: "center", gap: 10, paddingVertical: 40 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },

  /* Bubble row (includes optional avatar for received) */
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  bubbleRowOwn: { justifyContent: "flex-end" },
  bubbleRowOther: { justifyContent: "flex-start" },

  /* Small avatar for received messages */
  receivedAvatarWrap: { marginBottom: 4 },
  receivedAvatar: { width: 28, height: 28, borderRadius: 14 },
  receivedAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Bubble container */
  bubbleContainer: { maxWidth: "76%", marginVertical: 1 },
  bubbleContainerOwn: { alignSelf: "flex-end", alignItems: "flex-end" },
  bubbleContainerOther: { alignSelf: "flex-start", alignItems: "flex-start" },

  /* Bubble */
  bubble: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn: {
    backgroundColor: BRAND,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bubbleText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  bubbleTextOwn: { color: "#fff" },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular" },

  /* Media */
  mediaImg: { width: 200, height: 140, borderRadius: 12, marginBottom: 4 },
  videoThumb: { position: "relative" },
  videoPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlayCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Audio bubble */
  audioBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 190,
  },
  audioBubbleOwn: {
    backgroundColor: BRAND,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 20,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  audioPlayBtnOwn: { backgroundColor: "#fff" },
  audioWaveWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 2 },
  audioBar: { width: 3, borderRadius: 2, minHeight: 4 },
  audioDuration: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    minWidth: 28,
    textAlign: "right",
  },

  /* Attach tray */
  attachTray: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  attachOption: { alignItems: "center", gap: 6 },
  attachIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  attachLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },

  /* Recording */
  recordingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#DC2626" },
  recordingText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: "#DC2626" },

  /* Actions (long-press) */
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    backgroundColor: "#FFF5F5",
    borderRadius: 10,
    padding: 8,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 4, padding: 4 },
  actionText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#E53935" },

  /* Phone warning */
  phoneWarn: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  phoneWarnText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#92400E",
    lineHeight: 17,
  },

  /* Typing indicator */
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  typingBubble: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },
  typingLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },

  /* Input bar */
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  attachBtn: {
    width: 38,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    borderWidth: 0,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#CBD5E1" },
});
