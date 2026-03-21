import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = ["Reports", "Users", "Listings", "Analytics"] as const;
type Tab = typeof TABS[number];

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Feather name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { reports, cars, reviews } = useApp();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("Reports");

  const pending   = reports.filter((r) => r.status === "pending");
  const flaggedCars = cars.filter((c) => (c.reportCount || 0) > 0);
  const sold = cars.filter((c) => c.isSold);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: "#0A1628",
        paddingTop: (insets.top || (typeof window !== "undefined" ? 67 : 0)) + 10,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Westcars Control Centre</Text>
        </View>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: tab === t ? "#0066CC" : colors.textTertiary }]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>
        {/* ── Reports Tab ── */}
        {tab === "Reports" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Pending"  value={pending.length}   icon="alert-circle" color="#E53935" />
              <StatCard label="Total"    value={reports.length}   icon="flag"         color="#F59E0B" />
              <StatCard label="Listings" value={flaggedCars.length} icon="car"        color="#0066CC" />
            </View>

            {pending.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Feather name="check-circle" size={36} color="#22C55E" />
                <Text style={[styles.emptyText, { color: colors.text }]}>No pending reports</Text>
              </View>
            ) : (
              pending.map((r) => (
                <View key={r.id} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.reportTop}>
                    <View style={[styles.typePill, r.targetType === "listing" ? styles.typeListing : styles.typeUser]}>
                      <Text style={styles.typeText}>{r.targetType.toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.reportDate, { color: colors.textTertiary }]}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={[styles.reportReason, { color: colors.text }]}>{r.reason}</Text>
                  <Text style={[styles.reportId, { color: colors.textTertiary }]}>Target: {r.targetId}</Text>
                  <View style={styles.reportActions}>
                    <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#DCFCE7" }]}>
                      <Text style={[styles.actionBtnText, { color: "#16A34A" }]}>Dismiss</Text>
                    </Pressable>
                    <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}>
                      <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Remove Content</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── Users Tab ── */}
        {tab === "Users" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Dealers"   value={2}   icon="star"         color="#F59E0B" />
              <StatCard label="Verified"  value={3}   icon="shield"       color="#0066CC" />
              <StatCard label="Blocked"   value={0}   icon="slash"        color="#E53935" />
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Dealer Verification Requests</Text>
              <View style={styles.dealerRow}>
                <Text style={[styles.dealerName, { color: colors.text }]}>Accra Motors Ltd</Text>
                <View style={styles.dealerActions}>
                  <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#DCFCE7" }]}>
                    <Text style={[styles.actionBtnText, { color: "#16A34A" }]}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}>
                    <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Reject</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={[styles.subText, { color: colors.textTertiary }]}>Submitted 2 days ago · 12 listings</Text>
            </View>
          </>
        )}

        {/* ── Listings Tab ── */}
        {tab === "Listings" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Total"   value={cars.length}  icon="car"         color="#0066CC" />
              <StatCard label="Sold"    value={sold.length}  icon="check-circle" color="#22C55E" />
              <StatCard label="Flagged" value={flaggedCars.length} icon="flag"  color="#E53935" />
            </View>
            {flaggedCars.map((car) => (
              <View key={car.id} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.reportReason, { color: colors.text }]}>
                  {car.brand} {car.model} {car.year}
                </Text>
                <Text style={[styles.reportId, { color: colors.textTertiary }]}>
                  Reports: {car.reportCount} · {car.isHidden ? "Auto-hidden" : "Visible"}
                </Text>
                <View style={styles.reportActions}>
                  <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}>
                    <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Remove</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtnSmall, { backgroundColor: "#F3F4F6" }]}>
                    <Text style={[styles.actionBtnText, { color: "#4A4A4A" }]}>
                      {car.isHidden ? "Restore" : "Hide"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Analytics Tab ── */}
        {tab === "Analytics" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Listings" value={cars.length}   icon="list"       color="#0066CC" />
              <StatCard label="Reviews"  value={reviews.length} icon="star"      color="#F59E0B" />
              <StatCard label="Reports"  value={reports.length} icon="alert-triangle" color="#E53935" />
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Top Regions</Text>
              {["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast"].map((city, i) => (
                <View key={city} style={styles.regionRow}>
                  <Text style={[styles.regionName, { color: colors.text }]}>{city}</Text>
                  <View style={[styles.regionBar, { width: `${85 - i * 12}%` as any, backgroundColor: "#0066CC" + (Math.round(80 - i * 12)).toString(16) }]} />
                  <Text style={[styles.regionPct, { color: colors.textTertiary }]}>{85 - i * 12}%</Text>
                </View>
              ))}
            </View>
            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Top Categories</Text>
              {[["SUV", "38%"], ["Sedan", "24%"], ["Pickup", "18%"], ["Hatchback", "12%"], ["Other", "8%"]].map(([cat, pct]) => (
                <View key={cat} style={styles.regionRow}>
                  <Text style={[styles.regionName, { color: colors.text }]}>{cat}</Text>
                  <Text style={[styles.regionPct, { color: colors.accent }]}>{pct}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 16, gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.6)" },
  adminBadge: {
    marginLeft: "auto",
    backgroundColor: "#E53935",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  adminBadgeText: { fontSize: 11, fontFamily: "Manrope_700Bold", color: "#fff", letterSpacing: 1 },

  tabs: {
    flexDirection: "row", borderBottomWidth: 1,
  },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#0066CC" },
  tabText: { fontSize: 12, fontFamily: "Manrope_600SemiBold" },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12,
    alignItems: "center", gap: 4,
    borderLeftWidth: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 22, fontFamily: "Manrope_800ExtraBold", color: "#1A1A1A" },
  statLabel: { fontSize: 11, fontFamily: "Manrope_500Medium", color: "#9E9E9E" },

  emptyCard: {
    borderRadius: 14, padding: 32, alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  emptyText: { fontSize: 15, fontFamily: "Manrope_500Medium" },

  reportCard: {
    borderRadius: 12, padding: 14, gap: 8,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reportTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeListing: { backgroundColor: "#EDF4FF" },
  typeUser: { backgroundColor: "#FEF3C7" },
  typeText: { fontSize: 10, fontFamily: "Manrope_700Bold", color: "#4A4A4A" },
  reportDate: { fontSize: 11, fontFamily: "Manrope_400Regular", marginLeft: "auto" },
  reportReason: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  reportId: { fontSize: 11, fontFamily: "Manrope_400Regular" },
  reportActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtnSmall: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnText: { fontSize: 12, fontFamily: "Manrope_600SemiBold" },

  infoCard: {
    borderRadius: 14, padding: 16, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoTitle: { fontSize: 14, fontFamily: "Manrope_700Bold", marginBottom: 2 },
  dealerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dealerName: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  dealerActions: { flexDirection: "row", gap: 8 },
  subText: { fontSize: 12, fontFamily: "Manrope_400Regular" },

  regionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  regionName: { width: 80, fontSize: 13, fontFamily: "Manrope_500Medium" },
  regionBar: { height: 6, borderRadius: 3, flex: 1 },
  regionPct: { width: 36, fontSize: 12, fontFamily: "Manrope_500Medium", textAlign: "right" },
});
