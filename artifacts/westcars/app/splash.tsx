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

const SPLASH_CAR = require("@/assets/images/splash-car.png");
const LOGO       = require("@/assets/images/logo-wordmark.png");

export default function SplashScreen() {
  const carOpacity  = useRef(new Animated.Value(0)).current;
  const carY        = useRef(new Animated.Value(40)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.85)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dot1Scale   = useRef(new Animated.Value(0.4)).current;
  const dot2Scale   = useRef(new Animated.Value(0.4)).current;
  const dot3Scale   = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Step 1: Car glides up into frame
    Animated.parallel([
      Animated.timing(carOpacity, {
        toValue: 1, duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(carY, {
        toValue: 0, tension: 45, friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    // Step 2: Logo pops in over the car
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1, tension: 120, friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Step 3: Tagline fades in below
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1, duration: 350,
        useNativeDriver: true,
      }).start();
    }, 820);

    // Step 4: Pulsing loading dots
    setTimeout(() => {
      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(dot, { toValue: 1.5, useNativeDriver: true, speed: 50, bounciness: 10 }),
            Animated.spring(dot, { toValue: 0.4, useNativeDriver: true, speed: 18, bounciness: 0 }),
          ])
        ).start();
      pulse(dot1Scale, 0);
      pulse(dot2Scale, 180);
      pulse(dot3Scale, 360);
    }, 900);

    const nav = setTimeout(() => router.replace("/auth/login"), 3400);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* ── Hero block: car + logo overlaid ── */}
      <Animated.View
        style={[
          styles.heroBlock,
          { opacity: carOpacity, transform: [{ translateY: carY }] },
        ]}
      >
        {/* Porsche 911 */}
        <Image source={SPLASH_CAR} style={styles.car} resizeMode="contain" />

        {/* Wordmark centred over the car's body */}
        <Animated.View
          style={[
            styles.logoOverlay,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {/* Soft frosted pill behind the logo */}
          <View style={styles.logoPill}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </View>
        </Animated.View>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Ghana's Car Marketplace
      </Animated.Text>

      {/* Pulsing dots */}
      <View style={styles.dotsRow}>
        {[dot1Scale, dot2Scale, dot3Scale].map((s, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ scale: s }] }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },

  /* Contains both the car and the logo overlay */
  heroBlock: {
    width: "100%",
    paddingHorizontal: 16,
    position: "relative",
    alignItems: "center",
  },

  car: {
    width: "100%",
    height: 220,
  },

  /* Absolutely positioned over the car's centre */
  logoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Frosted pill that sits behind the logo text */
  logoPill: {
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    shadowColor: "#0044AA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },

  logo: { width: 240, height: 48 },

  tagline: {
    fontSize: 11,
    fontFamily: "Manrope_500Medium",
    color: "#AAAAAA",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: -8,
  },

  dotsRow: {
    position: "absolute",
    bottom: 56,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#0066CC",
  },
});
