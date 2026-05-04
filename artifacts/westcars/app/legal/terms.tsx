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
  { n: "1", title: "Acceptance of Terms", body: "By accessing or using the Westcars application, you confirm that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must not use our services." },
  { n: "2", title: "Eligibility", body: "You must be at least 18 years of age and a resident of Ghana to create an account and use Westcars. By registering, you represent and warrant that you meet these requirements." },
  { n: "3", title: "User Accounts", body: "You are fully responsible for all activity that occurs under your account. Keep your login credentials secure and notify us immediately if you suspect unauthorised access. Do not share your account with others." },
  { n: "4", title: "Listings", body: "Sellers must provide accurate, truthful information about vehicles listed on the platform. Misleading, fraudulent, or duplicate listings are strictly prohibited and may result in immediate account suspension or permanent ban." },
  { n: "5", title: "Transactions", body: "Westcars is a marketplace platform that connects buyers and sellers. We do not process, escrow, or facilitate payments between users. All financial transactions are solely between the buyer and the seller. Westcars bears no responsibility for payment disputes." },
  { n: "6", title: "Prohibited Activities", body: "The following are strictly prohibited: fraudulent or misleading listings, spam or unsolicited messages, posting illegal vehicles or content, price manipulation, identity impersonation, and any activity that violates Ghanaian law." },
  { n: "7", title: "Termination", body: "Westcars reserves the right to suspend or permanently terminate any account that violates these Terms, without prior notice. We may also remove any listing at our sole discretion." },
  { n: "8", title: "Disclaimer", body: "All vehicles are sold on an 'as is' basis. Westcars does not inspect, certify, or warrant any vehicle listed on the platform. Buyers are strongly advised to physically inspect the vehicle and conduct a test drive before any purchase." },
  { n: "9", title: "Limitation of Liability", body: "Westcars is not liable for any disputes, losses, or damages arising from transactions between users. We are not responsible for vehicle defects, fraud between parties, or failure to complete a transaction." },
  { n: "10", title: "Changes to Terms", body: "We may update these Terms of Service at any time. Significant changes will be communicated via in-app notification or email. Continued use of Westcars after changes have been posted constitutes your acceptance of the revised terms." },
];

export default function TermsScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={["#0EB5CA", "#0098AA"]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Terms of Service</Text>
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
          Please read these Terms carefully before using Westcars — Ghana's Trusted Car Marketplace.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.n} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numText}>{s.n}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{s.title}</Text>
            </View>
            <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{s.body}</Text>
          </View>
        ))}

        {/* Contact */}
        <View style={[styles.contactCard, { backgroundColor: "rgba(14,181,202,0.08)", borderColor: "rgba(14,181,202,0.25)" }]}>
          <Feather name="mail" size={20} color="#0EB5CA" />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Questions about these Terms?</Text>
            <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Terms of Service Enquiry`)}>
              <Text style={styles.contactEmail}>{CONTACT_EMAIL}</Text>
            </Pressable>
          </View>
        </View>

        {/* Accept Button */}
        <Pressable
          style={styles.acceptBtn}
          onPress={() => router.back()}
        >
          <LinearGradient colors={["#0EB5CA", "#0098AA"]} style={styles.acceptGrad}>
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.acceptText}>I Accept These Terms</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
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
  body: { padding: 16, gap: 12 },
  intro: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 20, marginBottom: 4 },
  section: {
    borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 10,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  numBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#0EB5CA", alignItems: "center", justifyContent: "center",
  },
  numText: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
  sectionTitle: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", flex: 1 },
  sectionBody: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 21 },
  contactCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 4,
  },
  contactTitle: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold" },
  contactEmail: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA", textDecorationLine: "underline" },
  acceptBtn: { marginTop: 8, borderRadius: 16, overflow: "hidden" },
  acceptGrad: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16,
  },
  acceptText: { fontSize: 16, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
});
