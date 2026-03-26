import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
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

const FAQS = [
  { q: "How do I create an account?", a: "Tap 'Sign Up' from the login screen, enter your name, Ghana phone number (+233), email, and a password of at least 6 characters. After submitting, verify your phone via SMS to activate your account." },
  { q: "How do I sell a car?", a: "Tap the teal '+' button in the bottom navigation bar to access the Sell screen. Upload up to 8 photos of your car, fill in all details (brand, model, year, price, condition, description), and submit. Your listing will appear live after a brief review." },
  { q: "How do I verify my identity?", a: "Go to Profile → Settings → Verification Centre. Tap 'ID Verification', upload a clear photo of your Ghana Card or Passport, then take a selfie. Our partner Kora will verify your identity typically within minutes. Verified users receive a blue badge on their profile and listings." },
  { q: "Is it safe to buy a car on Westcars?", a: "Always meet in a safe, public location (e.g. a police station forecourt or busy car park), inspect the car thoroughly, request a test drive, and never pay any money before seeing the vehicle in person. Use our in-app chat — never share personal banking details through any channel." },
  { q: "How do I contact a seller?", a: "On any car listing, tap the 'Message' button to open an in-app chat, or tap 'Call' to phone the seller directly. Verified sellers are identified by a blue check-circle badge next to their name." },
  { q: "How do I report a suspicious listing?", a: "Tap the three-dot (⋮) menu icon at the top right of any listing and select 'Report Listing'. Alternatively, visit the seller's profile and tap 'Report User'. Our team reviews all reports within 24 hours." },
  { q: "What is the Trust Score?", a: "The Trust Score is a percentage (0–100%) calculated based on your level of verification (phone, ID, dealer), the number of completed sales, and the ratings you have received from other users. A higher score signals a more trustworthy seller to buyers." },
  { q: "How do I delete my account?", a: "Go to Profile → Settings → Account. Scroll to the bottom and select 'Delete Account'. Confirm your choice and your account, listings, messages, and all personal data will be permanently removed from Westcars within 30 days." },
  { q: "Can I post motorcycles?", a: "Yes! When creating a listing, select 'Moto' as the condition category. On the home screen, tap the 'Moto' tab to browse motorcycles separately from cars. Sub-categories include Motorcycle, Scooter, ATV / Quad, and Dirt Bike." },
  { q: "How do I enable dark mode?", a: "Go to Profile → Settings → Preferences. Toggle the 'Dark Mode' switch to enable or disable it. Your preference is saved automatically and applied across the entire app." },
  { q: "What payment methods are available?", a: "Payments are agreed directly between buyer and seller — Westcars does not process any payments. Common methods in Ghana include Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money), bank transfer, or cash on delivery. Always confirm the payment method before committing." },
  { q: "What if I receive a suspicious phone number in chat?", a: "Westcars will automatically display a warning in the chat if a phone number shared by a user differs from their registered listing number. Do not transact outside the app or send money to unverified numbers. Report any suspicious activity immediately." },
  { q: "How do I contact Westcars support?", a: `Email us at ${CONTACT_EMAIL} — include your account phone number and a brief description of your issue. You can also use the Help & Support section in your Profile. We typically respond within 1 business day.` },
];

function FAQItem({ item, isDark, colors }: { item: typeof FAQS[0]; isDark: boolean; colors: any }) {
  const [open, setOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.spring(anim, { toValue: next ? 1 : 0, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };

  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable style={styles.itemHeader} onPress={toggle}>
        <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Feather name="chevron-down" size={18} color="#0EB5CA" />
        </Animated.View>
      </Pressable>
      {open && (
        <View style={[styles.answerWrap, { borderTopColor: colors.border }]}>
          <Text style={[styles.answer, { color: colors.textSecondary }]}>{item.a}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

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
          <Text style={styles.headerTitle}>FAQ</Text>
          <Text style={styles.headerSub}>Frequently Asked Questions</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.count, { color: colors.textTertiary }]}>{filtered.length} questions</Text>

        {filtered.map((f, i) => (
          <FAQItem key={i} item={f} isDark={isDark} colors={colors} />
        ))}

        <View style={[styles.contactCard, { backgroundColor: "rgba(14,181,202,0.08)", borderColor: "rgba(14,181,202,0.25)" }]}>
          <Feather name="help-circle" size={22} color="#0EB5CA" />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Still have a question?</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>Our support team is ready to help.</Text>
            <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Westcars Support`)}>
              <Text style={styles.contactEmail}>{CONTACT_EMAIL}</Text>
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
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.75)", marginTop: 2 },
  scroll: { flex: 1 },
  body: { padding: 16, gap: 10 },
  count: { fontSize: 12, fontFamily: "Manrope_500Medium", marginBottom: 2 },
  item: {
    borderRadius: 16, borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  itemHeader: {
    flexDirection: "row", alignItems: "center",
    padding: 16, gap: 12,
  },
  question: { flex: 1, fontSize: 14, fontFamily: "Manrope_600SemiBold", lineHeight: 20 },
  answerWrap: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12, borderTopWidth: 1 },
  answer: { fontSize: 13, fontFamily: "Manrope_400Regular", lineHeight: 21 },
  contactCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 4,
  },
  contactTitle: { fontSize: 14, fontFamily: "Manrope_700Bold" },
  contactSub: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  contactEmail: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#0EB5CA", textDecorationLine: "underline" },
});
