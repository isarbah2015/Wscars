import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BG   = require("@/assets/images/banner-car.png");
const LOGO = require("@/assets/images/wc-logo.png");

const { width: SCREEN_W } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const trackWidth = Math.min(SCREEN_W - 40, 360);
  const THUMB     = 52;
  const MAX_X     = trackWidth - THUMB - 8;
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
    <ImageBackground source={BG} style={styles.root} resizeMode="cover">
      <LinearGradient
        colors={["rgba(14,181,202,0.55)", "rgba(10,22,40,0.92)", "rgba(10,22,40,1)"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 28 }]}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" tintColor="#FFFFFF" />
          <Text style={styles.brandTag}>GHANA'S TRUSTED CAR MARKETPLACE</Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.bottomBlock}>
          <Text style={styles.welcome}>Welcome to{"\n"}WestCars</Text>
          <Text style={styles.sub}>
            Buy, sell and discover your next ride from thousands of verified listings across Ghana.
          </Text>

          <Text style={styles.getStarted}>Get started</Text>

          <View style={[styles.slideTrack, { width: trackWidth }]}>
            <Animated.Text style={[styles.slideLabel, { opacity: labelOpacity }]}>
              Slide to sign in
            </Animated.Text>
            <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange}>
              <Animated.View style={[styles.slideThumb, { transform: [{ translateX }] }]}>
                <Feather name="arrow-right" size={22} color="#0A1628" />
              </Animated.View>
            </PanGestureHandler>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: "#0A1628" },
  content: { flex: 1, paddingHorizontal: 24, alignItems: "center" },

  brandRow: { alignItems: "center", gap: 4 },
  logo:     { width: 140, height: 56 },
  brandTag: {
    fontSize: 10, color: "#E0FBFF", letterSpacing: 2.4,
    fontFamily: "Inter_600SemiBold", textAlign: "center",
  },

  bottomBlock: { width: "100%", alignItems: "center", gap: 10 },
  welcome: {
    fontSize: 38, lineHeight: 42, color: "#FFFFFF",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -1, textAlign: "center",
  },
  sub: {
    fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.78)",
    fontFamily: "Inter_400Regular", textAlign: "center",
    paddingHorizontal: 12, marginBottom: 6,
  },
  getStarted: {
    fontSize: 12, color: "#0EB5CA", letterSpacing: 3,
    fontFamily: "Inter_700Bold", textTransform: "uppercase",
    marginTop: 4, marginBottom: 4,
  },

  slideTrack: {
    height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.20)",
    justifyContent: "center", padding: 4,
    position: "relative", overflow: "hidden",
  },
  slideLabel: {
    position: "absolute", left: 0, right: 0, textAlign: "center",
    color: "rgba(255,255,255,0.85)", fontSize: 14,
    fontFamily: "Inter_600SemiBold", letterSpacing: 0.5,
  },
  slideThumb: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#0EB5CA", alignItems: "center", justifyContent: "center",
    shadowColor: "#0EB5CA", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
});
