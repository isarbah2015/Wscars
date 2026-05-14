/**
 * WestCars — FilterScreen + ProfilePhotoScreen
 * =============================================
 * Replit-safe: React 18.3.1 · React Native 0.76.9 · Expo SDK 52
 *
 * NO external animation libs (no reanimated version hell)
 * NO expo-camera (use expo-image-picker only — avoids Android permission chaos)
 * All navigation via @react-navigation/native-stack (v6, RN 0.76 compatible)
 *
 * DROP-IN usage in your existing app:
 *   import FilterScreen from './WestCarsFilterAndPhoto';
 *   import ProfilePhotoScreen from './WestCarsFilterAndPhoto';
 *
 * Or copy the individual components you need.
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  Linking,
  FlatList,
  Pressable,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Firebase — adjust this import to wherever you init Firebase
// import { db, storage, auth } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, updateProfile } from 'firebase/auth';

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  teal: '#1DA49C',
  tealLight: '#E8F7F6',
  tealDark: '#16827B',
  dark: '#0D1B2A',
  mid: '#4A6580',
  muted: '#8A9BB0',
  border: '#D8E4EE',
  bg: '#F4F7FA',
  white: '#FFFFFF',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  success: '#16A34A',
  successBg: '#F0FDF4',
  tag: '#EEF2FF',
  tagText: '#4338CA',
};

// ═══════════════════════════════════════════════════════════════════════════════
// ████  PART 1: FILTER SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
//
// Renders as a bottom sheet Modal — call it from any screen:
//
//   const [showFilter, setShowFilter] = useState(false);
//   <FilterSheet visible={showFilter} onClose={() => setShowFilter(false)}
//     onApply={(filters) => { console.log(filters); setShowFilter(false); }} />
//
// Or use the standalone FilterScreen for stack navigation.

const CAR_BRANDS = [
  'Any', 'Toyota', 'Mercedes', 'BMW', 'Honda', 'Ford',
  'Hyundai', 'Kia', 'Lexus', 'Nissan', 'Volkswagen',
  'Audi', 'Land Rover', 'Mitsubishi', 'Mazda', 'Suzuki',
];

const BODY_TYPES = ['Any', 'SUV / 4×4', 'Sedan', 'Hatchback', 'Pickup', 'Coupe', 'Van'];
const FUEL_TYPES = ['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Any', 'Automatic', 'Manual'];
const CONDITIONS = ['Any', 'New', 'Used', 'Certified Pre-Owned'];

const YEAR_MIN = 2000;
const YEAR_MAX = new Date().getFullYear();
const PRICE_STEPS = [0, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 999999];

const DEFAULT_FILTERS = {
  brand: 'Any',
  bodyType: 'Any',
  fuelType: 'Any',
  transmission: 'Any',
  condition: 'Any',
  yearMin: YEAR_MIN,
  yearMax: YEAR_MAX,
  priceMin: 0,
  priceMax: 999999,
  mileageMax: 999999,
  hasPhotos: false,
  sellerVerified: false,
  location: '',
};

const formatPrice = (v) =>
  v >= 999999 ? 'Any' : `$${v.toLocaleString()}`;

const formatMileage = (v) =>
  v >= 999999 ? 'Any' : `${v.toLocaleString()} km`;

// ── Pill Selector ─────────────────────────────────────────────────────────────
const PillRow = ({ label, options, value, onChange }) => (
  <View style={fs.section}>
    <Text style={fs.sectionLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={fs.pillRow}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={[fs.pill, active && fs.pillActive]}
              activeOpacity={0.75}
            >
              <Text style={[fs.pillText, active && fs.pillTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  </View>
);

// ── Range Slider (pure JS, no reanimated) ─────────────────────────────────────
const StepSlider = ({ label, steps, minIndex, maxIndex, onMinChange, onMaxChange, format }) => {
  return (
    <View style={fs.section}>
      <Text style={fs.sectionLabel}>{label}</Text>
      <View style={fs.rangeRow}>
        <Text style={fs.rangeLabel}>From: <Text style={fs.rangeValue}>{format(steps[minIndex])}</Text></Text>
        <Text style={fs.rangeLabel}>To: <Text style={fs.rangeValue}>{format(steps[maxIndex])}</Text></Text>
      </View>
      <View style={fs.sliderTrack}>
        {steps.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              if (i <= maxIndex) onMinChange(i);
            }}
            style={[
              fs.sliderStep,
              i >= minIndex && i <= maxIndex && fs.sliderStepActive,
            ]}
          />
        ))}
      </View>
      <View style={fs.sliderLabels}>
        <Text style={fs.sliderEdge}>{format(steps[0])}</Text>
        <Text style={fs.sliderEdge}>{format(steps[steps.length - 1])}</Text>
      </View>
      {/* Max selector */}
      <View style={fs.sliderTrack}>
        {steps.map((_, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              if (i >= minIndex) onMaxChange(i);
            }}
            style={[
              fs.sliderStep,
              i >= minIndex && i <= maxIndex && fs.sliderStepActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// ── Year Range Input ──────────────────────────────────────────────────────────
const YearRange = ({ yearMin, yearMax, onChange }) => {
  const [minStr, setMinStr] = useState(String(yearMin));
  const [maxStr, setMaxStr] = useState(String(yearMax));

  const commit = (field, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) return;
    if (field === 'min' && n >= YEAR_MIN && n <= yearMax) onChange({ yearMin: n });
    if (field === 'max' && n >= yearMin && n <= YEAR_MAX) onChange({ yearMax: n });
  };

  return (
    <View style={fs.section}>
      <Text style={fs.sectionLabel}>Year</Text>
      <View style={fs.yearRow}>
        <View style={fs.yearBox}>
          <Text style={fs.yearBoxLabel}>From</Text>
          <TextInput
            style={fs.yearInput}
            value={minStr}
            onChangeText={setMinStr}
            onBlur={() => commit('min', minStr)}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
          />
        </View>
        <Text style={fs.yearDash}>—</Text>
        <View style={fs.yearBox}>
          <Text style={fs.yearBoxLabel}>To</Text>
          <TextInput
            style={fs.yearInput}
            value={maxStr}
            onChangeText={setMaxStr}
            onBlur={() => commit('max', maxStr)}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
          />
        </View>
      </View>
    </View>
  );
};

// ── Toggle Row ────────────────────────────────────────────────────────────────
const ToggleRow = ({ label, subtitle, value, onChange }) => (
  <View style={fs.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={fs.toggleLabel}>{label}</Text>
      {subtitle ? <Text style={fs.toggleSub}>{subtitle}</Text> : null}
    </View>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: T.border, true: T.teal }}
      thumbColor={T.white}
      ios_backgroundColor={T.border}
    />
  </View>
);

// ── Active filter count badge ─────────────────────────────────────────────────
export const countActiveFilters = (filters) => {
  let count = 0;
  if (filters.brand !== 'Any') count++;
  if (filters.bodyType !== 'Any') count++;
  if (filters.fuelType !== 'Any') count++;
  if (filters.transmission !== 'Any') count++;
  if (filters.condition !== 'Any') count++;
  if (filters.yearMin > YEAR_MIN || filters.yearMax < YEAR_MAX) count++;
  if (filters.priceMin > 0 || filters.priceMax < 999999) count++;
  if (filters.mileageMax < 999999) count++;
  if (filters.hasPhotos) count++;
  if (filters.sellerVerified) count++;
  if (filters.location) count++;
  return count;
};

// ── Main FilterSheet Component ────────────────────────────────────────────────
export const FilterSheet = ({ visible, onClose, onApply, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters || DEFAULT_FILTERS);

  const set = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = () => setFilters(DEFAULT_FILTERS);

  const priceMinIdx = PRICE_STEPS.indexOf(filters.priceMin) >= 0
    ? PRICE_STEPS.indexOf(filters.priceMin) : 0;
  const priceMaxIdx = PRICE_STEPS.indexOf(filters.priceMax) >= 0
    ? PRICE_STEPS.indexOf(filters.priceMax) : PRICE_STEPS.length - 1;

  const MILEAGE_STEPS = [0, 10000, 30000, 50000, 75000, 100000, 150000, 200000, 999999];
  const mileageIdx = MILEAGE_STEPS.findIndex((s) => s >= filters.mileageMax);
  const mileageMaxIdx = mileageIdx >= 0 ? mileageIdx : MILEAGE_STEPS.length - 1;

  const activeCount = countActiveFilters(filters);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={fs.sheet}>
        {/* Header */}
        <View style={fs.header}>
          <TouchableOpacity onPress={onClose} style={fs.headerBtn}>
            <Text style={fs.headerBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={fs.headerTitle}>
            Filter{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
          <TouchableOpacity onPress={reset} style={fs.headerBtn}>
            <Text style={[fs.headerBtnText, { color: T.error }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable filter body */}
        <ScrollView
          style={fs.body}
          contentContainerStyle={fs.bodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PillRow
            label="Brand"
            options={CAR_BRANDS}
            value={filters.brand}
            onChange={(v) => set({ brand: v })}
          />

          <PillRow
            label="Body Type"
            options={BODY_TYPES}
            value={filters.bodyType}
            onChange={(v) => set({ bodyType: v })}
          />

          <PillRow
            label="Condition"
            options={CONDITIONS}
            value={filters.condition}
            onChange={(v) => set({ condition: v })}
          />

          <PillRow
            label="Fuel Type"
            options={FUEL_TYPES}
            value={filters.fuelType}
            onChange={(v) => set({ fuelType: v })}
          />

          <PillRow
            label="Transmission"
            options={TRANSMISSIONS}
            value={filters.transmission}
            onChange={(v) => set({ transmission: v })}
          />

          <YearRange
            yearMin={filters.yearMin}
            yearMax={filters.yearMax}
            onChange={set}
          />

          {/* Price range */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Price Range</Text>
            <View style={fs.rangeRow}>
              <Text style={fs.rangeLabel}>
                Min: <Text style={fs.rangeValue}>{formatPrice(filters.priceMin)}</Text>
              </Text>
              <Text style={fs.rangeLabel}>
                Max: <Text style={fs.rangeValue}>{formatPrice(filters.priceMax)}</Text>
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PRICE_STEPS.filter((_, i) => i < PRICE_STEPS.length - 1).map((step) => (
                  <TouchableOpacity
                    key={step}
                    style={[
                      fs.priceChip,
                      filters.priceMin === step && fs.priceChipActive,
                    ]}
                    onPress={() => {
                      if (step < filters.priceMax) set({ priceMin: step });
                    }}
                  >
                    <Text style={[
                      fs.priceChipText,
                      filters.priceMin === step && fs.priceChipTextActive,
                    ]}>
                      {step === 0 ? 'Any' : `$${(step / 1000).toFixed(0)}k+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={[fs.sectionLabel, { marginTop: 10 }]}>Max Price</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {PRICE_STEPS.map((step) => (
                  <TouchableOpacity
                    key={step}
                    style={[
                      fs.priceChip,
                      filters.priceMax === step && fs.priceChipActive,
                    ]}
                    onPress={() => {
                      if (step > filters.priceMin) set({ priceMax: step });
                    }}
                  >
                    <Text style={[
                      fs.priceChipText,
                      filters.priceMax === step && fs.priceChipTextActive,
                    ]}>
                      {step >= 999999 ? 'Any' : `$${(step / 1000).toFixed(0)}k`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Max mileage */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Max Mileage</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {MILEAGE_STEPS.map((step) => (
                  <TouchableOpacity
                    key={step}
                    style={[
                      fs.priceChip,
                      filters.mileageMax === step && fs.priceChipActive,
                    ]}
                    onPress={() => set({ mileageMax: step })}
                  >
                    <Text style={[
                      fs.priceChipText,
                      filters.mileageMax === step && fs.priceChipTextActive,
                    ]}>
                      {step >= 999999 ? 'Any' : `${(step / 1000).toFixed(0)}k km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Location */}
          <View style={fs.section}>
            <Text style={fs.sectionLabel}>Location</Text>
            <TextInput
              style={fs.locationInput}
              placeholder="City or region (e.g. Accra)"
              placeholderTextColor={T.muted}
              value={filters.location}
              onChangeText={(v) => set({ location: v })}
              returnKeyType="done"
            />
          </View>

          {/* Toggles */}
          <View style={fs.toggleSection}>
            <ToggleRow
              label="Photos only"
              subtitle="Only show listings with photos"
              value={filters.hasPhotos}
              onChange={(v) => set({ hasPhotos: v })}
            />
            <View style={fs.toggleDivider} />
            <ToggleRow
              label="Verified sellers only"
              subtitle="Filter to trust-verified accounts"
              value={filters.sellerVerified}
              onChange={(v) => set({ sellerVerified: v })}
            />
          </View>
        </ScrollView>

        {/* Apply button */}
        <View style={fs.footer}>
          <TouchableOpacity
            style={fs.applyBtn}
            onPress={() => onApply(filters)}
            activeOpacity={0.85}
          >
            <Text style={fs.applyBtnText}>
              {activeCount > 0 ? `Apply ${activeCount} Filter${activeCount > 1 ? 's' : ''}` : 'Apply Filters'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Filter styles ─────────────────────────────────────────────────────────────
const fs = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: T.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.white,
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: T.dark },
  headerBtn: { padding: 4 },
  headerBtnText: { fontSize: 15, fontWeight: '500', color: T.teal },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 24 },
  section: { paddingHorizontal: 20, paddingTop: 18 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: T.dark, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.white,
  },
  pillActive: { backgroundColor: T.teal, borderColor: T.teal },
  pillText: { fontSize: 13, color: T.mid, fontWeight: '500' },
  pillTextActive: { color: T.white },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rangeLabel: { fontSize: 13, color: T.muted },
  rangeValue: { fontWeight: '600', color: T.dark },
  sliderTrack: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  sliderStep: { flex: 1, height: 6, borderRadius: 3, backgroundColor: T.border },
  sliderStepActive: { backgroundColor: T.teal },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderEdge: { fontSize: 11, color: T.muted },
  yearRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  yearBox: { flex: 1, borderWidth: 1, borderColor: T.border, borderRadius: 10, padding: 10, backgroundColor: T.white },
  yearBoxLabel: { fontSize: 11, color: T.muted, marginBottom: 4 },
  yearInput: { fontSize: 16, fontWeight: '600', color: T.dark, padding: 0 },
  yearDash: { fontSize: 18, color: T.muted, fontWeight: '300' },
  toggleSection: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: T.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
    overflow: 'hidden',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  toggleDivider: { height: 1, backgroundColor: T.border, marginHorizontal: 16 },
  toggleLabel: { fontSize: 14, fontWeight: '500', color: T.dark },
  toggleSub: { fontSize: 12, color: T.muted, marginTop: 2 },
  locationInput: {
    backgroundColor: T.white,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: T.dark,
  },
  priceChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.white,
  },
  priceChipActive: { backgroundColor: T.teal, borderColor: T.teal },
  priceChipText: { fontSize: 12, color: T.mid, fontWeight: '500' },
  priceChipTextActive: { color: T.white },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: T.border,
    backgroundColor: T.white,
  },
  applyBtn: {
    backgroundColor: T.teal,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyBtnText: { color: T.white, fontSize: 16, fontWeight: '600' },
});


// ═══════════════════════════════════════════════════════════════════════════════
// ████  PART 2: PROFILE PHOTO SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
//
// Complete profile page with photo upload.
// Uses expo-image-picker ONLY (no expo-camera) — avoids the Android
// "opens wrong app" bug entirely. The user still gets full camera + gallery choice.
//
// Props:
//   user         — Firebase Auth user object
//   userProfile  — Firestore user document { displayName, photoURL, location, trustScore, ... }
//   onSignOut    — callback after sign out
//   onUpdate     — callback(updatedFields) when profile saves
//
// Wiring to Firebase:
//   Replace the uploadPhoto function's firebase imports with your own firebase.js file.

const TRUST_COLOR = (score) => {
  if (score >= 70) return T.success;
  if (score >= 40) return '#D97706';
  return T.muted;
};

export const ProfilePhotoScreen = ({ user, userProfile, onSignOut, onUpdate }) => {
  const [photoUri, setPhotoUri] = useState(userProfile?.photoURL || null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [location, setLocation] = useState(userProfile?.location || 'Accra');
  const [savingProfile, setSavingProfile] = useState(false);

  const trustScore = userProfile?.trustScore ?? 15;

  // ── Request permission then launch camera ────────────────────────────────
  const takeWithCamera = async () => {
    setUploadError('');
    setUploadSuccess(false);

    // Step 1: explicitly request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'denied') {
      // On Android, 'denied' after a previous rejection means we must send to Settings
      Alert.alert(
        'Camera Permission Required',
        'To take a profile photo, allow WestCars to use your camera in Settings.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
      return;
    }

    if (status !== 'granted') {
      setUploadError('Camera permission was not granted.');
      return;
    }

    // Step 2: launch camera directly — avoids the "opens wrong app" bug
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  // ── Request permission then open gallery ─────────────────────────────────
  const pickFromGallery = async () => {
    setUploadError('');
    setUploadSuccess(false);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status === 'denied') {
      Alert.alert(
        'Gallery Permission Required',
        'To choose a profile photo, allow WestCars to access your photos in Settings.',
        [
          { text: 'Not Now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }

    if (status !== 'granted') {
      setUploadError('Gallery permission was not granted.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  // ── Show action sheet: camera or gallery ─────────────────────────────────
  const promptPhotoSource = () => {
    Alert.alert('Update Profile Photo', 'Choose how to add your photo', [
      { text: 'Take a Photo', onPress: takeWithCamera },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Upload photo to Firebase Storage + update Firestore ──────────────────
  const uploadPhoto = async (localUri) => {
    if (!user) {
      setUploadError('You must be signed in to update your photo.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // 1. Fetch the local file as a blob
      const response = await fetch(localUri);
      if (!response.ok) throw new Error('Failed to read photo file');
      const blob = await response.blob();

      // 2. Upload to Firebase Storage
      //    Path: profiles/{uid}.jpg — overwrites previous photo automatically
      const storageInstance = getStorage();
      const photoRef = ref(storageInstance, `profiles/${user.uid}.jpg`);
      await uploadBytes(photoRef, blob);

      // 3. Get the public download URL
      const downloadUrl = await getDownloadURL(photoRef);

      // 4. Update Firebase Auth profile (for user.photoURL)
      const authInstance = getAuth();
      await updateProfile(authInstance.currentUser, { photoURL: downloadUrl });

      // 5. Update Firestore user document
      const firestoreInstance = getFirestore();
      await updateDoc(doc(firestoreInstance, 'users', user.uid), {
        photoURL: downloadUrl,
        updatedAt: serverTimestamp(),
      });

      // 6. Update local state
      setPhotoUri(downloadUrl);
      setUploadSuccess(true);
      if (onUpdate) onUpdate({ photoURL: downloadUrl });

      // Auto-clear success after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (err) {
      console.error('Photo upload error:', err);
      if (err.code === 'storage/unauthorized') {
        setUploadError('Permission denied. Check your Firebase Storage rules.');
      } else if (err.message?.includes('network')) {
        setUploadError('Upload failed — check your internet connection.');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // ── Save display name + location ─────────────────────────────────────────
  const saveProfile = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    setSavingProfile(true);
    try {
      const authInstance = getAuth();
      await updateProfile(authInstance.currentUser, {
        displayName: displayName.trim(),
      });

      const firestoreInstance = getFirestore();
      await updateDoc(doc(firestoreInstance, 'users', user.uid), {
        displayName: displayName.trim(),
        location: location.trim(),
        updatedAt: serverTimestamp(),
      });

      if (onUpdate) onUpdate({ displayName: displayName.trim(), location: location.trim() });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <ScrollView style={ps.screen} contentContainerStyle={ps.container} showsVerticalScrollIndicator={false}>

      {/* Profile photo section */}
      <View style={ps.photoSection}>
        <View style={ps.avatarWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={ps.avatar} />
          ) : (
            <View style={ps.avatarPlaceholder}>
              <Text style={ps.avatarInitials}>
                {(displayName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Camera button overlay */}
          <TouchableOpacity
            style={ps.cameraBtn}
            onPress={promptPhotoSource}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading
              ? <ActivityIndicator size="small" color={T.white} />
              : <Text style={ps.cameraBtnIcon}>📷</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Status messages */}
        {uploadSuccess && (
          <View style={ps.successBanner}>
            <Text style={ps.successText}>✓ Photo updated successfully</Text>
          </View>
        )}
        {uploadError ? (
          <View style={ps.errorBanner}>
            <Text style={ps.errorText}>{uploadError}</Text>
          </View>
        ) : null}

        {/* Photo action buttons */}
        <View style={ps.photoBtnRow}>
          <TouchableOpacity
            style={ps.photoBtn}
            onPress={takeWithCamera}
            disabled={uploading}
          >
            <Text style={ps.photoBtnText}>📸  Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={ps.photoBtn}
            onPress={pickFromGallery}
            disabled={uploading}
          >
            <Text style={ps.photoBtnText}>🖼️  Gallery</Text>
          </TouchableOpacity>
        </View>

        <Text style={ps.photoHint}>
          Square photos work best · Max 5MB · JPG or PNG
        </Text>
      </View>

      {/* Trust score */}
      <View style={ps.trustCard}>
        <View style={ps.trustHeader}>
          <Text style={ps.trustTitle}>Trust Score</Text>
          <View style={ps.trustBadge}>
            <Text style={ps.trustBadgeText}>
              {trustScore < 30 ? 'New' : trustScore < 60 ? 'Growing' : 'Trusted'}
            </Text>
          </View>
        </View>
        <View style={ps.trustBar}>
          <View style={[ps.trustFill, { width: `${trustScore}%`, backgroundColor: TRUST_COLOR(trustScore) }]} />
        </View>
        <Text style={ps.trustScore}>
          {trustScore}/100 · Based on verification, ratings & sales
        </Text>
        <View style={ps.trustStats}>
          {[
            { label: 'Listings', value: userProfile?.listingCount ?? 0 },
            { label: 'Saved', value: userProfile?.savedCount ?? 0 },
            { label: 'Reviews', value: userProfile?.reviewCount ?? 0 },
          ].map(({ label, value }) => (
            <View key={label} style={ps.trustStat}>
              <Text style={ps.trustStatValue}>{value}</Text>
              <Text style={ps.trustStatLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Profile fields */}
      <View style={ps.fieldCard}>
        <Text style={ps.fieldCardTitle}>Profile Details</Text>

        <Text style={ps.fieldLabel}>Display Name</Text>
        <TextInput
          style={ps.fieldInput}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your full name"
          placeholderTextColor={T.muted}
          autoCapitalize="words"
          returnKeyType="next"
        />

        <Text style={ps.fieldLabel}>Email</Text>
        <View style={ps.fieldInputDisabled}>
          <Text style={ps.fieldInputDisabledText}>{user?.email || '—'}</Text>
        </View>
        <Text style={ps.fieldHint}>Email cannot be changed here</Text>

        <Text style={ps.fieldLabel}>Location</Text>
        <TextInput
          style={ps.fieldInput}
          value={location}
          onChangeText={setLocation}
          placeholder="City or region"
          placeholderTextColor={T.muted}
          returnKeyType="done"
        />

        <TouchableOpacity
          style={[ps.saveBtn, savingProfile && ps.saveBtnDisabled]}
          onPress={saveProfile}
          disabled={savingProfile}
          activeOpacity={0.85}
        >
          {savingProfile
            ? <ActivityIndicator color={T.white} />
            : <Text style={ps.saveBtnText}>Save Profile</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Get Verified CTA */}
      {trustScore < 50 && (
        <TouchableOpacity style={ps.verifyCard} activeOpacity={0.85}>
          <View>
            <Text style={ps.verifyTitle}>Get Verified</Text>
            <Text style={ps.verifySub}>Boost your trust score and get more buyers</Text>
          </View>
          <Text style={ps.verifyArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Sign out */}
      <TouchableOpacity style={ps.signOutBtn} onPress={onSignOut} activeOpacity={0.75}>
        <Text style={ps.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

// ── Profile styles ────────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  screen: { flex: 1, backgroundColor: T.bg },
  container: { paddingBottom: 32 },

  photoSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 20, backgroundColor: T.white, borderBottomWidth: 1, borderBottomColor: T.border, marginBottom: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: T.teal },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: T.tealLight, borderWidth: 3, borderColor: T.teal, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 36, fontWeight: '700', color: T.teal },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: T.teal, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: T.white },
  cameraBtnIcon: { fontSize: 14 },

  successBanner: { backgroundColor: T.successBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12 },
  successText: { color: T.success, fontSize: 13, fontWeight: '500' },
  errorBanner: { backgroundColor: T.errorBg, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12 },
  errorText: { color: T.error, fontSize: 13, fontWeight: '500' },

  photoBtnRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  photoBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: T.teal, backgroundColor: T.tealLight },
  photoBtnText: { color: T.tealDark, fontSize: 13, fontWeight: '600' },
  photoHint: { fontSize: 12, color: T.muted, textAlign: 'center' },

  trustCard: { marginHorizontal: 16, backgroundColor: T.white, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  trustHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  trustTitle: { fontSize: 15, fontWeight: '600', color: T.dark },
  trustBadge: { backgroundColor: T.tealLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trustBadgeText: { color: T.tealDark, fontSize: 12, fontWeight: '600' },
  trustBar: { height: 6, backgroundColor: T.border, borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  trustFill: { height: '100%', borderRadius: 3 },
  trustScore: { fontSize: 12, color: T.muted, marginBottom: 16 },
  trustStats: { flexDirection: 'row' },
  trustStat: { flex: 1, alignItems: 'center' },
  trustStatValue: { fontSize: 20, fontWeight: '700', color: T.dark },
  trustStatLabel: { fontSize: 12, color: T.muted, marginTop: 2 },

  fieldCard: { marginHorizontal: 16, backgroundColor: T.white, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  fieldCardTitle: { fontSize: 15, fontWeight: '600', color: T.dark, marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  fieldInput: { borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: T.dark, backgroundColor: T.bg },
  fieldInputDisabled: { borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: T.bg },
  fieldInputDisabledText: { fontSize: 15, color: T.muted },
  fieldHint: { fontSize: 11, color: T.muted, marginTop: 4 },

  saveBtn: { backgroundColor: T.teal, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText: { color: T.white, fontSize: 15, fontWeight: '600' },

  verifyCard: { marginHorizontal: 16, backgroundColor: T.teal, borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verifyTitle: { fontSize: 15, fontWeight: '700', color: T.white },
  verifySub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  verifyArrow: { fontSize: 22, color: T.white },

  signOutBtn: { marginHorizontal: 16, paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: T.error, marginTop: 8 },
  signOutText: { color: T.error, fontSize: 15, fontWeight: '600' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// ████  PART 3: HOW TO WIRE THE FILTER BUTTON ON HOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
//
// In your HomeScreen.js:
//
//   import { FilterSheet, countActiveFilters } from './WestCarsFilterAndPhoto';
//
//   const HomeScreen = () => {
//     const [showFilter, setShowFilter] = useState(false);
//     const [filters, setFilters] = useState({});
//     const activeCount = countActiveFilters(filters);
//
//     return (
//       <View style={{ flex: 1 }}>
//         {/* Filter button */}
//         <TouchableOpacity onPress={() => setShowFilter(true)}>
//           <Text>Filters {activeCount > 0 ? `(${activeCount})` : ''}</Text>
//         </TouchableOpacity>
//
//         {/* Filter sheet */}
//         <FilterSheet
//           visible={showFilter}
//           onClose={() => setShowFilter(false)}
//           onApply={(f) => { setFilters(f); setShowFilter(false); fetchListings(f); }}
//           initialFilters={filters}
//         />
//       </View>
//     );
//   };

// ═══════════════════════════════════════════════════════════════════════════════
// ████  PART 4: FIREBASE STORAGE RULES (paste into Firebase Console)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Without these rules, uploads will throw storage/unauthorized
//
// rules_version = '2';
// service firebase.storage {
//   match /b/{bucket}/o {
//     // Profile photos: only the owner can write, anyone can read
//     match /profiles/{userId}.jpg {
//       allow read: if true;
//       allow write: if request.auth != null && request.auth.uid == userId
//                    && request.resource.size < 5 * 1024 * 1024  // 5MB max
//                    && request.resource.contentType.matches('image/.*');
//     }
//
//     // Car listing photos
//     match /listings/{listingId}/{fileName} {
//       allow read: if true;
//       allow write: if request.auth != null
//                    && request.resource.size < 10 * 1024 * 1024
//                    && request.resource.contentType.matches('image/.*');
//     }
//   }
// }

export default ProfilePhotoScreen;
