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
  // Background: dark navy fades to light teal
  const bgOpacity  = useRef(new Animated.Value(0)).current;   // light bg fades in

  // Portal / spotlight: white oval that blooms from center
  const portalScale   = useRef(new Animated.Value(0)).current;
  const portalOpacity = useRef(new Animated.Value(0)).current;

  // Badge drops in from above
  const badgeY       = useRef(new Animated.Value(-50)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale   = useRef(new Animated.Value(0.8)).current;

  // Shimmer line sweeps across badge
  const shimmerX     = useRef(new Animated.Value(-120)).current;
  const shimmerAlpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Portal burst from center (fast bloom)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(portalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(portalScale, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    // 2. Light bg fades in (dark → light world transition)
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 900,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 3. Badge drops in from above (after portal)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(badgeY,       { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(badgeScale,   { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 300);

    // 4. Portal fades out as bg is established
    setTimeout(() => {
      Animated.timing(portalOpacity, {
        toValue: 0, duration: 600,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 700);

    // 5. Shimmer sweep across badge
    setTimeout(() => {
      Animated.sequence([
        Animated.timing(shimmerAlpha, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shimmerX,     { toValue: 120, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmerAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 900);

    const nav = setTimeout(() => router.replace("/auth/login"), 3000);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Dark navy base layer */}
      <View style={[StyleSheet.absoluteFill, styles.darkBg]} />

      {/* Light teal layer fades in on top */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.lightBg, { opacity: bgOpacity }]} />

      {/* White portal burst from center */}
      <Animated.View
        style={[
          styles.portal,
          {
            opacity: portalOpacity,
            transform: [{ scale: portalScale }],
          },
        ]}
      />

      {/* W Badge */}
      <Animated.View
        style={[
          styles.badgeCard,
          {
            opacity: badgeOpacity,
            transform: [{ translateY: badgeY }, { scale: badgeScale }],
          },
        ]}
      >
        <Image source={WC_BADGE} style={styles.badge} resizeMode="contain" />

        {/* Shimmer sweep */}
        <Animated.View
          style={[
            styles.shimmer,
            { opacity: shimmerAlpha, transform: [{ translateX: shimmerX }] },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    </View>
  );
}

const BADGE = 130;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  darkBg: {
    backgroundColor: "#0B1929",
  },

  lightBg: {
    backgroundColor: "#EDF4F7",
  },

  /* Radial white portal — large oval that blooms */
  portal: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  /* White glass badge card */
  badgeCard: {
    width: BADGE,
    height: BADGE,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "rgba(14,181,202,1)",
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 22,
  },

  badge: {
    width: BADGE * 0.72,
    height: BADGE * 0.72,
    borderRadius: 14,
  },

  shimmer: {
    position: "absolute",
    top: -10,
    left: -55,
    width: 55,
    height: BADGE + 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    transform: [{ skewX: "-20deg" }],
  },
});
