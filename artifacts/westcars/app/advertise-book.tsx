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
type SpecInfo = { label: string; specs: SpecItem[] };

function getSizeRequirements(pkg: string): SpecInfo {
  const map: Record<string, SpecInfo> = {
    sponsored_listing: {
      label: "Sponsored Listing",
      specs: [
        { key: "Format", value: "Auto-generated from your listing" },
        { key: "Image", value: "Your car photos are used automatically" },
        { key: "Title", value: "Auto-pulled (max 60 chars)" },
        { key: "Price", value: "Auto-pulled from listing price" },
        { key: "Upload needed", value: "None — we handle everything" },
      ],
    },
    featured_listing: {
      label: "Featured Car",
      specs: [
        { key: "Format", value: "Auto-generated — gold border added" },
        { key: "Badge", value: "\"Featured\" ribbon placed automatically" },
        { key: "Upload needed", value: "None — built from your listing" },
      ],
    },
    urgent_badge: {
      label: "Urgent Sale Badge",
      specs: [
        { key: "Format", value: "Auto-applied badge on your card" },
        { key: "Color", value: "Bright red \"URGENT\" label" },
        { key: "Upload needed", value: "None — applied automatically" },
      ],
    },
    flyer: {
      label: "Flyer Ad",
      specs: [
        { key: "File type", value: "JPG or PNG" },
        { key: "Home banner", value: "1200 × 400 px (3:1 ratio)" },
        { key: "Feed card", value: "800 × 600 px (4:3 ratio)" },
        { key: "Max file size", value: "5 MB" },
        { key: "Color mode", value: "RGB / sRGB" },
        { key: "Safe zone", value: "40 px margin from all edges" },
      ],
    },
    banner_top: {
      label: "Top Banner Ad",
      specs: [
        { key: "File type", value: "JPG, PNG, or animated GIF" },
        { key: "Desktop", value: "1200 × 200 px" },
        { key: "Mobile", value: "800 × 200 px" },
        { key: "Max file size", value: "3 MB static / 1 MB GIF" },
        { key: "Animation", value: "Max 3 loops, 15 sec total" },
        { key: "Min text size", value: "14pt for readability" },
      ],
    },
    video_15: {
      label: "15-Second Video Ad",
      specs: [
        { key: "Duration", value: "Exactly 15 seconds" },
        { key: "Format", value: "MP4 (H.264 codec)" },
        { key: "Resolution", value: "1920 × 1080 px (Full HD)" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "150 MB" },
        { key: "Audio", value: "Stereo, 44.1 kHz, max -14 LUFS" },
        { key: "Captions", value: "SRT file required" },
      ],
    },
    video_20: {
      label: "20-Second Video Ad",
      specs: [
        { key: "Duration", value: "Exactly 20 seconds" },
        { key: "Format", value: "MP4 (H.264 codec)" },
        { key: "Resolution", value: "1920 × 1080 px (Full HD)" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "200 MB" },
        { key: "Audio", value: "Stereo, 44.1 kHz, max -14 LUFS" },
        { key: "Frame rate", value: "24, 25, or 30 fps" },
      ],
    },
    video_30: {
      label: "30-Second Video Ad",
      specs: [
        { key: "Duration", value: "Exactly 30 seconds" },
        { key: "Format", value: "MP4 (H.264 codec)" },
        { key: "Resolution", value: "1920 × 1080 px or 4K" },
        { key: "Aspect ratio", value: "16:9 landscape" },
        { key: "Max file size", value: "300 MB" },
        { key: "Audio", value: "Stereo, 44.1 kHz, max -14 LUFS" },
        { key: "Captions", value: "SRT file required" },
      ],
    },
    push_blast: {
      label: "Push Notification Blast",
      specs: [
        { key: "Title", value: "Max 50 characters (bold)" },
        { key: "Body text", value: "Max 120 characters" },
        { key: "Image (optional)", value: "400 × 400 px, JPG/PNG, max 500 KB" },
        { key: "CTA button", value: "Max 20 characters" },
        { key: "Deep link", value: "Auto-set to your listing" },
      ],
    },
    social_boost: {
      label: "Social Media Cross-Post",
      specs: [
        { key: "Facebook image", value: "1200 × 628 px or 1080 × 1080 px" },
        { key: "Instagram image", value: "1080 × 1080 px or 1080 × 1350 px" },
        { key: "WhatsApp", value: "Image + caption (max 500 chars)" },
        { key: "File type", value: "JPG or PNG, max 8 MB" },
        { key: "Caption", value: "Max 280 characters" },
      ],
    },
    dealer_spotlight: {
      label: "Dealer Spotlight Page",
      specs: [
        { key: "Banner image", value: "1400 × 400 px" },
        { key: "Logo", value: "400 × 400 px, transparent PNG" },
        { key: "About text", value: "Max 500 characters" },
        { key: "Phone / WhatsApp", value: "Your contact number" },
        { key: "Location", value: "Auto-mapped from your address" },
        { key: "Listings", value: "All active listings auto-included" },
      ],
    },
    dealer_verified: {
      label: "Verified Dealer Badge",
      specs: [
        { key: "Requirement", value: "Business registration (JPG/PDF)" },
        { key: "Dealership name", value: "Must match official registration" },
        { key: "Phone verification", value: "OTP to registered number" },
        { key: "Review time", value: "1–3 business days" },
        { key: "Badge display", value: "Blue ✓ on all listings & profile" },
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
  const price = params.price || "0";
  const duration = params.duration || "";

  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [notes, setNotes] = useState("");
  const [payMethod, setPayMethod] = useState<"mobile" | "bank" | "cash">("mobile");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const specInfo = getSizeRequirements(pkg);
  const priceNum = Number(price) || 0;
  const isVideo = pkg.startsWith("video");
  const isAutoGen = ["sponsored_listing", "featured_listing", "urgent_badge"].includes(pkg);

  const handleSubmit = () => {
    if (!businessName.trim() || !phone.trim()) {
      Alert.alert("Required fields", "Please fill in your business name and phone number.");
      return;
    }
    Alert.alert(
      "Booking Confirmed!",
      `Thank you, ${businessName}!\n\nOur ads team will contact you on ${phone} within 24 hours.\n\nConfirmation sent to ${email || "your email"}.`,
      [{ text: "Done", onPress: () => { router.back(); router.back(); } }]
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Book Ad</Text>
          <Text style={styles.topSub} numberOfLines={1}>
            {specInfo.label}{duration ? ` · ${duration}` : ""}
          </Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>GHS {priceNum.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Spec card */}
        <View style={styles.specsCard}>
          <View style={styles.specsTitleRow}>
            <View style={styles.specsIconWrap}>
              <Feather name="info" size={16} color="#0066CC" />
            </View>
            <Text style={styles.specsTitle}>
              {isAutoGen ? "How your ad works" : isVideo ? "Video requirements" : "Creative specifications"}
            </Text>
          </View>
          <Text style={styles.specsSub}>
            {isAutoGen
              ? "No upload needed — your ad is built automatically from your listing."
              : isVideo
              ? "Upload your finished video matching these specs. Reviewed within 4 hours."
              : "Prepare your creative files to these exact specifications."}
          </Text>
          {specInfo.specs.map((spec) => (
            <View key={spec.key} style={styles.specRow}>
              <Text style={styles.specKey}>{spec.key}</Text>
              <Text style={styles.specVal}>{spec.value}</Text>
            </View>
          ))}
        </View>

        {/* Upload zone */}
        {!isAutoGen && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upload creative</Text>
            <Pressable
              style={styles.uploadZone}
              onPress={() => Alert.alert("Upload", "File picker opens in the native app.")}
            >
              <Feather name={isVideo ? "film" : "image"} size={32} color="#BDBDBD" />
              <Text style={styles.uploadLabel}>
                Tap to select {isVideo ? "video file (MP4)" : "image (JPG / PNG)"}
              </Text>
              <Text style={styles.uploadHint}>
                {isVideo ? "Max 300 MB · H.264 · 16:9" : "Max 5 MB · RGB color"}
              </Text>
            </Pressable>
            {isVideo && (
              <Pressable
                style={[styles.uploadZone, { marginTop: 8 }]}
                onPress={() => Alert.alert("Upload", "SRT caption picker.")}
              >
                <Feather name="file-text" size={24} color="#BDBDBD" />
                <Text style={styles.uploadLabel}>Upload SRT captions (.srt)</Text>
                <Text style={styles.uploadHint}>Required for all video ads</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Contact form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your details</Text>
          {[
            { key: "biz", label: "Business / Dealership name *", val: businessName, set: setBusinessName, icon: "briefcase", ph: "e.g. Kwame Auto Sales" },
            { key: "contact", label: "Contact person", val: contactName, set: setContactName, icon: "user", ph: "Full name" },
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
            <Text style={styles.fieldLabel}>Notes / instructions</Text>
            <View style={[styles.fieldMulti, focusedField === "notes" && styles.fieldFocused]}>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any specific requirements for our ads team…"
                placeholderTextColor="#BDBDBD"
                multiline
                onFocus={() => setFocusedField("notes")}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment method</Text>
          {([
            { id: "mobile", label: "Mobile Money", sub: "MTN, Vodafone, AirtelTigo", icon: "smartphone" },
            { id: "bank", label: "Bank Transfer", sub: "GCB, Ecobank, Stanbic, Access", icon: "credit-card" },
            { id: "cash", label: "Cash on Visit", sub: "Pay at our Accra office", icon: "dollar-sign" },
          ] as { id: "mobile" | "bank" | "cash"; label: string; sub: string; icon: string }[]).map((p) => (
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
              <Feather name={payMethod === p.id ? "check-circle" : "circle"} size={18} color={payMethod === p.id ? "#0066CC" : "#E0E0E0"} />
            </Pressable>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Order summary</Text>
          {[
            { k: "Package", v: specInfo.label },
            { k: "Duration", v: duration || "N/A" },
            { k: "Region", v: region },
            { k: "Payment", v: payMethod === "mobile" ? "Mobile Money" : payMethod === "bank" ? "Bank Transfer" : "Cash" },
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
  topTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  topSub: { fontSize: 12, color: "#9E9E9E", fontFamily: "Inter_400Regular", marginTop: 1 },
  priceTag: { backgroundColor: "#EBF4FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceTagText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#0066CC" },

  specsCard: {
    backgroundColor: "#fff", margin: 16, borderRadius: 14,
    padding: 16, gap: 8,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  specsTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  specsIconWrap: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: "#EBF4FF", alignItems: "center", justifyContent: "center",
  },
  specsTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  specsSub: { fontSize: 12, color: "#6B6B6B", lineHeight: 18, marginBottom: 4, fontFamily: "Inter_400Regular" },
  specRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#F5F5F5",
  },
  specKey: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#6B6B6B", flex: 1 },
  specVal: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#1A1A1A", flex: 2, textAlign: "right" },

  card: {
    backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, padding: 16, gap: 12,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A1A" },

  uploadZone: {
    borderWidth: 2, borderColor: "#E0E0E0", borderStyle: "dashed",
    borderRadius: 12, padding: 24, alignItems: "center", gap: 6,
    backgroundColor: "#FAFAFA",
  },
  uploadLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#6B6B6B" },
  uploadHint: { fontSize: 11, color: "#BDBDBD", textAlign: "center", fontFamily: "Inter_400Regular" },

  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#6B6B6B",
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
  input: { flex: 1, fontSize: 14, color: "#1A1A1A", fontFamily: "Inter_400Regular", padding: 0 },
  textArea: { fontSize: 14, color: "#1A1A1A", fontFamily: "Inter_400Regular", minHeight: 80, textAlignVertical: "top" },

  regionRow: { gap: 8, paddingVertical: 4 },
  regionChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: "#E0E0E0", backgroundColor: "#fff",
  },
  regionChipActive: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
  regionText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#6B6B6B" },
  regionTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },

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
  payLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  paySub: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9E9E9E", marginTop: 1 },

  summaryCard: {
    backgroundColor: "#fff", marginHorizontal: 16, marginBottom: 16,
    borderRadius: 14, padding: 16, gap: 10,
    borderWidth: 1, borderColor: "#EEEEEE",
  },
  sumRow: { flexDirection: "row", justifyContent: "space-between" },
  sumKey: { fontSize: 13, color: "#6B6B6B", fontFamily: "Inter_400Regular" },
  sumVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  sumTotal: { paddingTop: 12, marginTop: 4, borderTopWidth: 1, borderTopColor: "#F0F0F0" },
  sumTotalKey: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  sumTotalVal: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#0066CC" },

  submitBar: {
    flexDirection: "row", alignItems: "center", gap: 16,
    paddingHorizontal: 16, paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1, borderTopColor: "#EEEEEE",
    shadowColor: "#000", shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  submitLbl: { fontSize: 11, color: "#9E9E9E", fontFamily: "Inter_400Regular" },
  submitPrice: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#0066CC" },
  submitBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#0066CC",
    paddingHorizontal: 22, paddingVertical: 14, borderRadius: 12,
  },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
