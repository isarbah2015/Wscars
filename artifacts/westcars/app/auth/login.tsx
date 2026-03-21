import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const LOGO = require("@/assets/images/westcars-logo.png");

export default function LoginScreen() {
  const { login } = useApp();
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

  const topPad = (insets.top || 0) + (Platform.OS === "web" ? 67 : 0);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Hero gradient top section */}
      <LinearGradient
        colors={["#0A0A0A", "#1A1A2E", "#0066CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topPad + 20 }]}
      >
        {/* Back button */}
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>

        {/* Logo + wordmark */}
        <View style={styles.brandRow}>
          <View style={styles.logoBg}>
            <Image source={LOGO} style={styles.logoImg} resizeMode="contain" />
          </View>
          <View>
            <Text style={styles.wordmark}>Westcars</Text>
            <Text style={styles.tagline}>Ghana's Car Marketplace</Text>
          </View>
        </View>

        {/* Hero text */}
        <Text style={styles.heroTitle}>Welcome back</Text>
        <Text style={styles.heroSub}>Sign in to access your listings,{"\n"}saved cars and messages</Text>

        {/* Decorative car stats */}
        <View style={styles.statsRow}>
          {[
            { value: "50k+", label: "Active buyers" },
            { value: "2.4k", label: "Listings" },
            { value: "8", label: "Regions" },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Form card */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign in</Text>

          {/* Email field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Email or phone</Text>
            <View style={[styles.field, focusedField === "email" && styles.fieldFocused]}>
              <Feather name="mail" size={16} color={focusedField === "email" ? "#0066CC" : "#9E9E9E"} />
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

          {/* Password field */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.field, focusedField === "pass" && styles.fieldFocused]}>
              <Feather name="lock" size={16} color={focusedField === "pass" ? "#0066CC" : "#9E9E9E"} />
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

          {/* Sign in button */}
          <Pressable
            style={[styles.signInBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0077EE", "#0055BB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signInGrad}
            >
              {loading ? (
                <Text style={styles.signInText}>Signing in…</Text>
              ) : (
                <>
                  <Text style={styles.signInText}>Sign in</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          {/* Create account */}
          <Pressable
            style={styles.registerBtn}
            onPress={() => router.push("/auth/signup")}
          >
            <Feather name="user-plus" size={16} color="#0066CC" />
            <Text style={styles.registerText}>Create account</Text>
          </Pressable>

          {/* Guest */}
          <Pressable style={styles.guestBtn} onPress={() => router.replace("/(tabs)")}>
            <Text style={styles.guestText}>Browse without signing in →</Text>
          </Pressable>
        </View>

        {/* Bottom trust indicators */}
        <View style={styles.trustRow}>
          {[
            { icon: "shield", text: "Secure login" },
            { icon: "lock", text: "Private & safe" },
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
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  backBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  logoBg: {
    width: 52, height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoImg: { width: 36, height: 36 },
  wordmark: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: "#fff", letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.6)", marginTop: 1,
  },
  heroTitle: {
    fontSize: 32, fontFamily: "Inter_700Bold",
    color: "#fff", letterSpacing: -0.8, marginTop: 8,
  },
  heroSub: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)", lineHeight: 22,
    marginTop: -8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.6)" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Form card
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  formTitle: {
    fontSize: 22, fontFamily: "Inter_700Bold",
    color: "#1A1A1A", marginBottom: 4,
  },

  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 12, fontFamily: "Inter_600SemiBold",
    color: "#6B6B6B", letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E8E8E8",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
  },
  fieldFocused: {
    borderColor: "#0066CC",
    backgroundColor: "#fff",
    shadowColor: "#0066CC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    fontFamily: "Inter_400Regular",
    padding: 0,
  },

  forgotBtn: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_500Medium" },

  signInBtn: { borderRadius: 12, overflow: "hidden", marginTop: 4 },
  signInGrad: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signInText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.2 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: "#F0F0F0" },
  divText: { fontSize: 13, color: "#BDBDBD", fontFamily: "Inter_400Regular" },

  registerBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#0066CC",
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
  },
  registerText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0066CC" },

  guestBtn: { alignItems: "center", paddingVertical: 6 },
  guestText: { fontSize: 13, color: "#9E9E9E", fontFamily: "Inter_400Regular" },

  // Trust row
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    paddingHorizontal: 8,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustText: { fontSize: 11, color: "#BDBDBD", fontFamily: "Inter_400Regular" },
});
