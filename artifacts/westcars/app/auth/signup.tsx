import { Feather } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { authErrorMessage } from "@/services/firebase";
import { COUNTRY_CODE } from "@/utils/ghanaData";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WC_LOGO      = require("@/assets/images/wc-logo.png");
const WC_LOGO_FULL = require("@/assets/images/wc-logo-full.png");

function SignupScreen() {
  const { signup } = useApp();
  const insets = useSafeAreaInsets();
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [focused,      setFocused]      = useState<string | null>(null);

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
      const fullPhone = trimmedPhone.startsWith("+") ? trimmedPhone : `${COUNTRY_CODE}${trimmedPhone.replace(/^0+/, "")}`;
      await signup(trimmedName, trimmedEmail, fullPhone, password);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Sign Up Failed", authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const strength =
    password.length === 0 ? 0
    : password.length < 4 ? 1
    : password.length < 7 ? 2
    : password.length < 10 ? 3 : 4;

  const strengthColor = ["#E8E8E8","#E8192C","#FF8C00","#F5C400","#22C55E"][strength];
  const strengthLabel = ["","Weak","Fair","Good","Strong"][strength];

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
        {/* ── Hero ── */}
        <View style={[styles.hero, styles.heroWhite, { paddingTop: topPad + 14 }]}>
          {/* Badge + motto */}
          <View style={styles.brandCol}>
            <Image source={WC_LOGO} style={styles.heroBadge} resizeMode="contain" tintColor="#0EB5CA" />
            <Text style={styles.brandName}>WESTCARS</Text>
            <Text style={styles.brandSub}>Ghana's Trusted Car Marketplace</Text>
          </View>

          <Text style={styles.heroTitle}>Create account</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of buyers {"&"} sellers.{"\n"}List your car for free.
          </Text>
        </View>

        {/* ── White form sheet ── */}
        <View style={styles.sheet}>
          {/* Full name */}
          <InputField
            label="Full name"
            icon="user"
            placeholder="e.g. Kwame Mensah"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            keyboardType="default"
            returnKeyType="next"
            focused={focused === "name"}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />

          {/* Email */}
          <InputField
            label="Email address"
            icon="mail"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="next"
            focused={focused === "email"}
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />

          {/* Phone with country code */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone number</Text>
            <View style={[styles.row, focused === "phone" && styles.rowFocused]}>
              <View style={styles.dialBadge}>
                <Text style={styles.dialText}>{COUNTRY_CODE}</Text>
              </View>
              <View style={styles.sep} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="024 000 0000"
                placeholderTextColor="#C0C0C0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                blurOnSubmit={false}
                pointerEvents="auto"
                underlineColorAndroid="transparent"
                returnKeyType="next"
                onFocus={() => setFocused("phone")}
                onBlur={() => setFocused(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.row, focused === "pass" && styles.rowFocused]}>
              <Feather name="lock" size={16} color={focused === "pass" ? "#0EB5CA" : "#AAAAAA"} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor="#C0C0C0"
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
                onFocus={() => setFocused("pass")}
                onBlur={() => setFocused(null)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#AAAAAA" />
              </Pressable>
            </View>

            {/* Strength bar */}
            {password.length > 0 && (
              <View style={styles.strengthWrap}>
                {[1,2,3,4].map((n) => (
                  <View
                    key={n}
                    style={[
                      styles.strengthSeg,
                      { backgroundColor: n <= strength ? strengthColor : "#EEEEEE" },
                    ]}
                  />
                ))}
                <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                  {strengthLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Terms */}
          <Text style={styles.terms}>
            By creating an account you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* CTA button */}
          <Pressable
            style={[styles.cta, { backgroundColor: "#0EB5CA" }, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <View style={styles.ctaGrad}>
              {loading ? (
                <Text style={[styles.ctaText, { color: "#FFFFFF" }]}>Creating account…</Text>
              ) : (
                <>
                  <Text style={[styles.ctaText, { color: "#FFFFFF" }]}>Create account</Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </>
              )}
            </View>
          </Pressable>

          {/* Sign in link */}
          <View style={styles.signinRow}>
            <Text style={styles.signinPrompt}>Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.signinLink}>Sign in</Text>
            </Pressable>
          </View>

          {/* Trust badges */}
          <View style={styles.trustRow}>
            {["Secure & private", "Free to join", "Verified listings"].map((t) => (
              <View key={t} style={styles.trustPill}>
                <Feather name="check" size={11} color="#FFFFFF" />
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: (insets.bottom || 0) + 24 }} />
        </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default React.memo(SignupScreen);

/* ── Reusable field ── */
function InputField({
  label, icon, placeholder, value, onChangeText,
  autoCapitalize, keyboardType, returnKeyType,
  focused, onFocus, onBlur,
}: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, focused && styles.rowFocused]}>
        <Feather name={icon} size={16} color={focused ? "#0EB5CA" : "#AAAAAA"} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={false}
          pointerEvents="auto"
          underlineColorAndroid="transparent"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#EDF4F7" },

  /* Hero */
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 6,
  },
  heroWhite: { backgroundColor: "#FFFFFF" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  brandCol: { alignItems: "center", gap: 0, paddingVertical: 0 },
  heroBadge: { width: 200, height: 84 },
  brandName: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: "Inter_600SemiBold",
    color: "#0098AA",
    letterSpacing: 3,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: -4,
  },
  brandSub: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#0098AA",
    letterSpacing: 1.1,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: 1,
  },
  heroTitle: {
    fontSize: 32, fontFamily: "Inter_600SemiBold",
    color: "#0F172A", letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#64748B", lineHeight: 22,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    paddingVertical: 14,
    marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0F172A" },
  statLabel: {
    fontSize: 11, fontFamily: "Inter_400Regular",
    color: "#64748B",
  },

  /* Form sheet */
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 16,
  },

  fieldGroup: { gap: 7 },
  label: {
    fontSize: 11, fontFamily: "Inter_700Bold",
    color: "#64748B", letterSpacing: 0.6, textTransform: "uppercase",
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 54, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: "#F9F9F9",
  },
  rowFocused: {
    borderColor: "#0EB5CA", backgroundColor: "#fff",
    shadowColor: "#0EB5CA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  input: {
    flex: 1, fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#1A1A1A", padding: 0,
  },

  /* Phone prefix */
  dialBadge: {
    backgroundColor: "rgba(14,181,202,0.10)",
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  dialText: {
    fontSize: 13, fontFamily: "Inter_700Bold", color: "#0098AA",
  },
  sep: { width: 1, height: 22, backgroundColor: "#E0E0E0" },

  /* Password strength */
  strengthWrap: {
    flexDirection: "row", alignItems: "center",
    gap: 4, marginTop: 2,
  },
  strengthSeg: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold",
    minWidth: 36, textAlign: "right",
  },

  /* Terms */
  terms: {
    fontSize: 12, fontFamily: "Inter_400Regular",
    color: "#9E9E9E", textAlign: "center", lineHeight: 18,
  },
  termsLink: { color: "#0098AA", fontFamily: "Inter_600SemiBold" },

  /* CTA */
  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    height: 56, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  ctaText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  /* Sign in link */
  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 5,
  },
  signinPrompt: {
    fontSize: 14, fontFamily: "Inter_400Regular", color: "#9E9E9E",
  },
  signinLink: {
    fontSize: 14, fontFamily: "Inter_700Bold", color: "#0098AA",
  },

  /* Trust row */
  trustRow: {
    flexDirection: "row", justifyContent: "center",
    flexWrap: "wrap", gap: 8,
  },
  trustPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(14,181,202,0.10)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  trustText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "#0098AA" },

});
