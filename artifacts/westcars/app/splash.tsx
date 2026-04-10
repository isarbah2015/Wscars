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

const WC_NEW_LOGO = require("@/assets/images/wc-new-logo.jpg");
const LOGO_SIZE = 220;

export default function SplashScreen() {
  // W slides in from left, C from right
  const wX        = useRef(new Animated.Value(-260)).current;
  const cX        = useRef(new Animated.Value(260)).current;
  const lettersOp = useRef(new Animated.Value(0)).current;

  // Logo image reveals after letters meet
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOp    = useRef(new Animated.Value(0)).current;

  // Motto
  const mottoOp = useRef(new Animated.Value(0)).current;

  // Shimmer on logo
  const shimmerX     = useRef(new Animated.Value(-LOGO_SIZE)).current;
  const shimmerAlpha = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Step 1: Fade in W and C
    Animated.timing(lettersOp, {
      toValue: 1, duration: 180, useNativeDriver: true,
    }).start();

    // Step 2: Slide W from left and C from right simultaneously
    Animated.parallel([
      Animated.spring(wX, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
      Animated.spring(cX, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
    ]).start(() => {
      // Step 3: Letters met — fade out letters, reveal logo
      Animated.parallel([
        Animated.timing(lettersOp, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(logoOp,    { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
      ]).start();

      // Step 4: Motto fade
      setTimeout(() => {
        Animated.timing(mottoOp, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      }, 300);

      // Step 5: Shimmer over logo
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(shimmerAlpha, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(shimmerX, { toValue: LOGO_SIZE, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(shimmerAlpha, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      }, 500);
    });

    const nav = setTimeout(() => router.replace("/auth/login"), 3200);
    return () => clearTimeout(nav);
  }, []);

  return (
    <View style={styles.root}>
      {/* Animated W + C letters (visible during slide-in phase) */}
      <Animated.View style={[styles.lettersRow, { opacity: lettersOp }]}>
        <Animated.Text style={[styles.letter, { transform: [{ translateX: wX }] }]}>
          W
        </Animated.Text>
        <Animated.Text style={[styles.letter, { transform: [{ translateX: cX }] }]}>
          C
        </Animated.Text>
      </Animated.View>

      {/* Logo image (reveals after letters meet) */}
      <Animated.View style={[
        styles.logoWrap,
        { opacity: logoOp, transform: [{ scale: logoScale }] }
      ]}>
        <Image source={WC_NEW_LOGO} style={styles.logo} resizeMode="contain" />
        <Animated.View
          style={[styles.shimmer, { opacity: shimmerAlpha, transform: [{ translateX: shimmerX }] }]}
          pointerEvents="none"
        />
      </Animated.View>

      <Animated.Text style={[styles.motto, { opacity: mottoOp }]}>
        Ghana's Trusted Car Marketplace
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  lettersRow: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  letter: {
    fontSize: 120,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0EB5CA",
    fontStyle: "italic",
    letterSpacing: -6,
    lineHeight: 130,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#000",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
  shimmer: {
    position: "absolute",
    top: -10,
    left: -70,
    width: 60,
    height: LOGO_SIZE + 20,
    backgroundColor: "rgba(255,255,255,0.4)",
    transform: [{ skewX: "-20deg" }],
  },
  motto: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.3,
    marginTop: 4,
  },
});
