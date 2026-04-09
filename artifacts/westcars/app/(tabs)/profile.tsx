import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
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
import { ReviewCard, StarRating } from "@/components/ReviewCard";
import { TrustScore } from "@/components/TrustScore";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

type ProfileTab = "listings" | "saved" | "reviews" | "settings";

function StatBox({ label, value }: { label: string; value: string | number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1,2,3,4,5].map((s) => (
        <Feather key={s} name="star" size={14} color={s <= n ? "#F59E0B" : "#DDD"} />
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { currentUser, isAuthenticated, logout, cars, favorites,
          getUserReviews, getSellerTrustScore, toggleAnonymous,
          blockUser, blockedUsers, unblockUser, verifyPhone, verifyId } = useApp();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [notifications, setNotifications] = useState(true);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [locLoading, setLocLoading] = useState(false);

  if (!isAuthenticated || !currentUser) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad, backgroundColor: colors.backgroundSecondary }]}>
        <View style={[styles.iconRing, { backgroundColor: colors.accentLight }]}>
          <Feather name="user" size={40} color={colors.accent} />
        </View>
        <Text style={[styles.authTitle, { color: colors.text }]}>Join Westcars</Text>
        <Text style={[styles.authText, { color: colors.textSecondary }]}>
          Create an account to list cars, save favourites, and message sellers.
        </Text>
        <Pressable
          style={[styles.authBtn, { backgroundColor: "#0EB5CA" }]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={[styles.authBtnText, { color: "#FFFFFF" }]}>Sign In</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/auth/signup")}>
          <Text style={[styles.signupLink, { color: colors.accent }]}>Create Account</Text>
        </Pressable>
      </View>
    );
  }

  const myListings = cars.filter((c) => c.sellerId === currentUser.id);
  const savedCars   = cars.filter((c) => favorites.includes(c.id));
  const myReviews   = getUserReviews(currentUser.id);
  const trustScore  = getSellerTrustScore(currentUser);

  const handleVerifyPhone = async () => {
    setVerifyingPhone(true);
    Alert.alert("Verify Phone", "A 6-digit code will be sent to " + currentUser.phone, [
      { text: "Cancel", style: "cancel", onPress: () => setVerifyingPhone(false) },
      {
        text: "Send Code",
        onPress: async () => {
          await verifyPhone();
          setVerifyingPhone(false);
          Alert.alert("Phone Verified!", "Your phone number is now verified.");
        },
      },
    ]);
  };

  const handleVerifyId = async () => {
    setVerifyingId(true);
    Alert.alert(
      "ID Verification",
      "Upload your Ghana Card or Passport + a selfie. Your identity will be verified within 24 hours via Smile ID.",
      [
        { text: "Cancel", style: "cancel", onPress: () => setVerifyingId(false) },
        {
          text: "Upload Documents",
          onPress: async () => {
            await verifyId();
            setVerifyingId(false);
            Alert.alert("ID Submitted!", "Your ID verification is pending review. Check back in 24 hours.");
          },
        },
      ]
    );
  };

  const handleDealerRequest = () => {
    Alert.alert(
      "Dealer Verification",
      "To become a Verified Dealer, email westcarsgh@gmail.com with your business registration certificate. Our team will review within 3 business days.",
      [{ text: "Got It" }]
    );
  };

  const handleUseMyLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Please allow location access in your device settings to use this feature.");
        setLocLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      const city = place.city || place.subregion || place.region || "Ghana";
      updateUserProfile({ location: city });
      Alert.alert("Location Updated", `Your default location has been set to ${city}.`);
    } catch {
      Alert.alert("Error", "Unable to get your location. Please try again.");
    }
    setLocLoading(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const v = currentUser.verification;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 10, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile Header ── */}
      <View style={[styles.profileHeader, {
        backgroundColor: isDark ? "#111827" : "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
      }]}>
        <View style={styles.avatarArea}>
          {currentUser.avatar ? (
            <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, {
              backgroundColor: isDark ? "rgba(14,181,202,0.15)" : "rgba(14,181,202,0.10)",
              borderColor: "#0EB5CA",
            }]}>
              <Feather name="user" size={36} color="#0098AA" />
            </View>
          )}
          <Pressable style={styles.editAvatarBtn}>
            <Feather name="camera" size={14} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={[styles.userName, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          {currentUser.name}
        </Text>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={12} color={isDark ? "#94A3B8" : "#64748B"} />
          <Text style={[styles.userLocation, { color: isDark ? "#94A3B8" : "#64748B" }]}>
            {currentUser.location}
          </Text>
        </View>

        <VerificationBadges user={currentUser} size="sm" style={styles.veriBadges} />

        {!currentUser.isVerified && !v?.phone && (
          <Pressable style={styles.verifyBtn} onPress={handleVerifyPhone}>
            <Feather name="shield" size={14} color="#FFFFFF" />
            <Text style={styles.verifyBtnText}>Get Verified</Text>
          </Pressable>
        )}

        <View style={[styles.statsRow, {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }]}>
          <StatBox label="Listings" value={myListings.length} />
          <View style={[styles.statDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }]} />
          <StatBox label="Saved" value={savedCars.length} />
          <View style={[styles.statDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }]} />
          <StatBox label="Reviews" value={myReviews.length} />
          <View style={[styles.statDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)" }]} />
          <StatBox label="Trust" value={`${trustScore}%`} />
        </View>
      </View>

      {/* Trust Score Bar */}
      <View style={[styles.trustCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TrustScore score={trustScore} size="md" />
      </View>

      {/* ── Tabs ── */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["listings", "saved", "reviews", "settings"] as ProfileTab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? Colors.primary : colors.textTertiary },
              activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ── Listings Tab ── */}
      {activeTab === "listings" && (
        <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
          {/* Ad Boost Banner */}
          <Pressable
            style={[styles.adBoostBanner, { backgroundColor: isDark ? "#1E293B" : "#FFF7ED", borderColor: isDark ? "rgba(255,107,0,0.18)" : "rgba(255,107,0,0.20)" }]}
            onPress={() => router.push("/advertise")}
          >
            <View style={styles.adBoostIconBox}>
              <Feather name="trending-up" size={20} color="#E65100" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.adBoostTitle, { color: isDark ? "#FED7AA" : "#C2410C" }]}>Boost Your Listings</Text>
              <Text style={[styles.adBoostSub, { color: isDark ? "#94A3B8" : "#78350F" }]}>Reach 10× more buyers with sponsored placement</Text>
            </View>
            <Feather name="arrow-right" size={16} color="#E65100" />
          </Pressable>

          {myListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="truck" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No listings yet</Text>
              <Pressable style={styles.listNowBtn} onPress={() => router.push("/(tabs)/sell")}>
                <Text style={styles.listNowText}>List a Car</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {myListings.map((car) => (
                <View key={car.id} style={styles.halfCard}>
                  <CarCard car={car} />
                  {car.isSold && (
                    <View style={styles.soldOverlay}>
                      <Text style={styles.soldOverlayText}>SOLD</Text>
                    </View>
                  )}
                  {car.expiresAt && !car.isSold && (
                    <View style={styles.expiry}>
                      <Feather name="clock" size={9} color="#F59E0B" />
                      <Text style={styles.expiryText}>
                        Expires {new Date(car.expiresAt).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Saved Tab ── */}
      {activeTab === "saved" && (
        <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
          {savedCars.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="heart" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No saved cars</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                Tap the heart on any listing to save it
              </Text>
            </View>
          ) : (
            <View style={styles.gridRow}>
              {savedCars.map((car) => (
                <View key={car.id} style={styles.halfCard}>
                  <CarCard car={car} />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Reviews Tab ── */}
      {activeTab === "reviews" && (
        <View style={[styles.tabContent, { backgroundColor: colors.background }]}>
          {myReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="star" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No reviews yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                Reviews appear here after completed transactions
              </Text>
            </View>
          ) : (
            <>
              <StarRating rating={currentUser.rating} totalReviews={myReviews.length} />
              {myReviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </>
          )}
        </View>
      )}

      {/* ── Settings Tab ── */}
      {activeTab === "settings" && (
        <View style={[styles.tabContent, { backgroundColor: colors.background }]}>

          {/* Preferences */}
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Preferences</Text>

            <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Feather name="bell" size={18} color={Colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Feather name="moon" size={18} color={Colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <Feather name="eye-off" size={18} color={Colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Anonymous Contact</Text>
                  <Text style={[styles.settingHint, { color: colors.textTertiary }]}>Hide phone from buyers</Text>
                </View>
              </View>
              <Switch
                value={currentUser.isAnonymous || false}
                onValueChange={toggleAnonymous}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            </View>

            <Pressable
              style={[styles.settingRow, { borderTopColor: colors.border }]}
              onPress={handleUseMyLocation}
              disabled={locLoading}
            >
              <View style={styles.settingLeft}>
                <Feather name="map-pin" size={18} color={Colors.primary} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Default Location</Text>
                  <Text style={[styles.settingHint, { color: colors.textTertiary }]}>{currentUser.location}</Text>
                </View>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: locLoading ? colors.textTertiary : "#0EB5CA" }]}>
                  {locLoading ? "Locating…" : "Use My Location"}
                </Text>
                <Feather name="navigation" size={14} color="#0EB5CA" />
              </View>
            </Pressable>
          </View>

          {/* Verification Centre */}
          <Pressable
            style={[styles.settingsCard, { backgroundColor: colors.card }]}
            onPress={() => router.push("/verification-centre")}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Verification Centre</Text>
              <Feather name="chevron-right" size={15} color={colors.textTertiary} />
            </View>

            {/* Phone */}
            <View style={[styles.veriRow, { borderTopColor: colors.border }]}>
              <View style={[styles.veriIcon, { backgroundColor: "#EDF4FF" }]}>
                <Feather name="phone" size={16} color="#0066CC" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.veriTitle, { color: colors.text }]}>Phone Verification</Text>
                <Text style={[styles.veriSub, { color: colors.textTertiary }]}>Via SMS OTP — instant</Text>
              </View>
              <View style={[styles.veriBadge, { backgroundColor: v?.phone ? "#DCFCE7" : "#FEF3C7" }]}>
                <Text style={[styles.veriBadgeText, { color: v?.phone ? "#16A34A" : "#D97706" }]}>
                  {v?.phone ? "Verified ✓" : "Verify"}
                </Text>
              </View>
            </View>

            {/* ID */}
            <View style={[styles.veriRow, { borderTopColor: colors.border }]}>
              <View style={[styles.veriIcon, { backgroundColor: "#E0F7FA" }]}>
                <Feather name="credit-card" size={16} color="#0EB5CA" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.veriTitle, { color: colors.text }]}>ID Verification</Text>
                <Text style={[styles.veriSub, { color: colors.textTertiary }]}>Ghana Card / Passport · Kora</Text>
              </View>
              <View style={[styles.veriBadge, { backgroundColor: v?.id ? "#DCFCE7" : "#FEF3C7" }]}>
                <Text style={[styles.veriBadgeText, { color: v?.id ? "#16A34A" : "#D97706" }]}>
                  {v?.id ? "Verified ✓" : "Verify"}
                </Text>
              </View>
            </View>

            {/* Dealer */}
            <View style={[styles.veriRow, { borderTopColor: colors.border }]}>
              <View style={[styles.veriIcon, { backgroundColor: "#FEF3C7" }]}>
                <Feather name="briefcase" size={16} color="#F59E0B" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.veriTitle, { color: colors.text }]}>Dealer Verification</Text>
                <Text style={[styles.veriSub, { color: colors.textTertiary }]}>Business registration · Manual</Text>
              </View>
              <View style={[styles.veriBadge, { backgroundColor: v?.dealer ? "#DCFCE7" : "#F3F4F6" }]}>
                <Text style={[styles.veriBadgeText, { color: v?.dealer ? "#16A34A" : "#9CA3AF" }]}>
                  {v?.dealer ? "Verified ✓" : "Request"}
                </Text>
              </View>
            </View>
          </Pressable>

          {/* Privacy & Safety */}
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Privacy & Safety</Text>
            <Pressable
              style={[styles.settingRow, { borderTopColor: colors.border }]}
              onPress={() => router.push("/privacy-safety")}
            >
              <View style={styles.settingLeft}>
                <Feather name="slash" size={18} color={Colors.danger} />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Blocked Users</Text>
                  <Text style={[styles.settingHint, { color: colors.textTertiary }]}>{blockedUsers.length} blocked</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>

            <Pressable
              style={[styles.settingRow, { borderTopColor: colors.border }]}
              onPress={() => router.push("/privacy-safety")}
            >
              <View style={styles.settingLeft}>
                <Feather name="shield" size={18} color={Colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Safety Checklist</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* Account */}
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Account</Text>

            <Pressable
              style={[styles.settingRow, { borderTopColor: colors.border }]}
              onPress={() => router.push("/advertise")}
            >
              <View style={styles.settingLeft}>
                <Feather name="trending-up" size={18} color="#E65100" />
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Advertise Your Car</Text>
                  <Text style={[styles.settingHint, { color: colors.textTertiary }]}>Sponsored listings · Boost &amp; reach more buyers</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>

            <Pressable style={[styles.settingRow, { borderTopColor: colors.border }]} onPress={() => router.push("/legal/help")}>
              <View style={styles.settingLeft}>
                <Feather name="help-circle" size={18} color={Colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>

            <Pressable style={[styles.settingRow, { borderTopColor: colors.border }]} onPress={() => router.push("/legal/about")}>
              <View style={styles.settingLeft}>
                <Feather name="info" size={18} color={Colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>About Westcars</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>

          {/* Support & Legal */}
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Support & Legal</Text>

            <Pressable style={[styles.settingRow, { borderTopColor: colors.border }]} onPress={() => router.push("/legal/faq")}>
              <View style={styles.settingLeft}>
                <Feather name="message-circle" size={18} color="#7C3AED" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>FAQ</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>

            <Pressable style={[styles.settingRow, { borderTopColor: colors.border }]} onPress={() => router.push("/legal/terms")}>
              <View style={styles.settingLeft}>
                <Feather name="file-text" size={18} color="#0098AA" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Service</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>

            <Pressable style={[styles.settingRow, { borderTopColor: colors.border }]} onPress={() => router.push("/legal/privacy")}>
              <View style={styles.settingLeft}>
                <Feather name="lock" size={18} color="#16A34A" />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.settingsCard, styles.logoutCard, { backgroundColor: colors.card }]}
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
  container: { flex: 1 },
  content: { gap: 0 },

  // Auth wall
  authWall: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  iconRing: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 24, fontFamily: "Manrope_700Bold" },
  authText: { fontSize: 14, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
  authBtn: { borderRadius: 14, width: "100%", paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  authGradient: { paddingVertical: 14, alignItems: "center" },
  authBtnText: { fontSize: 16, fontFamily: "Manrope_600SemiBold", color: "#fff", textAlign: "center" },
  signupLink: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },

  // Profile header
  profileHeader: { padding: 20, alignItems: "center", gap: 6, paddingBottom: 24 },
  avatarArea: { position: "relative", marginBottom: 4 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: "#0EB5CA" },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3,
    alignItems: "center", justifyContent: "center",
  },
  editAvatarBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#0EB5CA", borderWidth: 2, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  userName: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  userLocation: { fontSize: 13, fontFamily: "Manrope_400Regular" },
  veriBadges: { marginTop: 2 },
  verifyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#0EB5CA", paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
  },
  verifyBtnText: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#FFFFFF" },

  statsRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    marginTop: 8, width: "100%",
  },
  statBox: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 16, fontFamily: "Manrope_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Manrope_400Regular" },
  statDivider: { width: 1, height: 30 },

  // Trust score card
  trustCard: {
    margin: 12, borderRadius: 14, padding: 16,
    borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },

  // Tabs
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, fontFamily: "Manrope_500Medium" },
  tabTextActive: { fontFamily: "Manrope_700Bold" },

  // Tab content
  tabContent: { padding: 14, gap: 12 },

  // Ad boost banner
  adBoostBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  adBoostIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,107,0,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  adBoostTitle: { fontSize: 13, fontFamily: "Manrope_700Bold" },
  adBoostSub: { fontSize: 11, fontFamily: "Manrope_400Regular", marginTop: 2 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  halfCard: { width: "47%", position: "relative" },
  soldOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 2,
    alignItems: "center", justifyContent: "center",
  },
  soldOverlayText: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#fff", letterSpacing: 2 },
  expiry: {
    position: "absolute", bottom: 42, left: 6,
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  expiryText: { fontSize: 9, fontFamily: "Manrope_500Medium", color: "#FBBF24" },

  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: "Manrope_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Manrope_400Regular", textAlign: "center" },
  listNowBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.primary },
  listNowText: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#fff" },

  // Settings
  settingsCard: {
    borderRadius: 16, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  settingsSection: {
    fontSize: 11, fontFamily: "Manrope_600SemiBold",
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 15, fontFamily: "Manrope_400Regular" },
  settingHint: { fontSize: 11, fontFamily: "Manrope_400Regular", marginTop: 1 },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 14, fontFamily: "Manrope_400Regular" },

  // Verification rows
  veriRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 13, borderTopWidth: 1,
  },
  veriIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  veriTitle: { fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  veriSub: { fontSize: 11, fontFamily: "Manrope_400Regular" },
  veriBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  veriBadgeText: { fontSize: 12, fontFamily: "Manrope_600SemiBold" },

  // Logout
  logoutCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18,
  },
  logoutText: { fontSize: 16, fontFamily: "Manrope_600SemiBold", color: Colors.danger },
});
