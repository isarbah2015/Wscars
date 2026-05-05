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
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";

// Keep the native splash visible until all fonts are confirmed loaded.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
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
    // Vector-icon glyph fonts — must be loaded for icons to render on native.
    ...Feather.font,
    ...Ionicons.font,
    // Brand fonts
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // Hide the native splash only after fonts are resolved (loaded or errored).
  // Never called while fontsLoaded is still false so the splash never flashes.
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

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
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </AppProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
