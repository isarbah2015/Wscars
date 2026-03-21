import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { User } from "@/types";

interface Props {
  user: User;
  size?: "sm" | "md";
  row?: boolean;
  style?: ViewStyle;
}

export function VerificationBadges({ user, size = "md", row = true, style }: Props) {
  const v = user.verification;
  if (!v && !user.isVerified) return null;

  const fs = size === "sm" ? 9 : 11;
  const ps = size === "sm" ? 4 : 6;
  const iconSz = size === "sm" ? 10 : 12;

  const badges: { icon: string; label: string; color: string; bg: string }[] = [];

  if (v?.phone || user.isVerified) {
    badges.push({ icon: "phone", label: "Phone", color: "#0066CC", bg: "#EDF4FF" });
  }
  if (v?.id) {
    badges.push({ icon: "user-check", label: "ID Verified", color: "#22C55E", bg: "#DCFCE7" });
  }
  if (v?.dealer || user.isDealer) {
    badges.push({ icon: "star", label: "Dealer", color: "#F59E0B", bg: "#FEF3C7" });
  }

  if (badges.length === 0) return null;

  return (
    <View style={[row ? styles.row : styles.col, style]}>
      {badges.map((b) => (
        <View key={b.label} style={[styles.badge, { backgroundColor: b.bg, paddingHorizontal: ps }]}>
          <Feather name={b.icon as any} size={iconSz} color={b.color} />
          <Text style={[styles.label, { fontSize: fs, color: b.color }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

/* Single inline badge — for car cards */
export function VerifiedBadge({ user, size = "sm" }: { user: User; size?: "sm" | "md" }) {
  if (!user.isVerified && !user.verification?.id && !user.isDealer) return null;
  const iconSz = size === "sm" ? 10 : 13;
  const fs = size === "sm" ? 10 : 12;
  return (
    <View style={styles.singleBadge}>
      <Feather name="shield" size={iconSz} color="#0066CC" />
      <Text style={[styles.label, { fontSize: fs, color: "#0066CC" }]}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  col: { gap: 5 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    borderRadius: 20,
  },
  label: { fontFamily: "Manrope_600SemiBold" },
  singleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EDF4FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
});
