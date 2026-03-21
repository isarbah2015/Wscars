import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

interface VerifiedBadgeProps {
  size?: "small" | "medium";
}

export function VerifiedBadge({ size = "medium" }: VerifiedBadgeProps) {
  const isSmall = size === "small";
  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <Feather
        name="check-circle"
        size={isSmall ? 10 : 12}
        color={Colors.verified}
      />
      <Text style={[styles.text, isSmall && styles.textSmall]}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: Colors.verified + "18",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  text: {
    fontSize: 11,
    color: Colors.verified,
    fontFamily: "Manrope_600SemiBold",
  },
  textSmall: {
    fontSize: 10,
  },
});
