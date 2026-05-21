import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { CarCard } from "@/components/CarCard";
import { ReviewCard, StarRating } from "@/components/ReviewCard";
import { TrustScore } from "@/components/TrustScore";
import { VerificationBadges } from "@/components/VerificationBadges";
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
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
  const { currentUser, isAuthenticated, logout, cars, favorites, conversations,
          getUserReviews, getSellerTrustScore, toggleAnonymous,
          blockUser, blockedUsers, unblockUser, verifyPhone, verifyId,
          updateUserProfile, notifications, markNotificationRead,
          markAllNotificationsRead, unreadNotificationsCount } = useApp();
  const { user: firebaseUser, chineseProfile, sponsorship, logOut, saveChineseProfile } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [pushNotifEnabled, setPushNotifEnabled] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingId, setVerifyingId] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [locLoading, setLocLoading] = useState(false);
  const [isChineseSeller, setIsChineseSeller] = useState(false);
  const { photoURL: uploadedAvatar, progress: uploadProgress, isUploading: avatarUploading,
          pickAndUpload } =
    useAvatarUpload({
      userId: firebaseUser?.uid ?? "",
      initialPhotoURL: currentUser?.avatar,
      onSuccess: (url) => updateUserProfile({ avatar: url || undefined }),
    });
  const [wechatId, setWechatId] = useState("");
  const [locationInChina, setLocationInChina] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [savingChinese, setSavingChinese] = useState(false);
  const [chineseSaved, setChineseSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    if (chineseProfile) {
      setIsChineseSeller(chineseProfile.isChineseSeller);
      setWechatId(chineseProfile.wechatId ?? "");
      setLocationInChina(chineseProfile.locationInChina ?? "");
      setBusinessName(chineseProfile.businessName ?? "");
    }
  }, [chineseProfile]);

  if (!isAuthenticated || !currentUser) {
    return (
      <View style={styles.authRoot}>
        <View style={[styles.authCard, { marginTop: topPad + 28 }]}>
          <View style={styles.authIconRing}>
            <Feather name="user" size={30} color="#0EB5CA" />
          </View>
          <Text style={styles.authTitle}>Sign in to Westcars</Text>
          <Text style={styles.authText}>
            Access your saved cars, listings, messages, and seller tools with the same premium Westcars account.
          </Text>
          <Pressable style={styles.authCtaInner} onPress={() => router.push("/auth/login")}>
            <Feather name="log-in" size={16} color="#FFFFFF" />
            <Text style={styles.authCtaText}>Sign In</Text>
          </Pressable>
          <View style={styles.authSignupRow}>
            <Text style={styles.authSignupPrompt}>New to Westcars?</Text>
            <Pressable onPress={() => router.push("/auth/signup")}>
              <Text style={styles.authSignupLink}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  const myListings = cars.filter((c) => c.sellerId === currentUser.id);
  const activeListings = myListings.filter((c) => !c.isSold);
  const sponsorshipTier = sponsorship?.tier ?? (activeListings.some((c) => c.isSponsored) ? 'Premium Seller' : 'Standard Seller');
  const adCredits = sponsorship?.adCredits ?? 0;
  const savedCars   = cars.filter((c) => favorites.includes(c.id));
  const myReviews   = getUserReviews(currentUser.id);
  const trustScore  = getSellerTrustScore(currentUser);
  const v = currentUser.verification;
  const joinDate = currentUser.memberSince?.slice(0, 7) || "2024";
  const avatarUri = uploadedAvatar ?? currentUser.avatar ?? null;
  const initials = (currentUser.name || "U")
    .split(" ").slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");

  const completionItems = [
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

  const handleAuthSignOut = async () => {
    setSigningOut(true);
    try {
      await logOut();
      logout();
      router.replace("/welcome");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const handleChineseToggle = async (value: boolean) => {
    setIsChineseSeller(value);
    if (!value) {
      try {
        setSavingChinese(true);
        await saveChineseProfile({ isChineseSeller: false });
      } catch {
        Alert.alert("Error", "Failed to update profile.");
        setIsChineseSeller(true);
      } finally {
        setSavingChinese(false);
      }
    }
  };

  const handleSaveChineseProfile = async () => {
    try {
      setSavingChinese(true);
      await saveChineseProfile({
        isChineseSeller: true,
        wechatId: wechatId.trim(),
        locationInChina: locationInChina.trim(),
        businessName: businessName.trim() || undefined,
      });
      setChineseSaved(true);
      setTimeout(() => setChineseSaved(false), 2000);
    } catch {
      Alert.alert("Error", "Failed to save profile.");
    } finally {
      setSavingChinese(false);
    }
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
          {/* Bell icon top-right */}
          <View style={{ alignSelf: 'stretch', alignItems: 'flex-end', paddingHorizontal: 16, marginBottom: 4 }}>
            <Pressable
              onPress={() => setShowNotifications(true)}
              style={{ padding: 4, position: 'relative' }}
            >
              <Feather name="bell" size={22} color="#fff" />
              {unreadNotificationsCount > 0 && (
                <View style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: '#E8192C',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold' }}>
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.initialsRing}
            onPress={() => pickAndUpload("library")}
            disabled={avatarUploading}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.initialsText}>{initials}</Text>
            )}
            {avatarUploading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" size="small" />
                {uploadProgress !== null && (
                  <Text style={styles.avatarPct}>{Math.round(uploadProgress * 100)}%</Text>
                )}
              </View>
            )}
            {currentUser.isVerified && (
              <View style={styles.avatarVerifiedBadge}>
                <Feather name="check" size={10} color="#fff" />
              </View>
            )}
            <View style={styles.cameraBtn}>
              <Feather name="camera" size={11} color="#fff" />
            </View>
          </Pressable>

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

          <View style={styles.profileSection}>
            <Text style={[styles.profileSectionTitle, { color: colors.text }]}>Account details</Text>
            <View style={[styles.detailCard, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
              {[
                { icon: "mail", label: "Email", value: currentUser.email || "Not added" },
                { icon: "phone", label: "Phone", value: currentUser.phone || "Not added" },
                { icon: "map-pin", label: "Location", value: currentUser.location || "Ghana" },
              ].map((item, idx) => (
                <View
                  key={item.label}
                  style={[
                    styles.detailRow,
                    idx < 2 && { borderBottomWidth: 0.5, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
                  ]}
                >
                  <View style={styles.detailIcon}>
                    <Feather name={item.icon as any} size={15} color="#0EB5CA" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={[styles.profileSectionTitle, { color: colors.text }]}>Chinese Seller / Importer</Text>
            <View style={[styles.detailCard, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
              <View style={[styles.detailRow, { borderBottomWidth: isChineseSeller ? 0.5 : 0, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailValue, { color: colors.text }]}>I am a Chinese Seller / Importer</Text>
                </View>
                <Switch
                  value={isChineseSeller}
                  onValueChange={handleChineseToggle}
                  trackColor={{ false: "#CBD5E1", true: "#0EB5CA" }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {isChineseSeller && (
                <>
                  <TextInput
                    style={[styles.chineseInput, { color: colors.text, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}
                    placeholder="WeChat ID"
                    placeholderTextColor={colors.textTertiary}
                    value={wechatId}
                    onChangeText={setWechatId}
                  />
                  <TextInput
                    style={[styles.chineseInput, { color: colors.text, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}
                    placeholder="Location in China (city/province)"
                    placeholderTextColor={colors.textTertiary}
                    value={locationInChina}
                    onChangeText={setLocationInChina}
                  />
                  <TextInput
                    style={[styles.chineseInput, { color: colors.text, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)", backgroundColor: isDark ? "#111827" : "#FFFFFF" }]}
                    placeholder="Business Name in China (optional)"
                    placeholderTextColor={colors.textTertiary}
                    value={businessName}
                    onChangeText={setBusinessName}
                  />
                  <TouchableOpacity style={styles.chineseSaveBtn} onPress={handleSaveChineseProfile} disabled={savingChinese}>
                    {savingChinese
                      ? <ActivityIndicator color="#004D5A" />
                      : <Text style={styles.chineseSaveText}>Save</Text>}
                  </TouchableOpacity>
                  {chineseSaved && <Text style={styles.chineseSavedText}>Profile saved!</Text>}
                </>
              )}
            </View>
          </View>

          <View style={styles.profileSection}>
            <Text style={[styles.profileSectionTitle, { color: colors.text }]}>Sponsorship & Ads</Text>
            <View style={[styles.detailCard, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA", borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
              <View style={[styles.detailRow, { borderBottomWidth: activeListings.length > 0 ? 0.5 : 0, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailValue, { color: colors.text }]}>Status: {sponsorshipTier}</Text>
                  <Text style={[styles.detailLabel, { marginTop: 4 }]}>{adCredits} sponsored post credits remaining</Text>
                </View>
                {sponsorshipTier === 'Premium Seller' && (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
              {activeListings.length === 0 ? (
                <Text style={[styles.sponsorEmpty, { color: colors.textSecondary }]}>No active listings yet. Post a car to promote it.</Text>
              ) : (
                activeListings.map((listing, idx) => {
                  const msgCount = conversations.filter((c) => c.carId === listing.id).length;
                  const startDate = listing.createdAt?.slice(0, 10) ?? '—';
                  const endDate = listing.expiresAt?.slice(0, 10) ?? 'Active';
                  return (
                    <View
                      key={listing.id}
                      style={[
                        styles.sponsorListing,
                        idx < activeListings.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" },
                      ]}
                    >
                      <Text style={[styles.sponsorTitle, { color: colors.text }]} numberOfLines={1}>
                        {listing.brand} {listing.model}
                      </Text>
                      <Text style={[styles.detailLabel]}>GHS {listing.price.toLocaleString()} · {startDate} → {endDate}</Text>
                      <View style={styles.sponsorMetrics}>
                        <Text style={styles.sponsorMetric}>👁 {listing.views ?? 0} views</Text>
                        <Text style={styles.sponsorMetric}>💬 {msgCount} messages</Text>
                        {listing.isSponsored && <Text style={styles.sponsorMetric}>★ Sponsored</Text>}
                      </View>
                      <TouchableOpacity style={styles.boostBtn} onPress={() => router.push('/advertise')}>
                        <Text style={styles.boostBtnText}>Boost this ad</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Profile Completion */}
          <View style={[styles.completionCard, {
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }]}>
            {/* Header row */}
            <View style={styles.completionHeader}>
              <View>
                <Text style={[styles.completionTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>Profile Strength</Text>
                <Text style={[styles.completionSub, { color: isDark ? "#64748B" : "#94A3B8" }]}>
                  {completionPct < 60 ? "Keep going — almost there" : completionPct < 100 ? "Looking good!" : "All complete!"}
                </Text>
              </View>
              <View style={styles.completionCircle}>
                <Text style={styles.completionPct}>{completionPct}%</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
              <View style={[styles.progressFill, { width: `${completionPct}%` as any }]} />
            </View>

            {/* Items grid */}
            <View style={styles.completionGrid}>
              {[
                { label: "Email",       done: completionItems[0].done, icon: "mail",      iconBg: "#EFF6FF", iconColor: "#3B82F6" },
                { label: "Location",    done: completionItems[1].done, icon: "map-pin",   iconBg: "#FFF7ED", iconColor: "#F97316" },
                { label: "Phone",       done: completionItems[2].done, icon: "phone",     iconBg: "#F0FDF4", iconColor: "#22C55E" },
                { label: "ID Verified", done: completionItems[3].done, icon: "shield",    iconBg: "#F5F3FF", iconColor: "#8B5CF6" },
              ].map((item) => (
                <View
                  key={item.label}
                  style={[
                    styles.completionItem,
                    {
                      backgroundColor: item.done
                        ? (isDark ? "rgba(14,181,202,0.08)" : "rgba(14,181,202,0.05)")
                        : (isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"),
                      borderColor: item.done
                        ? (isDark ? "rgba(14,181,202,0.2)" : "rgba(14,181,202,0.18)")
                        : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)"),
                    },
                  ]}
                >
                  <View style={[styles.completionItemIcon, { backgroundColor: item.done ? item.iconBg : (isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9") }]}>
                    <Feather name={item.icon as any} size={13} color={item.done ? item.iconColor : "#94A3B8"} />
                  </View>
                  <Text style={[styles.completionItemLabel, { color: isDark ? (item.done ? "#F1F5F9" : "#64748B") : (item.done ? "#0F172A" : "#94A3B8") }]}>
                    {item.label}
                  </Text>
                  <View style={[styles.completionItemStatus, {
                    backgroundColor: item.done ? "#0EB5CA" : (isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0"),
                  }]}>
                    <Feather name={item.done ? "check" : "plus"} size={9} color={item.done ? "#fff" : "#94A3B8"} />
                  </View>
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
                <View style={styles.listingsGrid}>
                  {myListings.map((car) => {
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
                        {/* Badge overlay */}
                        <View style={styles.listingBadgeOverlay}>
                          <View style={[styles.listingBadge,
                            car.isSold ? { backgroundColor: "rgba(0,0,0,0.55)" } : { backgroundColor: "rgba(10,122,74,0.85)" },
                          ]}>
                            <Text style={[styles.listingBadgeText, { color: "#fff" }]}>
                              {car.isSold ? "Sold" : "Active"}
                            </Text>
                          </View>
                        </View>
                        {img ? (
                          <Image source={{ uri: img }} style={styles.listingImg} resizeMode="cover" />
                        ) : (
                          <View style={[styles.listingImgPlaceholder, { backgroundColor: "rgba(14,181,202,0.12)" }]}>
                            <Feather name="truck" size={26} color="#0EB5CA" />
                          </View>
                        )}
                        <View style={styles.listingInfo}>
                          <Text style={[styles.listingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={2}>
                            {title}
                          </Text>
                          {price !== undefined && (
                            <Text style={styles.listingPrice}>GHS {Number(price).toLocaleString()}</Text>
                          )}
                          <View style={styles.listingMeta}>
                            <Feather name="eye" size={10} color="#94A3B8" />
                            <Text style={styles.listingMetaText}>{(car as any).views ?? 0}</Text>
                            <Feather name="message-circle" size={10} color="#94A3B8" />
                            <Text style={styles.listingMetaText}>{(car as any).chats ?? 0}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
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
                <View style={styles.listingsGrid}>
                  {savedCars.map((car) => {
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
                            <Feather name="truck" size={26} color="#0EB5CA" />
                          </View>
                        )}
                        <View style={styles.listingInfo}>
                          <Text style={[styles.listingTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]} numberOfLines={2}>
                            {title}
                          </Text>
                          {price !== undefined && (
                            <Text style={styles.listingPrice}>GHS {Number(price).toLocaleString()}</Text>
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
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
                  <Switch value={pushNotifEnabled} onValueChange={setPushNotifEnabled}
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
              <TouchableOpacity style={styles.authSignOutBtn} onPress={handleAuthSignOut} disabled={signingOut}>
                {signingOut
                  ? <ActivityIndicator color="#0EB5CA" />
                  : <Text style={styles.authSignOutText}>Sign Out</Text>}
              </TouchableOpacity>

            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Notifications Modal ── */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 16,
            backgroundColor: '#0EB5CA',
          }}>
            <Text style={{ fontSize: 20, fontFamily: 'Manrope_800ExtraBold', color: '#fff' }}>
              Notifications
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              {unreadNotificationsCount > 0 && (
                <Pressable onPress={markAllNotificationsRead}>
                  <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                    Mark all read
                  </Text>
                </Pressable>
              )}
              <Pressable onPress={() => setShowNotifications(false)}>
                <Feather name="x" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>

          {notifications.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Feather name="bell-off" size={48} color="#CBD5E1" />
              <Text style={{ fontSize: 16, fontFamily: 'Inter_500Medium', color: '#94A3B8' }}>
                No notifications yet
              </Text>
              <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: '#CBD5E1',
                textAlign: 'center', paddingHorizontal: 40 }}>
                You'll see messages, saves, and listing activity here
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const iconMap: Record<string, string> = {
                  message: 'message-square',
                  saved: 'heart',
                  listing_view: 'eye',
                  listing_expiry: 'alert-circle',
                  listing_approved: 'check-circle',
                  price_drop: 'trending-down',
                };
                const colorMap: Record<string, string> = {
                  message: '#7C3AED',
                  saved: '#E8192C',
                  listing_view: '#0EB5CA',
                  listing_expiry: '#F59E0B',
                  listing_approved: '#10B981',
                  price_drop: '#0EB5CA',
                };
                const bgMap: Record<string, string> = {
                  message: '#F3EEFF',
                  saved: '#FFEDEE',
                  listing_view: '#E8F7FA',
                  listing_expiry: '#FFFBEB',
                  listing_approved: '#ECFDF5',
                  price_drop: '#E8F7FA',
                };
                return (
                  <Pressable
                    onPress={() => markNotificationRead(item.id)}
                    style={{
                      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                      paddingHorizontal: 20, paddingVertical: 14,
                      backgroundColor: item.read ? 'transparent' :
                        (isDark ? 'rgba(14,181,202,0.08)' : '#F0FBFD'),
                      borderBottomWidth: 0.5,
                      borderBottomColor: isDark ? '#1E2D40' : '#F1F5F9',
                    }}
                  >
                    <View style={{
                      width: 42, height: 42, borderRadius: 21,
                      backgroundColor: bgMap[item.type] ?? '#E8F7FA',
                      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Feather
                        name={iconMap[item.type] as any ?? 'bell'}
                        size={18}
                        color={colorMap[item.type] ?? '#0EB5CA'}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row',
                        justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{
                          fontSize: 14, fontFamily: 'Inter_600SemiBold',
                          color: isDark ? '#F1F5F9' : '#0F172A', flex: 1,
                        }}>{item.title}</Text>
                        {!item.read && (
                          <View style={{
                            width: 8, height: 8, borderRadius: 4,
                            backgroundColor: '#0EB5CA', marginLeft: 8,
                          }} />
                        )}
                      </View>
                      <Text style={{
                        fontSize: 13, fontFamily: 'Inter_400Regular',
                        color: isDark ? '#94A3B8' : '#64748B', marginTop: 2,
                        lineHeight: 18,
                      }}>{item.body}</Text>
                      <Text style={{
                        fontSize: 11, fontFamily: 'Inter_400Regular',
                        color: '#94A3B8', marginTop: 4,
                      }}>
                        {new Date(item.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  // ── Auth wall ──
  authRoot: { flex: 1, backgroundColor: "#EDF4F7", paddingHorizontal: 20 },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.12)",
    shadowColor: "#0A1628",
    shadowOpacity: 0.10,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  authIconRing: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "#E8F7FA",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.24)",
    marginBottom: 14,
  },
  authTitle: {
    fontSize: 28, color: "#0F172A", textAlign: "center",
    fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.6,
  },
  authText: {
    fontSize: 14, color: "#64748B", lineHeight: 22,
    fontFamily: "Inter_400Regular", textAlign: "center",
    marginTop: 8, marginBottom: 24,
  },
  authCtaInner: {
    width: "100%",
    height: 53, borderRadius: 28.5, backgroundColor: "#0EB5CA",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
  },
  authCtaText: { fontSize: 15, color: "#FFFFFF", fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  authSignupRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 22 },
  authSignupPrompt: { fontSize: 13, color: "#64748B", fontFamily: "Inter_400Regular" },
  authSignupLink: { fontSize: 13, color: "#0EB5CA", fontFamily: "Inter_700Bold" },

  // ── Teal header ──
  tealHeader: {
    backgroundColor: "#0EB5CA",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  initialsRing: {
    position: "relative",
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 3, borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 12, overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%", borderRadius: 44 },
  initialsText: {
    fontSize: 32, fontFamily: "Manrope_800ExtraBold",
    color: "#FFFFFF", letterSpacing: 1,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  avatarPct: { color: "#fff", fontSize: 10, marginTop: 2 },
  cameraBtn: {
    position: "absolute", bottom: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#0098AA",
    borderWidth: 1.5, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarVerifiedBadge: {
    position: "absolute", top: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#22C55E",
    borderWidth: 2, borderColor: "#0EB5CA",
    alignItems: "center", justifyContent: "center",
  },
  userName: { fontSize: 24, fontFamily: "Manrope_800ExtraBold", color: "#FFFFFF", letterSpacing: -0.5, textAlign: "center" },
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
    paddingTop: 18,
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

  profileSection: { paddingHorizontal: 16, marginBottom: 12 },
  profileSectionTitle: {
    fontSize: 16,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#E8F7FA",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#94A3B8", textTransform: "uppercase", letterSpacing: 0.4 },
  detailValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 2 },

  // ── Completion card ──
  completionCard: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16, borderWidth: 0.5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  completionHeader: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 12,
  },
  completionTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  completionSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  completionCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(14,181,202,0.1)",
    borderWidth: 2, borderColor: "#0EB5CA",
    alignItems: "center", justifyContent: "center",
  },
  completionPct: { fontSize: 13, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  progressTrack: { height: 5, borderRadius: 99, marginBottom: 14, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: "#0EB5CA" },
  completionGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 8,
  },
  completionItem: {
    width: "47%", flexDirection: "row", alignItems: "center",
    gap: 8, padding: 10, borderRadius: 10, borderWidth: 0.5,
  },
  completionItemIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  completionItemLabel: { flex: 1, fontSize: 11, fontFamily: "Inter_500Medium" },
  completionItemStatus: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },

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

  // ── Listings 2×2 grid ──
  listingsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10,
  },
  listingCard: {
    width: "47%", borderRadius: 12,
    borderWidth: 0.5, overflow: "hidden",
  },
  listingBadgeOverlay: {
    position: "absolute", top: 6, left: 6, zIndex: 1,
  },
  listingImg: { width: "100%", height: 100 },
  listingImgPlaceholder: {
    width: "100%", height: 100,
    alignItems: "center", justifyContent: "center",
  },
  listingInfo: { padding: 8, gap: 3 },
  listingBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  listingBadgeText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
  listingTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  listingPrice: { fontSize: 13, fontFamily: "Manrope_800ExtraBold", color: "#0EB5CA" },
  listingMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
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
  authSignOutBtn: {
    marginHorizontal: 16,
    marginBottom: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#004D5A",
    alignItems: "center",
    justifyContent: "center",
  },
  authSignOutText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#0EB5CA" },
  chineseInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  chineseSaveBtn: {
    backgroundColor: "#0EB5CA",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  chineseSaveText: { color: "#004D5A", fontSize: 15, fontFamily: "Inter_700Bold" },
  chineseSavedText: { color: "#16A34A", fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center", marginTop: 10 },
  premiumBadge: { backgroundColor: "#F59E0B", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  premiumBadgeText: { color: "#004D5A", fontSize: 11, fontFamily: "Inter_700Bold" },
  sponsorEmpty: { fontSize: 13, fontFamily: "Inter_400Regular", paddingVertical: 12, textAlign: "center" },
  sponsorListing: { paddingVertical: 14, gap: 6 },
  sponsorTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  sponsorMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sponsorMetric: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#64748B" },
  boostBtn: { marginTop: 4, alignSelf: "flex-start", backgroundColor: "#0EB5CA", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  boostBtnText: { color: "#004D5A", fontSize: 13, fontFamily: "Inter_700Bold" },
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
