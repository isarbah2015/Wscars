import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

import { auth } from "@/lib/firebase-persistence";

const LOGO   = require("@/assets/images/wc-logo.png");
const LOGO_W = 260;
const LOGO_H = 170;

export default function SplashScreen() {
  const router           = useRouter();
  const topY             = useRef(new Animated.Value(-(LOGO_H / 2 + 40))).current;
  const botY             = useRef(new Animated.Value(LOGO_H / 2 + 40)).current;
  const opacity          = useRef(new Animated.Value(0)).current;
  const shimmerX         = useRef(new Animated.Value(-LOGO_W - 60)).current;
  const shimmerOp        = useRef(new Animated.Value(0)).current;
  const navigationDone   = useRef(false);

  const navigate = (destination: string) => {
    if (navigationDone.current) return;
    navigationDone.current = true;
    try {
      router.replace(destination as any);
    } catch {
      setTimeout(() => {
        try { router.replace(destination as any); } catch {}
      }, 400);
    }
  };

  useEffect(() => {
    // ── Animations ────────────────────────────────────────────────────────
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
        Animated.timing(shimmerOp, { toValue: 1, duration: 80,  useNativeDriver: false }),
        Animated.timing(shimmerX,  {
          toValue: LOGO_W + 60, duration: 650,
          easing: Easing.inOut(Easing.quad), useNativeDriver: false,
        }),
        Animated.timing(shimmerOp, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    });

    // ── Hard fallback — never hang on splash beyond 6 s ───────────────────
    const hardFallback = setTimeout(() => navigate("/welcome"), 6000);

    // ── Auth check after animation settles (2.6 s) ────────────────────────
    const authTimer = setTimeout(() => {
      if (!auth) {
        navigate("/welcome");
        return;
      }
      const unsub = onAuthStateChanged(
        auth,
        (user) => {
          unsub();
          navigate(user ? "/(tabs)" : "/welcome");
        },
        () => {
          navigate("/welcome");
        },
      );
    }, 2600);

    return () => {
      clearTimeout(authTimer);
      clearTimeout(hardFallback);
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A1628",
    alignItems: "center",
    justifyContent: "center",
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
  logoImg: { width: LOGO_W, height: LOGO_H },
  shimmer: {
    position: "absolute",
    top: -10, left: -60,
    width: 50, height: LOGO_H + 20,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ skewX: "-18deg" }],
  },
});
