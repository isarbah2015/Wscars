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

export default function SplashScreen() {
  const carOpacity  = useRef(new Animated.Value(0)).current;
  const carScale    = useRef(new Animated.Value(0.88)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dot1Scale   = useRef(new Animated.Value(0.4)).current;
  const dot2Scale   = useRef(new Animated.Value(0.4)).current;
  const dot3Scale   = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Car floats in
    Animated.parallel([
      Animated.timing(carOpacity, {
        toValue: 1, duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(carScale, {
        toValue: 1, tension: 45, friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fades in after car
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1, duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Loading dots pulse
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
    }, 800);

    const nav = setTimeout(() => router.replace("/auth/login"), 3000);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Car hero image */}
      <Animated.View style={[styles.carWrap, { opacity: carOpacity, transform: [{ scale: carScale }] }]}>
        <Image source={SPLASH_CAR} style={styles.car} resizeMode="contain" />
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={[styles.brandBlock, { opacity: textOpacity }]}>
        <View style={styles.wordRow}>
          <Text style={styles.wordW}>W</Text>
          <Text style={styles.wordRest}>ESTCARS</Text>
        </View>
        <Text style={styles.tagline}>Ghana's Car Marketplace</Text>
      </Animated.View>

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

  carWrap: {
    width: "100%",
    paddingHorizontal: 20,
  },
  car: {
    width: "100%",
    height: 220,
  },

  brandBlock: { alignItems: "center", gap: 6 },
  wordRow: { flexDirection: "row", alignItems: "baseline" },
  wordW: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#0066CC",
    letterSpacing: -1,
    includeFontPadding: false,
  },
  wordRest: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -1,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#BDBDBD",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  dotsRow: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#0066CC",
  },
});
