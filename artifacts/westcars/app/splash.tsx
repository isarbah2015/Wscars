import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WC_BADGE = require("@/assets/images/wc-badge.png");
const BADGE = 260;

export default function SplashScreen() {
  const badgeScale   = useRef(new Animated.Value(0.7)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeY       = useRef(new Animated.Value(-40)).current;
  const mottoOpacity = useRef(new Animated.Value(0)).current;
  const shimmerX     = useRef(new Animated.Value(-BADGE)).current;
  const shimmerAlpha = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(badgeScale,   { toValue: 1, tension: 90, friction: 9, useNativeDriver: true }),
      Animated.timing(badgeOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(badgeY,       { toValue: 0, tension: 90, friction: 9, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.timing(mottoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 500);

    setTimeout(() => {
      Animated.sequence([
        Animated.timing(shimmerAlpha, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: BADGE, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(shimmerAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    }, 700);

    const nav = setTimeout(() => router.replace("/auth/login"), 3000);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  badgeWrap: {
    width: BADGE,
    height: BADGE,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  badge: { width: BADGE, height: BADGE },

  shimmer: {
    position: "absolute",
    top: -10,
    left: -70,
    width: 60,
    height: BADGE + 20,
    backgroundColor: "rgba(255,255,255,0.55)",
    transform: [{ skewX: "-20deg" }],
  },

  motto: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.3,
    marginTop: 2,
  },
});
