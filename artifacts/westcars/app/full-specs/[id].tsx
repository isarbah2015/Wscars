import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
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
import { CarDimensionDiagram } from "@/components/CarDimensionDiagram";
import { getCarTechSpecs } from "@/utils/buildTechSpecs";

function SpecRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  const { colors, isDark } = useTheme();
  const text = String(value);
  return (
    <View style={[styles.specRow, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#EEF2F6" }]}>
      <Text style={[styles.specLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.specValueWrap}>
        <Text
          style={[styles.specValue, { color: accent ? "#0EB5CA" : colors.text }]}
          selectable
        >
          {text}
        </Text>
      </View>
    </View>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ComponentProps<typeof Feather>["name"]; children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8EDF2" }]}>
      <View style={[styles.sectionHeader, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "#EEF2F6" }]}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.sectionIcon}>
            <Feather name={icon} size={14} color="#0EB5CA" />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
      </View>
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

  const s = getCarTechSpecs(car);

  const quickStats = [
    { label: "Body type", value: s.bodyType },
    { label: "Trim", value: s.trim },
    { label: "Power", value: `${s.horsepower} hp` },
    { label: "Drive", value: s.drive },
    { label: "0–100 km/h", value: s.acceleration },
    { label: "Top speed", value: `${s.maxSpeed} km/h` },
  ];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? colors.background : "#F4F7F9" }]}>
      <LinearGradient
        colors={isDark ? ["rgba(14,181,202,0.12)", colors.card as string] : ["rgba(14,181,202,0.10)", "#FFFFFF"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.topBar, { paddingTop: topPad + 8, borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#E4E8EF" }]}
      >
        <Pressable style={[styles.backBtn, { backgroundColor: isDark ? "#1E293B" : "#F7F8FA" }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.topTitle, { color: colors.text }]}>Full specifications</Text>
          <Text style={[styles.topSub, { color: colors.textSecondary }]} numberOfLines={1}>
            {car.brand} {car.model} · {car.year}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CarDimensionDiagram
          length={s.length}
          width={s.width}
          height={s.height}
          wheelbase={s.wheelbase}
          imageUri={car.images?.[0]}
          title={`${car.brand} ${car.model} · ${car.year}`}
        />

        <View style={[styles.quickGrid, { backgroundColor: colors.card, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E8EDF2" }]}>
          {quickStats.map((item) => (
            <View key={item.label} style={[styles.quickTile, { borderColor: isDark ? "rgba(255,255,255,0.06)" : "#EEF2F6" }]}>
              <Text style={[styles.quickLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.quickValue, { color: colors.text }]} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.sections}>
          <Section title="General information" icon="info">
            <SpecRow label="Body type" value={s.bodyType} accent />
            <SpecRow label="Trim level" value={s.trim} />
            <SpecRow label="Country of manufacture" value={s.country} />
            <SpecRow label="Car class" value={s.carClass} />
            <SpecRow label="Doors" value={s.doors} />
            <SpecRow label="Seating capacity" value={s.seats} />
            <SpecRow label="Steering position" value={s.steering} />
            <SpecRow label="Colour" value={s.color} />
            <SpecRow label="Previous owners" value={s.owners} />
          </Section>

          <Section title="Dimensions" icon="maximize">
            <SpecRow label="Length" value={`${s.length} mm`} />
            <SpecRow label="Width" value={`${s.width} mm`} />
            <SpecRow label="Height" value={`${s.height} mm`} />
            <SpecRow label="Wheelbase" value={`${s.wheelbase} mm`} />
            <SpecRow label="Ground clearance" value={`${s.clearance} mm`} />
            <SpecRow label="Front track" value={`${s.frontTrack} mm`} />
            <SpecRow label="Rear track" value={`${s.rearTrack} mm`} />
            <SpecRow label="Wheels & tyres" value={s.wheelSize} />
          </Section>

          <Section title="Weight & capacity" icon="package">
            <SpecRow label="Engine displacement" value={s.engineDisplacement} />
            <SpecRow label="Fuel tank" value={`${s.tankVolume} L`} />
            <SpecRow label="Curb weight" value={`${s.curbWeight.toLocaleString()} kg`} />
            <SpecRow label="Max laden weight" value={`${s.maxWeight.toLocaleString()} kg`} />
          </Section>

          <Section title="Transmission" icon="settings">
            <SpecRow label="Gearbox" value={s.gearbox} accent />
            <SpecRow label="Number of gears" value={s.gears} />
            <SpecRow label="Drive type" value={s.drive} />
          </Section>

          <Section title="Suspension & brakes" icon="disc">
            <SpecRow label="Front suspension" value={s.frontSuspension} />
            <SpecRow label="Rear suspension" value={s.rearSuspension} />
            <SpecRow label="Front brakes" value={s.frontBrakes} />
            <SpecRow label="Rear brakes" value={s.rearBrakes} />
          </Section>

          <Section title="Performance" icon="zap">
            <SpecRow label="Maximum speed" value={`${s.maxSpeed} km/h`} accent />
            <SpecRow label="Acceleration 0–100 km/h" value={s.acceleration} />
            <SpecRow label="Fuel consumption (city)" value={s.fuelCity} />
            <SpecRow label="Fuel consumption (highway)" value={s.fuelHighway} />
            <SpecRow label="Fuel consumption (mixed)" value={s.fuelMixed} />
            <SpecRow label="CO₂ emissions" value={s.co2} />
            <SpecRow label="Emissions standard" value={s.euroStandard} />
            <SpecRow label="Annual road tax" value={`GHS ${s.annualTax.toLocaleString()}`} />
          </Section>

          <Section title="Engine" icon="cpu">
            <SpecRow label="Engine type" value={s.engineType} accent />
            <SpecRow label="Engine layout" value={s.engineLayout} />
            <SpecRow label="Engine code" value={s.engineCode} />
            <SpecRow label="Displacement" value={s.engineDisplacement} />
            <SpecRow label="Maximum power" value={`${s.horsepower} hp (${Math.round(s.horsepower * 0.7457)} kW) @ ${s.horsepowerRpm}`} />
            <SpecRow label="Maximum torque" value={`${s.torque} @ ${s.torqueRpm}`} />
            <SpecRow label="Cylinder configuration" value={s.cylinderConfig} />
            <SpecRow label="Fuel grade" value={s.fuelGrade} />
          </Section>
        </View>

        <View style={{ height: (insets.bottom || 0) + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: { fontSize: 17, fontFamily: "Manrope_800ExtraBold" },
  topSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },

  quickGrid: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickTile: {
    width: "31%",
    flexGrow: 1,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
    minHeight: 68,
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  quickValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    lineHeight: 18,
  },

  sections: { paddingHorizontal: 12, paddingTop: 12, gap: 12 },

  section: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
  },
  sectionHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(14,181,202,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  sectionBody: { paddingBottom: 2 },

  specRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  specLabel: {
    width: "42%",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  specValueWrap: {
    flex: 1,
    minWidth: 0,
  },
  specValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 19,
    textAlign: "right",
  },
});
