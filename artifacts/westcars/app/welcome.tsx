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

const { width: SCREEN_W } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const trackWidth = Math.min(SCREEN_W - 80, 320);
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
    <View style={styles.root}>
      {/* Premium dark gradient backdrop */}
      <LinearGradient
        colors={["#04111F", "#0A1628", "#0E2540", "#0A1628"]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle cyan glow halo behind car */}
      <View pointerEvents="none" style={styles.glow}>
        <LinearGradient
          colors={["rgba(14,181,202,0.45)", "rgba(14,181,202,0.12)", "transparent"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Top brand row */}
      <View style={[styles.brandRow, { paddingTop: insets.top + 18 }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" tintColor="#FFFFFF" />
        <Text style={styles.brandTag}>GHANA'S TRUSTED CAR MARKETPLACE</Text>
      </View>

      {/* Hero car */}
      <View style={styles.carWrap}>
        <Image source={CAR} style={styles.carImg} resizeMode="contain" fadeDuration={250} />
      </View>


      {/* Premium glass card */}
      <View style={[styles.cardWrap, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.card}>
          <LinearGradient
            colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0.02)"]}
            style={StyleSheet.absoluteFill}
          />

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
    </View>
  );
}

const CAR_H = 340;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A1628" },

  glow: {
    position: "absolute",
    top: 60, left: -60, right: -60,
    height: 360,
    borderRadius: 360,
    overflow: "hidden",
    transform: [{ scaleX: 1.2 }],
  },

  brandRow: {
    alignItems: "center", gap: 6, paddingHorizontal: 24,
  },
  logo: { width: 130, height: 50 },
  brandTag: {
    fontSize: 10, color: "rgba(224,251,255,0.85)", letterSpacing: 2.6,
    fontFamily: "Inter_600SemiBold", textAlign: "center",
  },

  carWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 28,
  },
  carImg: {
    width: "100%",
    height: CAR_H,
  },

  cardWrap: {
    flex: 1,
    paddingHorizontal: 18,
    justifyContent: "flex-end",
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,22,40,0.55)",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },

  welcome: {
    fontSize: 36, lineHeight: 40, color: "#FFFFFF",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -1, textAlign: "center",
  },
  sub: {
    fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.72)",
    fontFamily: "Inter_400Regular", textAlign: "center",
    paddingHorizontal: 6, marginBottom: 4,
  },
  getStarted: {
    fontSize: 11, color: "#0EB5CA", letterSpacing: 3.2,
    fontFamily: "Inter_700Bold", textTransform: "uppercase",
    marginTop: 4, marginBottom: 6,
  },

  slideTrack: {
    height: 60, borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1, borderColor: "rgba(14,181,202,0.35)",
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
    shadowOpacity: 0.5, shadowRadius: 10,
  },
});
