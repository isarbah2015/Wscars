import { Feather, AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useApp } from "@/context/AppContext";
import { isFirebaseReady } from "@/lib/firebase";

WebBrowser.maybeCompleteAuthSession();

const WC_LOGO = require("@/assets/images/wc-logo.png");

const GOOGLE_WEB_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export default function LoginScreen() {
  const { login, loginWithGoogle } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (ok) router.replace("/(tabs)");
    else Alert.alert("Login Failed", "Invalid email or password.");
  };

  // ── Google Sign-In via expo-auth-session ──
  const googleConfigured = !!(GOOGLE_WEB_CLIENT_ID || GOOGLE_IOS_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID);
  const [_, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:        GOOGLE_WEB_CLIENT_ID,
    iosClientId:     GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type !== "success") return;
    const idToken = response.params?.id_token || (response as any).authentication?.idToken;
    const accessToken = (response as any).authentication?.accessToken;
    if (!idToken) return;
    (async () => {
      setLoading(true);
      const ok = await loginWithGoogle(idToken, accessToken);
      setLoading(false);
      if (ok) router.replace("/(tabs)");
      else Alert.alert("Sign in failed", "Could not sign in with Google.");
    })();
  }, [response]);

  const handleGoogle = () => {
    if (!isFirebaseReady()) {
      Alert.alert("Not configured", "Firebase is not configured yet. Please add the Firebase secrets first.");
      return;
    }
    if (!googleConfigured) {
      Alert.alert(
        "Google Sign-In not configured",
        "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and iOS/Android client IDs) to enable Google login.",
      );
      return;
    }
    promptAsync().catch((e) => Alert.alert("Error", String(e?.message || e)));
  };

  const handlePhone = () => {
    router.push("/auth/phone");
  };

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Hero */}
      <View style={[styles.hero, styles.heroWhite, { paddingTop: topPad + 16 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </Pressable>

        {/* WestCars badge + motto */}
        <View style={styles.brandCol}>
          <Image source={WC_LOGO} style={styles.heroBadge} resizeMode="contain" tintColor="#0EB5CA" />
          <Text style={styles.brandName}>WESTCARS</Text>
          <Text style={styles.tagline}>Ghana's Trusted Car Marketplace</Text>
        </View>

      </View>

      {/* Form card */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in to your account</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email or phone</Text>
            <View style={[styles.field, focusedField === "email" && styles.fieldFocused]}>
              <Feather name="mail" size={16} color={focusedField === "email" ? "#0EB5CA" : "#9E9E9E"} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#BDBDBD"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.field, focusedField === "pass" && styles.fieldFocused]}>
              <Feather name="lock" size={16} color={focusedField === "pass" ? "#0EB5CA" : "#9E9E9E"} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Your password"
                placeholderTextColor="#BDBDBD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedField("pass")}
                onBlur={() => setFocusedField(null)}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9E9E9E" />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.signInBtn, { backgroundColor: "#0EB5CA" }, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <View style={styles.signInGrad}>
              {loading ? (
                <Text style={[styles.signInText, { color: "#FFFFFF" }]}>Signing in…</Text>
              ) : (
                <>
                  <Text style={[styles.signInText, { color: "#FFFFFF" }]}>Sign in</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </>
              )}
            </View>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or continue with</Text>
            <View style={styles.divLine} />
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={[styles.socialBtn, { flex: 1 }]} onPress={handleGoogle} disabled={loading}>
              <AntDesign name="google" size={18} color="#0F172A" />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
            <Pressable style={[styles.socialBtn, { flex: 1 }]} onPress={handlePhone} disabled={loading}>
              <Feather name="phone" size={18} color="#0F172A" />
              <Text style={styles.socialText}>Phone</Text>
            </Pressable>
          </View>

          <Pressable style={styles.registerBtn} onPress={() => router.push("/auth/signup")}>
            <Feather name="user-plus" size={16} color="#0098AA" />
            <Text style={styles.registerText}>Create account</Text>
          </Pressable>

          <Pressable style={styles.guestBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.guestText}>Browse without signing in →</Text>
          </Pressable>
        </View>

        <View style={styles.trustRow}>
          {[
            { icon: "shield",       text: "Secure login" },
            { icon: "lock",         text: "Private & safe" },
            { icon: "check-circle", text: "Verified listings" },
          ].map((t) => (
            <View key={t.text} style={styles.trustItem}>
              <Feather name={t.icon as any} size={14} color="#9E9E9E" />
              <Text style={styles.trustText}>{t.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: (insets.bottom || 0) + 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EDF4F7" },

  hero: { paddingHorizontal: 24, paddingBottom: 28, gap: 12 },
  heroWhite: { backgroundColor: "#FFFFFF" },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },

  brandCol: { alignItems: "center", gap: 0, paddingVertical: 0 },
  heroBadge: { width: 200, height: 84 },
  brandName: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0098AA",
    letterSpacing: 3,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: -4,
  },
  tagline: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.1,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: 1,
  },

  heroTitle: {
    fontSize: 30, fontFamily: "Manrope_700Bold",
    color: "#0F172A", letterSpacing: -0.8, marginTop: 4,
  },
  heroSub: {
    fontSize: 14, fontFamily: "Manrope_400Regular",
    color: "#64748B", lineHeight: 22, marginTop: -2,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Manrope_700Bold", color: "#0F172A" },
  statLabel: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "#64748B" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  formCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 16, elevation: 6,
  },
  formTitle: { fontSize: 22, fontFamily: "Manrope_700Bold", color: "#1A1A1A", marginBottom: 4 },

  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 12, fontFamily: "Manrope_600SemiBold", color: "#6B6B6B",
    letterSpacing: 0.4, textTransform: "uppercase",
  },
  field: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 52, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#FAFAFA",
  },
  fieldFocused: {
    borderColor: "#0EB5CA", backgroundColor: "#fff",
    shadowColor: "#0EB5CA", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 2,
  },
  input: { flex: 1, fontSize: 15, color: "#1A1A1A", fontFamily: "Manrope_400Regular", padding: 0 },

  forgotBtn: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, color: "#0098AA", fontFamily: "Manrope_500Medium" },

  signInBtn: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  signInGrad: {
    height: 52, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  signInText: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#fff", letterSpacing: 0.2 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: "#F0F0F0" },
  divText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },

  registerBtn: {
    height: 52, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "rgba(14,181,202,0.45)",
    borderRadius: 12, backgroundColor: "rgba(14,181,202,0.07)",
  },
  registerText: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#0098AA" },

  socialBtn: {
    height: 52, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#E2E8F0",
    borderRadius: 12, backgroundColor: "#fff",
  },
  socialText: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0F172A" },

  guestBtn: { alignItems: "center", paddingVertical: 6 },
  guestText: { fontSize: 13, color: "#9E9E9E", fontFamily: "Manrope_400Regular" },

  trustRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 20, marginTop: 20, paddingHorizontal: 8,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustText: { fontSize: 11, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },

});
