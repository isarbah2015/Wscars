// app/_layout.tsx
// FIX #2: Added auth state listener — after login, router.back() fires automatically
// so the user lands back on the screen they came from (sell, profile, etc.)

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
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged } from "firebase/auth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useApp } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { auth } from "@/lib/firebase";

const FEATHER_TTF = require("../assets/fonts/Feather.ttf");
const IONICONS_TTF = require("../assets/fonts/Ionicons.ttf");

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

// ─── Auth redirect hook ────────────────────────────────────────────────────────
// Watches Firebase auth state. When the user signs in from the login screen,
// router.back() returns them to the tab they came from automatically.
// When signed out, any protected tab shows its own inline auth wall (existing behaviour).

function useAuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const prevAuthRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (user) => {
      const isAuthed = !!user;
      const wasAuthed = prevAuthRef.current;

      // Just signed IN (null → true) and we're on the login screen → go back
      if (wasAuthed === false && isAuthed) {
        const onLoginScreen =
          segments.includes("login") ||
          segments.includes("signup");
        if (onLoginScreen) {
          router.back();
        }
      }

      prevAuthRef.current = isAuthed;
    });

    return unsub;
  }, []);
}

function RootLayoutNav() {
  useAuthRedirect();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="auth/forgot-password" />
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
    feather: FEATHER_TTF,
    Ionicons: IONICONS_TTF,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  const [forceShow, setForceShow] = useState(false);
  const safetyFired = useRef(false);

  useEffect(() => {
    const id = setTimeout(() => {
      if (safetyFired.current) return;
      safetyFired.current = true;
      SplashScreen.hideAsync().catch(() => {});
      setForceShow(true);
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

  if (!fontsLoaded && !fontError && !forceShow) return null;

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
