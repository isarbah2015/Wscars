import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

interface RatingBarProps {
  label: string;
  icon: string;
  value: number;
  maxValue?: number;
  size?: "small" | "large";
}

export function RatingBar({
  label,
  icon,
  value,
  maxValue = 5,
  size = "large",
}: RatingBarProps) {
  const pct = Math.min(value / maxValue, 1);
  const isSmall = size === "small";

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Feather
        name={icon as any}
        size={isSmall ? 10 : 14}
        color={Colors.primary}
        style={{ width: isSmall ? 12 : 18 }}
      />
      {!isSmall && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={[styles.track, isSmall && styles.trackSmall]}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%` },
            isSmall && styles.fillSmall,
          ]}
        />
      </View>
      <Text style={[styles.value, isSmall && styles.valueSmall]}>
        {value.toFixed(1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  containerSmall: {
    gap: 4,
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    width: 90,
    fontFamily: "Inter_400Regular",
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.light.backgroundTertiary,
    borderRadius: 3,
    overflow: "hidden",
  },
  trackSmall: {
    height: 4,
    width: 36,
    flex: 0,
  },
  fill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  fillSmall: {
    backgroundColor: Colors.primary,
  },
  value: {
    fontSize: 13,
    color: Colors.light.text,
    fontFamily: "Inter_600SemiBold",
    width: 28,
    textAlign: "right",
  },
  valueSmall: {
    fontSize: 10,
    width: 22,
  },
});
