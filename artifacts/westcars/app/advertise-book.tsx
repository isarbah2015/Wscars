import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SpecItem = { key: string; value: string };
type SpecInfo = { label: string; isAutoGen: boolean; isVideo: boolean; specs: SpecItem[] };

function getSpecInfo(pkg: string): SpecInfo {
  const map: Record<string, SpecInfo> = {
    sponsored_listing: {
      label: "Sponsored Listing",
      isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated from", value: "Your active listing" },
        { key: "Placement", value: "Top of all search results" },
        { key: "Title", value: "Auto-pulled (max 60 chars)" },
        { key: "Image", value: "Your car photos are used automatically" },
        { key: "No upload needed", value: "We build the creative from your listing" },
      ],
    },
    featured_listing: {
      label: "Featured Car",
      isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated from", value: "Your active listing" },
        { key: "Visual", value: "Gold border + \"Featured\" badge added" },
        { key: "Placement", value: "Special Offers row on home screen" },
        { key: "No upload needed", value: "Badge applied automatically" },
      ],
    },
    urgent_badge: {
      label: "Urgent Sale Badge",
      isAutoGen: true, isVideo: false,
      specs: [
        { key: "Auto-generated", value: "\"URGENT\" badge on your listing card" },
        { key: "Color", value: "Bright red — draws immediate attention" },
        { key: "No upload needed", value: "Applied automatically to your listing" },
      ],
    },
    flyer: {
      label: "Flyer Ad",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "File type", value: "JPG or PNG only" },
        { key: "Home banner size", value: "1200 × 400 px" },
        { key: "Feed card size", value: "800 × 600 px" },
        { key: "Max file size", value: "5 MB" },
        { key: "Color mode", value: "RGB / sRGB" },
        { key: "Safe zone", value: "Keep text 40 px from all edges" },
      ],
    },
    banner_top: {
      label: "Top Banner Ad",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "File type", value: "JPG, PNG or animated GIF" },
        { key: "Desktop size", value: "1200 × 200 px" },
        { key: "Mobile size", value: "800 × 200 px" },
        { key: "Max file size", value: "3 MB static / 1 MB GIF" },
        { key: "GIF animation", value: "Max 3 loops, 15 sec total" },
        { key: "Min text size", value: "14pt for readability" },
      ],
    },
    video_15: {
      label: "15-Second Video Ad",
      isAutoGen: false, isVideo: true,
      specs: [
        { key: "Duration", value: "Exactly 15 seconds" },
        { key: "Format", value: "MP4 · H.264 codec" },
        { key: "Resolution", value: "1920 × 1080 (Full HD)" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "150 MB" },
        { key: "Audio", value: "Stereo · 44.1 kHz · max −14 LUFS" },
        { key: "Captions", value: "SRT file required" },
      ],
    },
    video_20: {
      label: "20-Second Video Ad",
      isAutoGen: false, isVideo: true,
      specs: [
        { key: "Duration", value: "Exactly 20 seconds" },
        { key: "Format", value: "MP4 · H.264 codec" },
        { key: "Resolution", value: "1920 × 1080 (Full HD)" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "200 MB" },
        { key: "Audio", value: "Stereo · 44.1 kHz · max −14 LUFS" },
        { key: "Frame rate", value: "24, 25 or 30 fps" },
      ],
    },
    video_30: {
      label: "30-Second Video Ad",
      isAutoGen: false, isVideo: true,
      specs: [
        { key: "Duration", value: "Exactly 30 seconds" },
        { key: "Format", value: "MP4 · H.264 codec (4K supported)" },
        { key: "Resolution", value: "1920 × 1080 or 3840 × 2160" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "300 MB" },
        { key: "Audio", value: "Stereo · 44.1 kHz · max −14 LUFS" },
        { key: "Frame rate", value: "24, 25 or 30 fps" },
      ],
    },
    push_blast: {
      label: "Push Notification Blast",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "Title", value: "Max 50 characters (bold)" },
        { key: "Body text", value: "Max 120 characters" },
        { key: "Optional image", value: "400 × 400 px · JPG/PNG · max 500 KB" },
        { key: "CTA button", value: "Max 20 characters" },
        { key: "Deep link", value: "Auto-set to your listing" },
      ],
    },
    social_boost: {
      label: "Social Media Cross-Post",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "Facebook", value: "1200 × 628 px or 1080 × 1080 px" },
        { key: "Instagram", value: "1080 × 1080 px or 1080 × 1350 px" },
        { key: "WhatsApp", value: "Image + caption (max 500 chars)" },
        { key: "File type", value: "JPG or PNG · max 8 MB" },
        { key: "Caption", value: "You write or our team does (max 280 chars)" },
      ],
    },
    dealer_spotlight: {
      label: "Dealer Spotlight Page",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "Hero banner", value: "1400 × 400 px" },
        { key: "Logo", value: "400 × 400 px · transparent PNG" },
        { key: "About text", value: "Max 500 characters" },
        { key: "Contact", value: "Phone / WhatsApp number" },
        { key: "Listings", value: "All your active listings included automatically" },
      ],
    },
    dealer_verified: {
      label: "Verified Dealer Badge",
      isAutoGen: false, isVideo: false,
      specs: [
        { key: "Required doc", value: "Business registration (JPG or PDF)" },
        { key: "Name match", value: "Must match official registration" },
        { key: "Verification", value: "OTP sent to registered phone" },
        { key: "Review time", value: "1–3 business days" },
        { key: "Badge shown as", value: "Blue ✓ on all listings & profile" },
      ],
    },
  };
  return map[pkg] || map["flyer"];
}

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern",
  "Central", "Northern", "Upper East", "Upper West",
  "Volta", "Brong-Ahafo", "All Regions",
];

