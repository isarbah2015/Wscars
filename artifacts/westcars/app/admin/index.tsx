import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

const TABS = ["Reports", "Users", "Listings", "Analytics"] as const;
type Tab = typeof TABS[number];

function StatCard({ label, value, icon, color }: {
  label: string; value: number | string; icon: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Feather name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const MOCK_DEALERS = [
  { name: "Accra Motors Ltd",    submitted: "2 days ago", listings: 12, approved: false },
  { name: "Kumasi Auto Centre",  submitted: "5 days ago", listings: 7,  approved: false },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { reports, cars, reviews, currentUser, dismissReport, resolveReport, toggleCarVisibility, deleteCar } = useApp();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("Reports");
  const [dealers, setDealers] = useState(MOCK_DEALERS);

  const isAdmin = currentUser?.isAdmin === true;

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert("Access Denied", "This area is restricted to admins.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [isAdmin]);

  if (!isAdmin) return null;

  const pending     = reports.filter((r) => r.status === "pending");
  const resolved    = reports.filter((r) => r.status === "reviewed" || r.status === "dismissed");
  const flaggedCars = cars.filter((c) => (c.reportCount || 0) > 0);
  const hiddenCars  = cars.filter((c) => c.isHidden);
  const sold        = cars.filter((c) => c.isSold);

  const handleDismiss = (reportId: string) => {
    Alert.alert("Dismiss Report", "Mark this report as dismissed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Dismiss", onPress: () => dismissReport(reportId) },
    ]);
  };

  const handleRemoveContent = (reportId: string, carTitle: string) => {
    Alert.alert(
      "Remove Content",
      `This will permanently remove the listing "${carTitle}" and resolve the report.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => resolveReport(reportId, "remove") },
      ]
    );
  };

  const handleToggleVisibility = (carId: string, isHidden: boolean | undefined, title: string) => {
    const action = isHidden ? "Restore" : "Hide";
    Alert.alert(`${action} Listing`, `${action} "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: action, onPress: () => toggleCarVisibility(carId) },
    ]);
  };

  const handleDeleteListing = (carId: string, title: string) => {
    Alert.alert("Delete Listing", `Permanently delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteCar(carId) },
    ]);
  };

  const handleDealerApproval = (idx: number, approve: boolean) => {
    const dealer = dealers[idx];
    Alert.alert(
      approve ? "Approve Dealer" : "Reject Application",
      `${approve ? "Approve" : "Reject"} ${dealer.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: approve ? "Approve" : "Reject",
          style: approve ? "default" : "destructive",
          onPress: () =>
            setDealers((prev) =>
              prev.map((d, i) => i === idx ? { ...d, approved: approve } : d)
            ),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, {
        paddingTop: (insets.top || (typeof window !== "undefined" ? 67 : 0)) + 10,
      }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>Westcars Control Centre</Text>
        </View>
        <View style={styles.adminBadge}>
          <Feather name="shield" size={11} color="#fff" />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {TABS.map((t) => {
          const count = t === "Reports" ? pending.length : t === "Listings" ? flaggedCars.length : undefined;
          return (
            <Pressable key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, { color: tab === t ? "#0EB5CA" : colors.textTertiary }]}>{t}</Text>
              {!!count && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{count}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 80 }}>

        {/* ── Reports Tab ── */}
        {tab === "Reports" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Pending"  value={pending.length}   icon="alert-circle"  color="#E53935" />
              <StatCard label="Resolved" value={resolved.length}  icon="check-circle"  color="#22C55E" />
              <StatCard label="Flagged"  value={flaggedCars.length} icon="flag"        color="#F59E0B" />
            </View>

            {pending.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Feather name="check-circle" size={36} color="#22C55E" />
                <Text style={[styles.emptyText, { color: colors.text }]}>All clear — no pending reports</Text>
              </View>
            ) : (
              pending.map((r) => {
                const car = cars.find((c) => c.id === r.targetId);
                const title = car ? `${car.brand} ${car.model}` : r.targetId;
                return (
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
                    <Text style={[styles.reportId, { color: colors.textTertiary }]}>
                      {r.targetType === "listing" ? `Listing: ${title}` : `User: ${r.targetId}`}
                    </Text>
                    <View style={styles.reportActions}>
                      <Pressable
                        style={[styles.actionBtnSmall, { backgroundColor: "#DCFCE7" }]}
                        onPress={() => handleDismiss(r.id)}
                      >
                        <Feather name="check" size={12} color="#16A34A" />
                        <Text style={[styles.actionBtnText, { color: "#16A34A" }]}>Dismiss</Text>
                      </Pressable>
                      {r.targetType === "listing" && (
                        <Pressable
                          style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}
                          onPress={() => handleRemoveContent(r.id, title)}
                        >
                          <Feather name="trash-2" size={12} color="#E53935" />
                          <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Remove Content</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ── Users Tab ── */}
        {tab === "Users" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Dealers"   value={dealers.filter(d => d.approved).length} icon="star"   color="#F59E0B" />
              <StatCard label="Pending"   value={dealers.filter(d => !d.approved).length} icon="clock" color="#0EB5CA" />
              <StatCard label="Total"     value={dealers.length}                           icon="users"  color="#64748B" />
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Dealer Verification Requests</Text>
              {dealers.map((d, i) => (
                <View key={d.name} style={[styles.dealerRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 2 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.dealerName, { color: colors.text }]}>{d.name}</Text>
                    <Text style={[styles.subText, { color: colors.textTertiary }]}>
                      Submitted {d.submitted} · {d.listings} listings
                    </Text>
                    {d.approved && (
                      <View style={styles.approvedPill}>
                        <Feather name="check" size={10} color="#16A34A" />
                        <Text style={styles.approvedText}>Approved</Text>
                      </View>
                    )}
                  </View>
                  {!d.approved && (
                    <View style={styles.dealerActions}>
                      <Pressable
                        style={[styles.actionBtnSmall, { backgroundColor: "#DCFCE7" }]}
                        onPress={() => handleDealerApproval(i, true)}
                      >
                        <Feather name="check" size={12} color="#16A34A" />
                        <Text style={[styles.actionBtnText, { color: "#16A34A" }]}>Approve</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}
                        onPress={() => handleDealerApproval(i, false)}
                      >
                        <Feather name="x" size={12} color="#E53935" />
                        <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Reject</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Listings Tab ── */}
        {tab === "Listings" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Total"   value={cars.length}        icon="list"         color="#0EB5CA" />
              <StatCard label="Sold"    value={sold.length}        icon="check-circle" color="#22C55E" />
              <StatCard label="Flagged" value={flaggedCars.length} icon="flag"         color="#E53935" />
            </View>

            {flaggedCars.length === 0 && hiddenCars.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                <Feather name="check-circle" size={36} color="#22C55E" />
                <Text style={[styles.emptyText, { color: colors.text }]}>No flagged listings</Text>
              </View>
            ) : (
              [...flaggedCars, ...hiddenCars.filter(c => !(c.reportCount || 0))].map((car) => (
                <View key={car.id} style={[styles.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.reportTop}>
                    <View style={[styles.typePill, car.isHidden ? styles.typeUser : styles.typeListing]}>
                      <Text style={styles.typeText}>{car.isHidden ? "HIDDEN" : "FLAGGED"}</Text>
                    </View>
                    <Text style={[styles.reportDate, { color: colors.textTertiary }]}>{car.year}</Text>
                  </View>
                  <Text style={[styles.reportReason, { color: colors.text }]}>
                    {car.brand} {car.model}
                  </Text>
                  <Text style={[styles.reportId, { color: colors.textTertiary }]}>
                    {(car.reportCount || 0) > 0
                      ? `${car.reportCount} report${(car.reportCount || 0) !== 1 ? "s" : ""} · ${car.location}`
                      : `Hidden by admin · ${car.location}`}
                  </Text>
                  <View style={styles.reportActions}>
                    <Pressable
                      style={[styles.actionBtnSmall, { backgroundColor: "#FEF2F2" }]}
                      onPress={() => handleDeleteListing(car.id, `${car.brand} ${car.model}`)}
                    >
                      <Feather name="trash-2" size={12} color="#E53935" />
                      <Text style={[styles.actionBtnText, { color: "#E53935" }]}>Delete</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.actionBtnSmall, { backgroundColor: car.isHidden ? "#DCFCE7" : "#F3F4F6" }]}
                      onPress={() => handleToggleVisibility(car.id, car.isHidden, `${car.brand} ${car.model}`)}
                    >
                      <Feather name={car.isHidden ? "eye" : "eye-off"} size={12} color={car.isHidden ? "#16A34A" : "#4A4A4A"} />
                      <Text style={[styles.actionBtnText, { color: car.isHidden ? "#16A34A" : "#4A4A4A" }]}>
                        {car.isHidden ? "Restore" : "Hide"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── Analytics Tab ── */}
        {tab === "Analytics" && (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Listings" value={cars.length}     icon="list"           color="#0EB5CA" />
              <StatCard label="Reviews"  value={reviews.length}  icon="star"           color="#F59E0B" />
              <StatCard label="Reports"  value={reports.length}  icon="alert-triangle" color="#E53935" />
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Top Regions</Text>
              {["Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast"].map((city, i) => (
                <View key={city} style={styles.regionRow}>
                  <Text style={[styles.regionName, { color: colors.text }]}>{city}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${85 - i * 12}%`, backgroundColor: "#0EB5CA" }]} />
                  </View>
                  <Text style={[styles.regionPct, { color: colors.textTertiary }]}>{85 - i * 12}%</Text>
                </View>
              ))}
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Top Categories</Text>
              {[["SUV / 4×4", "38%"], ["Sedan", "24%"], ["Pickup", "18%"], ["Hatchback", "12%"], ["Moto", "8%"]].map(([cat, pct]) => (
                <View key={cat} style={styles.regionRow}>
                  <Text style={[styles.regionName, { color: colors.text }]}>{cat}</Text>
                  <Text style={[styles.regionPct, { color: "#0EB5CA" }]}>{pct}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Platform Health</Text>
              <View style={styles.healthRow}>
                <View style={[styles.healthItem, { backgroundColor: "#DCFCE7" }]}>
                  <Feather name="trending-up" size={18} color="#16A34A" />
                  <Text style={styles.healthVal}>98.2%</Text>
                  <Text style={styles.healthLabel}>Uptime</Text>
                </View>
                <View style={[styles.healthItem, { backgroundColor: "#EDF4F7" }]}>
                  <Feather name="clock" size={18} color="#0098AA" />
                  <Text style={styles.healthVal}>1.2s</Text>
                  <Text style={styles.healthLabel}>Avg Load</Text>
                </View>
                <View style={[styles.healthItem, { backgroundColor: "#FEF9C3" }]}>
                  <Feather name="alert-triangle" size={18} color="#D97706" />
                  <Text style={styles.healthVal}>{reports.length}</Text>
                  <Text style={styles.healthLabel}>Open Issues</Text>
                </View>
              </View>
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
    backgroundColor: "#0A1628",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#fff" },
  headerSub: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "rgba(255,255,255,0.6)" },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#E53935",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
  },
  adminBadgeText: { fontSize: 11, fontFamily: "Manrope_700Bold", color: "#fff", letterSpacing: 1 },

  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: {
    flex: 1, paddingVertical: 13, alignItems: "center", justifyContent: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent", flexDirection: "row", gap: 5,
  },
  tabBtnActive: { borderBottomColor: "#0EB5CA" },
  tabText: { fontSize: 12, fontFamily: "Manrope_600SemiBold" },
  tabBadge: {
    backgroundColor: "#E53935", borderRadius: 9, minWidth: 18, height: 18,
    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontFamily: "Manrope_700Bold", color: "#fff" },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12,
    alignItems: "center", gap: 4, borderLeftWidth: 3,
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
    borderRadius: 12, padding: 14, gap: 8, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  reportTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeListing: { backgroundColor: "#EDF4FF" },
  typeUser:    { backgroundColor: "#FEF3C7" },
  typeText: { fontSize: 10, fontFamily: "Manrope_700Bold", color: "#4A4A4A" },
  reportDate: { fontSize: 11, fontFamily: "Manrope_400Regular", marginLeft: "auto" },
  reportReason: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  reportId: { fontSize: 11, fontFamily: "Manrope_400Regular" },
  reportActions: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  actionBtnSmall: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
  },
  actionBtnText: { fontSize: 12, fontFamily: "Manrope_600SemiBold" },

  infoCard: {
    borderRadius: 14, padding: 16, gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoTitle: { fontSize: 14, fontFamily: "Manrope_700Bold", marginBottom: 2 },

  dealerRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  dealerName: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  dealerActions: { flexDirection: "row", gap: 6 },
  subText: { fontSize: 12, fontFamily: "Manrope_400Regular" },
  approvedPill: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4,
    backgroundColor: "#DCFCE7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: "flex-start",
  },
  approvedText: { fontSize: 11, fontFamily: "Manrope_600SemiBold", color: "#16A34A" },

  regionRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  regionName: { width: 84, fontSize: 13, fontFamily: "Manrope_500Medium" },
  barTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "#E2E8F0", overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  regionPct: { width: 36, fontSize: 12, fontFamily: "Manrope_500Medium", textAlign: "right" },

  healthRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  healthItem: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  healthVal: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#1A1A1A" },
  healthLabel: { fontSize: 11, fontFamily: "Manrope_500Medium", color: "#64748B" },
});
