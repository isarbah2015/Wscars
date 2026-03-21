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
import { useApp } from "@/context/AppContext";
import { COUNTRY_CODE } from "@/utils/ghanaData";

const LOGO = require("@/assets/images/logo-wordmark.png");

const BENEFITS = [
  { icon: "check-circle", text: "List & sell your car for free" },
  { icon: "shield",       text: "Verified buyer community" },
  { icon: "bell",         text: "Instant alerts on new listings" },
];

export default function SignupScreen() {
  const { signup } = useApp();
  const insets = useSafeAreaInsets();
  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [phone,         setPhone]         = useState("");
  const [password,      setPassword]      = useState("");
  const [showPassword,  setShowPassword]  = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [focusedField,  setFocusedField]  = useState<string | null>(null);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const fullPhone = phone.startsWith("+") ? phone : `${COUNTRY_CODE}${phone}`;
    const ok = await signup(name.trim(), email.trim(), fullPhone, password);
    setLoading(false);
    if (ok) router.replace("/(tabs)");
  };

  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── Dark hero header ── */}
      <LinearGradient
        colors={["#070D1A", "#0A1628", "#003D99"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topPad + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>

        {/* White wordmark */}
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          tintColor="#ffffff"
        />
        <Text style={styles.logoSub}>Ghana's Car Marketplace</Text>

        <Text style={styles.heroTitle}>Create your account</Text>
        <Text style={styles.heroSub}>
          Join 50,000+ buyers & sellers across Ghana
        </Text>

        {/* Benefits strip */}
        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefitItem}>
              <Feather name={b.icon as any} size={14} color="#4DB3FF" />
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* ── Form card ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Your details</Text>

          {/* Full name */}
          <Field
            label="Full name"
            icon="user"
            placeholder="Kwame Mensah"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            focused={focusedField === "name"}
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Email */}
          <Field
            label="Email address"
            icon="mail"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            focused={focusedField === "email"}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
          />

          {/* Phone */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Phone number</Text>
            <View style={[styles.field, focusedField === "phone" && styles.fieldFocused]}>
              <View style={styles.dialCode}>
                <Text style={styles.dialCodeText}>{COUNTRY_CODE}</Text>
              </View>
              <View style={styles.dividerV} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="024 000 0000"
                placeholderTextColor="#BDBDBD"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="next"
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.field, focusedField === "pass" && styles.fieldFocused]}>
              <Feather name="lock" size={16} color={focusedField === "pass" ? "#0066CC" : "#9E9E9E"} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor="#BDBDBD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                onFocus={() => setFocusedField("pass")}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#9E9E9E" />
              </Pressable>
            </View>
          </View>

          {/* Password strength hint */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1,2,3,4].map((n) => (
                <View
                  key={n}
                  style={[
                    styles.strengthBar,
                    { backgroundColor:
                        password.length >= n * 3
                          ? n <= 1 ? "#E8192C"
                          : n <= 2 ? "#FF8C00"
                          : n <= 3 ? "#F5C400"
                          : "#22C55E"
                          : "#E8E8E8"
                    }
                  ]}
                />
              ))}
              <Text style={styles.strengthLabel}>
                {password.length < 4 ? "Weak" : password.length < 7 ? "Fair" : password.length < 10 ? "Good" : "Strong"}
              </Text>
            </View>
          )}

          <Text style={styles.terms}>
            By creating an account you agree to our{" "}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {" "}and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* CTA */}
          <Pressable
            style={[styles.cta, loading && { opacity: 0.72 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0077EE", "#0055BB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGrad}
            >
              {loading ? (
                <Text style={styles.ctaText}>Creating account…</Text>
              ) : (
                <>
                  <Text style={styles.ctaText}>Create account</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.signInRow}>
            <Text style={styles.signInPrompt}>Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.signInLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>

        {/* Trust badges */}
        <View style={styles.trustRow}>
          {[
            { icon: "shield",       label: "Secure" },
            { icon: "lock",         label: "Private" },
            { icon: "check-circle", label: "Free to join" },
          ].map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Feather name={t.icon as any} size={14} color="#BDBDBD" />
              <Text style={styles.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: (insets.bottom || 0) + 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ── Reusable field component ── */
function Field({
  label, icon, placeholder, value, onChangeText,
  keyboardType, autoCapitalize, returnKeyType,
  focused, onFocus, onBlur,
}: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Feather name={icon} size={16} color={focused ? "#0066CC" : "#9E9E9E"} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          returnKeyType={returnKeyType || "next"}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  /* Hero */
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 26,
    gap: 10,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  logo: { width: 200, height: 40 },
  logoSub: {
    fontSize: 10, fontFamily: "Manrope_500Medium",
    color: "rgba(255,255,255,0.45)", letterSpacing: 2,
    textTransform: "uppercase", marginTop: -4,
  },
  heroTitle: {
    fontSize: 28, fontFamily: "Manrope_800ExtraBold",
    color: "#fff", letterSpacing: -0.6, marginTop: 4,
  },
  heroSub: {
    fontSize: 13, fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.6)", lineHeight: 20,
  },
  benefits: {
    gap: 7, marginTop: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  benefitItem: { flexDirection: "row", alignItems: "center", gap: 9 },
  benefitText: {
    fontSize: 13, fontFamily: "Manrope_500Medium",
    color: "rgba(255,255,255,0.78)",
  },

  /* Scroll / card */
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  formCard: {
    backgroundColor: "#fff", borderRadius: 20, padding: 24, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 16, elevation: 5,
  },
  formTitle: {
    fontSize: 20, fontFamily: "Manrope_700Bold", color: "#1A1A1A",
    marginBottom: 2,
  },

  /* Fields */
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Manrope_600SemiBold",
    color: "#6B6B6B", letterSpacing: 0.5, textTransform: "uppercase",
  },
  field: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 52, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 12, paddingHorizontal: 14, backgroundColor: "#FAFAFA",
  },
  fieldFocused: {
    borderColor: "#0066CC", backgroundColor: "#fff",
    shadowColor: "#0066CC", shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14, shadowRadius: 6, elevation: 2,
  },
  input: {
    flex: 1, fontSize: 15, color: "#1A1A1A",
    fontFamily: "Manrope_400Regular", padding: 0,
  },

  /* Phone prefix */
  dialCode: {
    backgroundColor: "#EEF5FF",
    borderRadius: 7, paddingHorizontal: 9, paddingVertical: 5,
  },
  dialCodeText: {
    fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#0066CC",
  },
  dividerV: {
    width: 1, height: 22,
    backgroundColor: "#E0E0E0", marginHorizontal: 2,
  },

  /* Password strength */
  strengthRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: -6,
  },
  strengthBar: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: {
    fontSize: 11, fontFamily: "Manrope_500Medium",
    color: "#9E9E9E", marginLeft: 4, minWidth: 38,
  },

  /* Terms */
  terms: {
    fontSize: 12, fontFamily: "Manrope_400Regular",
    color: "#9E9E9E", lineHeight: 18, textAlign: "center",
  },
  termsLink: { color: "#0066CC", fontFamily: "Manrope_600SemiBold" },

  /* CTA */
  cta: { borderRadius: 12, overflow: "hidden", marginTop: 2 },
  ctaGrad: {
    height: 52, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  ctaText: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#fff" },

  /* Sign-in link */
  signInRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 5,
  },
  signInPrompt: {
    fontSize: 13, color: "#9E9E9E", fontFamily: "Manrope_400Regular",
  },
  signInLink: {
    fontSize: 13, color: "#0066CC", fontFamily: "Manrope_700Bold",
  },

  /* Trust row */
  trustRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 22, marginTop: 20,
  },
  trustItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  trustLabel: { fontSize: 11, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },
});
