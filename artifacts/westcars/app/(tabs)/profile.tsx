import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import AvatarUploadSheet from "@/components/AvatarUploadSheet";
import { CarCard } from "@/components/CarCard";
import { ReviewCard, StarRating } from "@/components/ReviewCard";
import { TrustScore } from "@/components/TrustScore";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

type ProfileTab = "listings" | "saved" | "reviews" | "settings";

function Stars({ n }: { n: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Feather key={s} name="star" size={12} color={s <= n ? "#F59E0B" : "#DDD"} />
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { currentUser, isAuthenticated, logout, cars, favorites,
          getUserReviews, getSellerTrustScore, toggleAnonymous,
          blockUser, blockedUsers, unblockUser, verifyPhone, verifyId,
          updateUserProfile } = useApp();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [notifications, setNotifications] = useState(true);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [locLoading, setLocLoading] = useState(false);
  const [avatarSheetOpen, setAvatarSheetOpen] = useState(false);
  const { photoURL: uploadedAvatar, progress: uploadProgress, isUploading: avatarUploading,
          pickAndUpload, removePhoto } =
    useAvatarUpload({
      userId: currentUser?.id ?? "",
      initialPhotoURL: currentUser?.avatar,
      onSuccess: (url) => updateUserProfile({ avatar: url || undefined }),
    });

  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.authRoot}>
        <View style={[styles.authTopSection, { paddingTop: topPad + 14 }]}>
          <View style={styles.authIconRing}>
            <Feather name="user" size={36} color="#0A1628" />
          </View>
          <Text style={styles.authTitle}>Join Westcars</Text>
        </View>
        <Svg width="100%" height={70} viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ marginTop: -1 }}>
          <Path
            d="M0,96L60,128C120,160,240,224,360,224C480,224,600,160,720,138.7C840,117,960,139,1080,160C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
            fill="#0EB5CA"
          />
        </Svg>
        <View style={styles.authBottom}>
          <Text style={styles.authText}>
            Create an account to list cars, save favourites, and message sellers.
          </Text>
          <Pressable style={styles.authCtaWrap} onPress={() => router.push("/auth/login")}>
            <LinearGradient
              colors={["#0EB5CA", "#5DDFEF", "#0EB5CA"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.authCtaBorder}
            >
              <View style={styles.authCtaInner}>
                <Feather name="log-in" size={16} color="#FFFFFF" />
                <Text style={styles.authCtaText}>Sign In</Text>
              </View>
            </LinearGradient>
          </Pressable>
          <View style={styles.authSignupRow}>
            <Text style={styles.authSignupPrompt}>New to WestCars?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={styles.authSignupLink}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const myListings = cars.filter((c) => c.sellerId === currentUser.id);
  const savedCars   = cars.filter((c) => favorites.includes(c.id));
  const myReviews   = getUserReviews(currentUser.id);
  const trustScore  = getSellerTrustScore(currentUser);
  const v = currentUser.verification;
  const avatarUri = uploadedAvatar ?? currentUser.avatar;
  const joinDate = currentUser.memberSince?.slice(0, 7) || "2024";

  const completionItems = [
    { label: "Photo",      done: !!avatarUri },
    { label: "Email",      done: !!currentUser.email },
    { label: "Location",   done: !!currentUser.location },
    { label: "Phone",      done: !!currentUser.phone },
    { label: "ID Verified",done: !!currentUser.isVerified },
  ];
  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

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
    if (Platform.OS === "web") {
      logout();
      setTimeout(() => { router.replace("/(tabs)"); }, 100);
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { logout(); setTimeout(() => { router.replace("/(tabs)"); }, 100); } },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* ── Teal Header ── */}
        <View style={[styles.tealHeader, { paddingTop: topPad + 16 }]}>
          <View style={styles.avatarArea}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={36} color="#0EB5CA" />
              </View>
            )}
            {avatarUploading && (
              <View style={styles.avatarUploadingOverlay}>
                <ActivityIndicator color="#fff" size="small" />
                {uploadProgress !== null && uploadProgress > 0 && (
                  <Text style={styles.avatarUploadPct}>{Math.round(uploadProgress * 100)}%</Text>
                )}
              </View>
            )}
            <Pressable
              style={styles.editAvatarBtn}
              onPress={() => {
                if (!currentUser?.id) { Alert.alert("Error", "You must be logged in to upload a photo"); return; }
                setAvatarSheetOpen(true);
              }}
              disabled={avatarUploading}
            >
              {avatarUploading
                ? <ActivityIndicator size={12} color="#FFFFFF" />
                : <Feather name="camera" size={13} color="#FFFFFF" />}
            </Pressable>
          </View>

          <Text style={styles.userName}>{currentUser.name}</Text>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={11} color="rgba(255,255,255,0.85)" />
            <Text style={styles.userLocation}>{currentUser.location || "Ghana"}</Text>
          </View>
          <Text style={styles.memberSince}>Member since {joinDate}</Text>
          {currentUser.isVerified && (
            <View style={styles.verifiedPill}>
              <Feather name="shield" size={11} color="#FFFFFF" />
              <Text style={styles.verifiedPillText}>Verified Seller</Text>
            </View>
          )}
          <View style={{ height: 32 }} />
        </View>

        {/* ── White Content Sheet ── */}
        <View style={[styles.contentSheet, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: "Listings",    value: String(myListings.length) },
              { label: "Trust Score", value: `${trustScore}%` },
              { label: "Saved",       value: String(savedCars.length) },
            ].map((stat, i) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: isDark ? "#1E293B" : "#F7F8FA" },
                  i === 1 && { borderColor: "#0EB5CA", borderWidth: 1 },
                ]}
              >
                <Text style={[styles.statValue, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Profile Completion */}
          <View style={[styles.completionCard, {
            backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }]}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={[styles.completionTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Profile Completion</Text>
              <Text style={styles.completionPct}>{completionPct}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }]}>
              <View style={[styles.progressFill, { width: `${completionPct}%` as any }]} />
            </View>
            <View style={styles.pillsRow}>
              {completionItems.map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.completionPill,
                    {
                      backgroundColor: item.done
                        ? "rgba(14,181,202,0.1)"
                        : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                      borderColor: item.done
                        ? "rgba(14,181,202,0.25)"
                        : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
                    },
                  ]}
                >
                  <Feather
                    name={item.done ? "check-circle" : "plus-circle"}
                    size={11}
                    color={item.done ? "#0EB5CA" : "#94A3B8"}
                  />
                  <Text style={[styles.completionPillText, { color: item.done ? "#0EB5CA" : "#94A3B8" }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tabs */}
          <View style={[styles.tabs, { borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#E4E8EF" }]}>
            {(["listings", "saved", "reviews", "settings"] as ProfileTab[]).map((tab) => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  { color: activeTab === tab ? "#0EB5CA" : "#64748B" },
                  activeTab === tab && styles.tabTextActive,
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Listings Tab ── */}
          {activeTab === "listings" && (
            <View style={styles.tabContent}>
              <Pressable
                style={[styles.adBoostBanner, {
                  backgroundColor: isDark ? "#1E293B" : "#FFF7ED",
                  borderColor: isDark ? "rgba(255,107,0,0.18)" : "rgba(255,107,0,0.20)",
                }]}
                onPress={() => router.push("/advertise")}
              >
                <View style={styles.adBoostIconBox}>
                  <Feather name="trending-up" size={18} color="#E65100" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adBoostTitle, { color: isDark ? "#FED7AA" : "#C2410C" }]}>Boost Your Listings</Text>
                  <Text style={[styles.adBoostSub, { color: isDark ? "#94A3B8" : "#78350F" }]}>Reach 10× more buyers with sponsored placement</Text>
                </View>
                <Feather name="arrow-right" size={14} color="#E65100" />
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
                myListings.map((car) => {
                  const img = (car as any).images?.[0];
                  const title = [(car as any).year, (car as any).make, (car as any).model]
                    .filter(Boolean).join(" ") || (car as any).title || "Car";
                  const price = (car as any).price;
                  return (
                    <Pressable
                      key={car.id}
                      style={[styles.listingCard, {
                        backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                      }]}
                      onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
                    >
                      {img ? (
                        <Image source={{ uri: img }} style={styles.listingImg} resizeMode="cover" />
                      ) : (
                        <View style={[styles.listingImgPlaceholder, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
                          <Feather name="truck" size={22} color="#0EB5CA" />
                        </View>
                      )}
                      <View style={styles.listingInfo}>
                        <View style={styles.listingBadgeRow}>
                          <View style={[styles.listingBadge,
                            car.isSold
                              ? { backgroundColor: "#f0f0f0" }
                              : { backgroundColor: "#eafbf4" },
                          ]}>
                            <Text style={[styles.listingBadgeText, { color: car.isSold ? "#888" : "#0a7a4a" }]}>
                              {car.isSold ? "Sold" : "Active"}
                            </Text>
                          </View>
                          {car.expiresAt && !car.isSold && (
                            <View style={[styles.listingBadge, { backgroundColor: "#FEF3C7", marginLeft: 4 }]}>
                              <Text style={[styles.listingBadgeText, { color: "#D97706" }]}>
                                Exp {new Date(car.expiresAt).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.listingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={1}>
                          {title}
                        </Text>
                        {price !== undefined && (
                          <Text style={styles.listingPrice}>GHS {Number(price).toLocaleString()}</Text>
                        )}
                        <View style={styles.listingMeta}>
                          <Feather name="eye" size={11} color="#94A3B8" />
                          <Text style={styles.listingMetaText}>{(car as any).views ?? 0} views</Text>
                          <Feather name="message-circle" size={11} color="#94A3B8" />
                          <Text style={styles.listingMetaText}>{(car as any).chats ?? 0} chats</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {/* ── Saved Tab ── */}
          {activeTab === "saved" && (
            <View style={styles.tabContent}>
              {savedCars.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="heart" size={40} color={colors.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No saved cars</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                    Tap the heart on any listing to save it
                  </Text>
                </View>
              ) : (
                savedCars.map((car) => {
                  const img = (car as any).images?.[0];
                  const title = [(car as any).year, (car as any).make, (car as any).model]
                    .filter(Boolean).join(" ") || (car as any).title || "Car";
                  const price = (car as any).price;
                  return (
                    <Pressable
                      key={car.id}
                      style={[styles.listingCard, {
                        backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
                      }]}
                      onPress={() => router.push({ pathname: "/car/[id]", params: { id: car.id } })}
                    >
                      {img ? (
                        <Image source={{ uri: img }} style={styles.listingImg} resizeMode="cover" />
                      ) : (
                        <View style={[styles.listingImgPlaceholder, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
                          <Feather name="truck" size={22} color="#0EB5CA" />
                        </View>
                      )}
                      <View style={styles.listingInfo}>
                        <Text style={[styles.listingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={1}>
                          {title}
                        </Text>
                        {price !== undefined && (
                          <Text style={styles.listingPrice}>GHS {Number(price).toLocaleString()}</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === "reviews" && (
            <View style={styles.tabContent}>
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
            <View style={styles.tabContent}>

              {/* Preferences */}
              <View style={[styles.settingsCard, {
                backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              }]}>
                <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Preferences</Text>

                <View style={[styles.settingRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="bell" size={16} color="#0EB5CA" />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Notifications</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>Push alerts for messages & offers</Text>
                  </View>
                  <Switch value={notifications} onValueChange={setNotifications}
                    trackColor={{ false: colors.border, true: "#0EB5CA" }} thumbColor="#fff" />
                </View>

                <View style={[styles.settingRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="moon" size={16} color="#0EB5CA" />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Dark Mode</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>Switch app appearance</Text>
                  </View>
                  <Switch value={isDark} onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: "#0EB5CA" }} thumbColor="#fff" />
                </View>

                <View style={[styles.settingRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="eye-off" size={16} color="#0EB5CA" />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Anonymous Contact</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>Hide phone from buyers</Text>
                  </View>
                  <Switch value={currentUser.isAnonymous || false} onValueChange={toggleAnonymous}
                    trackColor={{ false: colors.border, true: "#0EB5CA" }} thumbColor="#fff" />
                </View>

                <Pressable
                  style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  onPress={handleUseMyLocation}
                  disabled={locLoading}
                >
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="map-pin" size={16} color="#0EB5CA" />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Default Location</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>{currentUser.location}</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: locLoading ? "#94A3B8" : "#0EB5CA", fontFamily: "Inter_400Regular" }}>
                    {locLoading ? "Locating…" : "Update"}
                  </Text>
                </Pressable>
              </View>

              {/* Verification Centre */}
              <Pressable
                style={[styles.settingsCard, {
                  backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                }]}
                onPress={() => router.push("/verification-centre")}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Verification Centre</Text>
                  <Feather name="chevron-right" size={14} color={colors.textTertiary} style={{ marginRight: 14 }} />
                </View>
                {[
                  { icon: "phone",       label: "Phone Verification", sub: "Via SMS OTP — instant",               done: v?.phone,  bg: "#EDF4FF", ic: "#0066CC" },
                  { icon: "credit-card", label: "ID Verification",    sub: "Ghana Card / Passport · Kora",         done: v?.id,     bg: "#E0F7FA", ic: "#0EB5CA" },
                  { icon: "briefcase",   label: "Dealer Verification", sub: "Business registration · Manual",       done: v?.dealer, bg: "#FEF3C7", ic: "#F59E0B" },
                ].map((item, idx, arr) => (
                  <View key={item.label} style={[styles.settingRow, {
                    borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                    borderBottomWidth: idx < arr.length - 1 ? 0.5 : 0,
                  }]}>
                    <View style={[styles.settingIcon, { backgroundColor: item.bg }]}>
                      <Feather name={item.icon as any} size={16} color={item.ic} />
                    </View>
                    <View style={styles.settingMiddle}>
                      <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{item.label}</Text>
                      <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>{item.sub}</Text>
                    </View>
                    <View style={[styles.veriBadge, { backgroundColor: item.done ? "#DCFCE7" : "#FEF3C7" }]}>
                      <Text style={[styles.veriBadgeText, { color: item.done ? "#16A34A" : "#D97706" }]}>
                        {item.done ? "Verified ✓" : "Verify"}
                      </Text>
                    </View>
                  </View>
                ))}
              </Pressable>

              {/* Privacy & Safety */}
              <View style={[styles.settingsCard, {
                backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              }]}>
                <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Privacy & Safety</Text>
                <Pressable style={[styles.settingRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
                  onPress={() => router.push("/privacy-safety")}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="slash" size={16} color={Colors.danger} />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Blocked Users</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>{blockedUsers.length} blocked</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                </Pressable>
                <Pressable style={[styles.settingRow, { borderBottomWidth: 0 }]}
                  onPress={() => router.push("/privacy-safety")}>
                  <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                    <Feather name="shield" size={16} color="#0EB5CA" />
                  </View>
                  <View style={styles.settingMiddle}>
                    <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Safety Checklist</Text>
                    <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>Review safe trading tips</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                </Pressable>
              </View>

              {/* Account */}
              <View style={[styles.settingsCard, {
                backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              }]}>
                <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Account</Text>
                {[
                  { icon: "trending-up", label: "Advertise Your Car", sub: "Sponsored listings · Boost reach", route: "/advertise",   iconColor: "#E65100" },
                  { icon: "help-circle", label: "Help & Support",      sub: "FAQs, contact us",                  route: "/legal/help", iconColor: "#0EB5CA" },
                  { icon: "info",        label: "About Westcars",      sub: "Version & legal info",               route: "/legal/about",iconColor: "#0EB5CA" },
                ].map((item, idx, arr) => (
                  <Pressable key={item.label} style={[styles.settingRow, {
                    borderBottomWidth: idx < arr.length - 1 ? 0.5 : 0,
                    borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }]} onPress={() => router.push(item.route as any)}>
                    <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                      <Feather name={item.icon as any} size={16} color={item.iconColor} />
                    </View>
                    <View style={styles.settingMiddle}>
                      <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{item.label}</Text>
                      <Text style={[styles.settingSubtitle, { color: colors.textTertiary }]}>{item.sub}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                  </Pressable>
                ))}
              </View>

              {/* Support & Legal */}
              <View style={[styles.settingsCard, {
                backgroundColor: isDark ? "#1E293B" : "#F7F8FA",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
              }]}>
                <Text style={[styles.settingsSection, { color: colors.textTertiary }]}>Support & Legal</Text>
                {[
                  { icon: "message-circle", label: "FAQ",              route: "/legal/faq",     iconColor: "#7C3AED" },
                  { icon: "file-text",      label: "Terms of Service", route: "/legal/terms",   iconColor: "#0098AA" },
                  { icon: "lock",           label: "Privacy Policy",   route: "/legal/privacy", iconColor: "#16A34A" },
                ].map((item, idx, arr) => (
                  <Pressable key={item.label} style={[styles.settingRow, {
                    borderBottomWidth: idx < arr.length - 1 ? 0.5 : 0,
                    borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }]} onPress={() => router.push(item.route as any)}>
                    <View style={[styles.settingIcon, { backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}>
                      <Feather name={item.icon as any} size={16} color={item.iconColor} />
                    </View>
                    <View style={styles.settingMiddle}>
                      <Text style={[styles.settingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{item.label}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                  </Pressable>
                ))}
              </View>

              {/* Sign Out */}
              <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                <Feather name="log-out" size={18} color="#dc2626" />
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>

            </View>
          )}
        </View>
      </ScrollView>

      <AvatarUploadSheet
        visible={avatarSheetOpen}
        hasPhoto={!!(uploadedAvatar ?? currentUser.avatar)}
        onCamera={() => { setAvatarSheetOpen(false); pickAndUpload("camera"); }}
        onLibrary={() => { setAvatarSheetOpen(false); pickAndUpload("library"); }}
        onRemove={() => { setAvatarSheetOpen(false); removePhoto(); }}
        onClose={() => setAvatarSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  // ── Auth wall ──
  authRoot: { flex: 1, backgroundColor: "#0A1628" },
  authTopSection: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 22,
    paddingBottom: 16,
    alignItems: "center",
    gap: 14,
  },
  authIconRing: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center", justifyContent: "center",
  },
  authTitle: {
    fontSize: 32, color: "#0A1628", textAlign: "center",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.6,
  },
  authBottom: { flex: 1, paddingHorizontal: 28, paddingTop: 22, alignItems: "center" },
  authText: {
    fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 22,
    fontFamily: "Inter_400Regular", textAlign: "center",
    marginBottom: 24, paddingHorizontal: 8,
  },
  authCtaWrap: { width: "100%", borderRadius: 30, overflow: "hidden" },
  authCtaBorder: { padding: 1.5, borderRadius: 30 },
  authCtaInner: {
    height: 53, borderRadius: 28.5, backgroundColor: "#0A1628",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  authCtaText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  authSignupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 22 },
  authSignupPrompt: { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  authSignupLink: { fontSize: 13, color: "#0EB5CA", fontFamily: "Inter_700Bold" },

  // ── Teal header ──
  tealHeader: {
    backgroundColor: "#0EB5CA",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarArea: { position: "relative", marginBottom: 12 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.6)",
  },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.4)",
  },
  editAvatarBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#0098AA",
    borderWidth: 2, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarUploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 44,
    alignItems: "center", justifyContent: "center",
  },
  avatarUploadPct: { color: "#fff", fontSize: 11, marginTop: 2 },
  userName: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", color: "#FFFFFF", letterSpacing: -0.3 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  userLocation: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular" },
  memberSince: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 3 },
  verifiedPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, marginTop: 8,
  },
  verifiedPillText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },

  // ── Content sheet ──
  contentSheet: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    minHeight: 600,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, marginBottom: 12,
  },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontFamily: "Manrope_800ExtraBold" },
  statLabel: { fontSize: 10, color: "#64748B", marginTop: 2, fontFamily: "Inter_400Regular", textAlign: "center" },

  // ── Completion card ──
  completionCard: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 14, borderWidth: 0.5,
  },
  completionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  completionPct: { fontSize: 13, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  progressTrack: { height: 6, borderRadius: 99, marginBottom: 12, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#0EB5CA" },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  completionPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 20, borderWidth: 0.5,
  },
  completionPillText: { fontSize: 11, fontFamily: "Inter_500Medium" },

  // ── Tabs ──
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: {
    flex: 1, paddingVertical: 13, alignItems: "center",
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#0EB5CA" },
  tabText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  tabTextActive: { fontFamily: "Inter_700Bold" },

  // ── Tab content ──
  tabContent: { padding: 14, gap: 10 },

  // ── Listing card (row) ──
  listingCard: {
    flexDirection: "row", borderRadius: 12,
    padding: 10, borderWidth: 0.5, gap: 12,
    alignItems: "center",
  },
  listingImg: { width: 72, height: 60, borderRadius: 8 },
  listingImgPlaceholder: {
    width: 72, height: 60, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  listingInfo: { flex: 1, gap: 3 },
  listingBadgeRow: { flexDirection: "row" },
  listingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  listingBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  listingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  listingPrice: { fontSize: 14, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  listingMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  listingMetaText: { fontSize: 10, color: "#94A3B8", fontFamily: "Inter_400Regular" },

  // ── Ad boost ──
  adBoostBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  adBoostIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,107,0,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  adBoostTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  adBoostSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },

  // ── Empty state ──
  emptyState: { alignItems: "center", paddingVertical: 48, gap: 12 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  listNowBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: "#0EB5CA" },
  listNowText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },

  // ── Settings ──
  settingsCard: {
    marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, borderWidth: 0.5, overflow: "hidden",
  },
  settingsSection: {
    fontSize: 10, fontFamily: "Inter_600SemiBold",
    paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  settingMiddle: { flex: 1, gap: 1 },
  settingTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  settingSubtitle: { fontSize: 11, fontFamily: "Inter_400Regular" },
  veriBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  veriBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  // ── Logout ──
  logoutBtn: {
    marginHorizontal: 16, marginBottom: 16,
    height: 48, borderRadius: 12,
    backgroundColor: "#fff0f0",
    borderWidth: 1, borderColor: "#fca5a5",
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#dc2626" },
});
