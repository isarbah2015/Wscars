import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

export default function LoginScreen() {
  const { login } = useApp();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const ok = await login(email.trim(), password);
    setLoading(false);
    if (ok) {
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login Failed", "Invalid credentials. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#003D1A", "#005F2B", "#00873E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Feather name="truck" size={24} color="#00873E" />
            </View>
            <View>
              <View style={styles.wordmarkRow}>
                <Text style={styles.wordWest}>WEST</Text>
                <Text style={styles.wordCars}>CARS</Text>
              </View>
              <Text style={styles.logoTagline}>Ghana's Premier Car Marketplace</Text>
            </View>
          </View>

          <Text style={styles.headerGreeting}>Welcome back</Text>
          <Text style={styles.headerSub}>Sign in to continue</Text>
        </LinearGradient>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>

          {/* Email */}
          <View style={[styles.field, focused === "email" && styles.fieldFocused]}>
            <Feather name="mail" size={17} color={focused === "email" ? Colors.primary : Colors.light.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Email or phone number"
              placeholderTextColor={Colors.light.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Password */}
          <View style={[styles.field, focused === "pass" && styles.fieldFocused]}>
            <Feather name="lock" size={17} color={focused === "pass" ? Colors.primary : Colors.light.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onFocus={() => setFocused("pass")}
              onBlur={() => setFocused(null)}
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={17}
                color={Colors.light.textTertiary}
              />
            </Pressable>
          </View>

          <Pressable style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Sign In Button */}
          <Pressable
            style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.88 }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#005F2B", "#00873E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              {loading ? (
                <Text style={styles.btnText}>Signing in…</Text>
              ) : (
                <>
                  <Text style={styles.btnText}>Sign In</Text>
                  <Feather name="arrow-right" size={19} color="#fff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={styles.signupLink}>Create one free</Text>
            </Pressable>
          </View>

          {/* Quick browse hint */}
          <Pressable
            style={styles.browseRow}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.browseText}>Browse listings without signing in</Text>
            <Feather name="arrow-right" size={13} color={Colors.light.textTertiary} />
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff" },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 6,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  wordmarkRow: { flexDirection: "row", gap: 1 },
  wordWest: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 2 },
  wordCars: { fontSize: 20, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", letterSpacing: 2 },
  logoTagline: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", marginTop: 1 },
  headerGreeting: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -0.5 },
  headerSub: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    padding: 28,
    flex: 1,
    gap: 14,
  },
  formTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, marginBottom: 4 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  fieldFocused: { borderColor: Colors.primary, backgroundColor: Colors.primary + "06" },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  forgotRow: { alignSelf: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13, color: Colors.primary, fontFamily: "Inter_500Medium" },
  signInBtn: { borderRadius: 14, overflow: "hidden" },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  dividerLabel: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  signupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  signupPrompt: { fontSize: 14, color: Colors.light.textSecondary, fontFamily: "Inter_400Regular" },
  signupLink: { fontSize: 14, color: Colors.primary, fontFamily: "Inter_700Bold" },
  browseRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingTop: 4,
  },
  browseText: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
});
