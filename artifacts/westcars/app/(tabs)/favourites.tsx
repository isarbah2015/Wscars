import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
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
import { CarCard } from "@/components/CarCard";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

export default function FavouritesScreen() {
  const { cars, favorites, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;

  const favCars = cars.filter((c) => favorites.includes(c.id));

  if (!isAuthenticated) {
    return (
      <View style={[styles.authWall, { paddingTop: topPad + 40, backgroundColor: colors.background }]}>
        <View style={[styles.iconRing, { backgroundColor: colors.accentLight }]}>
          <Feather name="heart" size={38} color={colors.accent} />
        </View>
        <Text style={[styles.authTitle, { color: colors.text }]}>Save Your Favourites</Text>
        <Text style={[styles.authText, { color: colors.textSecondary }]}>
          Sign in to keep track of cars you love.
        </Text>
        <Pressable style={styles.authBtn} onPress={() => router.push("/auth/login")}>
          <LinearGradient colors={["#0066CC", "#3385D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.authGradient}>
            <Text style={styles.authBtnText}>Sign In</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#1E293B", "#111827"] : ["#0A1628", "#0066CC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 14 }]}
      >
        <Text style={styles.headerTitle}>Favourites</Text>
        {favCars.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favCars.length}</Text>
          </View>
        )}
      </LinearGradient>

      {favCars.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconRing, { backgroundColor: colors.accentLight }]}>
            <Feather name="heart" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No favourites yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Tap the heart on any car to save it here.
          </Text>
          <Pressable
            style={[styles.browseBtn, { backgroundColor: colors.accent }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.browseBtnText}>Browse Cars</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.grid, { paddingBottom: 110 + insets.bottom }]}
        >
          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
            {favCars.length} saved car{favCars.length !== 1 ? "s" : ""}
          </Text>
          <View style={styles.carGrid}>
            {favCars.map((car) => (
              <View key={car.id} style={styles.gridItem}>
                <CarCard car={car} />
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Manrope_700Bold",
    color: "#fff",
  },

  grid: { paddingHorizontal: 10, paddingTop: 12 },
  countLabel: {
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  carGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 40,
  },
  emptyIconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  emptyText: {
    fontSize: 14,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  browseBtnText: { fontSize: 15, fontFamily: "Manrope_600SemiBold", color: "#fff" },

  authWall: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  iconRing: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 22, fontFamily: "Manrope_700Bold" },
  authText: { fontSize: 14, fontFamily: "Manrope_400Regular", textAlign: "center", lineHeight: 20 },
  authBtn: { borderRadius: 14, overflow: "hidden", marginTop: 8, width: "80%" },
  authGradient: { paddingVertical: 14, alignItems: "center" },
  authBtnText: { fontSize: 16, fontFamily: "Manrope_600SemiBold", color: "#fff" },
});
