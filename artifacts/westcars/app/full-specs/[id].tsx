import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { useTheme } from "@/context/ThemeContext";

function Row({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.specRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.specValue, { color: accent ? colors.accent : colors.text }]}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <LinearGradient
        colors={isDark ? ["rgba(14,181,202,0.08)", "rgba(14,181,202,0.02)"] : ["rgba(14,181,202,0.10)", "rgba(14,181,202,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeader}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </LinearGradient>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function FullSpecsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cars } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 4 : (insets.top || 0);

  const car = cars.find((c) => c.id === id);

  if (!car) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>Car not found</Text>
      </View>
    );
  }

  const s = car.techSpecs;
  if (!s) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.textSecondary }}>No specifications available</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Top bar with gradient */}
      <LinearGradient
        colors={isDark
          ? ["rgba(14,181,202,0.12)", colors.card as string]
          : ["rgba(14,181,202,0.10)", "#FFFFFF"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.topBar, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}
      >
        <Pressable style={[styles.backBtn, { backgroundColor: colors.background }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Specifications</Text>
          <Text style={[styles.topSub, { color: colors.textSecondary }]} numberOfLines={1}>
            {car.brand} {car.model} · {car.year}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Car image with gradient overlay */}
        <View style={styles.heroCard}>
          <Image source={{ uri: car.images[0] }} style={styles.heroImg} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(14,181,202,0.35)", "rgba(10,30,50,0.55)"]}
            start={{ x: 0.5, y: 0.3 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dimBadge}>
            <Text style={styles.dimText}>{s.length} mm</Text>
            <Text style={styles.dimSub}>Length</Text>
          </View>
          <View style={[styles.dimBadge, { bottom: 10, right: 10, left: undefined }]}>
            <Text style={styles.dimText}>{s.height} mm</Text>
            <Text style={styles.dimSub}>Height</Text>
          </View>
        </View>

        {/* Quick spec tiles */}
        <View style={[styles.quickRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {[
            { label: "Body",   value: s.bodyType.split(" ")[0] },
            { label: "Trim",   value: s.trim?.split(" ")[0] || "Std" },
            { label: "Power",  value: `${s.horsepower} hp` },
            { label: "Drive",  value: s.drive.split(" ")[0] },
            { label: "0–100",  value: s.acceleration },
            { label: "Speed",  value: `${s.maxSpeed} km/h` },
          ].map((q, i) => (
            <View key={i} style={[styles.quickCell, { borderRightColor: colors.border }]}>
              <Text style={[styles.quickVal, { color: colors.text }]}>{q.value}</Text>
              <Text style={[styles.quickLbl, { color: colors.accent }]}>{q.label}</Text>
            </View>
          ))}
        </View>

        {/* Spec sections */}
        <View style={styles.sections}>
          <Section title="General Information">
            <Row label="Body type"            value={s.bodyType}   accent />
            <Row label="Trim level"           value={s.trim} />
            <Row label="Country of manufacture" value={s.country} />
            <Row label="Car class"            value={s.carClass} />
            <Row label="Number of doors"      value={s.doors} />
            <Row label="Seating capacity"     value={s.seats} />
            <Row label="Steering position"    value={s.steering} />
            <Row label="Color"                value={s.color} />
            <Row label="Previous owners"      value={s.owners} />
          </Section>

          <Section title="Dimensions">
            <Row label="Length"             value={`${s.length} mm`} />
            <Row label="Width"              value={`${s.width} mm`} />
            <Row label="Height"             value={`${s.height} mm`} />
            <Row label="Wheelbase"          value={`${s.wheelbase} mm`} />
            <Row label="Ground clearance"   value={`${s.clearance} mm`} />
            <Row label="Front track width"  value={`${s.frontTrack} mm`} />
            <Row label="Rear track width"   value={`${s.rearTrack} mm`} />
            <Row label="Wheel size"         value={s.wheelSize} />
          </Section>

          <Section title="Weight & Capacity">
            <Row label="Engine displacement"  value={s.engineDisplacement} />
            <Row label="Fuel tank volume"     value={`${s.tankVolume} L`} />
            <Row label="Curb weight"          value={`${s.curbWeight.toLocaleString()} kg`} />
            <Row label="Maximum laden weight" value={`${s.maxWeight.toLocaleString()} kg`} />
          </Section>

          <Section title="Transmission">
            <Row label="Gearbox type"   value={s.gearbox}   accent />
            <Row label="Number of gears" value={s.gears} />
            <Row label="Drive type"     value={s.drive} />
          </Section>

          <Section title="Suspension & Brakes">
            <Row label="Front suspension" value={s.frontSuspension} />
            <Row label="Rear suspension"  value={s.rearSuspension} />
            <Row label="Front brakes"     value={s.frontBrakes} />
            <Row label="Rear brakes"      value={s.rearBrakes} />
          </Section>

          <Section title="Performance">
            <Row label="Maximum speed"              value={`${s.maxSpeed} km/h`}  accent />
            <Row label="Acceleration 0–100 km/h"   value={s.acceleration} />
            <Row label="Fuel consumption (city)"   value={s.fuelCity} />
            <Row label="Fuel consumption (highway)" value={s.fuelHighway} />
            <Row label="Fuel consumption (mixed)"   value={s.fuelMixed} />
            <Row label="CO₂ emissions"              value={s.co2} />
            <Row label="Emissions standard"         value={s.euroStandard} />
            <Row label="Annual road tax"            value={`GHS ${s.annualTax.toLocaleString()}`} />
          </Section>

          <Section title="Engine">
            <Row label="Engine type"          value={s.engineType}         accent />
            <Row label="Engine layout"        value={s.engineLayout} />
            <Row label="Engine code"          value={s.engineCode} />
            <Row label="Displacement"         value={s.engineDisplacement} />
            <Row label="Maximum power"        value={`${s.horsepower} hp (${Math.round(s.horsepower * 0.7457)} kW) @ ${s.horsepowerRpm}`} />
            <Row label="Maximum torque"       value={`${s.torque} @ ${s.torqueRpm}`} />
            <Row label="Cylinder configuration" value={s.cylinderConfig} />
            <Row label="Fuel grade"           value={s.fuelGrade} />
          </Section>
        </View>

        <View style={{ height: (insets.bottom || 0) + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  topTitle: { fontSize: 16, fontFamily: "Manrope_700Bold" },
  topSub:   { fontSize: 12, fontFamily: "Manrope_400Regular", marginTop: 1 },

  heroCard: {
    height: 220,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0F172A",
  },
  heroImg: { width: "100%", height: "100%", opacity: 0.85 },
  dimBadge: {
    position: "absolute",
    bottom: 10, left: 10,
    backgroundColor: "rgba(14,181,202,0.25)",
    borderWidth: 1,
    borderColor: "rgba(14,181,202,0.55)",
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8,
  },
  dimText: { color: "#fff", fontSize: 13, fontFamily: "Manrope_700Bold" },
  dimSub:  { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Manrope_400Regular" },

  quickRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  quickCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  quickVal: { fontSize: 12, fontFamily: "Manrope_700Bold" },
  quickLbl: { fontSize: 10, fontFamily: "Manrope_600SemiBold", marginTop: 2, letterSpacing: 0.3 },

  sections: { padding: 14, gap: 12 },

  section: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionHeader: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(14,181,202,0.12)",
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBody: {},

  specRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    alignItems: "flex-start",
    gap: 12,
  },
  specLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    flex: 1,
    textAlign: "right",
  },
});
