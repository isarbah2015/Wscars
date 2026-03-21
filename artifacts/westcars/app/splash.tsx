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

const LOGO = require("@/assets/images/wc-logomark.png");

export default function SplashScreen() {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth   = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const dot1Scale   = useRef(new Animated.Value(0.4)).current;
  const dot2Scale   = useRef(new Animated.Value(0.4)).current;
  const dot3Scale   = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1) Logo pops in with spring scale + fade
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2) Red underline sweeps in
    setTimeout(() => {
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 350);

    // 3) Tagline fades in
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 700);

    // 4) Pulsing dots appear
    setTimeout(() => {
      Animated.timing(dotsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(dot, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 8 }),
            Animated.spring(dot, { toValue: 0.4, useNativeDriver: true, speed: 20, bounciness: 0 }),
          ])
        ).start();

      pulse(dot1Scale, 0);
      pulse(dot2Scale, 160);
      pulse(dot3Scale, 320);
    }, 900);

    const navTimer = setTimeout(() => router.replace("/auth/login"), 2900);
    return () => clearTimeout(navTimer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* Logo mark: W formed from two car silhouettes */}
        <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
        </Animated.View>

        {/* Wordmark text below logo */}
        <Animated.View style={{ opacity: logoOpacity, alignItems: "center", marginTop: 12 }}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordW}>W</Text>
            <Text style={styles.wordRest}>ESTCARS</Text>
          </View>

          {/* Red sweep underline */}
          <Animated.View
            style={[
              styles.sweepLine,
              {
                width: lineWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Ghana's Car Marketplace
        </Animated.Text>
      </View>

      {/* Pulsing loading dots */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        {[dot1Scale, dot2Scale, dot3Scale].map((s, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ scale: s }] }]} />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center" },

  logoImg: {
    width: 130,
    height: 130,
  },

  wordmarkRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  wordW: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#0066CC",
    letterSpacing: -1,
    includeFontPadding: false,
  },
  wordRest: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -1,
    includeFontPadding: false,
  },

  sweepLine: {
    height: 3,
    backgroundColor: "#E8192C",
    borderRadius: 2,
    marginTop: 5,
    alignSelf: "flex-start",
  },

  tagline: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9E9E9E",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 18,
  },

  dotsRow: {
    position: "absolute",
    bottom: 72,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#0066CC",
  },
});
