import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
import {
  CAR_BRANDS,
  CONDITIONS,
  FUEL_TYPES,
  GHANA_CITIES,
  TRANSMISSIONS,
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
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad }]}>
        <Feather name="lock" size={52} color={Colors.light.textTertiary} />
        <Text style={styles.authTitle}>Sign In Required</Text>
        <Text style={styles.authText}>
          You need to be logged in to list your car for sale.
        </Text>
        <Pressable
          style={styles.authBtn}
          onPress={() => router.push("/auth/login")}
        >
          <LinearGradient
            colors={["#00873E", "#00A64C"]}
            style={styles.authBtnGradient}
          >
            <Text style={styles.authBtnText}>Sign In</Text>
          </LinearGradient>
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

    const mockImageUrl =
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";

    addCar({
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
      images: images.length > 0 ? images : [mockImageUrl],
      sellerId: currentUser?.id || "currentUser",
      isFeatured: false,
      category: "sedan",
    });

    setSubmitting(false);
    Alert.alert(
      "Listing Posted!",
      "Your car has been listed successfully.",
      [{ text: "View Listings", onPress: () => router.push("/(tabs)") }]
    );
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
          {
            paddingTop: topPad + 10,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>List Your Car</Text>
        <Text style={styles.screenSubtitle}>
          Reach thousands of buyers across Ghana
        </Text>

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

        {/* Car Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Car Details</Text>
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
            colors={["#00873E", "#00A64C"]}
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
    padding: 16,
    gap: 14,
  },
  screenTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  screenSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
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
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    marginTop: -8,
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
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  fieldContainer: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    color: Colors.light.text,
    fontFamily: "Inter_700Bold",
    padding: 0,
    paddingVertical: 13,
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
    fontFamily: "Inter_700Bold",
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
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  authText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_600SemiBold",
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
    fontFamily: "Inter_500Medium",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  value: {
    fontSize: 15,
    color: Colors.light.text,
    fontFamily: "Inter_400Regular",
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
    fontFamily: "Inter_400Regular",
  },
  optionTextActive: {
    color: Colors.primary,
    fontFamily: "Inter_600SemiBold",
  },
});
