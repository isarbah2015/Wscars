// app/advertise-book.tsx
// ✅ Fixed: reads packageId + adType params (not the old 'pkg' param)
// ✅ Fixed: getSpecInfo maps all new package IDs from advertise.tsx
// ✅ Fixed: price parsed correctly from "GHS 120" string
// ✅ Fixed: real ImagePicker for flyer (images) and video (video files)
// ✅ Fixed: real DocumentPicker for SRT captions
// ✅ Fixed: order summary shows correct package name and ad type
// ✅ Fixed: upload zone label, pills and validation all respect adType

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Brand ───────────────────────────────────────────────────────────────────
const TEAL      = "#0EB5CA";
const DARK_CARD = "#1C1C1E";
const DARK_CELL = "#2C2C2E";
const DARK_SEP  = "#2A2A2C";

// ─── Spec data — keyed by packageId from advertise.tsx ───────────────────────
type SpecItem = { key: string; value: string };
type SpecInfo = {
  label: string;
  isAutoGen: boolean;
  isVideo: boolean;
  specs: SpecItem[];
};

function getSpecInfo(packageId: string, adType: string): SpecInfo {
  // ── Video packages ────────────────────────────────────────────────────────
  if (adType === "video" || packageId.startsWith("video_")) {
    const videoSpecs: SpecItem[] = [
      { key: "Format",        value: "MP4 · H.264 codec" },
      { key: "Resolution",    value: "1280 × 720 px minimum (1920 × 1080 preferred)" },
      { key: "Aspect ratio",  value: "16:9 landscape" },
      { key: "Frame rate",    value: "24, 25 or 30 fps" },
      { key: "Audio",         value: "Stereo · 44.1 kHz · max −14 LUFS" },
      { key: "Captions",      value: "SRT file required" },
      { key: "Max file size", value: "500 MB" },
    ];
    if (packageId === "video_basic") {
      return {
        label: "Short Clip Ad", isAutoGen: false, isVideo: true,
        specs: [
          { key: "Duration",      value: "Up to 15 seconds" },
          { key: "Resolution",    value: "320 × 480 px (vertical)" },
          { key: "Format",        value: "MP4 / MOV" },
          { key: "Max file size", value: "150 MB" },
          { key: "Captions",      value: "SRT file required" },
        ],
      };
    }
    if (packageId === "video_featured") {
      return {
        label: "Feature Reel Ad", isAutoGen: false, isVideo: true,
        specs: [
          { key: "Duration",      value: "Up to 30 seconds" },
          { key: "Resolution",    value: "1280 × 720 px (HD)" },
          { key: "Format",        value: "MP4 · H.264" },
          { key: "Frame rate",    value: "24, 25 or 30 fps" },
          { key: "Max file size", value: "300 MB" },
          { key: "Audio",         value: "Stereo · 44.1 kHz · max −14 LUFS" },
          { key: "Captions",      value: "SRT file required" },
        ],
      };
    }
    if (packageId === "video_premium") {
      return {
        label: "Cinematic Ad", isAutoGen: false, isVideo: true,
        specs: [
          { key: "Duration",      value: "Up to 60 seconds" },
          { key: "Resolution",    value: "1920 × 1080 px (Full HD)" },
          { key: "Format",        value: "MP4 · H.264 (4K supported)" },
          { key: "Frame rate",    value: "24, 25 or 30 fps" },
          { key: "Max file size", value: "500 MB" },
          { key: "Audio",         value: "Stereo · 44.1 kHz · max −14 LUFS" },
          { key: "Captions",      value: "SRT file required" },
        ],
      };
    }
    // Generic video fallback
    return { label: "Video Ad", isAutoGen: false, isVideo: true, specs: videoSpecs };
  }

  // ── Flyer packages ────────────────────────────────────────────────────────
  if (packageId === "flyer_basic") {
    return {
      label: "Basic Flyer Ad", isAutoGen: false, isVideo: false,
      specs: [
        { key: "File type",     value: "JPG or PNG only" },
        { key: "Size",          value: "320 × 100 px (Mobile Banner)" },
        { key: "Max file size", value: "3 MB" },
        { key: "Color mode",    value: "RGB / sRGB" },
        { key: "Safe zone",     value: "Keep text 20 px from all edges" },
      ],
    };
  }
  if (packageId === "flyer_featured") {
    return {
      label: "Featured Flyer Ad", isAutoGen: false, isVideo: false,
      specs: [
        { key: "File type",     value: "JPG or PNG only" },
        { key: "Size",          value: "300 × 250 px (Medium Rectangle)" },
        { key: "Max file size", value: "5 MB" },
        { key: "Color mode",    value: "RGB / sRGB" },
        { key: "Safe zone",     value: "Keep text 40 px from all edges" },
      ],
    };
  }
  if (packageId === "flyer_premium") {
    return {
      label: "Premium Flyer Ad", isAutoGen: false, isVideo: false,
      specs: [
        { key: "File type",     value: "JPG or PNG only" },
        { key: "Desktop size",  value: "728 × 90 px (Leaderboard)" },
        { key: "Mobile size",   value: "320 × 50 px (auto-resized)" },
        { key: "Max file size", value: "5 MB" },
        { key: "Color mode",    value: "RGB / sRGB" },
        { key: "Safe zone",     value: "Keep text 40 px from all edges" },
      ],
    };
  }

  // ── Legacy / fallback package IDs (old advertise page) ───────────────────
  const legacyMap: Record<string, SpecInfo> = {
    sponsored_listing: {
      label: "Sponsored Listing", isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated from", value: "Your active listing" },
        { key: "Placement",           value: "Top of all search results" },
      ],
    },
    featured_listing: {
      label: "Featured Car", isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated from", value: "Your active listing" },
        { key: "Visual",              value: "Gold border + \"Featured\" badge" },
      ],
    },
    urgent_badge: {
      label: "Urgent Sale Badge", isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated", value: "\"URGENT\" badge on your listing card" },
      ],
    },
    video_15: {
      label: "15-Second Video Ad", isAutoGen: false, isVideo: true,
      specs: [
        { key: "Duration",      value: "Exactly 15 seconds" },
        { key: "Format",        value: "MP4 · H.264 codec" },
        { key: "Resolution",    value: "1920 × 1080 (Full HD)" },
        { key: "Max file size", value: "150 MB" },
      ],
    },
    video_30: {
      label: "30-Second Video Ad", isAutoGen: false, isVideo: true,
      specs: [
        { key: "Duration",      value: "Exactly 30 seconds" },
        { key: "Format",        value: "MP4 · H.264 codec" },
        { key: "Resolution",    value: "1920 × 1080 (Full HD)" },
        { key: "Max file size", value: "300 MB" },
      ],
    },
  };
  if (legacyMap[packageId]) return legacyMap[packageId];

  // Default flyer fallback
  return {
    label: "Flyer Ad", isAutoGen: false, isVideo: false,
    specs: [
      { key: "File type",     value: "JPG or PNG only" },
      { key: "Home banner",   value: "1200 × 400 px" },
      { key: "Feed card",     value: "800 × 600 px" },
      { key: "Max file size", value: "5 MB" },
      { key: "Color mode",    value: "RGB / sRGB" },
    ],
  };
}

