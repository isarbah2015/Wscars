import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
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

import { useApp } from "@/context/AppContext";
import { authErrorMessage } from "@/services/firebase";
import { COUNTRY_CODE } from "@/utils/ghanaData";

const WC_LOGO  = require("@/assets/images/wc-logo.png");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CYAN = "#0EB5CA";
const NAVY = "#0A1628";
const NAVY_FIELD = "#14233A";

function SignupScreen() {
  const { signup } = useApp();
  const insets = useSafeAreaInsets();

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  const handleSignup = async () => {
    const trimmedName  = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim().replace(/\s/g, "");

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !password.trim()) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    if (trimmedPhone.replace(/\D/g, "").length < 9) {
      Alert.alert("Invalid phone", "Please enter a valid Ghanaian phone number (at least 9 digits).");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = trimmedPhone.startsWith("+")
        ? trimmedPhone
        : `${COUNTRY_CODE}${trimmedPhone.replace(/^0+/, "")}`;
      await signup(trimmedName, trimmedEmail, fullPhone, password);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Sign Up Failed", authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Cyan top ── */}
      <View style={[styles.topSection, { paddingTop: insets.top + 14 }]}>
        <View style={styles.topRow}>
          <View style={styles.iconBtn}>
            <Image source={WC_LOGO} style={styles.topLogo} resizeMode="contain" tintColor={NAVY} />
          </View>
          <Pressable style={styles.signInLink} onPress={() => router.replace("/auth/login")} hitSlop={10}>
            <Feather name="log-in" size={16} color={NAVY} />
            <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Sign Up</Text>
      </View>

      {/* ── Wave ── */}
      <Svg width="100%" height={70} viewBox="0 0 1440 320" preserveAspectRatio="none" style={styles.wave}>
        <Path
          d="M0,96L60,128C120,160,240,224,360,224C480,224,600,160,720,138.7C840,117,960,139,1080,160C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          fill={CYAN}
        />
      </Svg>

      {/* ── Dark form ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || 0) + 24, flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Kwame Mensah"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
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

            <Text style={[styles.label, { marginTop: 14 }]}>Phone number</Text>
            <View style={styles.field}>
              <View style={styles.dialBadge}>
                <Text style={styles.dialText}>{COUNTRY_CODE}</Text>
              </View>
              <TextInput
                style={[styles.input, { paddingLeft: 70 }]}
                placeholder="024 000 0000"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="next"
              />
            </View>

            <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
            <View style={styles.field}>
              <TextInput
                style={[styles.input, { paddingRight: 36 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="rgba(255,255,255,0.55)" />
              </Pressable>
            </View>

            <Text style={styles.terms}>
              By creating an account you agree to our{" "}
              <Text style={styles.termsLink}>Terms</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>

            <Pressable
              style={[styles.ctaWrap, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <LinearGradient
                colors={["#0EB5CA", "#5DDFEF", "#0EB5CA"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.ctaBorder}
              >
                <View style={styles.ctaInner}>
                  {loading ? (
                    <Text style={styles.ctaText}>Creating account…</Text>
                  ) : (
                    <>
                      <Feather name="user-plus" size={16} color="#FFFFFF" />
                      <Text style={styles.ctaText}>Create Account</Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </Pressable>

            <View style={styles.signinRow}>
              <Text style={styles.signinPrompt}>Already have an account?</Text>
              <Pressable onPress={() => router.replace("/auth/login")}>
                <Text style={styles.signinLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default React.memo(SignupScreen);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NAVY },

  topSection: {
    backgroundColor: CYAN,
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBtn: { width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" },
  topLogo: { width: 64, height: 28 },
  signInLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  signInText: { fontSize: 14, color: NAVY, fontFamily: "Inter_700Bold" },
  title: {
    fontSize: 36, color: NAVY, textAlign: "center",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.8,
    marginTop: 12, marginBottom: 4,
  },

  wave: { marginTop: -1 },

  scroll: { flex: 1, backgroundColor: NAVY },
  scrollContent: { paddingHorizontal: 28, paddingTop: 14 },

  label: {
    fontSize: 13, color: "rgba(255,255,255,0.65)",
    fontFamily: "Inter_500Medium", textAlign: "center",
    marginBottom: 6,
  },
  field: {
    height: 54, borderRadius: 27,
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
  dialBadge: {
    position: "absolute", left: 14, top: 0, bottom: 0,
    paddingHorizontal: 10, justifyContent: "center",
    backgroundColor: "rgba(14,181,202,0.18)",
    borderRadius: 18, marginVertical: 8,
  },
  dialText: { fontSize: 13, color: CYAN, fontFamily: "Inter_700Bold" },
  eyeBtn: {
    position: "absolute", right: 18, top: 0, bottom: 0,
    justifyContent: "center",
  },

  terms: {
    fontSize: 12, color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular", textAlign: "center",
    marginTop: 16, lineHeight: 18,
  },
  termsLink: { color: CYAN, fontFamily: "Inter_600SemiBold" },

  ctaWrap: { marginTop: 16, borderRadius: 30, overflow: "hidden" },
  ctaBorder: { padding: 1.5, borderRadius: 30 },
  ctaInner: {
    height: 53, borderRadius: 28.5,
    backgroundColor: NAVY,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
  },
  ctaText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },

  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 6, marginTop: 18,
  },
  signinPrompt: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  signinLink:   { fontSize: 13, color: CYAN, fontFamily: "Inter_700Bold" },
});
