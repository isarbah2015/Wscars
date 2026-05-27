import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  deleteSavedSearch,
  SavedSearch,
  setSavedSearchEnabled,
  subscribeSavedSearches,
} from "@/services/firebase/savedSearches";
import { isFirebaseReady } from "@/lib/firebase";

function loadErrorMessage(err: Error): string {
  const msg = err.message || "";
  if (msg.includes("index") || msg.includes("FAILED_PRECONDITION")) {
    return "Could not load alerts. Pull to refresh or try again in a moment.";
  }
  if (msg.includes("permission") || msg.includes("PERMISSION_DENIED")) {
    return "Saved search alerts are not available on the server yet. Ask your admin to deploy the latest Firestore rules.";
  }
  return "Could not load saved search alerts. Check your connection.";
}

type Props = {
  /** Renders inside profile Preferences row (title is shown by parent). */
  embedded?: boolean;
};

export function SavedSearchesPanel({ embedded = false }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid || !isFirebaseReady()) {
      setSearches([]);
      setLoadError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const unsub = subscribeSavedSearches((list, err) => {
      setSearches(list);
      setLoadError(err ? loadErrorMessage(err) : null);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid, authLoading]);

  const hintStyle = [
    embedded ? styles.hintEmbedded : styles.hint,
    { color: colors.textTertiary },
  ];
  const errorStyle = [
    embedded ? styles.hintEmbedded : styles.hint,
    { color: "#f87171" },
  ];

  if (!isFirebaseReady()) {
    return (
      <Text style={hintStyle}>
        Saved search alerts require Firebase.
      </Text>
    );
  }

  if (!user?.uid && !authLoading) {
    return (
      <Text style={hintStyle}>
        Sign in to manage saved search alerts.
      </Text>
    );
  }

  if (loading || authLoading) {
    return (
      <ActivityIndicator
        color="#0EB5CA"
        style={embedded ? styles.loaderEmbedded : { marginVertical: 12 }}
      />
    );
  }

  if (loadError) {
    return <Text style={errorStyle}>{loadError}</Text>;
  }

  if (searches.length === 0) {
    return (
      <Text style={hintStyle}>
        No saved searches yet. On Search, tap the bell icon to get alerts when new listings match.
      </Text>
    );
  }

  return (
    <View style={embedded ? styles.listEmbedded : styles.list}>
      {searches.map((s) => (
        <View
          key={s.id}
          style={[
            embedded ? styles.rowEmbedded : styles.row,
            { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[embedded ? styles.nameEmbedded : styles.name, { color: colors.text }]}
              numberOfLines={2}
            >
              {s.name}
            </Text>
            <Text style={[styles.meta, { color: colors.textTertiary }]}>
              {s.enabled ? "Alerts on" : "Paused"}
            </Text>
          </View>
          <Switch
            value={s.enabled}
            onValueChange={(v) => setSavedSearchEnabled(s.id, v).catch(() => {})}
            trackColor={{ false: colors.border, true: "#0EB5CA" }}
            thumbColor="#fff"
          />
          <Pressable
            hitSlop={8}
            onPress={() =>
              Alert.alert("Remove alert?", s.name, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Remove",
                  style: "destructive",
                  onPress: () => deleteSavedSearch(s.id).catch(() => {}),
                },
              ])
            }
          >
            <Feather name="trash-2" size={16} color={colors.textTertiary} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 0 },
  listEmbedded: { gap: 0, alignSelf: "stretch", width: "100%" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  rowEmbedded: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingRight: 0,
    borderBottomWidth: 0.5,
    alignSelf: "stretch",
  },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  nameEmbedded: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingVertical: 8 },
  hintEmbedded: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    alignSelf: "stretch",
  },
  loaderEmbedded: { marginTop: 4, alignSelf: "flex-start" },
});
