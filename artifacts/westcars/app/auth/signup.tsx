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

const WC_BADGE = require("@/assets/images/wc-badge.png");

export default function SignupScreen() {
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
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* ── Dark hero ── */}
        <LinearGradient
          colors={["#060C18", "#091529", "#0044AA"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: topPad + 14 }]}
        >
          {/* Back */}
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color="rgba(255,255,255,0.75)" />
          </Pressable>

          {/* Badge + brand */}
          <View style={styles.brandRow}>
            <Image source={WC_BADGE} style={styles.heroBadge} resizeMode="contain" />
            <View>
              <Text style={styles.brandName}>WESTCARS</Text>
              <Text style={styles.brandSub}>Ghana's Car Marketplace</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Create account</Text>
          <Text style={styles.heroSubtitle}>
            Join 50,000+ buyers &amp; sellers. List your car free.
          </Text>

          {/* Pill stats */}
          <View style={styles.statsRow}>
            {[
              { value: "Free", label: "To list" },
              { value: "50k+", label: "Members" },
              { value: "8",    label: "Regions" },
            ].map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

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
              <Feather name="lock" size={16} color={focused === "pass" ? "#0066CC" : "#AAAAAA"} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Min. 6 characters"
                placeholderTextColor="#C0C0C0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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
            style={[styles.cta, loading && { opacity: 0.7 }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <LinearGradient
              colors={["#0077EE", "#0050CC"]}
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
                <Feather name="check" size={11} color="#0066CC" />
                <Text style={styles.trustText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: (insets.bottom || 0) + 24 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
        <Feather name={icon} size={16} color={focused ? "#0066CC" : "#AAAAAA"} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#C0C0C0"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F4F8" },

  /* Hero */
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroBadge: { width: 52, height: 52, borderRadius: 12 },
  brandName: {
    fontSize: 22, fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF", letterSpacing: 3,
  },
  brandSub: {
    fontSize: 11, fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.5)", letterSpacing: 1,
    marginTop: 1,
  },
  heroTitle: {
    fontSize: 32, fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF", letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14, fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.65)", lineHeight: 22,
    marginTop: -4,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    marginTop: 4,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontFamily: "Manrope_700Bold", color: "#fff" },
  statLabel: {
    fontSize: 11, fontFamily: "Manrope_400Regular",
    color: "rgba(255,255,255,0.5)",
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
    fontSize: 11, fontFamily: "Manrope_700Bold",
    color: "#666", letterSpacing: 0.6, textTransform: "uppercase",
  },
  row: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 54, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 14, paddingHorizontal: 14,
    backgroundColor: "#F9F9F9",
  },
  rowFocused: {
    borderColor: "#0066CC", backgroundColor: "#fff",
    shadowColor: "#0066CC",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  input: {
    flex: 1, fontSize: 15,
    fontFamily: "Manrope_400Regular",
    color: "#1A1A1A", padding: 0,
  },

  /* Phone prefix */
  dialBadge: {
    backgroundColor: "#EDF4FF",
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  dialText: {
    fontSize: 13, fontFamily: "Manrope_700Bold", color: "#0055CC",
  },
  sep: { width: 1, height: 22, backgroundColor: "#E0E0E0" },

  /* Password strength */
  strengthWrap: {
    flexDirection: "row", alignItems: "center",
    gap: 4, marginTop: 2,
  },
  strengthSeg: { flex: 1, height: 3, borderRadius: 2 },
  strengthLabel: {
    fontSize: 11, fontFamily: "Manrope_600SemiBold",
    minWidth: 36, textAlign: "right",
  },

  /* Terms */
  terms: {
    fontSize: 12, fontFamily: "Manrope_400Regular",
    color: "#9E9E9E", textAlign: "center", lineHeight: 18,
  },
  termsLink: { color: "#0066CC", fontFamily: "Manrope_600SemiBold" },

  /* CTA */
  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    height: 56, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  ctaText: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#fff" },

  /* Sign in link */
  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 5,
  },
  signinPrompt: {
    fontSize: 14, fontFamily: "Manrope_400Regular", color: "#9E9E9E",
  },
  signinLink: {
    fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0066CC",
  },

  /* Trust row */
  trustRow: {
    flexDirection: "row", justifyContent: "center",
    flexWrap: "wrap", gap: 8,
  },
  trustPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#F0F7FF",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  trustText: { fontSize: 11, fontFamily: "Manrope_500Medium", color: "#0066CC" },
});
