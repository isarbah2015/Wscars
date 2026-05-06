import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { Feather, Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Local copies of icon font TTFs — bypasses Metro's unreliable symlink
// asset resolution in pnpm monorepos. Font family names must match what
// @expo/vector-icons createIconSet registers: 'feather' and 'Ionicons'.
const FEATHER_TTF = require("../assets/fonts/Feather.ttf");
const IONICONS_TTF = require("../assets/fonts/Ionicons.ttf");

// Keep the native splash visible until all fonts are confirmed loaded.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="car/[id]"          options={{ presentation: "card" }} />
      <Stack.Screen name="conversation/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="user/[id]"         options={{ presentation: "card" }} />
      <Stack.Screen name="advertise"         options={{ presentation: "card" }} />
      <Stack.Screen name="full-specs/[id]"   options={{ presentation: "card" }} />
      <Stack.Screen name="advertise-book"    options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Icon fonts loaded from local assets/ — font family names must exactly
    // match what @expo/vector-icons createIconSet registers internally.
    feather: FEATHER_TTF,
    Ionicons: IONICONS_TTF,
    // Brand fonts
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // Hide the native splash only after fonts are resolved (loaded or errored).
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Hard safety-net — always hide native splash after 5 s max,
  // even if a font hangs indefinitely on a slow Android device.
  const safetyFired = useRef(false);
  useEffect(() => {
    const id = setTimeout(() => {
      if (safetyFired.current) return;
      safetyFired.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const style = document.createElement("style");
    style.innerHTML = [
      "input, textarea { outline: none !important; box-shadow: none !important; -webkit-tap-highlight-color: transparent; }",
      "input:focus, textarea:focus { outline: none !important; box-shadow: none !important; }",
    ].join("\n");
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Keep the view tree empty (native splash stays visible) until fonts resolve.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <AppProvider>
                <RootLayoutNav />
              </AppProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
