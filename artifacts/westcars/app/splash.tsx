import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { WestcarsBadge } from "@/components/WestcarsBadge";

const BADGE_SIZE = 240;

export default function SplashScreen() {
  const badgeScale   = useRef(new Animated.Value(0.75)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeY       = useRef(new Animated.Value(-36)).current;
  const mottoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX     = useRef(new Animated.Value(-BADGE_SIZE)).current;
  const shimmerAlpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale,   { toValue: 1, tension: 90, friction: 9, useNativeDriver: true }),
      Animated.timing(badgeOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.spring(badgeY,       { toValue: 0, tension: 90, friction: 9, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(mottoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 480);

    setTimeout(() => {
      Animated.sequence([
        Animated.timing(shimmerAlpha, { toValue: 1,  duration: 100,  useNativeDriver: true }),
        Animated.timing(shimmerX,     { toValue: BADGE_SIZE, duration: 680, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmerAlpha, { toValue: 0,  duration: 150,  useNativeDriver: true }),
      ]).start();
    }, 680);

    const nav = setTimeout(() => router.replace("/auth/login"), 3000);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View
        style={{
          opacity: badgeOpacity,
          transform: [{ translateY: badgeY }, { scale: badgeScale }],
        }}
      >
        <WestcarsBadge size={BADGE_SIZE} textColor="#0F172A" />

        {/* Shimmer sweep */}
        <Animated.View
          style={[
            styles.shimmer,
            { opacity: shimmerAlpha, transform: [{ translateX: shimmerX }] },
          ]}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.Text style={[styles.motto, { opacity: mottoOpacity }]}>
        Ghana's Trusted Car Marketplace
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  shimmer: {
    position: "absolute",
    top: -10,
    left: -70,
    width: 60,
    height: BADGE_SIZE + 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ skewX: "-20deg" }],
  },

  motto: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.3,
    marginTop: 0,
  },
});
