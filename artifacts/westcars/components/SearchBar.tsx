import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilter?: () => void;
  placeholder?: string;
  editable?: boolean;
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  onFilter,
  placeholder = "Search cars...",
  editable = true,
  onPress,
}: SearchBarProps) {
  const content = (
    <View style={styles.container}>
      <Feather name="search" size={16} color={Colors.light.textTertiary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.light.textTertiary}
        editable={editable}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Feather name="x" size={15} color={Colors.light.textTertiary} />
        </Pressable>
      )}
      {onFilter && (
        <Pressable style={styles.filterBtn} onPress={onFilter} hitSlop={4}>
          <Feather name="sliders" size={15} color={Colors.primary} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: "Manrope_400Regular",
    padding: 0,
  },
  filterBtn: {
    width: 28,
    height: 28,
    backgroundColor: Colors.primary + "15",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
