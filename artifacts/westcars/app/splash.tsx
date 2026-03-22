import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const WC_BADGE = require("@/assets/images/wc-badge.png");

export default function SplashScreen() {
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale   = useRef(new Animated.Value(0.7)).current;

  const ring1Scale   = useRef(new Animated.Value(1)).current;
  const ring1Opacity = useRef(new Animated.Value(0.6)).current;
  const ring2Scale   = useRef(new Animated.Value(1)).current;
  const ring2Opacity = useRef(new Animated.Value(0.4)).current;
  const ring3Scale   = useRef(new Animated.Value(1)).current;
  const ring3Opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Logo fades and scales in
    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 80,
        friction: 9,
        useNativeDriver: true,
      }),
    ]).start();

    // Ripple rings pulse outward continuously
    const pulse = (scaleVal: Animated.Value, opacityVal: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scaleVal, {
              toValue: 2.8,
              duration: 1800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(opacityVal, {
              toValue: 0,
              duration: 1800,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleVal, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacityVal, { toValue: delay === 0 ? 0.55 : delay === 600 ? 0.35 : 0.18, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };

    setTimeout(() => {
      pulse(ring1Scale, ring1Opacity, 0);
      pulse(ring2Scale, ring2Opacity, 600);
      pulse(ring3Scale, ring3Opacity, 1200);
    }, 400);

    const nav = setTimeout(() => router.replace("/auth/login"), 3200);
    return () => clearTimeout(nav);
  }, []);

  const RING_SIZE = 130;

  return (
    <View style={styles.root}>
      {/* Very soft radial gradient background: achieved with layered Views */}
      <View style={styles.bgCenter} />

      {/* Ripple rings */}
      {[
        { scale: ring1Scale, opacity: ring1Opacity },
        { scale: ring2Scale, opacity: ring2Opacity },
        { scale: ring3Scale, opacity: ring3Opacity },
      ].map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              width: RING_SIZE,
              height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              opacity: r.opacity,
              transform: [{ scale: r.scale }],
            },
          ]}
        />
      ))}

      {/* W Badge */}
      <Animated.View
        style={{
          opacity: badgeOpacity,
          transform: [{ scale: badgeScale }],
          zIndex: 10,
        }}
      >
        <View style={styles.badgeWrap}>
          <Image source={WC_BADGE} style={styles.badge} resizeMode="contain" />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EDF4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  bgCenter: {
    position: "absolute",
    width: width * 1.4,
    height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: "rgba(14,181,202,0.08)",
    alignSelf: "center",
    top: "50%",
    marginTop: -(width * 0.7),
  },

  ring: {
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "rgba(14,181,202,0.55)",
    backgroundColor: "transparent",
  },

  badgeWrap: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(14,181,202,1)",
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },

  badge: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
});
