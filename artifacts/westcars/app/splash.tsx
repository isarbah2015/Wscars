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

const LOGO = require("@/assets/images/westcars-logo.png");

export default function SplashScreen() {
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameSlide = useRef(new Animated.Value(18)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Step 1: Logo pops in with overshoot spring
    Animated.spring(logoScale, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();

    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Step 2: Name slides up after logo settles
    const nameTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(nameOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(nameSlide, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }, 250);

    // Step 3: Tagline fades in
    const tagTimer = setTimeout(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 520);

    // Step 4: Loader appears
    const loaderTimer = setTimeout(() => {
      Animated.timing(loaderOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Pulse animation on loader dots
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.2, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }, 700);

    // Navigate
    const navTimer = setTimeout(() => {
      router.replace("/auth/login");
    }, 2600);

    return () => {
      clearTimeout(nameTimer);
      clearTimeout(tagTimer);
      clearTimeout(loaderTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Big logo */}
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
      </Animated.View>

      {/* Westcars name — slides up, smaller than logo */}
      <Animated.View
        style={{
          opacity: nameOpacity,
          transform: [{ translateY: nameSlide }],
          alignItems: "center",
          marginTop: 16,
        }}
      >
        <Text style={styles.wordmark}>
          West<Text style={styles.wordmarkThin}>cars</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Ghana's Car Marketplace
      </Animated.Text>

      {/* Pulsing dots loader */}
      <Animated.View style={[styles.loaderRow, { opacity: loaderOpacity }]}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                transform: [
                  {
                    scale: i === 1
                      ? pulseScale
                      : pulseScale.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [1, i === 0 ? 1.15 : 1.1],
                        }),
                  },
                ],
                opacity: pulseScale.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.4 + i * 0.2, 1],
                }),
              },
            ]}
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
  logoWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: 160,
    height: 160,
  },
  wordmark: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A1A",
    letterSpacing: -0.4,
  },
  wordmarkThin: {
    fontFamily: "Inter_400Regular",
    color: "#E8192C",
  },
  tagline: {
    marginTop: 6,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9E9E9E",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  loaderRow: {
    position: "absolute",
    bottom: 72,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0066CC",
  },
});
