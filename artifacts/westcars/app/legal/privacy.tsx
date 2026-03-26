import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const CONTACT_EMAIL = "westcarsgh@gmail.com";

const SECTIONS = [
  {
    icon: "database" as const,
    color: "#7C3AED",
    bg: "#F3EEFF",
    title: "Information We Collect",
    items: [
      "Full name, phone number, and email address",
      "Location data (city / region)",
      "Government-issued ID documents (for verification)",
      "Selfie photos for identity verification",
      "In-app chat messages with other users",
      "Car listing data: photos, price, description, specs",
      "Device and usage analytics",
    ],
  },
  {
    icon: "settings" as const,
    color: "#0EB5CA",
    bg: "#E0F7FA",
    title: "How We Use Your Information",
    items: [
      "To create and manage your Westcars account",
      "To verify your identity and increase trust on the platform",
      "To display your car listings to potential buyers",
      "To facilitate in-app messaging between buyers and sellers",
      "To send you relevant notifications and updates",
      "To improve app features and user experience",
      "To detect and prevent fraud, spam, and abuse",
    ],
  },
  {
    icon: "lock" as const,
    color: "#16A34A",
    bg: "#DCFCE7",
    title: "Data Storage & Security",
    items: [
      "All data is stored securely using Firebase (Firestore & Storage)",
      "Data is encrypted in transit using TLS/SSL",
      "Access to user data is restricted to authorised personnel only",
      "We conduct regular security reviews of our systems",
      "ID documents are stored with additional encryption layers",
    ],
  },
  {
    icon: "link" as const,
    color: "#D97706",
    bg: "#FEF3C7",
    title: "Third-Party Services",
    items: [
      "Kora — used for identity verification; Kora's privacy policy applies",
      "Firebase (Google) — backend services; Google's privacy policy applies",
      "Expo / React Native — mobile app framework",
      "We do not sell your personal data to any third parties",
    ],
  },
  {
    icon: "user-check" as const,
    color: "#1565C0",
    bg: "#EDF4FF",
    title: "Your Rights",
    items: [
      "Request a copy of all personal data we hold about you",
      "Request correction of inaccurate personal information",
      "Request deletion of your account and associated data",
      "Withdraw consent for data processing at any time",
      "To exercise these rights, email us at westcarsgh@gmail.com",
    ],
  },
  {
    icon: "bar-chart-2" as const,
    color: "#E8192C",
    bg: "#FFEDEE",
    title: "Cookies & Analytics",
    items: [
      "We use anonymous usage analytics to understand how the app is used",
      "No personally identifiable cookies are used for advertising",
      "You can opt out of analytics in your Profile → Settings",
    ],
  },
];

export default function PrivacyScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>Last updated: March 2026</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Your privacy matters. This policy explains what data Westcars collects, why we collect it, and how we protect it.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : s.bg }]}>
                <Feather name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{s.title}</Text>
            </View>
            <View style={styles.itemList}>
              {s.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={[styles.dot, { backgroundColor: s.color }]} />
                  <Text style={[styles.itemText, { color: colors.textSecondary }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={[styles.contactCard, { backgroundColor: "rgba(14,181,202,0.08)", borderColor: "rgba(14,181,202,0.25)" }]}>
          <Feather name="mail" size={20} color="#0EB5CA" />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Privacy concerns or data requests?</Text>
            <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Privacy Policy Enquiry`)}>
              <Text style={styles.contactEmail}>{CONTACT_EMAIL}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          We will notify all users of any significant changes to this policy via in-app notification or email before they take effect.
        </Text>
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
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 12 },
  intro: { fontSize: 13, fontFamily: "Manrope_400Regular", lineHeight: 20, marginBottom: 4 },
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", flex: 1 },
  itemList: { gap: 8 },
  itemRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  itemText: { fontSize: 13, fontFamily: "Manrope_400Regular", lineHeight: 20, flex: 1 },
  contactCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16,
  },
  contactTitle: { fontSize: 13, fontFamily: "Manrope_600SemiBold" },
  contactEmail: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#0EB5CA", textDecorationLine: "underline" },
  footer: { fontSize: 12, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 18, marginTop: 4 },
});
