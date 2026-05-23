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

export function SavedSearchesPanel() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !isFirebaseReady()) {
      setLoading(false);
      return;
    }
    const unsub = subscribeSavedSearches(user.uid, (list) => {
      setSearches(list);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  if (!isFirebaseReady()) {
    return (
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        Saved search alerts require Firebase.
      </Text>
    );
  }

  if (loading) {
    return <ActivityIndicator color="#0EB5CA" style={{ marginVertical: 12 }} />;
  }

  if (searches.length === 0) {
    return (
      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        No saved searches yet. On Search, tap the bell icon to get alerts when new listings match.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {searches.map((s) => (
        <View
          key={s.id}
          style={[styles.row, { borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  name: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  meta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, paddingVertical: 8 },
});
