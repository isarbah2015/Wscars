import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { ChineseSellerProfile } from "@/types";

type Props = {
  profile: ChineseSellerProfile;
  compact?: boolean;
};

export function ChineseSellerCard({ profile, compact }: Props) {
  const { colors, isDark } = useTheme();
  if (!profile.isChineseSeller) return null;

  const openWeChatHint = () => {
    if (profile.wechatId?.trim()) {
      Linking.openURL(`https://wa.me/?text=${encodeURIComponent(`WeChat ID: ${profile.wechatId}`)}`).catch(() => {});
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ["#1C1408", "#2A1810"] : ["#FFFBF4", "#FFF7ED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, { borderColor: isDark ? "rgba(255,140,0,0.25)" : "rgba(255,140,0,0.35)" }]}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🇨🇳</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Chinese Seller / Importer</Text>
          {!compact && (
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Verified importer profile — contact via WeChat or in-app chat
            </Text>
          )}
        </View>
      </View>

      <View style={styles.meta}>
        {profile.locationInChina ? (
          <View style={styles.metaRow}>
            <Feather name="map-pin" size={13} color="#E8640A" />
            <Text style={[styles.metaText, { color: colors.text }]}>
              Based in {profile.locationInChina}, China
            </Text>
          </View>
        ) : null}
        {profile.businessName ? (
          <View style={styles.metaRow}>
            <Feather name="briefcase" size={13} color="#E8640A" />
            <Text style={[styles.metaText, { color: colors.text }]}>{profile.businessName}</Text>
          </View>
        ) : null}
        {profile.wechatId ? (
          <Pressable style={styles.metaRow} onPress={openWeChatHint}>
            <Feather name="message-circle" size={13} color="#E8640A" />
            <Text style={[styles.metaText, { color: colors.text }]}>
              WeChat: <Text style={styles.wechat}>{profile.wechatId}</Text>
            </Text>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,140,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 18 },
  title: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2, lineHeight: 17 },
  meta: { gap: 6, paddingLeft: 46 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  metaText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1, flexShrink: 1 },
  wechat: { fontFamily: "Inter_700Bold", color: "#E8640A" },
});
