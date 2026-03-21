import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { Message } from "@/types";

function timeStr(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({
  msg,
  isOwn,
}: {
  msg: Message;
  isOwn: boolean;
}) {
  return (
    <View
      style={[
        styles.bubbleContainer,
        isOwn ? styles.bubbleContainerOwn : styles.bubbleContainerOther,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isOwn ? styles.bubbleOwn : styles.bubbleOther,
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther,
          ]}
        >
          {msg.text}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
        {timeStr(msg.timestamp)}
      </Text>
    </View>
  );
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { conversations, messages, sendMessage, currentUser } = useApp();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const conv = conversations.find((c) => c.id === id);
  const convMessages = messages[id] || [];

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(id, text.trim());
    setText("");
  };

  useEffect(() => {
    if (convMessages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [convMessages.length]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: (insets.top || (Platform.OS === "web" ? 67 : 0)) + 10,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
          <Feather name="arrow-left" size={22} color={Colors.light.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          {conv?.participant.avatar ? (
            <Image
              source={{ uri: conv.participant.avatar }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Feather name="user" size={18} color={Colors.light.textTertiary} />
            </View>
          )}
          <View>
            <Text style={styles.headerName}>
              {conv?.participant.name || "Seller"}
            </Text>
            <Text style={styles.headerCar} numberOfLines={1}>
              {conv?.car.brand} {conv?.car.model}
            </Text>
          </View>
        </View>
        <Pressable style={styles.headerCallBtn} onPress={() => {}}>
          <Feather name="phone" size={18} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Car Reference */}
      {conv && (
        <Pressable
          style={styles.carBanner}
          onPress={() =>
            router.push({
              pathname: "/car/[id]",
              params: { id: conv.carId },
            })
          }
        >
          <Image
            source={{ uri: conv.car.images[0] }}
            style={styles.carBannerImage}
          />
          <View style={styles.carBannerInfo}>
            <Text style={styles.carBannerTitle} numberOfLines={1}>
              {conv.car.brand} {conv.car.model}
            </Text>
            <Text style={styles.carBannerPrice}>
              {conv.car.price.toLocaleString("en-GH")} GHS
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
        </Pressable>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={convMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            msg={item}
            isOwn={item.senderId === currentUser?.id || item.senderId === "currentUser"}
          />
        )}
        contentContainerStyle={[
          styles.messageList,
          convMessages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Feather name="message-circle" size={40} color={Colors.light.textTertiary} />
            <Text style={styles.emptyText}>
              Say hello! Ask the seller about this car.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 10),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.light.textTertiary}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <Pressable
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Feather name="send" size={18} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerName: {
    fontSize: 15,
    fontFamily: "Manrope_600SemiBold",
    color: Colors.light.text,
  },
  headerCar: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: "Manrope_400Regular",
  },
  headerCallBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  carBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  carBannerImage: {
    width: 52,
    height: 40,
    borderRadius: 8,
  },
  carBannerInfo: {
    flex: 1,
  },
  carBannerTitle: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: Colors.light.text,
  },
  carBannerPrice: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: Colors.primary,
  },
  messageList: {
    padding: 14,
    gap: 6,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  emptyMessages: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
  },
  bubbleContainer: {
    gap: 2,
    maxWidth: "80%",
    marginVertical: 2,
  },
  bubbleContainerOwn: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  bubbleContainerOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: "#fff",
  },
  bubbleTextOther: {
    color: Colors.light.text,
  },
  bubbleTime: {
    fontSize: 10,
    color: Colors.light.textTertiary,
    fontFamily: "Manrope_400Regular",
    paddingHorizontal: 4,
  },
  bubbleTimeOwn: {
    textAlign: "right",
  },
  inputBar: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Manrope_400Regular",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: Colors.light.textTertiary,
  },
});
