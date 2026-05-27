import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  imageUri?: string;
  title?: string;
};

function fmt(n: number) {
  return n.toLocaleString();
}

function fmtM(n: number) {
  return `${(n / 1000).toFixed(2)} m`;
}

function DimBadge({
  label,
  value,
  sub,
  isDark,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  isDark: boolean;
  accent: string;
}) {
  return (
    <View
      style={[
        styles.dimBadge,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF",
          borderColor: isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0",
        },
      ]}
    >
      <Text style={[styles.dimBadgeLabel, { color: isDark ? "#94A3B8" : "#64748B" }]}>{label}</Text>
      <Text style={[styles.dimBadgeValue, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>{value}</Text>
      <Text style={[styles.dimBadgeSub, { color: accent }]}>{sub}</Text>
    </View>
  );
}

/** Listing photo with width/height callouts and dimension summary cards. */
export function CarDimensionDiagram({
  length,
  width,
  height,
  wheelbase,
  imageUri,
  title,
}: Props) {
  const { isDark } = useTheme();

  const accent = "#0EB5CA";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0";
  const muted = isDark ? "#94A3B8" : "#64748B";

  const metrics = [
    { label: "Length", value: length },
    { label: "Width", value: width },
    { label: "Height", value: height },
    { label: "Wheelbase", value: wheelbase },
  ];

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: border }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Dimensions</Text>
        {title ? (
          <Text style={[styles.headerSub, { color: muted }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      {imageUri ? (
        <View style={[styles.hero, { borderColor: border }]}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(10,22,40,0.75)"]} style={styles.heroScrim} />

          <View style={styles.heightRail}>
            <View style={styles.railLine} />
            <View style={styles.railBadge}>
              <Text style={styles.railLabel}>Height</Text>
              <Text style={styles.railValue}>{fmt(height)}</Text>
              <Text style={styles.railUnit}>mm · {fmtM(height)}</Text>
            </View>
            <View style={styles.railLine} />
          </View>

          <View style={styles.widthBar}>
            <View style={styles.widthTick} />
            <View style={styles.widthBadge}>
              <Text style={styles.widthLabel}>Width</Text>
              <Text style={styles.widthValue}>{fmt(width)} mm</Text>
              <Text style={styles.widthSub}>{fmtM(width)}</Text>
            </View>
            <View style={styles.widthTick} />
          </View>
        </View>
      ) : null}

      <View style={styles.metricsGrid}>
        {metrics.map((m) => (
          <DimBadge
            key={m.label}
            label={m.label}
            value={`${fmt(m.value)} mm`}
            sub={fmtM(m.value)}
            isDark={isDark}
            accent={accent}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 14,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  hero: {
    marginHorizontal: 12,
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  heightRail: {
    position: "absolute",
    left: 10,
    top: 24,
    bottom: 52,
    width: 72,
    alignItems: "center",
    justifyContent: "space-between",
  },
  railLine: {
    width: 2,
    flex: 1,
    backgroundColor: "rgba(14,181,202,0.85)",
    borderRadius: 1,
    marginVertical: 4,
  },
  railBadge: {
    backgroundColor: "rgba(10,22,40,0.88)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.45)",
    minWidth: 68,
  },
  railLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  railValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    marginTop: 2,
  },
  railUnit: {
    color: "#0EB5CA",
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    marginTop: 1,
  },
  widthBar: {
    position: "absolute",
    left: 88,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  widthTick: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(14,181,202,0.85)",
    borderRadius: 1,
  },
  widthBadge: {
    backgroundColor: "rgba(10,22,40,0.88)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.45)",
  },
  widthLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  widthValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    marginTop: 2,
  },
  widthSub: {
    color: "#0EB5CA",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    marginTop: 1,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  dimBadge: {
    width: "48%",
    flexGrow: 1,
    minWidth: 148,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  dimBadgeLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.45,
    textTransform: "uppercase",
  },
  dimBadgeValue: {
    fontSize: 14,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
  },
  dimBadgeSub: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
