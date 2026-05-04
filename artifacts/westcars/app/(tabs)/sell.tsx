import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { Colors } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { isFirebaseReady } from "@/lib/firebase";
import { updateCar, uploadCarImage } from "@/services/firebase";
import {
  CAR_BRANDS,
  CONDITIONS,
  FUEL_TYPES,
  GHANA_CITIES,
  TRANSMISSIONS,
  VEHICLE_TYPES,
} from "@/utils/ghanaData";

function PickerRow({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={pStyles.container}>
      <Pressable style={pStyles.trigger} onPress={() => setOpen(!open)}>
        <Text style={pStyles.label}>{label}</Text>
        <View style={pStyles.valueRow}>
          <Text style={[pStyles.value, !value && pStyles.placeholder]}>
            {value || `Select ${label}`}
          </Text>
          <Feather
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={Colors.light.textTertiary}
          />
        </View>
      </Pressable>
      {open && (
        <ScrollView style={pStyles.dropdown} nestedScrollEnabled>
          {options.map((opt) => (
            <Pressable
              key={opt}
              style={[pStyles.option, value === opt && pStyles.optionActive]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text
                style={[pStyles.optionText, value === opt && pStyles.optionTextActive]}
              >
                {opt}
              </Text>
              {value === opt && (
                <Feather name="check" size={16} color={Colors.primary} />
              )}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function SellScreen() {
  const { addCar, currentUser, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [images, setImages] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [mileage, setMileage] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [vin, setVin] = useState("");
  const [vinLoading, setVinLoading] = useState(false);
  const [vinDecoded, setVinDecoded] = useState(false);
  const [vinError, setVinError] = useState("");

  const decodeVIN = async () => {
    if (vin.length !== 17) return;
    setVinLoading(true);
    setVinDecoded(false);
    setVinError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
      );
      const data = await res.json();
      const results: any[] = data.Results || [];
      const get = (varName: string) =>
        results.find((r: any) => r.Variable === varName)?.Value || "";

      const make     = get("Make");
      const mdl      = get("Model");
      const yr       = get("Model Year");
      const fuel     = get("Fuel Type - Primary");
      const trans    = get("Transmission Style");

      if (!make || make === "0") {
        setVinError("VIN not recognised. Please enter details manually.");
        setVinLoading(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const fuelMap: Record<string, string> = {
        Gasoline: "Petrol", Petrol: "Petrol", Diesel: "Diesel",
        Electric: "Electric", "Natural Gas": "Hybrid", Hybrid: "Hybrid",
      };
      const transMap: Record<string, string> = {
        Automatic: "Automatic", Manual: "Manual",
        "Continuously Variable Transmission": "Automatic",
        CVT: "Automatic",
      };

      const normalMake = make.charAt(0) + make.slice(1).toLowerCase();
      const matchedBrand = CAR_BRANDS.find(
        (b) => b.toUpperCase() === make.toUpperCase()
      ) || normalMake;

      if (matchedBrand) setBrand(matchedBrand);
      if (mdl)  setModel(mdl);
      if (yr)   setYear(yr);
      if (fuel) setFuelType(fuelMap[fuel] || fuel);
      if (trans) setTransmission(transMap[trans] || trans);

      setVinDecoded(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setVinError("Could not reach the VIN lookup service. Check your connection.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setVinLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad }]}>
        <Feather name="lock" size={52} color={Colors.light.textTertiary} />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authText}>
          You need to be logged in to list your car for sale.
        </Text>
        <Pressable
          style={[styles.authBtn, { backgroundColor: "#0EB5CA", borderRadius: 14, paddingVertical: 14, alignItems: "center" }]}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={[styles.authBtnText, { color: "#FFFFFF" }]}>Sign In</Text>
        </Pressable>
      </View>
    );
  }

  const pickImages = async () => {
    if (images.length >= 10) {
      Alert.alert("Limit reached", "You can add up to 10 photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImgs = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...newImgs].slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    if (!brand || !model || !year || !price || !condition || !location) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }
    setSubmitting(true);

    try {
      const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
      const initialImages = images.length > 0 ? images : [PLACEHOLDER];

      // Step 1 — create the Firestore doc (gets us a carId)
      const carId = await addCar({
        brand,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        mileage: parseInt(mileage || "0"),
        fuelType: fuelType || "Petrol",
        transmission: transmission || "Automatic",
        condition,
        location,
        description,
        images: initialImages,
        sellerId: currentUser?.id || "currentUser",
        isFeatured: false,
        category: vehicleType || "sedan",
      });

      // Step 2 — upload real images to Firebase Storage (only when Firebase is live
      //           and the user actually picked local files)
      if (carId && isFirebaseReady() && currentUser?.id && images.length > 0) {
        try {
          const uploadedUrls = await Promise.all(
            images.map((uri, idx) =>
              uploadCarImage(currentUser.id, carId, uri, idx)
            )
          );
          // Step 3 — patch the Firestore doc with the real Storage download URLs
          await updateCar(carId, { images: uploadedUrls });
        } catch (uploadErr) {
          console.warn("[sell] image upload failed, listing saved with placeholder:", uploadErr);
        }
      }

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

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    multiline = false,
  }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textTertiary}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Glass header */}
        <View
          style={[
            styles.sellHeader,
            {
              paddingTop: topPad + 14,
              backgroundColor: "#FFFFFF",
              borderBottomWidth: 1,
              borderBottomColor: "rgba(0,0,0,0.07)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            },
          ]}
        >
          <View style={styles.sellHeaderBadge}>
            <Feather name="tag" size={13} color="#0098AA" />
            <Text style={[styles.sellHeaderBadgeText, { color: "#0098AA" }]}>SELL YOUR CAR</Text>
          </View>
          <Text style={[styles.screenTitle, { color: "#0F172A" }]}>List Your Car</Text>
          <Text style={[styles.screenSubtitle, { color: "#64748B" }]}>
            Reach thousands of buyers across Ghana
          </Text>
        </View>

        {/* Cards wrapper */}
        <View style={styles.cardsWrapper}>

        {/* ── VIN Lookup ── */}
        <View style={styles.card}>
          <View style={styles.vinTitleRow}>
            <View style={styles.vinIconBg}>
              <Feather name="search" size={14} color="#0098AA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>VIN Auto-Fill</Text>
              <Text style={styles.sectionSubtitle}>
                Enter your 17-digit VIN to auto-fill make, model & year
              </Text>
            </View>
          </View>

          <View style={styles.vinRow}>
            <TextInput
              style={[
                styles.vinInput,
                vinDecoded && { borderColor: "#22C55E" },
                vinError ? { borderColor: "#EF4444" } : undefined,
              ]}
              value={vin}
              onChangeText={(t) => {
                setVin(t.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""));
                setVinDecoded(false);
                setVinError("");
              }}
              placeholder="e.g. 1HGCM82633A123456"
              placeholderTextColor={Colors.light.textTertiary}
              maxLength={17}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Pressable
              style={[
                styles.vinBtn,
                { opacity: vin.length === 17 && !vinLoading ? 1 : 0.45 },
              ]}
              onPress={decodeVIN}
              disabled={vin.length !== 17 || vinLoading}
            >
              {vinLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="zap" size={16} color="#fff" />
              )}
            </Pressable>
          </View>

          <Text style={styles.vinCounter}>{vin.length}/17</Text>

          {vinDecoded && (
            <View style={styles.vinSuccess}>
              <Feather name="check-circle" size={15} color="#22C55E" />
              <Text style={styles.vinSuccessText}>
                VIN decoded! Fields below have been auto-filled.
              </Text>
            </View>
          )}
          {!!vinError && (
            <View style={styles.vinErrorBox}>
              <Feather name="alert-circle" size={15} color="#EF4444" />
              <Text style={styles.vinErrorText}>{vinError}</Text>
            </View>
          )}
        </View>

        {/* Photo upload */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Add up to 10 photos ({images.length}/10)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imagesRow}>
              {images.map((uri, i) => (
                <View key={i} style={styles.imageThumb}>
                  <Image source={{ uri }} style={styles.thumbImage} />
                  <Pressable
                    style={styles.removeImage}
                    onPress={() =>
                      setImages((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <Feather name="x" size={12} color="#fff" />
                  </Pressable>
                </View>
              ))}
              {images.length < 10 && (
                <Pressable style={styles.addImageBtn} onPress={pickImages}>
                  <Feather name="camera" size={24} color={Colors.primary} />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Vehicle Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
          <PickerRow
            label="Vehicle Type *"
            value={vehicleType}
            options={VEHICLE_TYPES}
            onSelect={setVehicleType}
          />
          <PickerRow
            label="Brand *"
            value={brand}
            options={CAR_BRANDS}
            onSelect={setBrand}
          />
          <InputField
            label="Model *"
            value={model}
            onChangeText={setModel}
            placeholder="e.g. Land Cruiser V8"
          />
          <InputField
            label="Year *"
            value={year}
            onChangeText={setYear}
            placeholder="e.g. 2020"
            keyboardType="numeric"
          />
          <InputField
            label="Mileage (km)"
            value={mileage}
            onChangeText={setMileage}
            placeholder="e.g. 45000"
            keyboardType="numeric"
          />
        </View>

        {/* Specs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <PickerRow
            label="Fuel Type"
            value={fuelType}
            options={FUEL_TYPES}
            onSelect={setFuelType}
          />
          <PickerRow
            label="Transmission"
            value={transmission}
            options={TRANSMISSIONS}
            onSelect={setTransmission}
          />
          <PickerRow
            label="Condition *"
            value={condition}
            options={CONDITIONS}
            onSelect={setCondition}
          />
          <PickerRow
            label="Location *"
            value={location}
            options={GHANA_CITIES}
            onSelect={setLocation}
          />
        </View>

        {/* Pricing */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.priceContainer}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>GHS</Text>
            </View>
            <TextInput
              style={styles.priceInput}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              placeholderTextColor={Colors.light.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <InputField
            label="Tell buyers about the car"
            value={description}
            onChangeText={setDescription}
            placeholder="Condition, features, history, why you're selling..."
            multiline
          />
        </View>

        {/* ── Boost Your Listing ── */}
        <Pressable style={styles.boostCard} onPress={() => router.push("/advertise")}>
          <LinearGradient
            colors={["#7A2000", "#FF6B00", "#FF8C38"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.boostGradient}
          >
            <View style={styles.boostLeft}>
              <View style={styles.boostIconBg}>
                <Feather name="zap" size={20} color="#0EB5CA" />
              </View>
              <View style={styles.boostText}>
                <Text style={styles.boostTitle}>Boost Your Listing</Text>
                <Text style={styles.boostSub}>Sponsored · Featured · Urgent Badge</Text>
              </View>
            </View>
            <View style={styles.boostArrow}>
              <Feather name="arrow-right" size={16} color="#0EB5CA" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            pressed && { opacity: 0.85 },
            submitting && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={["#CC3D00", "#FF6B00"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Feather name="upload-cloud" size={20} color="#fff" />
            <Text style={styles.submitText}>
              {submitting ? "Posting..." : "Post Listing"}
            </Text>
          </LinearGradient>
        </Pressable>

        </View>{/* end cardsWrapper */}
      </ScrollView>
    </KeyboardAvoidingView>
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
  cardsWrapper: {
    padding: 16,
    gap: 14,
  },
  sellHeader: {
    paddingHorizontal: 18,
    paddingBottom: 22,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sellHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(14,181,202,0.12)",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.32)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  sellHeaderBadgeText: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 1.5,
  },
  screenTitle: {
    fontSize: 26,
    fontFamily: "PlusJakartaSans_800ExtraBold",
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_400Regular",
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.textTertiary,
    marginTop: 0,
  },

  vinTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  vinIconBg: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  vinRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  vinInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: Colors.light.text,
    backgroundColor: "#F8FAFC",
    letterSpacing: 1,
  },
  vinBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0EB5CA",
    alignItems: "center",
    justifyContent: "center",
  },
  vinCounter: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_400Regular",
    color: Colors.light.textTertiary,
    textAlign: "right",
    marginTop: 0,
  },
  vinSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(34,197,94,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
  },
  vinSuccessText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#16A34A",
    flex: 1,
  },
  vinErrorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(239,68,68,0.07)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
  vinErrorText: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#DC2626",
    flex: 1,
  },

  imagesRow: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
    paddingTop: 4,
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  removeImage: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.primary + "12",
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImageText: {
    fontSize: 10,
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_500Medium",
    textAlign: "center",
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_500Medium",
    color: Colors.light.textSecondary,
  },
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "PlusJakartaSans_400Regular",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputMulti: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  currencyBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  currencyText: {
    color: "#fff",
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 15,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    color: Colors.light.text,
    fontFamily: "PlusJakartaSans_700Bold",
    padding: 0,
    paddingVertical: 13,
  },
  boostCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  boostGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  boostLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  boostIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  boostText: { gap: 2, flex: 1 },
  boostTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#fff",
  },
  boostSub: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "rgba(255,255,255,0.65)",
  },
  boostArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  submitText: {
    fontSize: 17,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#fff",
  },
  authWall: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
    backgroundColor: "#fff",
  },
  authTitle: {
    fontSize: 22,
    fontFamily: "PlusJakartaSans_700Bold",
    color: Colors.light.text,
  },
  authText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: "PlusJakartaSans_400Regular",
    textAlign: "center",
  },
  authBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
    width: "100%",
  },
  authBtnGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  authBtnText: {
    fontSize: 16,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
  },
});

const pStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  label: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: "PlusJakartaSans_500Medium",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  placeholder: {
    color: Colors.light.textTertiary,
  },
  dropdown: {
    maxHeight: 180,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundSecondary,
  },
  optionActive: {
    backgroundColor: Colors.primary + "0A",
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: "PlusJakartaSans_400Regular",
  },
  optionTextActive: {
    color: Colors.primary,
    fontFamily: "PlusJakartaSans_600SemiBold",
  },
});
