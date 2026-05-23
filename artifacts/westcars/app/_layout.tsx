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
import * as Updates from "expo-updates";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { isFirebaseReady } from "@/lib/firebase";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";
import { PaystackProvider } from "react-native-paystack-webview";

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
  const segments = useSegments() as string[];
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (segments[0] === 'splash' || segments.length === 0) return;

    const isAuthed = !!user;
    const onAuthScreen =
      segments[0] === 'welcome' ||
      segments[0] === 'auth';

    if (isAuthed && onAuthScreen) {
      router.replace('/(tabs)');
      return;
    }

    if (!isAuthed && segments[0] === 'conversation') {
      router.replace('/welcome');
    }
  }, [segments, user, loading]);
}

function RootLayoutNav() {
  useAuthRedirect();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
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
      <Stack.Screen name="boost"             options={{ presentation: "card" }} />
      <Stack.Screen name="full-specs/[id]"   options={{ presentation: "card" }} />
      <Stack.Screen name="advertise-book"    options={{ presentation: "card" }} />
    </Stack>
  );
}

function FirebaseUnavailableScreen() {
  const { colors } = useTheme();
  const [retrying, setRetrying] = useState(false);
  const retry = async () => {
    setRetrying(true);
    try {
      await Updates.reloadAsync();
    } catch {
      setRetrying(false);
    }
  };

  return (
    <View style={[styles.unavailableRoot, { backgroundColor: colors.background }]}>
      <View style={[styles.unavailableCard, { backgroundColor: colors.card, borderColor: "rgba(14,181,202,0.14)" }]}>
        <Feather name="wifi-off" size={34} color="#0EB5CA" />
        <Text style={[styles.unavailableTitle, { color: colors.text }]}>We could not connect securely</Text>
        <Text style={[styles.unavailableText, { color: colors.textSecondary }]}>
          Westcars could not start Firebase services. Check your connection and try again.
        </Text>
        <Pressable style={styles.unavailableButton} onPress={retry} disabled={retrying}>
          <Text style={styles.unavailableButtonText}>{retrying ? "Retrying..." : "Try Again"}</Text>
        </Pressable>
      </View>
    </View>
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
              {!__DEV__ && !isFirebaseReady() ? (
                <FirebaseUnavailableScreen />
              ) : (
                <AuthProvider>
                  <AppProvider>
                    <PaystackProvider
                      publicKey={PAYSTACK_PUBLIC_KEY}
                      currency="GHS"
                      defaultChannels={["card", "mobile_money", "ussd"]}
                    >
                      <RootLayoutNav />
                    </PaystackProvider>
                  </AppProvider>
                </AuthProvider>
              )}
            </QueryClientProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  unavailableRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF4F7",
    padding: 24,
  },
  unavailableCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.14)",
    shadowColor: "#0A1628",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  unavailableTitle: {
    marginTop: 14,
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0F172A",
    textAlign: "center",
  },
  unavailableText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
    color: "#64748B",
    textAlign: "center",
  },
  unavailableButton: {
    marginTop: 22,
    height: 50,
    alignSelf: "stretch",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0EB5CA",
  },
  unavailableButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
