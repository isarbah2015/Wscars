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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { Conversation } from "@/types";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function ConversationRow({ conv }: { conv: Conversation }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.convRow, pressed && { opacity: 0.9 }]}
      onPress={() =>
        router.push({ pathname: "/conversation/[id]", params: { id: conv.id } })
      }
    >
      <View style={styles.avatarContainer}>
        {conv.participant.avatar ? (
          <Image
            source={{ uri: conv.participant.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={20} color={Colors.light.textTertiary} />
          </View>
        )}
        {conv.participant.isVerified && (
          <View style={styles.verifiedDot}>
            <Feather name="check" size={8} color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.convContent}>
        <View style={styles.convTop}>
          <Text style={styles.participantName} numberOfLines={1}>
            {conv.participant.name}
          </Text>
          <Text style={styles.time}>{timeAgo(conv.lastMessageTime)}</Text>
        </View>
        <Text style={styles.carName} numberOfLines={1}>
          Re: {conv.car.brand} {conv.car.model}
        </Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {conv.lastMessage || "No messages yet"}
        </Text>
      </View>

      {conv.unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{conv.unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { conversations, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  if (!isAuthenticated) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad }]}>
        <Feather name="message-circle" size={52} color={Colors.light.textTertiary} />
        <Text style={styles.authTitle}>Sign In to View Messages</Text>
        <Pressable
          style={styles.authBtn}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.authBtnText}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationRow conv={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather
              name="message-circle"
              size={52}
              color={Colors.light.textTertiary}
            />
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>
              Contact a seller from a car listing to start chatting
            </Text>
          </View>
        }
        ListFooterComponent={
          <View
            style={{ height: 100 + (insets.bottom || 0) }}
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  convRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.verified,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  convContent: {
    flex: 1,
    gap: 2,
  },
  convTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  carName: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.primary,
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 80,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  authWall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  authTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  authBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  authBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
