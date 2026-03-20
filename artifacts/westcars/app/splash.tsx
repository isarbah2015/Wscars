import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GHANA_CITIES } from "@/utils/ghanaData";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const cityOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    // Step 1: Logo appears
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Step 2: Line + tagline
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(lineWidth, { toValue: 1, duration: 600, useNativeDriver: false }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }, 400);

    // Step 3: City text
    setTimeout(() => {
      Animated.timing(cityOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 800);

    // City rotation
    const cityInterval = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % GHANA_CITIES.length);
    }, 500);

    // Navigate
    const navTimeout = setTimeout(() => {
      router.replace("/auth/login");
    }, 3000);

    return () => {
      clearInterval(cityInterval);
      clearTimeout(navTimeout);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#003D1A", "#005F2B", "#00873E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}
    >
      {/* Decorative rings */}
      <View style={styles.ring1} />
      <View style={styles.ring2} />
      <View style={styles.ring3} />

      {/* Logo block */}
      <Animated.View
        style={[
          styles.logoBlock,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Icon mark */}
        <View style={styles.iconMark}>
          <View style={styles.iconMarkInner}>
            <Feather name="truck" size={36} color="#00873E" />
          </View>
          {/* Gold accent dot */}
          <View style={styles.goldDot} />
        </View>

        {/* Wordmark */}
        <View style={styles.wordmark}>
          <Text style={styles.wordmarkWest}>WEST</Text>
          <Text style={styles.wordmarkCars}>CARS</Text>
        </View>
      </Animated.View>

      {/* Divider line */}
      <Animated.View
        style={[
          styles.dividerLine,
          {
            width: lineWidth.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
          },
        ]}
      />

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Ghana's Premier Car Marketplace
      </Animated.Text>

      {/* City scroller */}
      <Animated.View style={[styles.cityRow, { opacity: cityOpacity }]}>
        <Feather name="map-pin" size={12} color="rgba(255,255,255,0.6)" />
        <Text style={styles.cityText}>{GHANA_CITIES[cityIndex]}</Text>
      </Animated.View>

      {/* Version tag */}
      <View
        style={[
          styles.versionTag,
          { bottom: 40 + (insets.bottom || (Platform.OS === "web" ? 34 : 0)) },
        ]}
      >
        <Text style={styles.versionText}>v1.0 · Made in 🇬🇭</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  ring1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    top: -100,
    right: -120,
  },
  ring2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    bottom: -60,
    left: -80,
  },
  ring3: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    bottom: 40,
    right: -20,
  },
  logoBlock: {
    alignItems: "center",
    gap: 18,
  },
  iconMark: {
    position: "relative",
    width: 100,
    height: 100,
  },
  iconMarkInner: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  goldDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#fff",
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  wordmarkWest: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 4,
  },
  wordmarkCars: {
    fontSize: 40,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 4,
  },
  dividerLine: {
    height: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
  },
  tagline: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  cityText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  versionTag: {
    position: "absolute",
    alignSelf: "center",
  },
  versionText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_400Regular",
  },
});
