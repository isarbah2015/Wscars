import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { CAR_CATEGORIES } from "@/utils/ghanaData";

interface CategoryChipsProps {
  selected: string;
  onSelect: (id: string) => void;
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CAR_CATEGORIES.map((cat) => {
        const isActive = selected === cat.id;
        return (
          <Pressable
            key={cat.id}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(cat.id)}
          >
            <Feather
              name={cat.icon as any}
              size={13}
              color={isActive ? "#fff" : Colors.light.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontFamily: "Manrope_500Medium",
  },
  labelActive: {
    color: "#fff",
  },
});
