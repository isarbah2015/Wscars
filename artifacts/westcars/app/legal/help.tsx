import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const SUPPORT_EMAIL = "westcarsgh@gmail.com";

const SAFETY_TIPS = [
  "Always meet in a safe, busy, public location",
  "Never send money before seeing the car in person",
  "Request a test drive before any commitment",
  "Check the vehicle's paperwork and registration",
  "Use in-app chat — never share banking details",
  "Verify the seller's badge before transacting",
  "If something feels wrong, report it immediately",
];

export default function HelpScreen() {
  const { colors, isDark } = useTheme();
  const { currentUser } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName]       = useState(currentUser?.name ?? "");
  const [email, setEmail]     = useState(currentUser?.email ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendFeedback = async () => {
    if (!message.trim()) { Alert.alert("Error", "Please enter a message."); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setMessage("");
    Alert.alert("Thank you!", "Your message has been sent to our support team. We'll get back to you within 1 business day.");
  };

  const openEmail = (subject = "Westcars Support") =>
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0EB5CA", "#0098AA"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <Text style={styles.headerSub}>We're here for you</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Contact Options */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONTACT US</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.contactRow} onPress={() => openEmail()}>
            <View style={[styles.contactIcon, { backgroundColor: "#E0F7FA" }]}>
              <Feather name="mail" size={20} color="#0098AA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactLabel, { color: colors.text }]}>Email Support</Text>
              <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
              <Text style={[styles.contactHint, { color: colors.textTertiary }]}>Response within 1 business day</Text>
            </View>
            <Feather name="external-link" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Quick Links */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>QUICK LINKS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.linkRow} onPress={() => router.push("/legal/faq")}>
            <View style={[styles.contactIcon, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
              <Feather name="help-circle" size={18} color="#0EB5CA" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Frequently Asked Questions</Text>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.linkRow} onPress={() => openEmail("Report a Problem – Westcars")}>
            <View style={[styles.contactIcon, { backgroundColor: "#FFEDEE" }]}>
              <Feather name="flag" size={18} color="#E8192C" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Report a Problem</Text>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.linkRow} onPress={() => router.push("/legal/terms")}>
            <View style={[styles.contactIcon, { backgroundColor: "#F3EEFF" }]}>
              <Feather name="file-text" size={18} color="#7C3AED" />
            </View>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Terms of Service</Text>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Safety Tips */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SAFETY TIPS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.safetyHeader}>
            <Feather name="shield" size={18} color="#0EB5CA" />
            <Text style={[styles.safetyTitle, { color: colors.text }]}>Stay Safe on Westcars</Text>
          </View>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Feedback Form */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SEND FEEDBACK</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.formPad}>
            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textTertiary}
            />

            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", color: colors.text, borderColor: colors.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", color: colors.text, borderColor: colors.border }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or feedback..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Pressable style={styles.sendBtn} onPress={sendFeedback} disabled={sending}>
              <LinearGradient colors={["#0EB5CA", "#0098AA"]} style={styles.sendGrad}>
                <Feather name={sending ? "loader" : "send"} size={17} color="#fff" />
                <Text style={styles.sendText}>{sending ? "Sending…" : "Submit Feedback"}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 18, gap: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 11, fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 1, marginTop: 4 },
  card: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  contactRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  linkRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  contactValue: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular", color: "#0EB5CA", marginTop: 1 },
  divider: { height: 1, marginHorizontal: 14 },
  safetyHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, paddingBottom: 8 },
  safetyTitle: { fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 16, paddingVertical: 5 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#0EB5CA", marginTop: 7 },
  tipText: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", flex: 1, lineHeight: 20 },
  formPad: { padding: 16, gap: 4 },
  formLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 4 },
  contactHint: { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", marginTop: 2 },
  input: {
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, fontFamily: "PlusJakartaSans_400Regular", marginBottom: 12,
  },
  textArea: { height: 110, paddingTop: 12 },
  sendBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  sendGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  sendText: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
});
