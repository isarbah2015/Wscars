import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { daysUntilDate } from "@/utils/listingSearchFilters";

export function ListingExpiryBanner() {
  const { cars, currentUser, renewListing } = useApp();
  const { colors, isDark } = useTheme();

  const expiring = useMemo(() => {
    if (!currentUser?.id) return [];
    return cars
      .filter((c) => c.sellerId === currentUser.id && !c.isHidden && !c.isSold && c.expiresAt)
      .map((c) => ({ car: c, days: daysUntilDate(c.expiresAt!) }))
      .filter((x) => x.days >= 0 && x.days <= 7)
      .sort((a, b) => a.days - b.days);
  }, [cars, currentUser?.id]);

  if (expiring.length === 0) return null;

  const urgent = expiring[0];

  return (
    <View style={[styles.wrap, { backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#92400E" : "#FCD34D" }]}>
      <Feather name="clock" size={18} color="#D97706" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>
          {expiring.length === 1
            ? `Listing expires in ${urgent.days} day${urgent.days === 1 ? "" : "s"}`
            : `${expiring.length} listings expiring soon`}
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]} numberOfLines={2}>
          {urgent.car.year} {urgent.car.brand} {urgent.car.model}
          {urgent.days === 0 ? " — renew today to stay visible" : ` — renew before ${urgent.car.expiresAt}`}
        </Text>
      </View>
      <Pressable
        style={styles.btn}
        onPress={() => {
          if (expiring.length === 1) {
            renewListing(urgent.car.id);
          } else {
            router.push("/(tabs)/profile");
          }
        }}
      >
        <Text style={styles.btnText}>Renew</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: { fontSize: 13, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  btn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
});