// ─── Regions ─────────────────────────────────────────────────────────────────
const REGIONS = [
  "All Regions", "Greater Accra", "Ashanti", "Western", "Eastern",
  "Central", "Northern", "Upper East", "Upper West",
  "Volta", "Brong-Ahafo",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse price from "GHS 120" or "120" → 120 */
function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw.replace(/[^\d.]/g, ""));
  return isNaN(n) ? 0 : n;
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AdvertiseBookScreen() {
  // ── Params — support both old (pkg) and new (packageId + adType) format ───
  const params = useLocalSearchParams<{
    // New format (from updated advertise.tsx)
    packageId?: string;
    packageName?: string;
    adType?: string;
    price?: string;
    duration?: string;
    dimensions?: string;
    // Old format fallback
    pkg?: string;
  }>();

  const packageId   = params.packageId || params.pkg || "flyer_featured";
  const adType      = params.adType    || (packageId.startsWith("video") ? "video" : "flyer");
  const packageName = params.packageName || "";
  const priceRaw    = params.price     || "0";
  const duration    = params.duration  || "";
  const dimensions  = params.dimensions || "";

  // Parse price whether it comes as "GHS 120" or "120"
  const priceNum = parsePrice(priceRaw);
  const priceDisplay = priceNum > 0
    ? `GHS ${priceNum.toLocaleString()}`
    : priceRaw.startsWith("GHS") ? priceRaw : `GHS ${priceRaw}`;

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const info = getSpecInfo(packageId, adType);

  // ── State ─────────────────────────────────────────────────────────────────
  const [creativeFile,     setCreativeFile]     = useState<{ name: string; uri: string } | null>(null);
  const [captionFile,      setCaptionFile]      = useState<{ name: string } | null>(null);
  const [businessName,     setBusinessName]     = useState("");
  const [phone,            setPhone]            = useState("");
  const [email,            setEmail]            = useState("");
  const [region,           setRegion]           = useState("Greater Accra");
  const [notes,            setNotes]            = useState("");
  const [payMethod,        setPayMethod]        = useState<"mobile" | "bank">("mobile");
  const [focusedField,     setFocusedField]     = useState<string | null>(null);
  const [specsOpen,        setSpecsOpen]        = useState(false);
  const [uploading,        setUploading]        = useState(false);

  // ── File pickers ──────────────────────────────────────────────────────────

  const handleUploadCreative = async () => {
    if (info.isVideo) {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photo library to upload a video.");
        return;
      }
      setUploading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['videos'] as any,
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const fileName = asset.uri.split("/").pop() || "video.mp4";
          setCreativeFile({ name: fileName, uri: asset.uri });
        }
      } catch (err) {
        Alert.alert("Error", "Could not open video picker. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow access to your photo library to upload your flyer.");
        return;
      }
      setUploading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'] as any,
          allowsEditing: false,
          quality: 1,
        });
        if (!result.canceled && result.assets?.[0]) {
          const asset = result.assets[0];
          const fileName = asset.uri.split("/").pop() || "flyer.jpg";
          setCreativeFile({ name: fileName, uri: asset.uri });
        }
      } catch (err) {
        Alert.alert("Error", "Could not open image picker. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleUploadCaption = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/x-subrip", "text/plain", "*/*"],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        setCaptionFile({ name: result.assets[0].name });
      }
    } catch (err) {
      Alert.alert("Error", "Could not open file picker. Please try again.");
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!businessName.trim() || !phone.trim()) {
      Alert.alert("Required fields", "Please fill in your business name and phone number.");
      return;
    }
    if (!info.isAutoGen && !creativeFile) {
      Alert.alert(
        "Upload required",
        `Please upload your ${info.isVideo ? "video file (MP4)" : "creative image (JPG or PNG)"} before confirming.`
      );
      return;
    }
    Alert.alert(
      "Booking Confirmed!",
      `Thank you, ${businessName}!\n\nOur ads team will contact you on ${phone} within 24 hours to complete payment and activation.`,
      [{ text: "Done", onPress: () => { router.back(); router.back(); } }]
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Teal gradient header ── */}
      <LinearGradient
        colors={["#004D5E", "#0098AA", TEAL]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 10 }]}
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <View style={styles.headerBody}>
          <View style={{ flex: 1 }}>
            <View style={styles.adTypeBadge}>
              <Feather
                name={info.isVideo ? "film" : "image"}
                size={11}
                color={TEAL}
              />
              <Text style={styles.adTypeBadgeTxt}>
                {info.isVideo ? "Video Ad" : "Flyer Ad"}
              </Text>
            </View>
            <Text style={styles.headerTitle}>
              {packageName || info.label}
            </Text>
            {duration ? <Text style={styles.headerSub}>{duration}</Text> : null}
            {dimensions ? (
              <Text style={styles.headerDim} numberOfLines={1}>{dimensions}</Text>
            ) : null}
          </View>
          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>{priceDisplay}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Upload / auto-gen hero ── */}
        {info.isAutoGen ? (
          <View style={[styles.darkCard, { margin: 16, alignItems: "center", paddingVertical: 28, gap: 12 }]}>
            <View style={styles.autoIconCircle}>
              <Feather name="zap" size={30} color={TEAL} />
            </View>
            <Text style={styles.autoTitle}>No upload needed</Text>
            <Text style={styles.autoSub}>
              Your ad creative is built automatically from your listing — our system
              pulls your car photos, title, and price.{"\n\n"}Just confirm your
              details below to activate.
            </Text>
          </View>
        ) : (
          <View style={[styles.darkCard, { margin: 16, gap: 12 }]}>

            <View style={styles.uploadHeroHeader}>
              <Feather name={info.isVideo ? "film" : "image"} size={18} color={TEAL} />
              <Text style={styles.uploadHeroTitle}>
                {info.isVideo
                  ? "Upload your video file (MP4)"
                  : "Upload your flyer image (JPG or PNG)"}
              </Text>
            </View>

            {/* Upload zone */}
            <Pressable
              style={[styles.uploadZone, !!creativeFile && styles.uploadZoneDone]}
              onPress={handleUploadCreative}
              disabled={uploading}
            >
              {creativeFile ? (
                <>
                  <View style={styles.uploadDoneIcon}>
                    <Feather name="check" size={26} color="#27AE60" />
                  </View>
                  <Text style={styles.uploadDoneLabel}>
                    {info.isVideo ? "Video" : "Image"} selected ✓
                  </Text>
                  <Text style={styles.uploadDoneFilename} numberOfLines={1}>
                    {creativeFile.name}
                  </Text>
                  <Text style={styles.uploadDoneHint}>Tap to replace</Text>
                </>
              ) : (
                <>
                  <View style={styles.uploadArrowCircle}>
                    <Feather
                      name={uploading ? "loader" : "upload"}
                      size={26}
                      color={TEAL}
                    />
                  </View>
                  <Text style={styles.uploadZoneLabel}>
                    {uploading
                      ? "Opening picker…"
                      : info.isVideo
                        ? "Tap to select MP4 / MOV video"
                        : "Tap to select JPG or PNG image"}
                  </Text>

                  {/* Spec pills — dynamically correct per ad type */}
                  <View style={styles.uploadSpecPills}>
                    {info.isVideo ? (
                      <>
                        <View style={styles.pill}><Text style={styles.pillText}>MP4 · MOV</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>HD / Full HD</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>Max 500 MB</Text></View>
                      </>
                    ) : (
                      <>
                        <View style={styles.pill}><Text style={styles.pillText}>JPG or PNG</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>Max 5 MB</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>RGB color</Text></View>
                      </>
                    )}
                  </View>
                </>
              )}
            </Pressable>

            {/* SRT captions — video only */}
            {info.isVideo && (
              <Pressable
                style={[styles.captionZone, !!captionFile && styles.captionZoneDone]}
                onPress={handleUploadCaption}
              >
                <Feather
                  name={captionFile ? "check-circle" : "file-text"}
                  size={18}
                  color={captionFile ? "#27AE60" : TEAL}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.captionLabel, !!captionFile && { color: "#27AE60" }]}>
                    {captionFile
                      ? `Captions uploaded ✓  ${captionFile.name}`
                      : "Upload SRT captions file"}
                  </Text>
                  <Text style={styles.captionHint}>
                    Required for all video ads · .srt format
                  </Text>
                </View>
                <Feather
                  name={captionFile ? "refresh-cw" : "upload"}
                  size={14}
                  color="rgba(255,255,255,0.4)"
                />
              </Pressable>
            )}

            {/* Specs accordion */}
            <Pressable
              style={styles.specsToggle}
              onPress={() => setSpecsOpen(!specsOpen)}
            >
              <Feather name="info" size={14} color={TEAL} />
              <Text style={styles.specsToggleText}>
                View exact {info.isVideo ? "video" : "image"} specifications
              </Text>
              <Feather
                name={specsOpen ? "chevron-up" : "chevron-down"}
                size={14}
                color="rgba(255,255,255,0.4)"
              />
            </Pressable>

            {specsOpen && (
              <View style={styles.specsBody}>
                {info.specs.map((s, i) => (
                  <View
                    key={s.key}
                    style={[
                      styles.specRow,
                      i > 0 && { borderTopWidth: 1, borderTopColor: DARK_SEP },
                    ]}
                  >
                    <Text style={styles.specKey}>{s.key}</Text>
                    <Text style={styles.specVal}>{s.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Contact form ── */}
        <View style={[styles.darkCard, { marginHorizontal: 16, marginTop: 0, gap: 14 }]}>
          <Text style={styles.cardTitle}>Your details</Text>
          {[
            {
              key: "biz",   label: "Business / Dealership name *",
              val: businessName, set: setBusinessName,
              icon: "briefcase", ph: "e.g. Kwame Auto Sales",
            },
            {
              key: "phone", label: "Phone / WhatsApp *",
              val: phone, set: setPhone,
              icon: "phone", ph: "+233 24 123 4567",
            },
            {
              key: "email", label: "Email address",
              val: email, set: setEmail,
              icon: "mail", ph: "you@example.com",
            },
          ].map((f) => (
            <View key={f.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={[styles.field, focusedField === f.key && styles.fieldFocused]}>
                <Feather
                  name={f.icon as any}
                  size={15}
                  color={focusedField === f.key ? TEAL : "rgba(255,255,255,0.35)"}
                />
                <TextInput
                  style={styles.input}
                  value={f.val}
                  onChangeText={f.set}
                  placeholder={f.ph}
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  onFocus={() => setFocusedField(f.key)}
                  onBlur={() => setFocusedField(null)}
                  keyboardType={f.key === "phone" ? "phone-pad" : f.key === "email" ? "email-address" : "default"}
                  autoCapitalize={f.key === "email" ? "none" : "words"}
                />
              </View>
            </View>
          ))}

          {/* Target region */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Target region</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.regionRow}
            >
              {REGIONS.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.regionChip, region === r && styles.regionChipActive]}
                  onPress={() => setRegion(r)}
                >
                  <Text style={[styles.regionText, region === r && styles.regionTextActive]}>
                    {r}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Notes */}
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Notes for our ads team</Text>
            <View style={[styles.fieldMulti, focusedField === "notes" && styles.fieldFocused]}>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any instructions or special requirements…"
                placeholderTextColor="rgba(255,255,255,0.25)"
                multiline
                onFocus={() => setFocusedField("notes")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* ── Payment method ── */}
        <View style={[styles.darkCard, { marginHorizontal: 16, marginTop: 12, gap: 10 }]}>
          <Text style={styles.cardTitle}>Payment method</Text>
          {(
            [
              { id: "mobile", label: "Mobile Money",  sub: "MTN · Vodafone · AirtelTigo", icon: "smartphone" },
              { id: "bank",   label: "Bank Transfer", sub: "GCB · Ecobank · Stanbic",    icon: "credit-card" },
            ] as { id: "mobile" | "bank"; label: string; sub: string; icon: string }[]
          ).map((p) => (
            <Pressable
              key={p.id}
              style={[styles.payOpt, payMethod === p.id && styles.payOptActive]}
              onPress={() => setPayMethod(p.id)}
            >
              <View
                style={[
                  styles.payIcon,
                  payMethod === p.id && { backgroundColor: "rgba(14,181,202,0.15)" },
                ]}
              >
                <Feather
                  name={p.icon as any}
                  size={18}
                  color={payMethod === p.id ? TEAL : "rgba(255,255,255,0.5)"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payLabel, payMethod === p.id && { color: TEAL }]}>
                  {p.label}
                </Text>
                <Text style={styles.paySub}>{p.sub}</Text>
              </View>
              <Feather
                name={payMethod === p.id ? "check-circle" : "circle"}
                size={18}
                color={payMethod === p.id ? TEAL : "rgba(255,255,255,0.25)"}
              />
            </Pressable>
          ))}
        </View>

        {/* ── Order summary ── */}
        <View style={[styles.darkCard, { marginHorizontal: 16, marginTop: 12, gap: 0 }]}>
          <Text
            style={[
              styles.cardTitle,
              { paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: DARK_SEP },
            ]}
          >
            Order summary
          </Text>
          {[
            { k: "Ad type",    v: info.isVideo ? "Video Ad" : "Flyer Ad" },
            { k: "Package",    v: packageName || info.label },
            { k: "Duration",   v: duration || "N/A" },
            { k: "Dimensions", v: dimensions || (info.specs[1]?.value || "See specs") },
            { k: "Region",     v: region },
            { k: "Payment",    v: payMethod === "mobile" ? "Mobile Money" : "Bank Transfer" },
          ].map((row, i) => (
            <View
              key={row.k}
              style={[
                styles.sumRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: DARK_SEP },
              ]}
            >
              <Text style={styles.sumKey}>{row.k}</Text>
              <Text style={styles.sumVal}>{row.v}</Text>
            </View>
          ))}
          <View
            style={[
              styles.sumRow,
              styles.sumTotal,
              { borderTopWidth: 1, borderTopColor: DARK_SEP },
            ]}
          >
            <Text style={styles.sumTotalKey}>Total</Text>
            <Text style={styles.sumTotalVal}>{priceDisplay}</Text>
          </View>
        </View>

        <View style={{ height: (insets.bottom || 0) + 120 }} />
      </ScrollView>

      {/* ── Sticky confirm bar ── */}
      <View
        style={[
          styles.submitBar,
          { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 16 : 12) },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.submitLbl}>Total due</Text>
          <Text style={styles.submitPrice}>{priceDisplay}</Text>
        </View>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Confirm Booking</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#121212" },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  backLabel: { fontSize: 14, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" },
  headerBody: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  adTypeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(14,181,202,0.2)", borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: "flex-start", marginBottom: 6,
  },
  adTypeBadgeTxt: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: TEAL },
  headerTitle: { fontSize: 20, fontFamily: "Manrope_800ExtraBold", color: "#fff", letterSpacing: -0.3 },
  headerSub:   { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 2 },
  headerDim:   { fontSize: 11, color: "rgba(14,181,202,0.9)", fontFamily: "Inter_500Medium", marginTop: 3 },
  priceTag: {
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start",
  },
  priceTagText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },

  // Dark card
  darkCard: { backgroundColor: DARK_CARD, borderRadius: 16, padding: 16, overflow: "hidden" },

  // Auto-gen
  autoIconCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "rgba(14,181,202,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  autoTitle: { fontSize: 18, fontFamily: "Manrope_800ExtraBold", color: "#fff" },
  autoSub: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 20,
  },

  // Upload
  uploadHeroHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  uploadHeroTitle:  { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", flex: 1 },

  uploadZone: {
    borderWidth: 1.5, borderColor: "rgba(14,181,202,0.4)", borderStyle: "dashed",
    borderRadius: 14, padding: 26, alignItems: "center", gap: 10,
    backgroundColor: "rgba(14,181,202,0.05)",
  },
  uploadZoneDone: { borderColor: "#27AE60", backgroundColor: "rgba(39,174,96,0.07)" },
  uploadArrowCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center", justifyContent: "center",
  },
  uploadZoneLabel:   { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  uploadSpecPills:   { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    backgroundColor: "rgba(14,181,202,0.15)", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontFamily: "Inter_500Medium", color: TEAL },

  uploadDoneIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "rgba(39,174,96,0.12)", alignItems: "center", justifyContent: "center",
  },
  uploadDoneLabel:    { fontSize: 15, fontFamily: "Inter_700Bold", color: "#27AE60" },
  uploadDoneFilename: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular", maxWidth: "90%" },
  uploadDoneHint:     { fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular" },

  captionZone: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: "rgba(14,181,202,0.3)", borderRadius: 12,
    padding: 14, backgroundColor: "rgba(14,181,202,0.04)",
  },
  captionZoneDone: { borderColor: "#27AE60" },
  captionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#fff" },
  captionHint:  { fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular", marginTop: 2 },

  specsToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 6, paddingHorizontal: 2,
  },
  specsToggleText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", color: TEAL },
  specsBody:  { backgroundColor: DARK_CELL, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  specRow:    { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9 },
  specKey:    { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.5)", flex: 1 },
  specVal:    { fontSize: 12, fontFamily: "Inter_400Regular", color: "#fff", flex: 2, textAlign: "right" },

  // Form
  cardTitle:  { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  fieldWrap:  { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.55)" },
  field: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 48, backgroundColor: DARK_CELL, borderRadius: 10,
    paddingHorizontal: 14, borderWidth: 1.5, borderColor: "transparent",
  },
  fieldFocused: { borderColor: TEAL },
  fieldMulti: {
    backgroundColor: DARK_CELL, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1.5, borderColor: "transparent", minHeight: 90,
  },
  input:    { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular", color: "#fff" },
  textArea: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#fff", minHeight: 70 },

  regionRow:        { flexDirection: "row", gap: 8, paddingVertical: 4 },
  regionChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: DARK_CELL,
  },
  regionChipActive: { backgroundColor: TEAL, borderColor: TEAL },
  regionText:       { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.6)" },
  regionTextActive: { color: "#fff", fontFamily: "Inter_700Bold" },

  // Payment
  payOpt: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: "transparent", backgroundColor: DARK_CELL,
  },
  payOptActive: { borderColor: TEAL },
  payIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: DARK_CARD, alignItems: "center", justifyContent: "center",
  },
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  paySub:   { fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular", marginTop: 2 },

  // Summary
  sumRow:      { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  sumKey:      { fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  sumVal:      { fontSize: 13, color: "#fff", fontFamily: "Inter_500Medium", textAlign: "right", flex: 1, paddingLeft: 16 },
  sumTotal:    { marginTop: 2 },
  sumTotalKey: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  sumTotalVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: TEAL, textAlign: "right", flex: 1, paddingLeft: 16 },

  // Sticky bar
  submitBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#111",
    paddingTop: 14, paddingHorizontal: 20, gap: 16,
    borderTopWidth: 1, borderTopColor: "#2A2A2A",
  },
  submitLbl:     { fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "Inter_400Regular" },
  submitPrice:   { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginTop: 2 },
  submitBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 13,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
