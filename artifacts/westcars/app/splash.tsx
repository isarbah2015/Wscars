import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const WC_BADGE = require("@/assets/images/wc-badge.png");

export default function SplashScreen() {
  const bgOpacity      = useRef(new Animated.Value(0)).current;
  const portalScale    = useRef(new Animated.Value(0)).current;
  const portalOpacity  = useRef(new Animated.Value(0)).current;
  const badgeY         = useRef(new Animated.Value(-60)).current;
  const badgeOpacity   = useRef(new Animated.Value(0)).current;
  const badgeScale     = useRef(new Animated.Value(0.75)).current;
  const mottoOpacity   = useRef(new Animated.Value(0)).current;
  const shimmerX       = useRef(new Animated.Value(-BADGE)).current;
  const shimmerAlpha   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(portalOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(portalScale, { toValue: 1, tension: 40, friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.timing(bgOpacity, {
      toValue: 1, duration: 900, delay: 200,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(portalOpacity, {
        toValue: 0, duration: 600,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start();
    }, 700);

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(badgeY,       { toValue: 0, tension: 100, friction: 10, useNativeDriver: true }),
        Animated.timing(badgeOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(badgeScale,   { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();
    }, 1150);

    setTimeout(() => {
      Animated.timing(mottoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1400);

    setTimeout(() => {
      Animated.sequence([
        Animated.timing(shimmerAlpha, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: BADGE, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmerAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 1650);

    const nav = setTimeout(() => router.replace("/auth/login"), 3200);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.darkBg]} />
      <Animated.View style={[StyleSheet.absoluteFill, styles.lightBg, { opacity: bgOpacity }]} />

      <Animated.View
        style={[styles.portal, { opacity: portalOpacity, transform: [{ scale: portalScale }] }]}
      />

      <Animated.View
        style={[
          styles.badgeWrap,
          {
            opacity: badgeOpacity,
            transform: [{ translateY: badgeY }, { scale: badgeScale }],
          },
        ]}
      >
        <Image source={WC_BADGE} style={styles.badge} resizeMode="contain" />

        <Animated.View
          style={[styles.shimmer, { opacity: shimmerAlpha, transform: [{ translateX: shimmerX }] }]}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.Text style={[styles.motto, { opacity: mottoOpacity }]}>
        Ghana's Trusted Car Marketplace
      </Animated.Text>
    </View>
  );
}

const BADGE = 260;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },

  darkBg: { backgroundColor: "#0B1929" },
  lightBg: { backgroundColor: "#FFFFFF" },

  portal: {
    position: "absolute",
    width: 360, height: 360, borderRadius: 180,
    backgroundColor: "rgba(255,255,255,0.24)",
  },

  badgeWrap: {
    width: BADGE, height: BADGE,
    alignItems: "center", justifyContent: "center",
  },

  badge: { width: BADGE, height: BADGE },

  shimmer: {
    position: "absolute",
    top: -10, left: -70,
    width: 60, height: BADGE + 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ skewX: "-20deg" }],
  },

  motto: {
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: "#0098AA",
    letterSpacing: 1.2,
    marginTop: 4,
  },
});
