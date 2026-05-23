import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthGatePlaceholder } from "@/components/AuthGatePlaceholder";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { isFirebaseReady } from "@/lib/firebase";
import { updateCar, uploadCarImage } from "@/services/firebase";
import {
  CAR_BRANDS,
  CONDITIONS,
  FUEL_TYPES,
  getLocationOptions,
  GHANA_CITIES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
} from "@/utils/ghanaData";

const TEAL       = "#0EB5CA";
const TEAL_DARK  = "#0098AA";
const TEAL_LIGHT = "rgba(14,181,202,0.10)";
const BG         = "#F4F7F9";
const CARD       = "#FFFFFF";
const INPUT_BG   = "#F1F5F9";
const BORDER     = "#E2E8F0";
const TEXT       = "#0F172A";
const MUTED      = "#64748B";
const PLACEHOLDER = "#94A3B8";

const STEPS = ["Photos", "Details", "Specs", "Price"];

// ── Section header ────────────────────────────────────────────────────────
function SectionHeader({ title, right, icon = "square" }: { title: string; right?: React.ReactNode; icon?: React.ComponentProps<typeof Feather>["name"] }) {
  const { colors } = useTheme();
  return (
    <View style={sh.row}>
      <View style={sh.icon}>
        <Feather name={icon} size={10} color={TEAL} />
      </View>
      <Text style={[sh.title, { color: colors.text }]}>{title}</Text>
      {right && <View style={{ marginLeft: "auto" }}>{right}</View>}
    </View>
  );
}
const sh = StyleSheet.create({
  row:   { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  icon:  { width: 22, height: 22, borderRadius: 5, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontFamily: "Inter_700Bold" },
});

// ── Inline picker (expands in place — no absolute dropdown) ───────────────
function InlinePicker({
  label, value, options, onSelect, required, flex,
}: {
  label: string; value: string; options: string[];
  onSelect: (v: string) => void; required?: boolean; flex?: number;
}) {
  const { colors, isDark } = useTheme();
  const borderColor = isDark ? colors.border : BORDER;
  const [open, setOpen] = useState(false);
  return (
    <View style={{ flex: flex ?? 1 }}>
      <Text style={[ip.label, { color: colors.textSecondary }]}>
        {label}
        {required ? <Text style={{ color: TEAL }}> •</Text> : null}
      </Text>
      <Pressable
        style={[ip.trigger, { backgroundColor: colors.inputBg, borderColor }, open && ip.triggerOpen]}
        onPress={() => setOpen(v => !v)}
      >
        <Text style={[ip.val, { color: colors.text }, !value && { color: colors.textTertiary }]} numberOfLines={1}>
          {value || "Select"}
        </Text>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={13} color={colors.textSecondary} />
      </Pressable>
      {open && (
        <View style={[ip.list, { backgroundColor: colors.card, borderColor }]}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="always" style={{ maxHeight: 160 }}>
            {options.map(opt => (
              <Pressable
                key={opt}
                style={[ip.opt, { borderBottomColor: borderColor }, value === opt && ip.optActive]}
                onPress={() => { onSelect(opt); setOpen(false); }}
              >
                <Text style={[ip.optText, { color: colors.text }, value === opt && ip.optTextActive]}>{opt}</Text>
                {value === opt && <Feather name="check" size={12} color={TEAL} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
const ip = StyleSheet.create({
  label:        { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 },
  trigger:      { height: 44, borderRadius: 10, borderWidth: 1.5, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, justifyContent: "space-between" },
  triggerOpen:  { borderColor: TEAL, backgroundColor: "rgba(14,181,202,0.04)" },
  val:          { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1 },
  list:         { borderWidth: 1.5, borderRadius: 10, marginTop: 4, overflow: "hidden" },
  opt:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1 },
  optActive:    { backgroundColor: TEAL_LIGHT },
  optText:      { fontSize: 14, fontFamily: "Inter_400Regular" },
  optTextActive:{ color: TEAL, fontFamily: "Inter_600SemiBold" },
});

// ── Main screen ───────────────────────────────────────────────────────────
export default function SellScreen() {
  const { addCar, currentUser, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const insets  = useSafeAreaInsets();
  const topPad  = insets.top + (Platform.OS === "web" ? 67 : 0);
  const borderColor = isDark ? colors.border : BORDER;
  const fieldStyle = { backgroundColor: colors.inputBg, borderColor, color: colors.text };
  const cardStyle = { backgroundColor: colors.card };

  const [images,       setImages]       = useState<string[]>([]);
  const [brand,        setBrand]        = useState("");
  const [model,        setModel]        = useState("");
  const [year,         setYear]         = useState("");
  const [price,        setPrice]        = useState("");
  const [mileage,      setMileage]      = useState("");
  const [fuelType,     setFuelType]     = useState("");
  const [transmission, setTransmission] = useState("");
  const [condition,    setCondition]    = useState("");
  const [location,     setLocation]     = useState("");
  const [description,  setDescription]  = useState("");
  const [vehicleType,  setVehicleType]  = useState("");
  const [negotiable,   setNegotiable]   = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  type IdType = "VIN" | "IMEI" | "Serial";
  const ID_TYPES: { key: IdType; label: string; hint: string; maxLen: number; format: string }[] = [
    { key: "VIN",    label: "VIN",           hint: "17-char vehicle ID — auto-fills details",  maxLen: 17, format: "e.g. 1HGCM82633A123456" },
    { key: "IMEI",   label: "IMEI",          hint: "15-digit phone / device identifier",        maxLen: 15, format: "e.g. 354081087654321" },
    { key: "Serial", label: "Serial / Chassis", hint: "Manufacturer serial or chassis number", maxLen: 40, format: "e.g. CHS-GH-2024-00123" },
  ];

  const [idType,     setIdType]     = useState<IdType>("VIN");
  const [identifier, setIdentifier] = useState("");
  const [idLoading,  setIdLoading]  = useState(false);
  const [idDecoded,  setIdDecoded]  = useState(false);
  const [idError,    setIdError]    = useState("");
  const [idInfo,     setIdInfo]     = useState("");

  const currentIdConfig = ID_TYPES.find(t => t.key === idType)!;

  const locationOptions = useMemo(() => getLocationOptions(condition), [condition]);

  useEffect(() => {
    if (location && !locationOptions.includes(location)) {
      setLocation("");
    }
  }, [location, locationOptions]);

  const resetForm = () => {
    setImages([]);
    setBrand("");
    setModel("");
    setYear("");
    setPrice("");
    setMileage("");
    setFuelType("");
    setTransmission("");
    setCondition("");
    setLocation("");
    setDescription("");
    setVehicleType("");
    setNegotiable(false);
    setIdType("VIN");
    setIdentifier("");
    setIdDecoded(false);
    setIdError("");
    setIdInfo("");
  };

  const handleIdTypeChange = (t: IdType) => {
    setIdType(t);
    setIdentifier("");
    setIdDecoded(false);
    setIdError("");
    setIdInfo("");
  };

  const lookupIdentifier = async () => {
    setIdLoading(true);
    setIdDecoded(false);
    setIdError("");
    setIdInfo("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (idType === "VIN") {
        if (identifier.length !== 17) { setIdError("VIN must be exactly 17 characters."); return; }
        const res  = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${identifier}?format=json`);
        const data = await res.json();
        const results: any[] = data.Results || [];
        const get = (v: string) => results.find((r: any) => r.Variable === v)?.Value || "";
        const make  = get("Make");
        const mdl   = get("Model");
        const yr    = get("Model Year");
        const fuel  = get("Fuel Type - Primary");
        const trans = get("Transmission Style");
        if (!make || make === "0") {
          setIdError("VIN not recognised. Enter details manually.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        const fuelMap:  Record<string,string> = { Gasoline:"Petrol", Petrol:"Petrol", Diesel:"Diesel", Electric:"Electric", "Natural Gas":"Hybrid", Hybrid:"Hybrid" };
        const transMap: Record<string,string> = { Automatic:"Automatic", Manual:"Manual", "Continuously Variable Transmission":"Automatic", CVT:"Automatic" };
        const matched = CAR_BRANDS.find(b => b.toUpperCase() === make.toUpperCase()) || (make.charAt(0) + make.slice(1).toLowerCase());
        if (matched) setBrand(matched);
        if (mdl)     setModel(mdl);
        if (yr)      setYear(yr);
        if (fuel)    setFuelType(fuelMap[fuel]  || fuel);
        if (trans)   setTransmission(transMap[trans] || trans);
        setIdInfo(`${matched || make} ${mdl} ${yr}`.trim());
        setIdDecoded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else if (idType === "IMEI") {
        if (identifier.length !== 15 || !/^\d{15}$/.test(identifier)) {
          setIdError("IMEI must be exactly 15 digits.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        const luhn = (n: string) => {
          let sum = 0;
          for (let i = 0; i < n.length; i++) {
            let d = parseInt(n[i]);
            if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
            sum += d;
          }
          return sum % 10 === 0;
        };
        if (!luhn(identifier)) {
          setIdError("IMEI checksum invalid. Please double-check the number.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        setIdInfo(`IMEI ${identifier} — checksum valid`);
        setIdDecoded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      } else {
        if (identifier.trim().length < 4) {
          setIdError("Please enter a valid serial or chassis number.");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        setIdInfo(`Serial / Chassis: ${identifier.trim()}`);
        setIdDecoded(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setIdError("Lookup failed. Check your connection and try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIdLoading(false);
    }
  };

  const pickImages = async () => {
    if (images.length >= 10) { Alert.alert("Limit reached", "You can add up to 10 photos."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    if (!brand || !model || !year || !price || !condition || !location) {
      Alert.alert("Missing info", "Please fill in all required fields (marked •).");
      return;
    }
    setSubmitting(true);
    try {
      const PLACEHOLDER_IMG = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
      const initialImages   = images.length > 0 ? images : [PLACEHOLDER_IMG];
      const idLine = idDecoded && identifier.trim()
        ? `\n\n${currentIdConfig.label}: ${identifier.trim()}`
        : "";
      const finalDesc = description.trim()
        + idLine
        + (negotiable ? (description.trim() || idLine ? "\nPrice negotiable." : "Price negotiable.") : "");

      const carId = await addCar({
        brand,
        model,
        year:         parseInt(year),
        price:        parseFloat(price),
        mileage:      parseInt(mileage || "0"),
        fuelType:     fuelType     || "Petrol",
        transmission: transmission || "Automatic",
        condition,
        location,
        description:  finalDesc,
        images:       initialImages,
        sellerId:     currentUser?.id || "currentUser",
        isFeatured:   false,
        category:     vehicleType || "sedan",
      });

      if (carId && isFirebaseReady() && currentUser?.id && images.length > 0) {
        try {
          const uploadedUrls = await Promise.all(
            images.map((uri, idx) => uploadCarImage(currentUser.id, carId, uri, idx))
          );
          await updateCar(carId, { images: uploadedUrls });
        } catch (uploadErr) {
          console.warn("[sell] image upload failed:", uploadErr);
        }
      }

      resetForm();
      Alert.alert(
        "Listing Posted!",
        "Your car has been listed successfully.",
        [{ text: "View Listings", onPress: () => router.push("/(tabs)") }]
      );
    } catch (err) {
      Alert.alert("Error", "Failed to post listing. Please try again.");
      console.error("[sell] submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Auth wall ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AuthGatePlaceholder
        icon="plus-circle"
        title="Sign in to sell your car"
        subtitle="List your vehicle and reach thousands of buyers across Ghana."
        topPad={topPad}
        backgroundColor={colors.background}
      />
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <Text style={styles.headerTitle}>Sell your car</Text>
      </View>

      {/* ── Progress stepper ── */}
      <View style={[styles.stepperWrap, cardStyle, { borderBottomColor: borderColor }]}>
        {STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, i === 0 && styles.stepDotActive]}>
                <Text style={[styles.stepNum, i === 0 && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{step}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, i === 0 && styles.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Photos ── */}
        <View style={[styles.card, cardStyle]}>
          <SectionHeader
            title="Vehicle photos"
            right={<Text style={styles.photoCount}>{images.length} / 10 photos added</Text>}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoScroll}
            contentContainerStyle={styles.photoScrollContent}
          >
            {images.length < 10 && (
              <Pressable style={styles.addPhoto} onPress={pickImages}>
                <Feather name="plus" size={22} color={TEAL} />
                <Text style={styles.addPhotoText}>Add</Text>
              </Pressable>
            )}
            {images.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.thumbImg} />
                {i === 0 && (
                  <View style={styles.coverBadge}><Text style={styles.coverText}>Cover</Text></View>
                )}
                <Pressable style={styles.removePhoto} onPress={() => setImages(prev => prev.filter((_,j) => j !== i))}>
                  <Feather name="x" size={10} color="#fff" />
                </Pressable>
              </View>
            ))}
            {images.length === 0 && (
              <>
                {[0,1,2].map(i => (
                  <View key={i} style={styles.photoEmpty} />
                ))}
              </>
            )}
          </ScrollView>
          <Text style={[styles.photoHint, { color: colors.textSecondary }]}>
            Tap + to select photos from your gallery. First photo will be the cover.
          </Text>
        </View>

        {/* ── ID Lookup ── */}
        <View style={[styles.card, cardStyle]}>
          <SectionHeader
            title="Product identifier"
            right={<Text style={[styles.optionalTag, { color: colors.textSecondary }]}>optional</Text>}
          />

          {/* Type selector pills */}
          <View style={styles.idTypePills}>
            {ID_TYPES.map(t => (
              <Pressable
                key={t.key}
                style={[styles.idTypePill, { backgroundColor: colors.inputBg, borderColor }, idType === t.key && styles.idTypePillActive]}
                onPress={() => handleIdTypeChange(t.key)}
              >
                <Text style={[styles.idTypePillText, { color: colors.textSecondary }, idType === t.key && styles.idTypePillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.idHint, { color: colors.textSecondary }]}>{currentIdConfig.hint}</Text>

          <View style={styles.vinRow}>
            <TextInput
              style={[
                styles.vinInput,
                fieldStyle,
                idDecoded && { borderColor: "#22C55E" },
                !!idError  && { borderColor: "#EF4444" },
              ]}
              value={identifier}
              onChangeText={t => {
                const clean = idType === "VIN"
                  ? t.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "")
                  : idType === "IMEI"
                  ? t.replace(/\D/g, "")
                  : t;
                setIdentifier(clean);
                setIdDecoded(false);
                setIdError("");
              }}
              placeholder={currentIdConfig.format}
              placeholderTextColor={colors.textTertiary}
              maxLength={currentIdConfig.maxLen}
              autoCapitalize={idType === "VIN" ? "characters" : "none"}
              autoCorrect={false}
              keyboardType={idType === "IMEI" ? "numeric" : "default"}
            />
            <Pressable
              style={[styles.vinBtn, (identifier.length < 4 || idLoading) && { opacity: 0.45 }]}
              onPress={lookupIdentifier}
              disabled={identifier.length < 4 || idLoading}
            >
              {idLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.vinBtnText}>Look up</Text>
              }
            </Pressable>
          </View>

          {idType === "VIN" && (
            <Text style={styles.idCounter}>{identifier.length} / 17</Text>
          )}
          {idType === "IMEI" && (
            <Text style={styles.idCounter}>{identifier.length} / 15</Text>
          )}

          {idDecoded && (
            <View style={styles.vinSuccess}>
              <Feather name="check-circle" size={14} color="#22C55E" />
              <Text style={styles.vinSuccessText}>
                {idType === "VIN" ? `Auto-filled: ${idInfo}` : idInfo}
              </Text>
            </View>
          )}
          {!!idError && (
            <View style={styles.vinError}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.vinErrorText}>{idError}</Text>
            </View>
          )}
        </View>

        {/* ── Vehicle Details ── */}
        <View style={[styles.card, cardStyle]}>
          <SectionHeader title="Vehicle details" />

          {/* Brand | Year */}
          <View style={styles.row2}>
            <InlinePicker label="Brand" value={brand} options={CAR_BRANDS} onSelect={setBrand} required />
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={[ip.label, { color: colors.textSecondary }]}>Year <Text style={{ color: TEAL }}>•</Text></Text>
              <TextInput
                style={[styles.fieldInput, fieldStyle]}
                value={year}
                onChangeText={setYear}
                placeholder="2024"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          {/* Model */}
          <View style={{ marginTop: 14 }}>
            <Text style={[ip.label, { color: colors.textSecondary }]}>Model <Text style={{ color: TEAL }}>•</Text></Text>
            <TextInput
              style={[styles.fieldInput, fieldStyle]}
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Corolla, Hilux…"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          {/* Type | Condition */}
          <View style={[styles.row2, { marginTop: 14 }]}>
            <InlinePicker label="Type" value={vehicleType} options={VEHICLE_TYPES} onSelect={setVehicleType} />
            <View style={{ width: 12 }} />
            <InlinePicker label="Condition" value={condition} options={CONDITIONS} onSelect={setCondition} required />
          </View>

          {/* Fuel | Transmission */}
          <View style={[styles.row2, { marginTop: 14 }]}>
            <InlinePicker label="Fuel" value={fuelType} options={FUEL_TYPES} onSelect={setFuelType} />
            <View style={{ width: 12 }} />
            <InlinePicker label="Transmission" value={transmission} options={TRANSMISSIONS} onSelect={setTransmission} />
          </View>

          {/* Mileage | Location */}
          <View style={[styles.row2, { marginTop: 14 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[ip.label, { color: colors.textSecondary }]}>Mileage (km)</Text>
              <TextInput
                style={[styles.fieldInput, fieldStyle]}
                value={mileage}
                onChangeText={setMileage}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: 12 }} />
            <InlinePicker label="Location" value={location} options={locationOptions} onSelect={setLocation} required />
          </View>
        </View>

        {/* ── Asking Price ── */}
        <View style={[styles.card, cardStyle]}>
          <SectionHeader title="Asking price" right={<Text style={{ color: TEAL, fontSize: 12, fontFamily: "Inter_600SemiBold" }}>•</Text>} />
          <View style={[styles.priceRow, { backgroundColor: colors.inputBg, borderColor }]}>
            <View style={styles.ghsBadge}>
              <Text style={styles.ghsText}>GHS</Text>
            </View>
            <TextInput
              style={[styles.priceInput, { color: colors.text }]}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.negotiableRow}>
            <Switch
              value={negotiable}
              onValueChange={setNegotiable}
              trackColor={{ false: borderColor, true: TEAL }}
              thumbColor="#fff"
              ios_backgroundColor={borderColor}
            />
            <Text style={[styles.negotiableText, { color: colors.textSecondary }]}>Price is negotiable</Text>
          </View>
        </View>

        {/* ── Description ── */}
        <View style={[styles.card, cardStyle]}>
          <SectionHeader title="Description" icon="align-left" />
          <TextInput
            style={[styles.descInput, fieldStyle]}
            value={description}
            onChangeText={t => t.length <= 500 && setDescription(t)}
            placeholder={"Describe your vehicle — condition, features, service history…"}
            placeholderTextColor={PLACEHOLDER}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>{description.length} / 500</Text>
        </View>

        {/* ── Boost banner ── */}
        <Pressable style={[styles.boostCard, cardStyle, { borderColor }]} onPress={() => router.push("/advertise")}>
          <View style={styles.boostIcon}>
            <Feather name="trending-up" size={18} color={TEAL} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.boostTitle, { color: colors.text }]}>Boost your listing</Text>
            <Text style={[styles.boostSub, { color: colors.textSecondary }]}>Get 5× more views with a sponsored ad</Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </Pressable>

        {/* ── Footer note ── */}
        <Text style={styles.footerNote}>
          Your listing will be reviewed before going live.{" "}
          <Text style={{ color: TEAL, fontFamily: "Inter_500Medium" }}>Required fields must be filled.</Text>
        </Text>

        {/* ── Submit ── */}
        <Pressable
          style={[styles.submitBtn, submitting && { opacity: 0.65 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Post listing</Text>
          }
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Auth wall
  authWall: {
    flex: 1, backgroundColor: BG, alignItems: "center",
    paddingHorizontal: 32, gap: 14,
  },
  authIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  authTitle:   { fontSize: 20, fontFamily: "Inter_700Bold",    color: TEXT, textAlign: "center" },
  authSub:     { fontSize: 14, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 22 },
  authBtn: {
    marginTop: 8, height: 50, width: "100%",
    backgroundColor: TEAL, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  authBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },

  // Header
  header: {
    backgroundColor: TEAL,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },

  // Stepper
  stepperWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  stepItem:        { alignItems: "center", gap: 4 },
  stepDot:         { width: 26, height: 26, borderRadius: 13, backgroundColor: INPUT_BG, borderWidth: 1.5, borderColor: BORDER, alignItems: "center", justifyContent: "center" },
  stepDotActive:   { backgroundColor: TEAL, borderColor: TEAL },
  stepNum:         { fontSize: 12, fontFamily: "Inter_700Bold", color: MUTED },
  stepNumActive:   { color: "#fff" },
  stepLabel:       { fontSize: 10, fontFamily: "Inter_400Regular", color: MUTED },
  stepLabelActive: { color: TEAL, fontFamily: "Inter_600SemiBold" },
  stepLine:        { flex: 1, height: 1.5, backgroundColor: BORDER, marginBottom: 12 },
  stepLineActive:  { backgroundColor: TEAL },

  // Layout
  scroll:   { flex: 1, backgroundColor: BG },
  content:  { padding: 16, gap: 12 },
  card:     {
    backgroundColor: CARD, borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    overflow: "visible",
  },
  row2: { flexDirection: "row", alignItems: "flex-start" },

  // Photos
  photoCount:         { fontSize: 11, fontFamily: "Inter_500Medium", color: TEAL },
  photoScroll:        { marginHorizontal: -16 },
  photoScrollContent: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  photoRow:           { flexDirection: "row", gap: 8, paddingVertical: 4 },
  addPhoto: {
    width: 76, height: 76, borderRadius: 10,
    borderWidth: 2, borderColor: TEAL, borderStyle: "dashed",
    backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center", gap: 2,
  },
  addPhotoText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: TEAL },
  photoThumb: { width: 76, height: 76, borderRadius: 10, overflow: "hidden", position: "relative" },
  thumbImg:   { width: "100%", height: "100%" },
  coverBadge: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(14,181,202,0.85)", paddingVertical: 3, alignItems: "center",
  },
  coverText:  { fontSize: 9, fontFamily: "Inter_700Bold", color: "#fff" },
  removePhoto: {
    position: "absolute", top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center",
  },
  photoEmpty: { width: 76, height: 76, borderRadius: 10, backgroundColor: INPUT_BG, borderWidth: 1.5, borderColor: BORDER },
  photoHint:  { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, lineHeight: 16, marginTop: 4 },

  // Identifier
  optionalTag: { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, fontStyle: "italic" },
  idTypePills: { flexDirection: "row", gap: 8, marginBottom: 10 },
  idTypePill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: INPUT_BG,
  },
  idTypePillActive:     { backgroundColor: TEAL, borderColor: TEAL },
  idTypePillText:       { fontSize: 12, fontFamily: "Inter_600SemiBold", color: MUTED },
  idTypePillTextActive: { color: "#fff" },
  idHint:    { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, marginBottom: 10, lineHeight: 16 },
  idCounter: { fontSize: 11, fontFamily: "Inter_400Regular", color: PLACEHOLDER, textAlign: "right", marginTop: 4 },
  vinRow:    { flexDirection: "row", gap: 10 },
  vinInput: {
    flex: 1, height: 46, backgroundColor: INPUT_BG,
    borderRadius: 10, borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 14, fontSize: 13,
    fontFamily: "Inter_600SemiBold", color: TEXT, letterSpacing: 1,
  },
  vinBtn: {
    height: 46, paddingHorizontal: 18, borderRadius: 10,
    backgroundColor: TEAL, alignItems: "center", justifyContent: "center",
  },
  vinBtnText:    { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  vinSuccess: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8,
    backgroundColor: "rgba(34,197,94,0.08)", padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.2)",
  },
  vinSuccessText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#16A34A" },
  vinError: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8,
    backgroundColor: "rgba(239,68,68,0.07)", padding: 10, borderRadius: 8,
    borderWidth: 1, borderColor: "rgba(239,68,68,0.2)",
  },
  vinErrorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#DC2626", flex: 1 },

  // Fields
  fieldInput: {
    height: 44, backgroundColor: INPUT_BG, borderRadius: 10,
    borderWidth: 1.5, borderColor: BORDER,
    paddingHorizontal: 12, fontSize: 14,
    fontFamily: "Inter_400Regular", color: TEXT,
  },

  // Price
  priceRow: { flexDirection: "row", alignItems: "center", gap: 0, borderWidth: 1.5, borderColor: BORDER, borderRadius: 10, overflow: "hidden", backgroundColor: INPUT_BG },
  ghsBadge: { height: 48, paddingHorizontal: 16, backgroundColor: TEAL, alignItems: "center", justifyContent: "center" },
  ghsText:  { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  priceInput: {
    flex: 1, height: 48, paddingHorizontal: 14,
    fontSize: 15, fontFamily: "Inter_500Medium", color: TEXT,
  },
  negotiableRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  negotiableText: { fontSize: 13, fontFamily: "Inter_400Regular", color: MUTED },

  // Description
  descInput: {
    minHeight: 110, backgroundColor: INPUT_BG,
    borderRadius: 10, borderWidth: 1.5, borderColor: BORDER,
    padding: 12, fontSize: 14, fontFamily: "Inter_400Regular",
    color: TEXT, lineHeight: 22,
  },
  charCount: { fontSize: 11, fontFamily: "Inter_400Regular", color: PLACEHOLDER, textAlign: "right", marginTop: 6 },

  // Boost
  boostCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: CARD, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: BORDER,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  boostIcon: { width: 36, height: 36, borderRadius: 9, backgroundColor: TEAL_LIGHT, alignItems: "center", justifyContent: "center" },
  boostTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: TEXT, marginBottom: 2 },
  boostSub:   { fontSize: 12, fontFamily: "Inter_400Regular", color: MUTED },

  // Footer
  footerNote: { fontSize: 11, fontFamily: "Inter_400Regular", color: MUTED, textAlign: "center", lineHeight: 18, paddingHorizontal: 8 },
  submitBtn: {
    height: 52, backgroundColor: TEAL, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    shadowColor: TEAL, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  submitText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
