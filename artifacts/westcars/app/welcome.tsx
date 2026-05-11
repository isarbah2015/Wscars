import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image as RNImage,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PanGestureHandler, GestureHandlerStateChangeEvent } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CAR  = require("@/assets/images/welcome-car-porsche.png");
const LOGO = require("@/assets/images/wc-logo.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const TEAL_DEEP = "#006F80";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const BTN_H      = 64;
  const THUMB      = BTN_H - 8;
  const trackWidth = Math.min(SCREEN_W - 48, 340);
  const MAX_X      = trackWidth - THUMB - 8;

  const translateX = useRef(new Animated.Value(0)).current;
  const shimmerX   = useRef(new Animated.Value(-trackWidth)).current;
  const thumbPulse = useRef(new Animated.Value(1)).current;
  const [unlocked, setUnlocked] = useState(false);

  // Shimmer sweeps left → right on a 1.8s loop
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: trackWidth,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(600),
        Animated.timing(shimmerX, {
          toValue: -trackWidth,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Thumb gentle pulse: scale 1 → 1.10 → 1 every 1.4s
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(thumbPulse, {
          toValue: 1.12,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(thumbPulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(200),
      ])
    );

    shimmer.start();
    pulse.start();
    return () => { shimmer.stop(); pulse.stop(); };
  }, []);

  const goToLogin = () => {
    if (unlocked) return;
    setUnlocked(true);
    router.replace("/auth/login");
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const x = e.nativeEvent.translationX;
        if (x < 0)     translateX.setValue(0);
        if (x > MAX_X) translateX.setValue(MAX_X);
      },
    },
  );

  const onHandlerStateChange = (e: any) => {
    if (e.nativeEvent.state === 5) {
      const x = e.nativeEvent.translationX;
      if (x >= MAX_X * 0.85) {
        Animated.timing(translateX, {
          toValue: MAX_X, duration: 120, useNativeDriver: false,
        }).start(goToLogin);
      } else {
        Animated.spring(translateX, {
          toValue: 0, useNativeDriver: false,
        }).start();
      }
    }
  };

  const labelOpacity = translateX.interpolate({
    inputRange: [0, MAX_X * 0.4],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.root}>

      {/* ── Background gradient: white → teal ── */}
      <LinearGradient
        colors={["#FFFFFF", "#E8F9FC", "#0EB5CA", TEAL_DEEP]}
        locations={[0, 0.30, 0.70, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Car image ── */}
      <Image
        source={CAR}
        style={styles.carFull}
        contentFit="contain"
        transition={0}
        cachePolicy="memory-disk"
      />

      {/* ── Bottom scrim ── */}
      <LinearGradient
        colors={[
          "transparent",
          "transparent",
          "rgba(0,111,128,0.30)",
          "rgba(0,111,128,0.82)",
          TEAL_DEEP,
        ]}
        locations={[0, 0.38, 0.55, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Logo pinned top-left ── */}
      <View style={[styles.topRow, { paddingTop: insets.top + 16 }]}>
        <RNImage source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      {/* ── Bottom content ── */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>

        <Text style={styles.headline}>
          Ghana's Finest.{"\n"}Endless Choices!
        </Text>
        <Text style={styles.sub}>
          Experience the perfect blend of quality, trust, and{"\n"}affordability with thousands of verified car listings.
        </Text>

        {/* ── Slide track with shimmer ── */}
        <View style={[styles.slideTrack, { width: trackWidth }]}>

          {/* Shimmer overlay — sweeps right to hint swipe */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.shimmer,
              { transform: [{ translateX: shimmerX }] },
            ]}
          >
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.55)", "rgba(255,255,255,0.28)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </Animated.View>

          {/* Centred label */}
          <Animated.Text style={[styles.slideLabel, { opacity: labelOpacity }]}>
            Slide to Get Started
          </Animated.Text>

          {/* ">>" hint on right */}
          <Text style={styles.chevrons}>{">>"}</Text>

          {/* Teal thumb with white arrow — fully visible */}
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[
                styles.slideThumb,
                { transform: [{ translateX }, { scale: thumbPulse }] },
              ]}
            >
              <Feather name="arrow-right" size={24} color="#fff" />
            </Animated.View>
          </PanGestureHandler>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  carFull: {
    position: "absolute",
    top: SCREEN_H * 0.05,
    left: -SCREEN_W * 0.38,
    width: SCREEN_W * 1.26,
    height: SCREEN_H * 0.50,
  },

  topRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  logo: { width: 110, height: 40 },

  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 36,
    alignItems: "center",
  },

  headline: {
    fontSize: 28,
    lineHeight: 36,
    color: "#FFFFFF",
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.5,
    marginBottom: 12,
    textAlign: "left",
    width: "100%",
  },
  sub: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
    textAlign: "left",
    width: "100%",
  },

  slideTrack: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.40)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 100,
    zIndex: 1,
    pointerEvents: "none",
  },
  slideLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    zIndex: 0,
    pointerEvents: "none",
  },
  chevrons: {
    position: "absolute",
    right: 20,
    color: "rgba(255,255,255,0.55)",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    zIndex: 0,
    pointerEvents: "none",
  },
  slideThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0EB5CA",      // teal — arrow stays white, fully visible
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.70,
    shadowRadius: 14,
    elevation: 10,
  },
});
