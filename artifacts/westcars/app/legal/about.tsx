import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
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
const APP_VERSION   = "2.0.0";
const WC_LOGO = require("@/assets/images/wc-logo.png");

const FEATURES = [
  { icon: "user-check" as const, label: "Verified Sellers", desc: "ID verification powered by Kora" },
  { icon: "message-square" as const, label: "In-App Chat", desc: "Secure messaging with all sellers" },
  { icon: "star" as const, label: "Ratings & Reviews", desc: "Trust-based seller ratings system" },
  { icon: "moon" as const, label: "Dark / Light Mode", desc: "Comfortable viewing any time of day" },
  { icon: "truck" as const, label: "Motorcycle Listings", desc: "Browse and list motorcycles & moto" },
  { icon: "shield" as const, label: "Trust Score", desc: "Transparency for every seller" },
];

const SOCIALS = [
  { icon: "instagram" as const, label: "Instagram", color: "#E1306C", url: "https://instagram.com/westcarsgh" },
  { icon: "facebook" as const, label: "Facebook", color: "#1877F2", url: "https://facebook.com/westcarsgh" },
  { icon: "twitter" as const, label: "Twitter / X", color: "#1DA1F2", url: "https://twitter.com/westcarsgh" },
];

export default function AboutScreen() {
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
          <Text style={styles.headerTitle}>About Westcars</Text>
          <Text style={styles.headerSub}>v{APP_VERSION}</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero */}
        <LinearGradient
          colors={isDark ? ["#0B2030", "#0F2840"] : ["#FFFFFF", "#F4FBFC"]}
          style={styles.brandHero}
        >
          <Image source={WC_LOGO} style={styles.logo} resizeMode="contain" tintColor="#0EB5CA" />
          <Text style={[styles.tagline, { color: "#0098AA" }]}>Ghana's Trusted Car Marketplace</Text>
          <View style={[styles.versionBadge, { backgroundColor: "rgba(14,181,202,0.15)" }]}>
            <Text style={styles.versionText}>Version {APP_VERSION}</Text>
          </View>
        </LinearGradient>

        {/* Description */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="info" size={18} color="#0EB5CA" />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>What is Westcars?</Text>
            <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
              Westcars connects car buyers and sellers across Ghana. Whether you are looking for a brand-new vehicle,
              a foreign-used import, a budget Tokunbo, or a motorcycle — Westcars makes it safe, fast, and easy to find
              your perfect vehicle.
            </Text>
          </View>
        </View>

        {/* Mission */}
        <View style={[styles.missionCard, { borderColor: "rgba(14,181,202,0.3)" }]}>
          <LinearGradient colors={["rgba(14,181,202,0.12)", "rgba(0,152,170,0.08)"]} style={styles.missionGrad}>
            <Feather name="target" size={22} color="#0EB5CA" />
            <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
            <Text style={[styles.missionBody, { color: colors.textSecondary }]}>
              To make car buying and selling in Ghana safe, transparent, and convenient — connecting every Ghanaian
              to the vehicle they deserve.
            </Text>
          </LinearGradient>
        </View>

        {/* Features */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FEATURES</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
                <Feather name={f.icon} size={18} color="#0EB5CA" />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>{f.label}</Text>
              <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* Contact */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONTACT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="mail" size={18} color="#0EB5CA" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Support & General Enquiries</Text>
            <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Westcars Enquiry`)}>
              <Text style={styles.emailLink}>{CONTACT_EMAIL}</Text>
            </Pressable>
            <Text style={[styles.cardBody, { color: colors.textTertiary }]}>Response within 1 business day</Text>
          </View>
        </View>

        {/* Social Links */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FOLLOW US</Text>
        <View style={styles.socialsRow}>
          {SOCIALS.map((s) => (
            <Pressable
              key={s.label}
              style={[styles.socialBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Linking.openURL(s.url)}
            >
              <Feather name={s.icon} size={20} color={s.color} />
              <Text style={[styles.socialLabel, { color: colors.text }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Rate Us */}
        <Pressable
          style={styles.rateBtn}
          onPress={() => Alert.alert("Rate Us", "Thank you! Opening the app store…")}
        >
          <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.rateGrad}>
            <Feather name="star" size={18} color="#fff" />
            <Text style={styles.rateText}>Rate Westcars ★★★★★</Text>
          </LinearGradient>
        </Pressable>

        {/* Credits */}
        <Text style={[styles.credits, { color: colors.textTertiary }]}>
          Built with React Native, Expo, Firebase & Kora{"\n"}Made with ❤️ for Ghana
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
  headerTitle: { fontSize: 18, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 12 },

  brandHero: {
    borderRadius: 20, padding: 28,
    alignItems: "center", gap: 6,
  },
  logo: { width: 160, height: 160 },
  tagline: { fontSize: 10, fontFamily: "PlusJakartaSans_600SemiBold", letterSpacing: 1, textAlign: "center" },
  versionBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4 },
  versionText: { fontSize: 12, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA" },

  card: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardTitle: { fontSize: 14, fontFamily: "PlusJakartaSans_700Bold" },
  cardBody: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 20 },

  missionCard: { borderRadius: 16, borderWidth: 1.5, overflow: "hidden" },
  missionGrad: { padding: 20, alignItems: "center", gap: 8 },
  missionTitle: { fontSize: 16, fontFamily: "PlusJakartaSans_700Bold" },
  missionBody: { fontSize: 13, fontFamily: "PlusJakartaSans_400Regular", textAlign: "center", lineHeight: 20 },

  sectionLabel: { fontSize: 11, fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 1, marginTop: 4 },
  featuresGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  featureCard: {
    width: "47%", borderRadius: 14, borderWidth: 1, padding: 14, gap: 6,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 13, fontFamily: "PlusJakartaSans_700Bold" },
  featureDesc: { fontSize: 11, fontFamily: "PlusJakartaSans_400Regular", lineHeight: 16 },

  emailLink: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA", textDecorationLine: "underline" },

  socialsRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 14,
    alignItems: "center", gap: 6,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  socialLabel: { fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold" },

  rateBtn: { borderRadius: 14, overflow: "hidden" },
  rateGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15 },
  rateText: { fontSize: 15, fontFamily: "PlusJakartaSans_700Bold", color: "#fff" },

  credits: { fontSize: 12, fontFamily: "PlusJakartaSans_400Regular", textAlign: "center", lineHeight: 20 },
});
