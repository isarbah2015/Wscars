import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CAR  = require("@/assets/images/welcome-car-porsche.png");
const LOGO = require("@/assets/images/wc-logo.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const TEAL      = "#0EB5CA";
const TEAL_MID  = "#0098AA";
const TEAL_DEEP = "#006F80";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const BTN_H      = 64;
  const THUMB      = BTN_H - 8;
  const trackWidth = Math.min(SCREEN_W - 48, 340);
  const MAX_X      = trackWidth - THUMB - 8;
  const translateX = useRef(new Animated.Value(0)).current;
  const [unlocked, setUnlocked] = useState(false);

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
    if (e.nativeEvent.state === State.END) {
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
        colors={["#FFFFFF", "#E8F9FC", TEAL, TEAL_DEEP]}
        locations={[0, 0.30, 0.70, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Car image ── */}
      <Image
        source={CAR}
        style={styles.carFull}
        resizeMode="contain"
        fadeDuration={200}
      />

      {/* ── Scrim: transparent at top (white bg shows) → teal-dark at bottom ── */}
      <LinearGradient
        colors={[
          "transparent",
          "transparent",
          `rgba(0,111,128,0.30)`,
          `rgba(0,111,128,0.82)`,
          TEAL_DEEP,
        ]}
        locations={[0, 0.38, 0.55, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Logo pinned top-left (teal on white bg) ── */}
      <View style={[styles.topRow, { paddingTop: insets.top + 16 }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      {/* ── Bottom content ── */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 20 }]}>

        <Text style={styles.headline}>
          Ghana's Finest.{"\n"}Endless Choices!
        </Text>
        <Text style={styles.sub}>
          Experience the perfect blend of quality, trust, and{"\n"}affordability with thousands of verified car listings.
        </Text>

        {/* ── Slide-to-start track ── */}
        <View style={[styles.slideTrack, { width: trackWidth }]}>

          <Animated.Text style={[styles.slideLabel, { opacity: labelOpacity }]}>
            Get Started
          </Animated.Text>

          <Text style={styles.chevrons}>{">>"}</Text>

          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.slideThumb, { transform: [{ translateX }] }]}>
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
    paddingHorizontal: 24,
    gap: 0,
  },

  headline: {
    fontSize: 38,
    lineHeight: 46,
    color: "#FFFFFF",
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  sub: {
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },

  slideTrack: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  slideLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.2,
    pointerEvents: "none",
  },
  chevrons: {
    position: "absolute",
    right: 20,
    color: "rgba(255,255,255,0.50)",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    pointerEvents: "none",
  },
  slideThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 8,
  },
});
