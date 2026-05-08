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

const CAR  = require("@/assets/images/welcome-car.png");
const LOGO = require("@/assets/images/wc-logo.png");

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const trackWidth = Math.min(SCREEN_W - 80, 320);
  const THUMB      = 56;
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
    inputRange: [0, MAX_X],
    outputRange: [1, 0],
  });

  return (
    <View style={styles.root}>
      {/* ── Full-screen cinematic car image ── */}
      <Image source={CAR} style={styles.carFull} resizeMode="cover" fadeDuration={250} />

      {/* ── Multi-stop scrim — transparent top → near-black bottom ── */}
      <LinearGradient
        colors={[
          "transparent",
          "rgba(2,5,14,0.20)",
          "rgba(2,5,14,0.65)",
          "rgba(2,5,14,0.92)",
          "#02060F",
        ]}
        locations={[0, 0.30, 0.52, 0.72, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* ── Top: brand identity ── */}
      <View style={[styles.brandRow, { paddingTop: insets.top + 18 }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" tintColor="#FFFFFF" />
        <Text style={styles.brandTag}>GHANA'S TRUSTED CAR MARKETPLACE</Text>
      </View>

      {/* ── Orange accent line ── */}
      <View style={styles.accentLine} />

      {/* ── Bottom content ── */}
      <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.headline}>Buy. Sell.{"\n"}Drive Smart.</Text>
        <Text style={styles.sub}>
          Thousands of verified listings across Ghana.{"\n"}Find your perfect ride today.
        </Text>

        <Text style={styles.cueLabel}>GET STARTED</Text>

        {/* Slide-to-unlock CTA */}
        <View style={[styles.slideTrack, { width: trackWidth }]}>
          <Animated.Text style={[styles.slideLabel, { opacity: labelOpacity }]}>
            Slide to sign in →
          </Animated.Text>
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
  root: { flex: 1, backgroundColor: "#02060F" },

  carFull: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H * 0.72,
  },

  brandRow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 24,
  },
  logo: { width: 130, height: 50 },
  brandTag: {
    fontSize: 10,
    color: "rgba(224,251,255,0.85)",
    letterSpacing: 2.6,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },

  accentLine: {
    position: "absolute",
    left: 28,
    bottom: "38%",
    width: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FF6B00",
  },

  bottomWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    gap: 0,
  },

  headline: {
    fontSize: 46,
    lineHeight: 52,
    color: "#FFFFFF",
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_400Regular",
    marginBottom: 28,
  },

  cueLabel: {
    fontSize: 10,
    color: "#FF6B00",
    letterSpacing: 3.5,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    marginBottom: 14,
  },

  slideTrack: {
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.40)",
    justifyContent: "center",
    padding: 4,
    position: "relative",
    overflow: "hidden",
    marginBottom: 8,
  },
  slideLabel: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    color: "rgba(255,255,255,0.70)",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
  },
  slideThumb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
});
