import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GoogleAuthBridge } from "@/components/GoogleAuthBridge";
import { useApp } from "@/context/AppContext";
import { isFirebaseReady } from "@/lib/firebase";
import { authErrorMessage, sendPasswordResetEmail } from "@/services/firebase";

const WC_LOGO  = require("@/assets/images/wc-logo.png");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GOOGLE_IOS_CLIENT_ID     = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

const CYAN = "#0EB5CA";
const NAVY = "#0A1628";
const NAVY_FIELD = "#14233A";

function LoginScreen() {
  const { login, loginWithGoogle, loginWithGooglePopup } = useApp();
  const insets = useSafeAreaInsets();

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [showForgot,   setShowForgot]   = useState(false);

  const isWeb = Platform.OS === "web";
  const nativeGoogleConfigured =
    Platform.OS === "ios"     ? !!GOOGLE_IOS_CLIENT_ID :
    Platform.OS === "android" ? !!GOOGLE_ANDROID_CLIENT_ID :
    false;
  const promptGoogleRef = useRef<(() => Promise<void>) | null>(null);

  const handleLogin = async () => {
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert("Required", "Please enter your email and password.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await login(trimmedEmail, trimmedPassword);
      router.replace("/(tabs)");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        code === "auth/invalid-login-credentials" ||
        code === "auth/user-not-found"
      ) {
        setShowForgot(true);
      }
      Alert.alert("Sign In Failed", authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Enter your email", "Type your email address in the field above, then tap 'Forgot password?'");
      return;
    }
    if (!isFirebaseReady()) {
      Alert.alert("Not configured", "Firebase is not set up yet.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(trimmed);
      Alert.alert("Reset email sent", `A password reset link has been sent to ${trimmed}. Check your inbox.`);
    } catch (err) {
      Alert.alert("Failed", authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogleIdToken = useCallback(async (idToken: string, accessToken?: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(idToken, accessToken);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Google Sign-In Failed", authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle]);

  const handleGoogle = async () => {
    if (!isFirebaseReady()) {
      Alert.alert("Not configured", "Firebase is not configured yet. Please add the Firebase secrets first.");
      return;
    }
    if (isWeb) {
      setLoading(true);
      try {
        await loginWithGooglePopup();
        router.replace("/(tabs)");
      } catch (err) {
        Alert.alert("Google Sign-In Failed", authErrorMessage(err));
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!nativeGoogleConfigured || !promptGoogleRef.current) {
      Alert.alert(
        "Google Sign-In unavailable",
        "Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (Android) or EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (iOS) to enable Google sign-in on device.",
      );
      return;
    }
    promptGoogleRef.current().catch((e) => Alert.alert("Error", String(e?.message || e)));
  };

  const handlePhone = () => router.push("/auth/phone");
  const handleGuest = () => router.replace("/(tabs)");

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!isWeb && nativeGoogleConfigured && (
        <GoogleAuthBridge onIdToken={onGoogleIdToken} promptRef={promptGoogleRef} />
      )}

      {/* ── Cyan top section ── */}
      <View style={[styles.topSection, { paddingTop: insets.top + 14 }]}>
        <View style={styles.topRow}>
          <View style={styles.iconBtn}>
            <Image source={WC_LOGO} style={styles.topLogo} resizeMode="contain" tintColor={NAVY} />
          </View>
          <Pressable style={styles.signUpLink} onPress={() => router.push("/auth/signup")} hitSlop={10}>
            <Feather name="user-plus" size={16} color={NAVY} />
            <Text style={styles.signUpText}>Sign Up</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Sign In</Text>
      </View>

      {/* ── Wave divider ── */}
      <Svg width="100%" height={70} viewBox="0 0 1440 320" preserveAspectRatio="none" style={styles.wave}>
        <Path
          d="M0,96L60,128C120,160,240,224,360,224C480,224,600,160,720,138.7C840,117,960,139,1080,160C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          fill={CYAN}
        />
      </Svg>

      {/* ── Dark navy form ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 0) + 24, flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
            <View style={styles.field}>
              <TextInput
                style={[styles.input, { paddingRight: 36 }]}
                placeholder="••••••••••"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.55)" />
              </Pressable>
            </View>

            {showForgot && (
              <Pressable style={styles.forgotBtn} onPress={handleForgotPassword} disabled={loading}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            )}

            {/* Gradient outline Sign In button */}
            <Pressable
              style={[styles.ctaWrap, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#0EB5CA", "#5DDFEF", "#0EB5CA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaBorder}
              >
                <View style={styles.ctaInner}>
                  {loading ? (
                    <Text style={styles.ctaText}>Signing in…</Text>
                  ) : (
                    <>
                      <Feather name="log-in" size={16} color="#FFFFFF" />
                      <Text style={styles.ctaText}>Sign In</Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>Or sign in with</Text>
              <View style={styles.divLine} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={styles.socialCircle} onPress={handleGoogle} disabled={loading}>
                <Text style={styles.googleG}>G</Text>
              </Pressable>
              <Pressable style={styles.socialCircle} onPress={handlePhone} disabled={loading}>
                <Feather name="phone" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <Pressable style={styles.guestBtn} onPress={handleGuest}>
              <Text style={styles.guestText}>Browse without signing in →</Text>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default React.memo(LoginScreen);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY },

  topSection: {
    backgroundColor: CYAN,
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  topLogo: { width: 64, height: 28 },
  signUpLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  signUpText: { fontSize: 14, color: NAVY, fontFamily: "Inter_700Bold" },
  title: {
    fontSize: 38, color: NAVY, textAlign: "center",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.8,
    marginTop: 16, marginBottom: 6,
  },

  wave: { marginTop: -1 },

  scroll: { flex: 1, backgroundColor: NAVY },
  scrollContent: { paddingHorizontal: 28, paddingTop: 18 },

  label: {
    fontSize: 13, color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_500Medium", textAlign: "center",
    marginBottom: 8,
  },
  field: {
    height: 56, borderRadius: 28,
    backgroundColor: NAVY_FIELD,
    paddingHorizontal: 22,
    justifyContent: "center",
    position: "relative",
  },
  input: {
    fontSize: 15, color: "#FFFFFF",
    fontFamily: "Inter_500Medium", padding: 0,
    textAlign: "center",
  },
  eyeBtn: {
    position: "absolute", right: 18, top: 0, bottom: 0,
    justifyContent: "center",
  },

  forgotBtn: { alignSelf: "center", marginTop: 10 },
  forgotText: { fontSize: 13, color: CYAN, fontFamily: "Inter_600SemiBold" },

  ctaWrap: { marginTop: 22, borderRadius: 30, overflow: "hidden" },
  ctaBorder: { padding: 1.5, borderRadius: 30 },
  ctaInner: {
    height: 53, borderRadius: 28.5,
    backgroundColor: NAVY,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
  },
  ctaText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },

  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, marginBottom: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  divText: { fontSize: 12, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },

  socialRow: { flexDirection: "row", justifyContent: "center", gap: 18 },
  socialCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: NAVY_FIELD,
    alignItems: "center", justifyContent: "center",
  },
  googleG: { fontSize: 22, color: "#FFFFFF", fontFamily: "Inter_700Bold" },

  guestBtn: { alignItems: "center", marginTop: 22 },
  guestText: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
});
