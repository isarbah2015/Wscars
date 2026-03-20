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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter your email and password.");
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
          {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
            paddingBottom: insets.bottom + 24,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={["#FF6B00", "#FF8C42"]}
          style={styles.headerGradient}
        >
          <View style={styles.logoArea}>
            <View style={styles.iconCircle}>
              <Feather name="truck" size={28} color="#FF6B00" />
            </View>
            <Text style={styles.appName}>Westcars</Text>
          </View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subText}>
            Sign in to buy or sell cars in Ghana
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>

          {/* Email field */}
          <View style={styles.inputContainer}>
            <Feather name="mail" size={18} color={Colors.light.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Email address or phone"
              placeholderTextColor={Colors.light.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Password field */}
          <View style={styles.inputContainer}>
            <Feather name="lock" size={18} color={Colors.light.textTertiary} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.light.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={18}
                color={Colors.light.textTertiary}
              />
            </Pressable>
          </View>

          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Login button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && { opacity: 0.85 },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={["#FF6B00", "#FF8C42"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <Text style={styles.loginText}>Signing in...</Text>
              ) : (
                <>
                  <Text style={styles.loginText}>Sign In</Text>
                  <Feather name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupPrompt}>Don't have an account?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={styles.signupLink}>Sign Up Free</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 4,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  subText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 28,
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  formTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_500Medium",
  },
  loginButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  loginText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    fontSize: 13,
    color: Colors.light.textTertiary,
    fontFamily: "Inter_400Regular",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  signupPrompt: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
  },
  signupLink: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
  },
});
