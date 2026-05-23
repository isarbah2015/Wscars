import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { Car } from "@/types";
import { isChinaListingLocation } from "@/utils/ghanaData";

export type VehicleDetailRow = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  highlight?: boolean;
};

export function buildVehicleDetailRows(car: Car): VehicleDetailRow[] {
  const mileage =
    car.mileage >= 1000
      ? `${(car.mileage / 1000).toFixed(0)}k km`
      : car.mileage > 0
        ? `${car.mileage} km`
        : "Not listed";

  const rows: VehicleDetailRow[] = [
    { icon: "tag", label: "Condition", value: car.condition || "—" },
    { icon: "truck", label: "Body type", value: car.category || "—" },
    { icon: "droplet", label: "Fuel", value: car.fuelType || "—" },
    { icon: "settings", label: "Transmission", value: car.transmission || "—" },
    { icon: "activity", label: "Mileage", value: mileage },
  ];

  if (car.color?.trim()) {
    rows.push({ icon: "circle", label: "Colour", value: car.color.trim() });
  }

  rows.push({
    icon: "map-pin",
    label: "Location",
    value: car.location || "—",
    highlight: isChinaListingLocation(car.location || ""),
  });

  if (car.negotiable) {
    rows.push({ icon: "percent", label: "Price", value: "Negotiable" });
  }

  return rows;
}

export function VehicleDetailsCard({ car }: { car: Car }) {
  const { colors, isDark } = useTheme();
  const rows = buildVehicleDetailRows(car);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: isDark ? colors.border : "rgba(0,0,0,0.06)" }]}>
      {rows.map((row, i) => (
        <View
          key={row.label}
          style={[
            styles.row,
            i < rows.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            },
          ]}
        >
          <View style={[styles.iconWrap, row.highlight && styles.iconWrapChina]}>
            <Feather
              name={row.icon}
              size={14}
              color={row.highlight ? "#DC2626" : colors.textSecondary}
            />
          </View>
          <Text style={[styles.label, { color: colors.textTertiary }]}>{row.label}</Text>
          <Text
            style={[
              styles.value,
              { color: row.highlight ? "#DC2626" : colors.text },
              row.highlight && styles.valueChina,
            ]}
            numberOfLines={2}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(14,181,202,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapChina: {
    backgroundColor: "rgba(220,38,38,0.1)",
  },
  label: {
    width: 88,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  value: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "right",
  },
  valueChina: {
    fontFamily: "Inter_700Bold",
  },
});
