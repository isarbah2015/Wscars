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
const LOGO      = require("@/assets/images/logo-wordmark.png");

export default function SplashScreen() {
  const carOpacity   = useRef(new Animated.Value(0)).current;
  const carY         = useRef(new Animated.Value(30)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const tagOpacity   = useRef(new Animated.Value(0)).current;
  const dot1Scale    = useRef(new Animated.Value(0.4)).current;
  const dot2Scale    = useRef(new Animated.Value(0.4)).current;
  const dot3Scale    = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Car rises up and fades in
    Animated.parallel([
      Animated.timing(carOpacity, {
        toValue: 1, duration: 750,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(carY, {
        toValue: 0, tension: 40, friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo fades in after car settles
    setTimeout(() => {
      Animated.timing(logoOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }, 550);

    // Tagline
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1, duration: 400,
        useNativeDriver: true,
      }).start();
    }, 850);

    // Pulsing dots
    setTimeout(() => {
      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(dot, { toValue: 1.4, useNativeDriver: true, speed: 40, bounciness: 8 }),
            Animated.spring(dot, { toValue: 0.4, useNativeDriver: true, speed: 18, bounciness: 0 }),
          ])
        ).start();
      pulse(dot1Scale, 0);
      pulse(dot2Scale, 170);
      pulse(dot3Scale, 340);
    }, 900);

    const nav = setTimeout(() => router.replace("/auth/login"), 3200);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Car hero */}
      <Animated.View
        style={[
          styles.carWrap,
          { opacity: carOpacity, transform: [{ translateY: carY }] },
        ]}
      >
        <Image source={SPLASH_CAR} style={styles.car} resizeMode="contain" />
      </Animated.View>

      {/* WestCars wordmark logo */}
      <Animated.View style={[styles.logoWrap, { opacity: logoOpacity }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
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
    gap: 20,
  },

  carWrap: { width: "100%", paddingHorizontal: 10 },
  car: { width: "100%", height: 210 },

  logoWrap: { alignItems: "center" },
  logo: { width: 260, height: 52 },

  tagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#AAAAAA",
    letterSpacing: 2.5,
    textTransform: "uppercase",
    marginTop: -10,
  },

  dotsRow: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#0066CC",
  },
});
