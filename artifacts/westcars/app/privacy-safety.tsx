import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const SAFETY_TIPS = [
  { icon: "map-pin" as const, color: "#22C55E", title: "Meet in public", tip: "Always meet in a busy, public location such as a police station forecourt or a busy car park." },
  { icon: "dollar-sign" as const, color: "#E8192C", title: "Never pay first", tip: "Never send any money before seeing and inspecting the car in person. No genuine seller requires upfront payment." },
  { icon: "navigation" as const, color: "#0EB5CA", title: "Test drive first", tip: "Always request a test drive before committing. A seller who refuses a test drive is a red flag." },
  { icon: "file-text" as const, color: "#F59E0B", title: "Check documents", tip: "Verify the vehicle registration, DVLA documents, and that the chassis number matches the papers." },
  { icon: "message-square" as const, color: "#7C3AED", title: "Use in-app chat", tip: "Keep all communication inside the Westcars app. Never share bank account details or send money via chat." },
  { icon: "user-check" as const, color: "#0066CC", title: "Check the badge", tip: "Look for the blue verified badge on the seller's profile. Verified sellers have passed Kora identity checks." },
  { icon: "flag" as const, color: "#DC2626", title: "Report suspicious listings", tip: "Tap the three-dot menu on any listing and select 'Report Listing'. All reports are reviewed within 24 hours." },
];

export default function PrivacySafetyScreen() {
  const { colors, isDark } = useTheme();
  const { blockedUsers, unblockUser } = useApp();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);

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
          <Text style={styles.headerTitle}>Privacy & Safety</Text>
          <Text style={styles.headerSub}>Stay safe on Westcars</Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Blocked Users */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>BLOCKED USERS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {blockedUsers.length === 0 ? (
            <View style={styles.emptyBlock}>
              <View style={[styles.emptyIcon, { backgroundColor: "rgba(14,181,202,0.10)" }]}>
                <Feather name="slash" size={22} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Blocked Users</Text>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                Users you block will appear here. You can unblock them at any time.
              </Text>
            </View>
          ) : (
            <>
              <Text style={[styles.blockedCount, { color: colors.textSecondary }]}>
                {blockedUsers.length} user{blockedUsers.length !== 1 ? "s" : ""} blocked
              </Text>
              {blockedUsers.map((userId) => (
                <View key={userId} style={[styles.blockedRow, { borderTopColor: colors.border }]}>
                  <View style={[styles.blockedAvatar, { backgroundColor: colors.background }]}>
                    <Feather name="user" size={16} color={colors.textTertiary} />
                  </View>
                  <Text style={[styles.blockedId, { color: colors.text }]}>User {userId.slice(0, 8)}...</Text>
                  <Pressable
                    style={styles.unblockBtn}
                    onPress={() => {
                      Alert.alert("Unblock User", "Unblocking will allow this user to message you and see your listings.", [
                        { text: "Cancel", style: "cancel" },
                        { text: "Unblock", onPress: () => unblockUser(userId) },
                      ]);
                    }}
                  >
                    <Text style={styles.unblockText}>Unblock</Text>
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Safety Checklist */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SAFETY CHECKLIST</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: "hidden" }]}>
          {SAFETY_TIPS.map((tip, i) => (
            <Pressable
              key={i}
              style={[styles.tipRow, i < SAFETY_TIPS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              onPress={() => setExpanded(expanded === i ? null : i)}
            >
              <View style={[styles.tipIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }]}>
                <Feather name={tip.icon} size={17} color={tip.color} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.tipTitle, { color: colors.text }]}>{tip.title}</Text>
                {expanded === i && (
                  <Text style={[styles.tipBody, { color: colors.textSecondary }]}>{tip.tip}</Text>
                )}
              </View>
              <Feather
                name={expanded === i ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textTertiary}
              />
            </Pressable>
          ))}
        </View>

        {/* Privacy controls */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PRIVACY CONTROLS</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 0, overflow: "hidden" }]}>
          <Pressable
            style={[styles.privRow]}
            onPress={() => Alert.alert("Data Export", "We will prepare a copy of all your Westcars data and email it to your registered address within 48 hours.\n\nContact westcarsgh@gmail.com to request your data.")}
          >
            <View style={[styles.privIcon, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
              <Feather name="download" size={17} color="#0EB5CA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.privTitle, { color: colors.text }]}>Request My Data</Text>
              <Text style={[styles.privSub, { color: colors.textTertiary }]}>Download a copy of your Westcars data</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable
            style={styles.privRow}
            onPress={() => router.push("/legal/privacy")}
          >
            <View style={[styles.privIcon, { backgroundColor: "rgba(22,163,74,0.12)" }]}>
              <Feather name="lock" size={17} color="#16A34A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.privTitle, { color: colors.text }]}>Privacy Policy</Text>
              <Text style={[styles.privSub, { color: colors.textTertiary }]}>How we handle your data</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Pressable
            style={styles.privRow}
            onPress={() => Alert.alert(
              "Delete Account",
              "This will permanently delete your account, listings, messages, and all personal data. This cannot be undone.\n\nTo proceed, email westcarsgh@gmail.com with the subject 'Delete Account Request'.",
              [{ text: "OK" }]
            )}
          >
            <View style={[styles.privIcon, { backgroundColor: "rgba(232,25,44,0.10)" }]}>
              <Feather name="trash-2" size={17} color="#E8192C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.privTitle, { color: "#E8192C" }]}>Delete Account</Text>
              <Text style={[styles.privSub, { color: colors.textTertiary }]}>Permanently remove all your data</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.textTertiary} />
          </Pressable>
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
  sectionLabel: { fontSize: 11, fontFamily: "Manrope_700Bold", letterSpacing: 1, marginTop: 4 },
  card: {
    borderRadius: 16, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  emptyBlock: { padding: 28, alignItems: "center", gap: 10 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 15, fontFamily: "Manrope_700Bold" },
  emptyText: { fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
  blockedCount: { fontSize: 12, fontFamily: "Manrope_500Medium", padding: 14, paddingBottom: 0 },
  blockedRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: 1 },
  blockedAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  blockedId: { flex: 1, fontSize: 13, fontFamily: "Manrope_500Medium" },
  unblockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "rgba(14,181,202,0.12)" },
  unblockText: { fontSize: 12, fontFamily: "Manrope_700Bold", color: "#0EB5CA" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  tipIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  tipTitle: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  tipBody: { fontSize: 12, fontFamily: "Manrope_400Regular", lineHeight: 18 },
  privRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  privIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  privTitle: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  privSub: { fontSize: 11, fontFamily: "Manrope_400Regular" },
  divider: { height: 1, marginHorizontal: 14 },
});
