import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  style?: ViewStyle;
}

function getLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: "Excellent", color: "#22C55E", bg: "#DCFCE7" };
  if (score >= 65) return { label: "Good",      color: "#0066CC", bg: "#EDF4FF" };
  if (score >= 40) return { label: "Fair",      color: "#F59E0B", bg: "#FEF3C7" };
  return             { label: "New",       color: "#9E9E9E", bg: "#F3F4F6" };
}

export function TrustScore({ score, size = "md", showLabel = true, style }: Props) {
  const { label, color, bg } = getLevel(score);
  const clamp = Math.max(0, Math.min(100, score));

  if (size === "sm") {
    return (
      <View style={[styles.smContainer, { backgroundColor: bg }, style]}>
        <Text style={[styles.smScore, { color }]}>{clamp}</Text>
        <Text style={[styles.smLabel, { color }]}>Trust</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.topRow}>
          <Text style={styles.title}>Trust Score</Text>
          <View style={[styles.levelPill, { backgroundColor: bg }]}>
            <Text style={[styles.levelText, { color }]}>{label}</Text>
          </View>
        </View>
      )}

      {/* Bar */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamp}%` as any, backgroundColor: color }]} />
      </View>

      {/* Number */}
      <View style={styles.bottomRow}>
        <Text style={[styles.scoreNum, { color }]}>{clamp}/100</Text>
        <Text style={styles.hint}>Based on verification, ratings &amp; sales</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#4A4A4A" },
  levelPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  levelText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  track: { height: 8, backgroundColor: "#E8E8E8", borderRadius: 4, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4 },
  bottomRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreNum: { fontSize: 14, fontFamily: "Inter_700Bold" },
  hint: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#9E9E9E" },

  smContainer: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 0,
  },
  smScore: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  smLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
});
