import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/context/ThemeContext";
import {
  GENOMICS_ACCENT,
  getCarGenomics,
  type AspectRating,
} from "@/utils/genomicsData";

type Props = {
  brand: string;
  model: string;
};

const useNative = Platform.OS !== "web";

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.25 && value - full < 0.75;
  const filledTotal = half ? full + 0.5 : Math.round(value);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const isFull = i + 1 <= filledTotal;
        const isHalf = !isFull && i + 0.5 < filledTotal;
        return (
          <Feather
            key={i}
            name="star"
            size={14}
            color={isFull || isHalf ? GENOMICS_ACCENT : "#D7DEE3"}
          />
        );
      })}
    </View>
  );
}

function AspectBar({
  aspect,
  index,
  textColor,
  subTextColor,
  trackColor,
}: {
  aspect: AspectRating;
  index: number;
  textColor: string;
  subTextColor: string;
  trackColor: string;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = Math.max(0, Math.min(1, aspect.value / 5));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 900,
      delay: index * 110,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [anim, pct, index]);

  const widthInterp = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.aspectRow}>
      <View style={styles.aspectHeader}>
        <View style={styles.aspectLabelWrap}>
          <View style={styles.aspectIconBubble}>
            <Feather name={aspect.icon as any} size={11} color={GENOMICS_ACCENT} />
          </View>
          <Text style={[styles.aspectLabel, { color: textColor }]}>{aspect.label}</Text>
        </View>
        <Text style={[styles.aspectValue, { color: textColor }]}>
          {aspect.value.toFixed(1)}
          <Text style={[styles.aspectValueOf, { color: subTextColor }]}> /5</Text>
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.barFillWrap, { width: widthInterp }]}>
          <LinearGradient
            colors={["#FF8A3D", GENOMICS_ACCENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.barFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export function CarGenomics({ brand, model }: Props) {
  const { colors, isDark } = useTheme();
  const data = getCarGenomics(brand, model);

  // Big rating animation
  const ratingAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ratingAnim, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: useNative,
    }).start();
  }, [ratingAnim]);

  if (!data || data.totalReviews === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.titleRow}>
          <View style={[styles.titleAccent, { backgroundColor: GENOMICS_ACCENT }]} />
          <Text style={[styles.title, { color: colors.text }]}>Car Genomics</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Feather name="bar-chart-2" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Be the first to review this car
          </Text>
        </View>
      </View>
    );
  }

  const trackColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)";
  const chipBg = isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC";
  const chipBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)";

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.titleRow}>
        <View style={[styles.titleAccent, { backgroundColor: GENOMICS_ACCENT }]} />
        <Text style={[styles.title, { color: colors.text }]}>Car Genomics</Text>
        <View style={styles.countBadge}>
          <Feather name="users" size={11} color={GENOMICS_ACCENT} />
          <Text style={styles.countBadgeText}>{data.totalReviews} reviews</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Aggregated owner experiences for the {brand} {model}
      </Text>

      {/* Overall rating hero */}
      <Animated.View
        style={[
          styles.heroWrap,
          {
            backgroundColor: isDark ? "rgba(255,107,0,0.08)" : "rgba(255,107,0,0.06)",
            borderColor: isDark ? "rgba(255,107,0,0.20)" : "rgba(255,107,0,0.18)",
            opacity: ratingAnim,
            transform: [
              {
                translateY: ratingAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.heroLeft}>
          <Text style={[styles.heroValue, { color: colors.text }]}>
            {data.overallRating.toFixed(1)}
          </Text>
          <Text style={[styles.heroOf, { color: colors.textTertiary }]}>out of 5</Text>
        </View>
        <View style={styles.heroRight}>
          <Stars value={data.overallRating} />
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>
            Overall owner rating
          </Text>
          <View style={styles.heroPillRow}>
            <View style={styles.heroPill}>
              <Feather name="trending-up" size={10} color={GENOMICS_ACCENT} />
              <Text style={styles.heroPillText}>Verified data</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Aspect bars */}
      <View style={styles.aspectsBlock}>
        {data.aspects.map((a, i) => (
          <AspectBar
            key={a.label}
            aspect={a}
            index={i}
            textColor={colors.text}
            subTextColor={colors.textTertiary}
            trackColor={trackColor}
          />
        ))}
      </View>

      {/* Keywords */}
      <View style={styles.keywordsBlock}>
        <View style={styles.kwHeader}>
          <View style={[styles.kwDot, { backgroundColor: "#22C55E" }]} />
          <Text style={[styles.kwTitle, { color: colors.text }]}>What owners love</Text>
        </View>
        <View style={styles.chipRow}>
          {data.positiveKeywords.map((kw) => (
            <View
              key={kw}
              style={[
                styles.chip,
                {
                  backgroundColor: isDark ? "rgba(34,197,94,0.10)" : "rgba(34,197,94,0.08)",
                  borderColor: isDark ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.20)",
                },
              ]}
            >
              <Feather name="thumbs-up" size={10} color="#16A34A" />
              <Text style={[styles.chipText, { color: "#15803D" }]}>{kw}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.kwHeader, { marginTop: 14 }]}>
          <View style={[styles.kwDot, { backgroundColor: "#E53935" }]} />
          <Text style={[styles.kwTitle, { color: colors.text }]}>Common complaints</Text>
        </View>
        <View style={styles.chipRow}>
          {data.negativeKeywords.map((kw) => (
            <View
              key={kw}
              style={[
                styles.chip,
                {
                  backgroundColor: isDark ? "rgba(229,57,53,0.10)" : "rgba(229,57,53,0.07)",
                  borderColor: isDark ? "rgba(229,57,53,0.25)" : "rgba(229,57,53,0.18)",
                },
              ]}
            >
              <Feather name="thumbs-down" size={10} color="#DC2626" />
              <Text style={[styles.chipText, { color: "#B91C1C" }]}>{kw}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer note */}
      <View style={[styles.footer, { backgroundColor: chipBg, borderColor: chipBorder }]}>
        <Feather name="info" size={11} color={colors.textTertiary} />
        <Text style={[styles.footerText, { color: colors.textTertiary }]}>
          Genomics data is aggregated from verified owner reviews of this model.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  titleAccent: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    letterSpacing: -0.3,
    flex: 1,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,107,0,0.10)",
    borderColor: "rgba(255,107,0,0.22)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countBadgeText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
    color: GENOMICS_ACCENT,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    marginTop: 4,
    marginBottom: 14,
  },

  /* Hero */
  heroWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  heroLeft: { alignItems: "center", minWidth: 72 },
  heroValue: {
    fontSize: 38,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -1.2,
    lineHeight: 42,
  },
  heroOf: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroRight: { flex: 1, gap: 4 },
  heroLabel: {
    fontSize: 12,
    fontFamily: "Manrope_600SemiBold",
  },
  heroPillRow: { flexDirection: "row", marginTop: 4 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,107,0,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  heroPillText: {
    fontSize: 10,
    fontFamily: "Manrope_700Bold",
    color: GENOMICS_ACCENT,
    letterSpacing: 0.3,
  },

  /* Aspect bars */
  aspectsBlock: { gap: 12, marginBottom: 16 },
  aspectRow: { gap: 6 },
  aspectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aspectLabelWrap: { flexDirection: "row", alignItems: "center", gap: 7 },
  aspectIconBubble: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,107,0,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  aspectLabel: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
  },
  aspectValue: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
  },
  aspectValueOf: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFillWrap: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    flex: 1,
    height: "100%",
    borderRadius: 4,
  },

  /* Keywords */
  keywordsBlock: { marginBottom: 12 },
  kwHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  kwDot: { width: 6, height: 6, borderRadius: 3 },
  kwTitle: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontFamily: "Manrope_700Bold",
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  footerText: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    flex: 1,
  },

  /* Empty */
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
  },
});
