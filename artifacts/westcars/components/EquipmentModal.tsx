import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EQUIPMENT: { icon: string; category: string; count: number; items: string[] }[] = [
  {
    icon: "shield",
    category: "Safety",
    count: 14,
    items: [
      "ABS (Anti-lock braking system)",
      "Front airbags",
      "Side airbags",
      "Curtain airbags",
      "Hill start assist (HSA)",
      "Electronic stability control (ESC)",
      "Emergency brake assist (EBA)",
      "Traction control (TCS)",
      "Rear parking sensors",
      "Front parking sensors",
      "Collision warning system",
      "Lane departure warning",
      "Blind spot monitoring",
      "Emergency call system",
    ],
  },
  {
    icon: "star",
    category: "Comfort",
    count: 20,
    items: [
      "Adaptive cruise control",
      "Dual-zone climate control",
      "Power windows (all)",
      "Electrically adjustable mirrors",
      "Heated front seats",
      "Heated rear seats",
      "Seat ventilation",
      "Memory driver seat",
      "Sunroof / panoramic roof",
      "Keyless entry & start",
      "Auto-folding mirrors",
      "Wireless phone charging",
      "Automatic parking assist",
      "Heads-up display (HUD)",
      "Power tailgate",
      "Soft-close doors",
      "Ambient interior lighting",
      "Heated steering wheel",
      "360° surround camera",
      "Rain-sensing wipers",
    ],
  },
  {
    icon: "sun",
    category: "Interior",
    count: 14,
    items: [
      "Leather upholstery",
      "3-spoke steering wheel",
      "Aluminium pedals",
      "Wood trim accents",
      "Leather dashboard trim",
      "Panoramic glass roof",
      "Rear window shade",
      "Power-adjustable front seats",
      "Lumbar support (front)",
      "Flat-folding rear seats",
      "Centre armrest with storage",
      "Rear centre armrest",
      "Illuminated door sills",
      "Grab handles (all doors)",
    ],
  },
  {
    icon: "music",
    category: "Multimedia",
    count: 7,
    items: [
      "10.1\" touchscreen display",
      "Apple CarPlay",
      "Android Auto",
      "Built-in GPS navigation",
      "Bluetooth audio streaming",
      "USB charging ports (2x)",
      "Premium speaker system (8-speaker)",
    ],
  },
  {
    icon: "eye",
    category: "Visibility",
    count: 6,
    items: [
      "LED headlights",
      "LED daytime running lights",
      "LED rear lights",
      "Front fog lights",
      "Automatic headlight control",
      "High-beam assist",
    ],
  },
  {
    icon: "layers",
    category: "Exterior",
    count: 3,
    items: [
      "18\" alloy wheels",
      "Rear roof spoiler",
      "Roof rails",
    ],
  },
  {
    icon: "lock",
    category: "Anti-theft",
    count: 2,
    items: [
      "Immobiliser",
      "Perimeter alarm system",
    ],
  },
  {
    icon: "more-horizontal",
    category: "Other",
    count: 1,
    items: [
      "Towing hook (detachable)",
    ],
  },
];

interface Props {
  visible: boolean;
  trimName?: string;
  onClose: () => void;
}

export function EquipmentModal({ visible, trimName = "Standard", onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>("Safety");

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top || 0 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Equipment</Text>
            <Text style={styles.headerSub}>{trimName} trim</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
            <Feather name="x" size={20} color="#1A1A1A" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Category summary chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipRow}>
              {EQUIPMENT.map((cat) => (
                <Pressable
                  key={cat.category}
                  style={[styles.catChip, expanded === cat.category && styles.catChipActive]}
                  onPress={() => setExpanded(expanded === cat.category ? null : cat.category)}
                >
                  <Feather
                    name={cat.icon as any}
                    size={14}
                    color={expanded === cat.category ? "#fff" : "#1A1A1A"}
                  />
                  <Text style={[styles.catChipText, expanded === cat.category && styles.catChipTextActive]}>
                    {cat.category}
                  </Text>
                  <Text style={[styles.catChipCount, expanded === cat.category && styles.catChipTextActive]}>
                    {cat.count}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Full categories */}
          {EQUIPMENT.map((cat) => (
            <View key={cat.category} style={styles.catBlock}>
              <Pressable
                style={styles.catHeader}
                onPress={() => setExpanded(expanded === cat.category ? null : cat.category)}
              >
                <View style={styles.catHeaderLeft}>
                  <View style={styles.catIconWrap}>
                    <Feather name={cat.icon as any} size={18} color="#0066CC" />
                  </View>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={styles.catCount}>{cat.count}</Text>
                </View>
                <Feather
                  name={expanded === cat.category ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#9E9E9E"
                />
              </Pressable>

              {expanded === cat.category && (
                <View style={styles.catItems}>
                  {cat.items.map((item, i) => (
                    <View key={item} style={[styles.itemRow, i < cat.items.length - 1 && styles.itemBorder]}>
                      <View style={styles.itemCheck}>
                        <Feather name="check" size={12} color="#27AE60" />
                      </View>
                      <Text style={styles.itemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1A1A1A" },
  headerSub: { fontSize: 13, color: "#6B6B6B", fontFamily: "Inter_400Regular", marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },

  chipScroll: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEEEEE" },
  chipRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  catChipActive: { backgroundColor: "#1A1A1A", borderColor: "#1A1A1A" },
  catChipText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#1A1A1A" },
  catChipTextActive: { color: "#fff" },
  catChipCount: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B6B6B" },

  catBlock: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#EEEEEE",
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  catHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  catIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#EBF4FF",
    alignItems: "center", justifyContent: "center",
  },
  catName: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#1A1A1A" },
  catCount: {
    fontSize: 13, fontFamily: "Inter_400Regular",
    color: "#6B6B6B",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },

  catItems: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  itemCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  itemText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#1A1A1A", flex: 1 },
});
