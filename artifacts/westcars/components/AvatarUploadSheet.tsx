import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AvatarUploadSheetProps {
  visible: boolean;
  hasPhoto: boolean;
  onCamera: () => void;
  onLibrary: () => void;
  onRemove: () => void;
  onClose: () => void;
}

const TEAL = "#0EB5CA";

export default function AvatarUploadSheet({
  visible,
  hasPhoto,
  onCamera,
  onLibrary,
  onRemove,
  onClose,
}: AvatarUploadSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Dimmed backdrop — tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.sheet, { paddingBottom: (insets.bottom || 16) + 8 }]}>
        {/* Handle */}
        <View style={styles.handle} />

        <Text style={styles.title}>Update Profile Photo</Text>

        {/* Camera + Library options */}
        <View style={styles.optRow}>
          <TouchableOpacity style={styles.opt} onPress={onCamera} activeOpacity={0.75}>
            <View style={styles.optIcon}>
              <Feather name="camera" size={22} color="#fff" />
            </View>
            <Text style={styles.optLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.opt} onPress={onLibrary} activeOpacity={0.75}>
            <View style={styles.optIcon}>
              <Feather name="image" size={22} color="#fff" />
            </View>
            <Text style={styles.optLabel}>Photo Library</Text>
          </TouchableOpacity>
        </View>

        {/* Remove — only when photo exists */}
        {hasPhoto && (
          <TouchableOpacity style={styles.removeRow} onPress={onRemove} activeOpacity={0.75}>
            <Feather name="trash-2" size={16} color="#E53935" />
            <Text style={styles.removeText}>Remove Photo</Text>
          </TouchableOpacity>
        )}

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelRow} onPress={onClose} activeOpacity={0.75}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: -6 },
      },
      android: { elevation: 20 },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111",
    marginBottom: 18,
    textAlign: "center",
  },

  // Option buttons (Camera + Library)
  optRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  opt: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    gap: 8,
  },
  optIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TEAL,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: TEAL,
        shadowOpacity: 0.45,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
    }),
  },
  optLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },

  // Remove row
  removeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    backgroundColor: "#FFF0F0",
    borderRadius: 14,
    marginBottom: 10,
  },
  removeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E53935",
  },

  // Cancel
  cancelRow: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
});
