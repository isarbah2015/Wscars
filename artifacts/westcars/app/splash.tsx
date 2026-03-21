import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SplashScreen() {
  // Animations
  const logoX = useRef(new Animated.Value(-60)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const dot1Scale = useRef(new Animated.Value(0.4)).current;
  const dot2Scale = useRef(new Animated.Value(0.4)).current;
  const dot3Scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // 1) Logo slides in from left + fades
    Animated.parallel([
      Animated.spring(logoX, {
        toValue: 0,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 2) Red underline sweeps in after logo lands
    setTimeout(() => {
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 400);

    // 3) Tagline fades in
    setTimeout(() => {
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 700);

    // 4) Pulsing dots
    setTimeout(() => {
      Animated.timing(dotsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      const pulse = (dot: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.spring(dot, { toValue: 1.3, useNativeDriver: true, speed: 40, bounciness: 8 }),
            Animated.spring(dot, { toValue: 0.4, useNativeDriver: true, speed: 20, bounciness: 0 }),
          ])
        ).start();

      pulse(dot1Scale, 0);
      pulse(dot2Scale, 150);
      pulse(dot3Scale, 300);
    }, 900);

    const navTimer = setTimeout(() => router.replace("/auth/login"), 2800);
    return () => clearTimeout(navTimer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        {/* Wordmark: West 🚙 cars */}
        <Animated.View
          style={[
            styles.wordmarkRow,
            { opacity: logoOpacity, transform: [{ translateX: logoX }] },
          ]}
        >
          <Text style={styles.wordWest}>West</Text>
          <View style={styles.iconWrap}>
            <Feather name="truck" size={40} color="#E8192C" />
          </View>
          <Text style={styles.wordCars}>cars</Text>
        </Animated.View>

        {/* Red sweep line */}
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

        {/* Ghana's Car Marketplace */}
        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Ghana's Car Marketplace
        </Animated.Text>
      </View>

      {/* Pulsing dots */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        {[dot1Scale, dot2Scale, dot3Scale].map((s, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ scale: s }] }]}
          />
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

  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  wordWest: {
    fontSize: 52,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -2,
    includeFontPadding: false,
  },
  iconWrap: {
    marginHorizontal: 4,
    transform: [{ scaleX: -1 }],
  },
  wordCars: {
    fontSize: 52,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A",
    letterSpacing: -2,
    includeFontPadding: false,
  },

  sweepLine: {
    height: 3,
    backgroundColor: "#E8192C",
    borderRadius: 2,
    marginTop: 6,
    alignSelf: "flex-start",
  },

  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9E9E9E",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 16,
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
    backgroundColor: "#E8192C",
  },
});
