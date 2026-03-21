import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.specRow}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function FullSpecsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars } = useApp();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const car = cars.find((c) => c.id === id);

  if (!car) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#9E9E9E" }}>Car not found</Text>
      </View>
    );
  }

  const s = car.techSpecs;
  if (!s) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#9E9E9E" }}>No specifications available</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#1A1A1A" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.topTitle}>Specifications</Text>
          <Text style={styles.topSub} numberOfLines={1}>
            {car.brand} {car.model} · {car.year}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Car illustration */}
        <View style={styles.heroCard}>
          <Image source={{ uri: car.images[0] }} style={styles.heroImg} resizeMode="cover" />

          {/* Dimension overlay badges */}
          <View style={styles.dimBadge}>
            <Text style={styles.dimText}>{s.length} mm</Text>
            <Text style={styles.dimSub}>Length</Text>
          </View>
          <View style={[styles.dimBadge, { bottom: 10, right: 10, left: undefined }]}>
            <Text style={styles.dimText}>{s.height} mm</Text>
            <Text style={styles.dimSub}>Height</Text>
          </View>
        </View>

        {/* Quick spec row */}
        <View style={styles.quickRow}>
          {[
            { label: "Body", value: s.bodyType.split(" ")[0] },
            { label: "Engine", value: s.engineDisplacement.split(" ")[0] },
            { label: "Power", value: `${s.horsepower} hp` },
            { label: "Drive", value: s.drive.split(" ")[0] },
            { label: "0–100", value: s.acceleration },
            { label: "Speed", value: `${s.maxSpeed} km/h` },
          ].map((q, i) => (
            <View key={i} style={styles.quickCell}>
              <Text style={styles.quickVal}>{q.value}</Text>
              <Text style={styles.quickLbl}>{q.label}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        <View style={styles.sections}>

          <Section title="General Information">
            <Row label="Body type" value={s.bodyType} />
            <Row label="Country of manufacture" value={s.country} />
            <Row label="Car class" value={s.carClass} />
            <Row label="Number of doors" value={s.doors} />
            <Row label="Seating capacity" value={s.seats} />
            <Row label="Steering position" value={s.steering} />
            <Row label="Color" value={s.color} />
            <Row label="Trim level" value={s.trim} />
            <Row label="Previous owners" value={s.owners} />
          </Section>

          <Section title="Dimensions">
            <Row label="Length" value={`${s.length} mm`} />
            <Row label="Width" value={`${s.width} mm`} />
            <Row label="Height" value={`${s.height} mm`} />
            <Row label="Wheelbase" value={`${s.wheelbase} mm`} />
            <Row label="Ground clearance" value={`${s.clearance} mm`} />
            <Row label="Front track width" value={`${s.frontTrack} mm`} />
            <Row label="Rear track width" value={`${s.rearTrack} mm`} />
            <Row label="Wheel size" value={s.wheelSize} />
          </Section>

          <Section title="Weight & Capacity">
            <Row label="Engine displacement" value={s.engineDisplacement} />
            <Row label="Fuel tank volume" value={`${s.tankVolume} L`} />
            <Row label="Curb weight" value={`${s.curbWeight.toLocaleString()} kg`} />
            <Row label="Maximum laden weight" value={`${s.maxWeight.toLocaleString()} kg`} />
          </Section>

          <Section title="Transmission">
            <Row label="Gearbox type" value={s.gearbox} />
            <Row label="Number of gears" value={s.gears} />
            <Row label="Drive type" value={s.drive} />
          </Section>

          <Section title="Suspension & Brakes">
            <Row label="Front suspension" value={s.frontSuspension} />
            <Row label="Rear suspension" value={s.rearSuspension} />
            <Row label="Front brakes" value={s.frontBrakes} />
            <Row label="Rear brakes" value={s.rearBrakes} />
          </Section>

          <Section title="Performance Characteristics">
            <Row label="Maximum speed" value={`${s.maxSpeed} km/h`} />
            <Row label="Acceleration 0–100 km/h" value={s.acceleration} />
            <Row label="Fuel consumption (city)" value={s.fuelCity} />
            <Row label="Fuel consumption (highway)" value={s.fuelHighway} />
            <Row label="Fuel consumption (mixed)" value={s.fuelMixed} />
            <Row label="CO₂ emissions" value={s.co2} />
            <Row label="Emissions standard" value={s.euroStandard} />
            <Row label="Annual road tax" value={`GHS ${s.annualTax.toLocaleString()}`} />
          </Section>

          <Section title="Engine">
            <Row label="Engine type" value={s.engineType} />
            <Row label="Engine layout" value={s.engineLayout} />
            <Row label="Engine code" value={s.engineCode} />
            <Row label="Displacement" value={s.engineDisplacement} />
            <Row label="Maximum power" value={`${s.horsepower} hp (${Math.round(s.horsepower * 0.7457)} kW) @ ${s.horsepowerRpm}`} />
            <Row label="Maximum torque" value={`${s.torque} @ ${s.torqueRpm}`} />
            <Row label="Cylinder configuration" value={s.cylinderConfig} />
            <Row label="Fuel grade" value={s.fuelGrade} />
          </Section>
        </View>

        <View style={{ height: (insets.bottom || 0) + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    gap: 8,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 16, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  topSub: { fontSize: 12, color: "#9E9E9E", fontFamily: "Manrope_400Regular", marginTop: 1 },

  heroCard: {
    backgroundColor: "#1A1A1A",
    height: 220,
    position: "relative",
    overflow: "hidden",
  },
  heroImg: {
    width: "100%",
    height: "100%",
    opacity: 0.75,
  },
  dimBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  dimText: { color: "#fff", fontSize: 13, fontFamily: "Manrope_700Bold" },
  dimSub: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontFamily: "Manrope_400Regular" },

  quickRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  quickCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#F0F0F0",
  },
  quickVal: { fontSize: 13, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  quickLbl: { fontSize: 10, fontFamily: "Manrope_400Regular", color: "#9E9E9E", marginTop: 2 },

  sections: { padding: 16, gap: 12 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FAFAFA",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionBody: {},

  specRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    alignItems: "flex-start",
    gap: 12,
  },
  specLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    color: "#6B6B6B",
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#1A1A1A",
    flex: 1,
    textAlign: "right",
  },
});
