import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CarCard } from "@/components/CarCard";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { currentUser, isAuthenticated, logout, cars, favorites } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [activeTab, setActiveTab] = useState<"listings" | "saved" | "settings">(
    "listings"
  );
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  if (!isAuthenticated || !currentUser) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad }]}>
        <View style={styles.iconRing}>
          <Feather name="user" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.authTitle}>Join Westcars</Text>
        <Text style={styles.authText}>
          Create an account to list cars, save favorites, and message sellers.
        </Text>
        <Pressable
          style={styles.authBtn}
          onPress={() => router.push("/auth/login")}
        >
          <LinearGradient
            colors={["#00873E", "#00A64C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.authGradient}
          >
            <Text style={styles.authBtnText}>Sign In</Text>
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => router.push("/auth/signup")}>
          <Text style={styles.signupLink}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const myListings = cars.filter((c) => c.sellerId === currentUser.id);
  const savedCars = cars.filter((c) => favorites.includes(c.id));

  const handleVerify = () => {
    Alert.alert(
      "Verification Center",
      "Choose how to verify your account:",
      [
        {
          text: "Verify Phone",
          onPress: () =>
            Alert.alert("Phone Verification", "SMS code sent to " + currentUser.phone),
        },
        {
          text: "Upload ID",
          onPress: () =>
            Alert.alert(
              "ID Verification",
              "Upload your Ghana Card or Passport photo and a selfie. Admin will review within 24-48 hours."
            ),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: topPad + 10,
          paddingBottom: insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Profile Header */}
      <LinearGradient
        colors={["#00873E", "#00A64C"]}
        style={styles.profileHeader}
      >
        <View style={styles.avatarArea}>
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={36} color="#fff" />
            </View>
          )}
          <Pressable style={styles.editAvatarBtn}>
            <Feather name="camera" size={14} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.userName}>{currentUser.name}</Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
          <Text style={styles.userLocation}>{currentUser.location}</Text>
        </View>

        {currentUser.isVerified ? (
          <VerifiedBadge />
        ) : (
          <Pressable style={styles.verifyBtn} onPress={handleVerify}>
            <Feather name="shield" size={14} color="#00873E" />
            <Text style={styles.verifyBtnText}>Get Verified</Text>
          </Pressable>
        )}

        <View style={styles.statsRow}>
          <StatBox label="Listings" value={myListings.length} />
          <View style={styles.statDivider} />
          <StatBox label="Saved" value={savedCars.length} />
          <View style={styles.statDivider} />
          <StatBox
            label="Member Since"
            value={currentUser.memberSince.slice(0, 7)}
          />
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["listings", "saved", "settings"] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* My Listings Tab */}
      {activeTab === "listings" && (
        <View style={styles.tabContent}>
          {myListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="truck" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Pressable
                style={styles.listNowBtn}
                onPress={() => router.push("/(tabs)/sell")}
              >
                <Text style={styles.listNowText}>List a Car</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {myListings.map((car, i) => (
                <CarCard key={car.id} car={car} style={styles.halfCard} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Saved Cars Tab */}
      {activeTab === "saved" && (
        <View style={styles.tabContent}>
          {savedCars.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="heart" size={40} color={Colors.light.textTertiary} />
              <Text style={styles.emptyTitle}>No saved cars</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart on any listing to save it
              </Text>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {savedCars.map((car) => (
                <CarCard key={car.id} car={car} style={styles.halfCard} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <View style={styles.tabContent}>
          <View style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Preferences</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="bell" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.light.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="moon" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.light.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="map-pin" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Default Location</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>{currentUser.location}</Text>
                <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
              </View>
            </Pressable>

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="dollar-sign" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Currency</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>GHS (₵)</Text>
                <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
              </View>
            </Pressable>

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="globe" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Language</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>English</Text>
                <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
              </View>
            </Pressable>
          </View>

          <View style={styles.settingsCard}>
            <Text style={styles.settingsSection}>Account</Text>
            <Pressable style={styles.settingRow} onPress={handleVerify}>
              <View style={styles.settingLeft}>
                <Feather name="shield" size={18} color={Colors.verified} />
                <Text style={styles.settingLabel}>Verification Center</Text>
              </View>
              <View style={styles.settingRight}>
                <View
                  style={[
                    styles.verifiedBadge,
                    currentUser.isVerified
                      ? styles.verifiedBadgeGreen
                      : styles.verifiedBadgeOrange,
                  ]}
                >
                  <Text style={styles.verifiedBadgeText}>
                    {currentUser.isVerified ? "Verified" : "Unverified"}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="help-circle" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
            </Pressable>

            <Pressable style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Feather name="info" size={18} color={Colors.primary} />
                <Text style={styles.settingLabel}>About Westcars</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.settingsCard, styles.logoutCard]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color={Colors.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  content: {
    gap: 0,
  },
  profileHeader: {
    padding: 20,
    alignItems: "center",
    gap: 8,
    paddingBottom: 24,
  },
  avatarArea: {
    position: "relative",
    marginBottom: 4,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  userLocation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  verifyBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    width: "100%",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.8)",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontFamily: "Inter_700Bold",
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  halfCard: {
    width: "47%",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    textAlign: "center",
  },
  listNowBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  listNowText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  settingsSection: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textTertiary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValue: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedBadgeGreen: {
    backgroundColor: Colors.verified + "20",
  },
  verifiedBadgeOrange: {
    backgroundColor: Colors.warning + "20",
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  logoutCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  authWall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 40,
    backgroundColor: "#fff",
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  authTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  authText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  authBtn: {
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
  },
  authGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  authBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  signupLink: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
});
