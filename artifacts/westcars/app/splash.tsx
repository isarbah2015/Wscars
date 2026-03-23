import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const WC_BADGE = require("@/assets/images/wc-badge.png");

export default function SplashScreen() {
  // Badge animations
  const badgeScale   = useRef(new Animated.Value(0.5)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  // Shimmer bar sweep
  const shimmerX     = useRef(new Animated.Value(-width)).current;
  const shimmerAlpha = useRef(new Animated.Value(0)).current;

  // Radial circles appear
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;

  // Outer glow pulse
  const glowScale   = useRef(new Animated.Value(0.9)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Concentric background circles bloom in
    Animated.stagger(160, [
      Animated.timing(circle1, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(circle2, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(circle3, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    // 2. Badge springs in after a short pause
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(badgeScale, { toValue: 1, tension: 120, friction: 8, useNativeDriver: true }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    }, 300);

    // 3. Outer glow fades in and gently pulses once
    setTimeout(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.5, duration: 400, useNativeDriver: true }),
          Animated.spring(glowScale, { toValue: 1.15, tension: 60, friction: 10, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, { toValue: 0.25, duration: 600, useNativeDriver: true }),
          Animated.spring(glowScale, { toValue: 1.0, tension: 50, friction: 10, useNativeDriver: true }),
        ]),
      ]).start();
    }, 500);

    // 4. Shimmer sweep once across the badge
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(shimmerAlpha, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: width * 1.2, duration: 680, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmerAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 900);

    const nav = setTimeout(() => router.replace("/auth/login"), 3000);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Radial background circles */}
      <Animated.View style={[styles.circle, styles.circle3, { opacity: circle3 }]} />
      <Animated.View style={[styles.circle, styles.circle2, { opacity: circle2 }]} />
      <Animated.View style={[styles.circle, styles.circle1, { opacity: circle1 }]} />

      {/* Outer glow ring around badge */}
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Badge card */}
      <Animated.View
        style={[
          styles.badgeCard,
          { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
        ]}
      >
        <Image source={WC_BADGE} style={styles.badge} resizeMode="contain" />

        {/* Shimmer sweep overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              opacity: shimmerAlpha,
              transform: [{ translateX: shimmerX }],
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    </View>
  );
}

const SIZE = 140;
const RING = SIZE + 40;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EDF4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Concentric teal background circles */
  circle: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(14,181,202,0.06)",
  },
  circle1: { width: 260, height: 260 },
  circle2: { width: 400, height: 400, backgroundColor: "rgba(14,181,202,0.04)" },
  circle3: { width: 580, height: 580, backgroundColor: "rgba(14,181,202,0.025)" },

  /* Outer glow ring */
  glowRing: {
    position: "absolute",
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderColor: "rgba(14,181,202,0.45)",
    backgroundColor: "transparent",
  },

  /* White card holding the badge */
  badgeCard: {
    width: SIZE,
    height: SIZE,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "rgba(14,181,202,1)",
    shadowOpacity: 0.28,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },

  badge: {
    width: SIZE * 0.7,
    height: SIZE * 0.7,
    borderRadius: 16,
  },

  /* Shimmer diagonal bar */
  shimmer: {
    position: "absolute",
    top: -10,
    left: -60,
    width: 60,
    height: SIZE + 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    transform: [{ skewX: "-20deg" }],
  },
});
