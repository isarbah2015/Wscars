import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

const LOGO  = require("@/assets/images/wc-logo.png");
const LOGO_W = 260;
const LOGO_H = 170;

function goToLogin() {
  if (Platform.OS === "web") {
    try { router.replace("/auth/login"); } catch (_) {}
  } else {
    router.replace("/auth/login");
  }
}

export default function SplashScreen() {
  const topY    = useRef(new Animated.Value(-(LOGO_H / 2 + 40))).current;
  const botY    = useRef(new Animated.Value(LOGO_H / 2 + 40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const mottoOp   = useRef(new Animated.Value(0)).current; // kept for compat, not rendered
  const shimmerX  = useRef(new Animated.Value(-LOGO_W - 60)).current;
  const shimmerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      Animated.sequence([
        Animated.timing(shimmerOp, { toValue: 1, duration: 80, useNativeDriver: false }),
        Animated.timing(shimmerX, {
          toValue: LOGO_W + 60, duration: 650,
          easing: Easing.inOut(Easing.quad), useNativeDriver: false,
        }),
        Animated.timing(shimmerOp, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    });

    const mottoTimer = setTimeout(() => {
      Animated.timing(mottoOp, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    }, 700);

    const navTimer = setTimeout(goToLogin, 2600);

    return () => {
      clearTimeout(mottoTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[styles.halfWrap, styles.topHalf, { opacity, transform: [{ translateY: topY }] }]}
        >
          <Image source={LOGO} style={styles.logoImg} resizeMode="contain" tintColor="#0EB5CA" />
        </Animated.View>

        <Animated.View
          style={[styles.halfWrap, styles.botHalf, { opacity, transform: [{ translateY: botY }] }]}
        >
          <Image
            source={LOGO}
            style={[styles.logoImg, { marginTop: -(LOGO_H / 2) }]}
            resizeMode="contain"
            tintColor="#0EB5CA"
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmer,
            { opacity: shimmerOp, transform: [{ translateX: shimmerX }] },
          ]}
        />
      </View>

      {/* tagline removed */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A1628",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
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
  motto: {
    fontSize: 10,
    fontFamily: "Manrope_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.4,
    textAlign: "center",
  },
});
