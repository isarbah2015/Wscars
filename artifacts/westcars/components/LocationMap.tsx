import { Feather } from "@expo/vector-icons";
import React from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

const GHANA_COORDS: Record<string, { lat: number; lng: number }> = {
  Accra:     { lat: 5.6037,  lng: -0.1870 },
  Kumasi:    { lat: 6.6884,  lng: -1.6244 },
  Tema:      { lat: 5.6698,  lng: -0.0167 },
  Takoradi:  { lat: 4.8927,  lng: -1.7557 },
  Tamale:    { lat: 9.4008,  lng: -0.8393 },
  Sunyani:   { lat: 7.3400,  lng: -2.3200 },
  "Cape Coast": { lat: 5.1054,  lng: -1.2466 },
  Koforidua: { lat: 6.0940,  lng: -0.2590 },
  Bolgatanga:{ lat: 10.7860, lng: -0.8510 },
  Techiman:  { lat: 7.5910,  lng: -1.9330 },
  Wa:        { lat: 10.0602, lng: -2.5099 },
  Ho:        { lat: 6.6010,  lng: 0.4703 },
};

function getCoords(location: string) {
  for (const [city, coords] of Object.entries(GHANA_COORDS)) {
    if (location.toLowerCase().includes(city.toLowerCase())) return { city, ...coords };
  }
  return { city: location, lat: 5.6037, lng: -0.1870 }; // default to Accra
}

interface Props {
  location: string;
}

export function LocationMap({ location }: Props) {
  const { colors, isDark } = useTheme();
  const { city, lat, lng } = getCoords(location);

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(city + ", Ghana")}`,
      android: `geo:${lat},${lng}?q=${encodeURIComponent(city + ", Ghana")}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city + ", Ghana")}`,
    });
    Linking.openURL(url!).catch(() =>
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city + ", Ghana")}`)
    );
  };

  // On web, show an OpenStreetMap iframe
  if (Platform.OS === "web") {
    const zoom = 13;
    const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04},${lat - 0.04},${lng + 0.04},${lat + 0.04}&layer=mapnik&marker=${lat},${lng}`;

    return (
      <View style={styles.root}>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color="#0EB5CA" />
          <Text style={[styles.locationText, { color: colors.text }]}>{city}, Ghana</Text>
        </View>
        {/* @ts-ignore — iframe is valid in Expo Web */}
        <iframe
          src={iframeSrc}
          style={{ width: "100%", height: 220, border: "none", borderRadius: 12 }}
          title="Car location map"
          loading="lazy"
        />
        <Pressable style={[styles.openBtn, { backgroundColor: isDark ? "rgba(14,181,202,0.15)" : "rgba(14,181,202,0.10)", borderColor: "rgba(14,181,202,0.3)" }]} onPress={openMaps}>
          <Feather name="external-link" size={14} color="#0EB5CA" />
          <Text style={styles.openBtnText}>Open in Google Maps</Text>
        </Pressable>
      </View>
    );
  }

  // Native fallback: styled map card with tap to open
  return (
    <View style={styles.root}>
      <View style={styles.locationRow}>
        <Feather name="map-pin" size={14} color="#0EB5CA" />
        <Text style={[styles.locationText, { color: colors.text }]}>{city}, Ghana</Text>
      </View>
      <Pressable
        style={[styles.nativeMapCard, { backgroundColor: isDark ? "#0B1F30" : "#E0F2FE", borderColor: "rgba(14,181,202,0.3)" }]}
        onPress={openMaps}
      >
        {/* Fake grid lines */}
        <View style={styles.gridLines}>
          {[0.25, 0.5, 0.75].map((f) => (
            <View key={f} style={[styles.gridH, { top: `${f * 100}%` as any }]} />
          ))}
          {[0.25, 0.5, 0.75].map((f) => (
            <View key={f} style={[styles.gridV, { left: `${f * 100}%` as any }]} />
          ))}
        </View>
        {/* Pin marker */}
        <View style={styles.pin}>
          <View style={styles.pinHead}>
            <Feather name="map-pin" size={24} color="#E8192C" />
          </View>
          <Text style={[styles.pinLabel, { color: isDark ? "#E0F2FE" : "#004D5A" }]}>{city}</Text>
        </View>
        <View style={styles.openOverlay}>
          <Feather name="external-link" size={13} color="#0EB5CA" />
          <Text style={styles.openOverlayText}>Tap to open maps</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 14, fontFamily: "PlusJakartaSans_600SemiBold" },
  openBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  openBtnText: { fontSize: 13, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA" },
  nativeMapCard: {
    height: 180, borderRadius: 14, borderWidth: 1,
    overflow: "hidden", alignItems: "center", justifyContent: "center",
  },
  gridLines: { ...StyleSheet.absoluteFillObject },
  gridH: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "rgba(14,181,202,0.15)" },
  gridV: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(14,181,202,0.15)" },
  pin: { alignItems: "center", gap: 4 },
  pinHead: {},
  pinLabel: { fontSize: 12, fontFamily: "PlusJakartaSans_700Bold" },
  openOverlay: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  openOverlayText: { fontSize: 11, fontFamily: "PlusJakartaSans_600SemiBold", color: "#0EB5CA" },
});
