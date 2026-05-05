import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "@/context/AppContext";

const REASONS = [
  "Fake listing / doesn't exist",
  "Wrong information",
  "Scam / fraud attempt",
  "Already sold",
  "Duplicate listing",
  "Inappropriate content",
  "Other",
];

interface Props {
  visible: boolean;
  targetId: string;
  targetType: "listing" | "user";
  targetName?: string;
  onClose: () => void;
}

export function ReportModal({ visible, targetId, targetType, targetName, onClose }: Props) {
  const { reportItem, currentUser } = useApp();
  const [selected, setSelected] = useState<string | null>(null);
  const [details,  setDetails]  = useState("");

  const handleSubmit = () => {
    if (!selected) {
      Alert.alert("Select a reason", "Please choose a reason for reporting.");
      return;
    }
    reportItem({
      reporterId: currentUser?.id || "guest",
      targetId,
      targetType,
      reason: selected + (details ? `: ${details}` : ""),
    });
    Alert.alert("Report submitted", "Thank you. Our team will review this shortly.");
    setSelected(null); setDetails("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title}>
              Report {targetType === "listing" ? "Listing" : "User"}
              {targetName ? ` — ${targetName}` : ""}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Feather name="x" size={20} color="#9E9E9E" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>What is the issue?</Text>

          {REASONS.map((r) => (
            <Pressable
              key={r}
              style={[styles.option, selected === r && styles.optionSelected]}
              onPress={() => setSelected(r)}
            >
              <View style={[styles.radio, selected === r && styles.radioSelected]}>
                {selected === r && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.optionText, selected === r && styles.optionTextSelected]}>
                {r}
              </Text>
            </Pressable>
          ))}

          <TextInput
            style={styles.details}
            placeholder="Additional details (optional)"
            placeholderTextColor="#BDBDBD"
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={3}
          />

          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.submitBtn, !selected && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!selected}
            >
              <Text style={styles.submitText}>Submit Report</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 36, gap: 4,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "#E0E0E0", alignSelf: "center", marginTop: 10, marginBottom: 12,
  },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#1A1A1A", flex: 1 },
  subtitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#6B6B6B", marginBottom: 4, marginTop: 4 },
  option: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 11, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: "#E8E8E8",
    marginVertical: 3, backgroundColor: "#FAFAFA",
  },
  optionSelected: { borderColor: "#0066CC", backgroundColor: "#EDF4FF" },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: "#CCCCCC",
    alignItems: "center", justifyContent: "center",
  },
  radioSelected: { borderColor: "#0066CC" },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0066CC" },
  optionText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#1A1A1A", flex: 1 },
  optionTextSelected: { fontFamily: "Inter_600SemiBold", color: "#0066CC" },
  details: {
    borderWidth: 1.5, borderColor: "#E8E8E8", borderRadius: 12,
    padding: 12, fontSize: 14, fontFamily: "Inter_400Regular",
    color: "#1A1A1A", minHeight: 72, textAlignVertical: "top",
    marginTop: 8, backgroundColor: "#FAFAFA",
  },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#E0E0E0",
    alignItems: "center", justifyContent: "center",
  },
  cancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#6B6B6B" },
  submitBtn: {
    flex: 2, height: 50, borderRadius: 12,
    backgroundColor: "#E53935", alignItems: "center", justifyContent: "center",
  },
  submitText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
