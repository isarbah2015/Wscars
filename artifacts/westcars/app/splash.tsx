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

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const cityAnim = useRef(new Animated.Value(0)).current;
  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // City rotation
    const cityInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(cityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(cityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setCityIndex((prev) => (prev + 1) % GHANA_CITIES.length);
    }, 800);

    const navTimeout = setTimeout(() => {
      router.replace("/auth/login");
    }, 3200);

    return () => {
      clearInterval(cityInterval);
      clearTimeout(navTimeout);
    };
  }, []);

  return (
    <LinearGradient
      colors={["#FF6B00", "#FF8C42", "#FFA84E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { paddingTop: insets.top || (Platform.OS === "web" ? 67 : 0) }]}
    >
      {/* Background decoration circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Feather name="truck" size={48} color="#FF6B00" />
        </View>
        <Text style={styles.appName}>Westcars</Text>
        <Text style={styles.tagline}>Ghana's Trusted Car Marketplace</Text>
      </Animated.View>

      {/* City rotation */}
      <Animated.View
        style={[
          styles.cityContainer,
          {
            opacity: cityAnim,
            paddingBottom: insets.bottom || (Platform.OS === "web" ? 34 : 0),
          },
        ]}
      >
        <Feather name="map-pin" size={14} color="rgba(255,255,255,0.8)" />
        <Text style={styles.cityText}>{GHANA_CITIES[cityIndex]}</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={[styles.dotsContainer, { marginBottom: 40 + (insets.bottom || 0) }]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.dot} />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circleTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  circleBottomLeft: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  logoContainer: {
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 42,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  cityContainer: {
    position: "absolute",
    bottom: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cityText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
