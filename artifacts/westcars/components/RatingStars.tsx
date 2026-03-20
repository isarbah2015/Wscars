import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Colors } from "@/constants/colors";

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  maxStars?: number;
}

export function RatingStars({
  rating,
  size = 12,
  color = Colors.star,
  maxStars = 5,
}: RatingStarsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Feather
            key={i}
            name={filled ? "star" : half ? "star" : "star"}
            size={size}
            color={filled || half ? color : "#DDD"}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
  },
});
