import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-persistence";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";

const LOGO   = require("@/assets/images/wc-logo.png");
const LOGO_W = 260;
const LOGO_H = 170;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function SplashScreen() {
  const router    = useRouter();
  const topY      = useRef(new Animated.Value(-(LOGO_H / 2 + 40))).current;
  const botY      = useRef(new Animated.Value(LOGO_H / 2 + 40)).current;
  const opacity   = useRef(new Animated.Value(0)).current;
  const shimmerX  = useRef(new Animated.Value(-LOGO_W - 60)).current;
  const shimmerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sleep = (ms: number) => new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, ms);
      timers.push(timer);
    });

    const runAnimation = () => new Promise<void>((resolve) => {
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
        ]).start(() => resolve());
      });
    });

    const resolveAuthUser = async () => {
      if (!auth) await sleep(300);
      const resolvedAuth = auth;
      if (!resolvedAuth) return null;

      return new Promise((resolve) => {
        unsub = onAuthStateChanged(resolvedAuth, (user) => {
          unsub?.();
          unsub = undefined;
          sleep(500).then(() => resolve(user));
        });
      });
    };

    const routeWhenReady = async () => {
      const [user] = await Promise.all([resolveAuthUser(), runAnimation()]);
      if (cancelled) return;
      const target = user ? "/(tabs)" : "/welcome";
      try {
        router.replace(target);
      } catch {
        await wait(250);
        if (!cancelled) {
          try { router.replace(target); } catch {}
        }
      }
    };

    routeWhenReady();

    return () => {
      cancelled = true;
      unsub?.();
      timers.forEach(clearTimeout);
    };
  }, [router]);

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