export default function AdvertiseBookScreen() {
  const params = useLocalSearchParams<{ pkg: string; price: string; duration: string }>();
  const pkg = params.pkg || "flyer";
  const priceNum = Number(params.price) || 0;
  const duration = params.duration || "";

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const info = getSpecInfo(pkg);

  const [creativeUploaded, setCreativeUploaded] = useState(false);
  const [captionUploaded, setCaptionUploaded] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState<"mobile" | "bank">("mobile");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [specsOpen, setSpecsOpen] = useState(false);

  const handleUploadCreative = () => {
    setCreativeUploaded(true);
    Alert.alert("File selected", "Your creative file is ready to submit.");
  };

  const handleUploadCaption = () => {
    setCaptionUploaded(true);
    Alert.alert("Captions selected", "SRT file is ready to submit.");
  };

  const handleSubmit = () => {
    if (!businessName.trim() || !phone.trim()) {
      Alert.alert("Required fields", "Please fill in your business name and phone.");
      return;
    }
    if (!info.isAutoGen && !creativeUploaded) {
      Alert.alert("Upload required", `Please upload your ${info.isVideo ? "video file" : "creative image"} before confirming.`);
      return;
    }
    Alert.alert(
      "Booking Confirmed!",
      `Thank you, ${businessName}!\n\nOur ads team will contact you on ${phone} within 24 hours to complete activation.`,
      [{ text: "Done", onPress: () => { router.back(); router.back(); } }]
    );
  };

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>{info.label}</Text>
          {duration ? <Text style={styles.topSub}>{duration}</Text> : null}
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>GHS {priceNum.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ── UPLOAD / AUTO-GEN HERO ── */}
        {info.isAutoGen ? (
          <View style={styles.autoGenHero}>
            <View style={styles.autoGenIconCircle}>
              <Feather name="zap" size={32} color="#0066CC" />
            </View>
            <Text style={styles.autoGenTitle}>No upload needed</Text>
            <Text style={styles.autoGenSub}>
              Your ad creative is built automatically from your listing — our system pulls your car photos, title, and price.{"\n\n"}Just confirm your details below to activate.
            </Text>
          </View>
        ) : (
          <View style={styles.uploadHero}>
            <View style={styles.uploadHeroHeader}>
              <Feather name={info.isVideo ? "film" : "image"} size={20} color="#0066CC" />
              <Text style={styles.uploadHeroTitle}>
                Upload your {info.isVideo ? "video file" : "creative image"}
              </Text>
            </View>

            {/* Main upload zone */}
            <Pressable
              style={[styles.uploadZone, creativeUploaded && styles.uploadZoneDone]}
              onPress={handleUploadCreative}
            >
              {creativeUploaded ? (
                <>
                  <View style={styles.uploadDoneIcon}>
                    <Feather name="check" size={28} color="#27AE60" />
                  </View>
                  <Text style={styles.uploadDoneLabel}>File uploaded ✓</Text>
                  <Text style={styles.uploadDoneHint}>Tap to replace</Text>
                </>
              ) : (
                <>
                  <View style={styles.uploadArrowCircle}>
                    <Feather name="upload" size={28} color="#0066CC" />
                  </View>
                  <Text style={styles.uploadZoneLabel}>
                    Tap to select {info.isVideo ? "MP4 video" : "JPG / PNG image"}
                  </Text>
                  <View style={styles.uploadSpecPills}>
                    {info.isVideo ? (
                      <>
                        <View style={styles.pill}><Text style={styles.pillText}>MP4 · H.264</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>1920 × 1080</Text></View>
                        <View style={styles.pill}><Text style={styles.pillText}>Max 300 MB</Text></View>
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

            {/* SRT captions (video only) */}
            {info.isVideo && (
              <Pressable
                style={[styles.captionZone, captionUploaded && styles.uploadZoneDone]}
                onPress={handleUploadCaption}
              >
                <Feather
                  name={captionUploaded ? "check-circle" : "file-text"}
                  size={18}
                  color={captionUploaded ? "#27AE60" : "#0066CC"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.captionLabel, captionUploaded && { color: "#27AE60" }]}>
                    {captionUploaded ? "Captions uploaded ✓" : "Upload SRT captions file"}
                  </Text>
                  <Text style={styles.captionHint}>Required for all video ads · .srt format</Text>
                </View>
                <Feather name={captionUploaded ? "refresh-cw" : "upload"} size={14} color="#9E9E9E" />
              </Pressable>
            )}

            {/* Specs accordion */}
            <Pressable style={styles.specsToggle} onPress={() => setSpecsOpen(!specsOpen)}>
              <Feather name="info" size={14} color="#0066CC" />
              <Text style={styles.specsToggleText}>View exact size requirements</Text>
              <Feather name={specsOpen ? "chevron-up" : "chevron-down"} size={14} color="#9E9E9E" />
            </Pressable>

            {specsOpen && (
              <View style={styles.specsBody}>
                {info.specs.map((s) => (
                  <View key={s.key} style={styles.specRow}>
                    <Text style={styles.specKey}>{s.key}</Text>
                    <Text style={styles.specVal}>{s.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── CONTACT FORM ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your details</Text>
          {[
            { key: "biz", label: "Business / Dealership name *", val: businessName, set: setBusinessName, icon: "briefcase", ph: "e.g. Kwame Auto Sales" },
            { key: "phone", label: "Phone / WhatsApp *", val: phone, set: setPhone, icon: "phone", ph: "+233 24 123 4567" },
            { key: "email", label: "Email address", val: email, set: setEmail, icon: "mail", ph: "you@example.com" },
          ].map((f) => (
            <View key={f.key} style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <View style={[styles.field, focusedField === f.key && styles.fieldFocused]}>
                <Feather name={f.icon as any} size={15} color={focusedField === f.key ? "#0066CC" : "#9E9E9E"} />
                <TextInput
                  style={styles.input}
                  value={f.val}
                  onChangeText={f.set}
                  placeholder={f.ph}
                  placeholderTextColor="#BDBDBD"
                  onFocus={() => setFocusedField(f.key)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>
          ))}

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Target region</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionRow}>
              {REGIONS.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.regionChip, region === r && styles.regionChipActive]}
                  onPress={() => setRegion(r)}
                >
                  <Text style={[styles.regionText, region === r && styles.regionTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Notes for our ads team</Text>
            <View style={[styles.fieldMulti, focusedField === "notes" && styles.fieldFocused]}>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any instructions or special requirements…"
                placeholderTextColor="#BDBDBD"
                multiline
                onFocus={() => setFocusedField("notes")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* ── PAYMENT ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment method</Text>
          {([
            { id: "mobile", label: "Mobile Money", sub: "MTN · Vodafone · AirtelTigo", icon: "smartphone" },
            { id: "bank",   label: "Bank Transfer",  sub: "GCB · Ecobank · Stanbic",   icon: "credit-card" },
          ] as { id: "mobile"|"bank"; label: string; sub: string; icon: string }[]).map((p) => (
            <Pressable
              key={p.id}
              style={[styles.payOpt, payMethod === p.id && styles.payOptActive]}
              onPress={() => setPayMethod(p.id)}
            >
              <View style={[styles.payIcon, payMethod === p.id && { backgroundColor: "#EBF4FF" }]}>
                <Feather name={p.icon as any} size={18} color={payMethod === p.id ? "#0066CC" : "#6B6B6B"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.payLabel, payMethod === p.id && { color: "#0066CC" }]}>{p.label}</Text>
                <Text style={styles.paySub}>{p.sub}</Text>
              </View>
              <Feather
                name={payMethod === p.id ? "check-circle" : "circle"}
                size={18}
                color={payMethod === p.id ? "#0066CC" : "#E0E0E0"}
              />
            </Pressable>
          ))}
        </View>

        {/* ── ORDER SUMMARY ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order summary</Text>
          {[
            { k: "Package", v: info.label },
            { k: "Duration", v: duration || "N/A" },
            { k: "Region", v: region },
            { k: "Payment", v: payMethod === "mobile" ? "Mobile Money" : "Bank Transfer" },
          ].map((row) => (
            <View key={row.k} style={styles.sumRow}>
              <Text style={styles.sumKey}>{row.k}</Text>
              <Text style={styles.sumVal}>{row.v}</Text>
            </View>
          ))}
          <View style={[styles.sumRow, styles.sumTotal]}>
            <Text style={styles.sumTotalKey}>Total</Text>
            <Text style={styles.sumTotalVal}>GHS {priceNum.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: (insets.bottom || 0) + 120 }} />
      </ScrollView>

      {/* Sticky confirm */}
      <View style={[styles.submitBar, { paddingBottom: (insets.bottom || 0) + (Platform.OS === "web" ? 16 : 12) }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.submitLbl}>Total due</Text>
          <Text style={styles.submitPrice}>GHS {priceNum.toLocaleString()}</Text>
        </View>
        <Pressable style={styles.submitBtn} onPress={handleSubmit}>
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Confirm Booking</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  topBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: "#EEEEEE", gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  topSub: { fontSize: 12, color: "#9E9E9E", fontFamily: "Manrope_400Regular", marginTop: 1 },
  priceTag: { backgroundColor: "#EBF4FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceTagText: { fontSize: 14, fontFamily: "Manrope_700Bold", color: "#0066CC" },

  // Auto-gen hero
  autoGenHero: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16,
    padding: 24, alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  autoGenIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#EBF4FF",
    alignItems: "center", justifyContent: "center",
  },
  autoGenTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  autoGenSub: {
    fontSize: 13, fontFamily: "Manrope_400Regular", color: "#6B6B6B",
    textAlign: "center", lineHeight: 20,
  },

  // Upload hero
  uploadHero: {
    backgroundColor: "#fff", margin: 16, borderRadius: 16,
    padding: 16, gap: 12,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  uploadHeroHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  uploadHeroTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },

  uploadZone: {
    borderWidth: 2, borderColor: "#CCE0FF", borderStyle: "dashed",
    borderRadius: 14, padding: 28, alignItems: "center", gap: 10,
    backgroundColor: "#F5FAFF",
  },
  uploadZoneDone: {
    borderColor: "#27AE60", backgroundColor: "#F0FFF4",
  },
  uploadArrowCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#EBF4FF",
    alignItems: "center", justifyContent: "center",
  },
  uploadZoneLabel: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  uploadSpecPills: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "center" },
  pill: {
    backgroundColor: "#E8F0FF", borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontFamily: "Manrope_500Medium", color: "#0066CC" },

  uploadDoneIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "#E8FFF0", alignItems: "center", justifyContent: "center",
  },
  uploadDoneLabel: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#27AE60" },
  uploadDoneHint: { fontSize: 12, color: "#9E9E9E", fontFamily: "Manrope_400Regular" },

  captionZone: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: "#CCE0FF", borderRadius: 12,
    padding: 14, backgroundColor: "#F8FBFF",
  },
  captionLabel: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  captionHint: { fontSize: 11, color: "#9E9E9E", fontFamily: "Manrope_400Regular", marginTop: 2 },

  specsToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  specsToggleText: { flex: 1, fontSize: 13, fontFamily: "Manrope_500Medium", color: "#0066CC" },
  specsBody: {
    backgroundColor: "#F8FBFF", borderRadius: 10,
    borderWidth: 1, borderColor: "#E0EEFF",
    paddingHorizontal: 12, paddingVertical: 4,
  },
  specRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#EEF4FF",
  },
  specKey: { fontSize: 12, fontFamily: "Manrope_500Medium", color: "#6B6B6B", flex: 1 },
  specVal: { fontSize: 12, fontFamily: "Manrope_400Regular", color: "#1A1A1A", flex: 2, textAlign: "right" },

  // Form
  card: {
    backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, padding: 16, gap: 12,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  cardTitle: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Manrope_600SemiBold", color: "#6B6B6B",
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  field: {
    flexDirection: "row", alignItems: "center", gap: 10,
    height: 48, borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 10, paddingHorizontal: 12, backgroundColor: "#FAFAFA",
  },
  fieldFocused: { borderColor: "#0066CC", backgroundColor: "#fff" },
  fieldMulti: {
    borderWidth: 1.5, borderColor: "#E8E8E8",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: "#FAFAFA",
  },
  input: { flex: 1, fontSize: 14, color: "#1A1A1A", fontFamily: "Manrope_400Regular", padding: 0 },
  textArea: { fontSize: 14, color: "#1A1A1A", fontFamily: "Manrope_400Regular", minHeight: 72, textAlignVertical: "top" },

  regionRow: { gap: 8, paddingVertical: 4 },
  regionChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#E0E0E0", backgroundColor: "#fff",
  },
  regionChipActive: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
  regionText: { fontSize: 13, fontFamily: "Manrope_500Medium", color: "#6B6B6B" },
  regionTextActive: { color: "#fff", fontFamily: "Manrope_600SemiBold" },

  // Payment
  payOpt: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E8E8E8", backgroundColor: "#FAFAFA",
  },
  payOptActive: { borderColor: "#0066CC", backgroundColor: "#F8FBFF" },
  payIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center",
  },
  payLabel: { fontSize: 14, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  paySub: { fontSize: 11, fontFamily: "Manrope_400Regular", color: "#9E9E9E", marginTop: 1 },

  // Summary
  summaryCard: {
    backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, padding: 16, gap: 10,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between" },
  sumKey: { fontSize: 13, color: "#6B6B6B", fontFamily: "Manrope_400Regular" },
  sumVal: { fontSize: 13, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  sumTotal: { paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  sumTotalKey: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  sumTotalVal: { fontSize: 20, fontFamily: "Manrope_700Bold", color: "#0066CC" },

  // Submit bar
  submitBar: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#EEEEEE",
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  submitLbl: { fontSize: 11, color: "#9E9E9E", fontFamily: "Manrope_400Regular" },
  submitPrice: { fontSize: 22, fontFamily: "Manrope_700Bold", color: "#0066CC" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0066CC",
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#fff" },
});
