import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Review } from "@/types";

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Feather
          key={n}
          name="star"
          size={size}
          color={n <= Math.round(rating) ? "#F59E0B" : "#E0E0E0"}
        />
      ))}
    </View>
  );
}

interface Props {
  review: Review;
}

export function ReviewCard({ review }: Props) {
  const date = new Date(review.createdAt).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {review.fromUserAvatar ? (
          <Image source={{ uri: review.fromUserAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={16} color="#9E9E9E" />
          </View>
        )}
        <View style={styles.meta}>
          <Text style={styles.name}>{review.fromUserName}</Text>
          <View style={styles.ratingRow}>
            <Stars rating={review.rating} />
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreText}>{review.rating}.0</Text>
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

export function StarRating({ rating, totalReviews }: { rating: number; totalReviews: number }) {
  return (
    <View style={styles.ratingBig}>
      <Text style={styles.ratingNum}>{rating > 0 ? rating.toFixed(1) : "—"}</Text>
      <Stars rating={rating} size={14} />
      <Text style={styles.ratingCount}>({totalReviews} reviews)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center",
  },
  meta: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  date: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "#9E9E9E" },
  scorePill: {
    backgroundColor: "#FEF3C7", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  scoreText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: "#D97706" },
  comment: { fontSize: 13, fontFamily: "Manrope_400Regular", color: "#4A4A4A", lineHeight: 20 },

  ratingBig: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingNum: { fontSize: 22, fontFamily: "Manrope_800ExtraBold", color: "#1A1A1A" },
  ratingCount: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#9E9E9E" },
});
