import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const TIPS = [
  { icon: "users",       text: "Meet in a busy, public place — a petrol station or shopping mall." },
  { icon: "user-plus",   text: "Bring a trusted friend or family member to all meetings." },
  { icon: "tool",        text: "Always inspect the car thoroughly and request a test drive." },
  { icon: "credit-card", text: "Never pay anything before seeing the car in person." },
  { icon: "phone",       text: "Only use the in-app chat or the seller's registered number." },
  { icon: "alert-circle",text: "If anything feels off, trust your instincts and walk away." },
  { icon: "file-text",   text: "Verify the V5/logbook and seller's ID before completing any payment." },
];

interface Props {
  visible: boolean;
  onContinue: () => void;
  onCancel?: () => void;
}

export function SafetyTipsModal({ visible, onContinue, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Feather name="shield" size={26} color="#0066CC" />
            </View>
            <Text style={styles.title}>Stay Safe on Westcars</Text>
            <Text style={styles.subtitle}>
              Read these tips before contacting this seller
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {TIPS.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipIcon}>
                  <Feather name={tip.icon as any} size={16} color="#0066CC" />
                </View>
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </ScrollView>

          {/* CTA */}
          <Pressable style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueText}>I Understand — Continue</Text>
          </Pressable>

          {onCancel && (
            <Pressable style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Go Back</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 36,
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 16,
    gap: 6,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EDF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#9E9E9E",
    textAlign: "center",
  },
  scroll: { marginBottom: 16 },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EDF4FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "PlusJakartaSans_400Regular",
    color: "#333",
    lineHeight: 20,
  },
  continueBtn: {
    backgroundColor: "#0066CC",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  continueText: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#fff",
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#9E9E9E",
  },
});
