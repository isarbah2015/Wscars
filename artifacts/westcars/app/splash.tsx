import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  View,
} from "react-native";

const LOGO   = require("@/assets/images/wc-logo-full.png");
const LOGO_W = 260;
const LOGO_H = 210;

function goToLogin() {
  if (Platform.OS === "web") {
    // On web, use the Expo router but also ensure we push to the auth route
    try { router.replace("/auth/login"); } catch (_) {}
  } else {
    router.replace("/auth/login");
  }
}

export default function SplashScreen() {
  // Top half slides in from above; bottom half from below
  const topY    = useRef(new Animated.Value(-(LOGO_H / 2 + 40))).current;
  const botY    = useRef(new Animated.Value(LOGO_H / 2 + 40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Shimmer
  const shimmerX  = useRef(new Animated.Value(-LOGO_W - 60)).current;
  const shimmerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // useNativeDriver:false works on both native and web
    Animated.timing(opacity, {
      toValue: 1, duration: 200, useNativeDriver: false,
    }).start();

    Animated.parallel([
      Animated.timing(topY, {
        toValue: 0, duration: 600,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
      Animated.timing(botY, {
        toValue: 0, duration: 600,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Shimmer after halves meet
      Animated.sequence([
        Animated.timing(shimmerOp, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(shimmerX, {
          toValue: LOGO_W + 60, duration: 650,
          easing: Easing.inOut(Easing.quad), useNativeDriver: false,
        }),
        Animated.timing(shimmerOp, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    });

    // Navigate away
    const navTimer = setTimeout(goToLogin, 2600);

    return () => {
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.root}>
      {/* Logo — top half slides from above */}
      <View style={styles.logoContainer}>
        <Animated.View
          style={[styles.halfWrap, styles.topHalf, { opacity, transform: [{ translateY: topY }] }]}
        >
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
        </Animated.View>

        {/* Bottom half slides from below */}
        <Animated.View
          style={[styles.halfWrap, styles.botHalf, { opacity, transform: [{ translateY: botY }] }]}
        >
          <Image
            source={LOGO}
            style={[styles.logoImg, { marginTop: -(LOGO_H / 2) }]}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Shimmer sweep */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            { opacity: shimmerOp, transform: [{ translateX: shimmerX }] },
          ]}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  logoContainer: {
    width: LOGO_W,
    height: LOGO_H,
    overflow: "hidden",
    position: "relative",
  },
  halfWrap: {
    position: "absolute",
    left: 0,
    width: LOGO_W,
    height: LOGO_H / 2,
    overflow: "hidden",
  },
  topHalf: { top: 0 },
  botHalf: { top: LOGO_H / 2 },
  logoImg: {
    width: LOGO_W,
    height: LOGO_H,
  },
  shimmer: {
    position: "absolute",
    top: -10,
    left: -60,
    width: 50,
    height: LOGO_H + 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ skewX: "-18deg" }],
  },
});
