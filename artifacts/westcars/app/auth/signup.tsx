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
import { useApp } from "@/context/AppContext";
import { COUNTRY_CODE } from "@/utils/ghanaData";
import { WestcarsBadge } from "@/components/WestcarsBadge";

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
        {/* ── Hero ── */}
        <View style={[styles.hero, styles.heroWhite, { paddingTop: topPad + 14 }]}>
          {/* Badge + motto */}
          <View style={styles.brandCol}>
            <WestcarsBadge size={150} textColor="#0F172A" />
            <Text style={styles.brandSub}>Ghana's Trusted Car Marketplace</Text>
          </View>

          <Text style={styles.heroTitle}>Create account</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of buyers &amp; sellers. List your car for free.
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

          {/* ── Admin / Support Access ── */}
          <Pressable
            style={styles.adminToggle}
            onPress={() => setShowAdminPanel(!showAdminPanel)}
          >
            <Feather name="settings" size={13} color="#9E9E9E" />
            <Text style={styles.adminToggleText}>Staff / Support Login</Text>
            <Feather name={showAdminPanel ? "chevron-up" : "chevron-down"} size={13} color="#9E9E9E" />
          </Pressable>

          {showAdminPanel && (
            <View style={styles.adminPanel}>
              <View style={styles.adminPanelHeader}>
                <View style={styles.adminBadge}>
                  <Feather name="shield" size={12} color="#fff" />
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
                <Text style={styles.adminPanelTitle}>Westcars Support Access</Text>
              </View>
              <Text style={styles.adminPanelSub}>
                Use these credentials to respond to user support messages and manage the marketplace.
              </Text>
              <View style={styles.adminCredRow}>
                <View style={styles.adminCredItem}>
                  <Text style={styles.adminCredLabel}>Email</Text>
                  <Text style={styles.adminCredVal}>admin@westcars.gh</Text>
                </View>
                <View style={styles.adminCredItem}>
                  <Text style={styles.adminCredLabel}>Password</Text>
                  <Text style={styles.adminCredVal}>any password</Text>
                </View>
              </View>
              <Pressable
                style={styles.adminAutoFill}
                onPress={() => router.replace("/auth/login")}
              >
                <Feather name="log-in" size={14} color="#0066CC" />
                <Text style={styles.adminAutoFillText}>Go to Login → Use credentials</Text>
              </Pressable>
            </View>
          )}

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
        <Feather name={icon} size={16} color={focused ? "#0EB5CA" : "#AAAAAA"} />
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
  root: { flex: 1, backgroundColor: "#EDF4F7" },

  /* Hero */
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  heroWhite: { backgroundColor: "#FFFFFF" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  brandCol: { alignItems: "center", gap: 6 },
  heroBadge: { width: 140, height: 140 },
  brandSub: {
    fontSize: 12, fontFamily: "Manrope_600SemiBold",
    color: "#0098AA", letterSpacing: 1.2, textAlign: "center",
  },
  heroTitle: {
    fontSize: 32, fontFamily: "Manrope_800ExtraBold",
    color: "#0F172A", letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14, fontFamily: "Manrope_400Regular",
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
  statValue: { fontSize: 20, fontFamily: "Manrope_700Bold", color: "#0F172A" },
  statLabel: {
    fontSize: 11, fontFamily: "Manrope_400Regular",
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
    fontSize: 11, fontFamily: "Manrope_700Bold",
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
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  input: {
    flex: 1, fontSize: 15,
    fontFamily: "Manrope_400Regular",
    color: "#1A1A1A", padding: 0,
  },

  /* Phone prefix */
  dialBadge: {
    backgroundColor: "rgba(14,181,202,0.10)",
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  dialText: {
    fontSize: 13, fontFamily: "Manrope_700Bold", color: "#0098AA",
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
  termsLink: { color: "#0098AA", fontFamily: "Manrope_600SemiBold" },

  /* CTA */
  cta: { borderRadius: 14, overflow: "hidden" },
  ctaGrad: {
    height: 56, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  ctaText: { fontSize: 16, fontFamily: "Manrope_700Bold" },

  /* Sign in link */
  signinRow: {
    flexDirection: "row", justifyContent: "center",
    alignItems: "center", gap: 5,
  },
  signinPrompt: {
    fontSize: 14, fontFamily: "Manrope_400Regular", color: "#9E9E9E",
  },
  signinLink: {
    fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0098AA",
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
  trustText: { fontSize: 11, fontFamily: "Manrope_500Medium", color: "#0098AA" },

  /* Admin panel */
  adminToggle: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, marginTop: 4, paddingVertical: 8,
  },
  adminToggleText: { fontSize: 12, color: "#BDBDBD", fontFamily: "Manrope_400Regular" },
  adminPanel: {
    borderRadius: 14, borderWidth: 1, borderColor: "#D0E4FF",
    backgroundColor: "#F0F7FF", padding: 16, gap: 10,
  },
  adminPanelHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#0EB5CA", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  adminBadgeText: { fontSize: 10, fontFamily: "Manrope_700Bold", color: "#FFFFFF", letterSpacing: 0.5 },
  adminPanelTitle: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0F172A" },
  adminPanelSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#64748B", lineHeight: 18 },
  adminCredRow: { flexDirection: "row", gap: 12 },
  adminCredItem: {
    flex: 1, backgroundColor: "#fff", borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(14,181,202,0.32)", padding: 10, gap: 2,
  },
  adminCredLabel: { fontSize: 10, fontFamily: "Manrope_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },
  adminCredVal: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: "#0F172A" },
  adminAutoFill: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    height: 40, backgroundColor: "#fff", borderRadius: 10,
    borderWidth: 1.5, borderColor: "rgba(14,181,202,0.45)",
  },
  adminAutoFillText: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#0098AA" },
});
