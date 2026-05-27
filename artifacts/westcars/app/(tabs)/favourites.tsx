import { Feather } from "@expo/vector-icons";
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
import { AuthGatePlaceholder } from "@/components/AuthGatePlaceholder";
import { ListingGrid2x2 } from "@/components/ListingGrid2x2";
import { listingGridContainerStyle } from "@/constants/listingGrid";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";

export default function FavouritesScreen() {
  const { cars, favorites, toggleFavorite, isAuthenticated } = useApp();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 10 : insets.top;

  const favCars = cars.filter((c) => favorites.includes(c.id));

  if (!isAuthenticated) {
    return (
      <AuthGatePlaceholder
        icon="heart"
        title="Save Your Favourites"
        subtitle="Sign in to keep track of cars you love."
        topPad={topPad}
        backgroundColor={colors.background}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 14,
            backgroundColor: isDark ? "#111827" : "#FFFFFF",
            borderBottomColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>
          Saved Cars
        </Text>
        {favCars.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{favCars.length}</Text>
          </View>
        )}
      </View>

      {favCars.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconRing, { backgroundColor: colors.accentLight }]}>
            <Feather name="heart" size={40} color={colors.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No saved cars yet</Text>
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
          contentContainerStyle={[styles.list, { paddingBottom: 110 + insets.bottom }]}
        >
          <Text style={[styles.countLabel, { color: colors.textTertiary }]}>
            {favCars.length} saved car{favCars.length !== 1 ? "s" : ""}
          </Text>

          {/* 2-column CarCard grid */}
          <ListingGrid2x2
            cars={favCars}
            isDark={isDark}
            variant="carcard"
          />
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
    justifyContent: "space-between",
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0,
  },
  countBadge: {
    backgroundColor: "#0EB5CA",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
  },

  list: { ...listingGridContainerStyle, paddingTop: 8 },
  countLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
    paddingHorizontal: 2,
  },

  /* ── Empty state ── */
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
  emptyTitle: { fontSize: 22, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.3 },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  browseBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#fff" },

  /* ── Auth wall ── */
  authWall: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 40 },
  iconRing: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  authTitle: { fontSize: 22, fontFamily: "Manrope_800ExtraBold", letterSpacing: -0.3 },
  authText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  authBtn: { borderRadius: 14, marginTop: 8, width: "80%", paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  authGradient: { paddingVertical: 14, alignItems: "center" },
  authBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff", textAlign: "center" },
});
