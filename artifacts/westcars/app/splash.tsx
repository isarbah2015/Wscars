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

const { width, height } = Dimensions.get("window");

const SPLASH_BG  = require("@/assets/images/splash-bg.png");
const WC_BADGE   = require("@/assets/images/wc-badge.png");
const SPLASH_CAR = require("@/assets/images/splash-car.png");

export default function SplashScreen() {
  // Animation refs
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale   = useRef(new Animated.Value(0.6)).current;
  const wordOpacity  = useRef(new Animated.Value(0)).current;
  const wordY        = useRef(new Animated.Value(16)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const carOpacity   = useRef(new Animated.Value(0)).current;
  const carY         = useRef(new Animated.Value(60)).current;
  const dot1         = useRef(new Animated.Value(0.3)).current;
  const dot2         = useRef(new Animated.Value(0.3)).current;
  const dot3         = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // 1. Badge pops in
    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1, tension: 100, friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. WESTCARS wordmark slides up
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1, duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(wordY, {
          toValue: 0, tension: 80, friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);

    // 3. Tagline fades
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1, duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);

    // 4. Car glides up from bottom
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(carOpacity, {
          toValue: 1, duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(carY, {
          toValue: 0, tension: 40, friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);

    // 5. Pulsing dots
    setTimeout(() => {
      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(dot, { toValue: 1, duration: 340, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 340, useNativeDriver: true }),
          ])
        ).start();
      pulse(dot1, 0);
      pulse(dot2, 200);
      pulse(dot3, 400);
    }, 1000);

    const nav = setTimeout(() => router.replace("/auth/login"), 3600);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Full-bleed dark background */}
      <Image source={SPLASH_BG} style={styles.bg} resizeMode="cover" />

      {/* Dark overlay to deepen it */}
      <View style={styles.overlay} />

      {/* ── Logo block ── */}
      <View style={styles.logoBlock}>
        {/* W badge */}
        <Animated.View
          style={{
            opacity: badgeOpacity,
            transform: [{ scale: badgeScale }],
          }}
        >
          <Image source={WC_BADGE} style={styles.badge} resizeMode="contain" />
        </Animated.View>

        {/* WESTCARS wordmark in code — crisp on all densities */}
        <Animated.View
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordY }],
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={styles.wordmark}>WESTCARS</Text>
          <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
            Ghana's Car Marketplace
          </Animated.Text>
        </Animated.View>
      </View>

      {/* ── Car hero at the bottom ── */}
      <Animated.View
        style={[
          styles.carWrap,
          {
            opacity: carOpacity,
            transform: [{ translateY: carY }],
          },
        ]}
      >
        {/* Glow under the car */}
        <View style={styles.carGlow} />
        <Image source={SPLASH_CAR} style={styles.car} resizeMode="contain" />
      </Animated.View>

      {/* ── Pulsing loading dots ── */}
      <View style={styles.dotsRow}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: d }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#060C18",
    alignItems: "center",
    justifyContent: "center",
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,8,18,0.55)",
  },

  /* Logo sits in the upper-centre area */
  logoBlock: {
    position: "absolute",
    top: "18%",
    alignItems: "center",
    gap: 18,
  },

  badge: {
    width: 100,
    height: 100,
    borderRadius: 22,
  },

  wordmark: {
    fontSize: 38,
    fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: 8,
    textAlign: "center",
  },

  tagline: {
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 3.5,
    textTransform: "uppercase",
    textAlign: "center",
  },

  /* Car slides up from bottom-centre */
  carWrap: {
    position: "absolute",
    bottom: 80,
    width: "100%",
    alignItems: "center",
  },
  carGlow: {
    position: "absolute",
    bottom: -20,
    width: width * 0.7,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#0055FF",
    opacity: 0.25,
  },
  car: {
    width: width * 0.92,
    height: 200,
  },

  /* Loading dots */
  dotsRow: {
    position: "absolute",
    bottom: 34,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#3399FF",
  },
});
