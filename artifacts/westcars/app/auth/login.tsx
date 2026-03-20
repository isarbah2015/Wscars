import { Feather } from "@expo/vector-icons";
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

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: (insets.top || 0) + (Platform.OS === "web" ? 67 : 0) + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoBlock}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoIconText}>W</Text>
            </View>
            <Text style={styles.logoText}>
              West<Text style={styles.logoThin}>cars</Text>
            </Text>
          </View>
          <Text style={styles.tagline}>Ghana's Car Marketplace</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Sign in</Text>

          <View style={[styles.field, focusedField === "email" && styles.fieldFocus]}>
            <TextInput
              style={styles.input}
              placeholder="Email or phone number"
              placeholderTextColor={Colors.light.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              returnKeyType="next"
            />
          </View>

          <View style={[styles.field, focusedField === "pass" && styles.fieldFocus]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={Colors.light.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField("pass")}
              onBlur={() => setFocusedField(null)}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          <Pressable
            style={[styles.signInBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.signInText}>{loading ? "Signing in…" : "Sign in"}</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          <Pressable
            style={styles.registerBtn}
            onPress={() => router.push("/auth/signup")}
          >
            <Text style={styles.registerText}>Create account</Text>
          </Pressable>

          <Pressable
            style={styles.guestBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.guestText}>Browse without signing in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  logoBlock: { alignItems: "center", marginBottom: 40, gap: 8 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: "#0066CC",
    alignItems: "center", justifyContent: "center",
  },
  logoIconText: { color: "#fff", fontSize: 22, fontFamily: "Inter_700Bold" },
  logoText: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#0066CC" },
  logoThin: { fontFamily: "Inter_400Regular" },
  tagline: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  form: { gap: 12 },
  formTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.light.text, marginBottom: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  fieldFocus: { borderColor: "#0066CC", borderWidth: 1.5 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13, color: "#0066CC", fontFamily: "Inter_400Regular" },
  signInBtn: {
    height: 50,
    backgroundColor: "#0066CC",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  signInText: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.light.border },
  divText: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
  registerBtn: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#0066CC",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0066CC" },
  guestBtn: { alignItems: "center", paddingVertical: 8 },
  guestText: { fontSize: 13, color: Colors.light.textTertiary, fontFamily: "Inter_400Regular" },
});
