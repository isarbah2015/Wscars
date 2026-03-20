import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    const t = setTimeout(() => {
      router.replace("/auth/login");
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.center, { opacity }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoIconText}>W</Text>
          </View>
          <Text style={styles.logoText}>
            West<Text style={styles.logoTextThin}>cars</Text>
          </Text>
        </View>
        <Text style={styles.tagline}>Ghana's Car Marketplace</Text>
      </Animated.View>
      <ActivityIndicator
        style={styles.loader}
        color="#0066CC"
        size="small"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", gap: 10 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIconText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  logoText: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#0066CC",
    letterSpacing: -0.5,
  },
  logoTextThin: {
    fontFamily: "Inter_400Regular",
    color: "#0066CC",
  },
  tagline: {
    fontSize: 13,
    color: "#9E9E9E",
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  loader: {
    position: "absolute",
    bottom: 80,
  },
});
