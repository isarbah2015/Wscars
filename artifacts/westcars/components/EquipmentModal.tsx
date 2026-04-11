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

const EQUIPMENT: {
  icon: string;
  category: string;
  iconColor: string;
  iconBg: string;
  accentColor: string;
  count: number;
  items: string[];
}[] = [
  {
    icon: "shield",
    category: "Safety",
    iconColor: "#E53935",
    iconBg: "#FCE4EC",
    accentColor: "#E53935",
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
    iconColor: "#1565C0",
    iconBg: "#E3F2FD",
    accentColor: "#1565C0",
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
    iconColor: "#F59E0B",
    iconBg: "#FFF3E0",
    accentColor: "#F59E0B",
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
    iconColor: "#7B1FA2",
    iconBg: "#F3E5F5",
    accentColor: "#7B1FA2",
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
    iconColor: "#0EB5CA",
    iconBg: "#E0F8FB",
    accentColor: "#0EB5CA",
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
    iconColor: "#2E7D32",
    iconBg: "#E8F5E9",
    accentColor: "#2E7D32",
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
    iconColor: "#37474F",
    iconBg: "#ECEFF1",
    accentColor: "#37474F",
    count: 2,
    items: [
      "Immobiliser",
      "Perimeter alarm system",
    ],
  },
  {
    icon: "more-horizontal",
    category: "Other",
    iconColor: "#E65100",
    iconBg: "#FBE9E7",
    accentColor: "#E65100",
    count: 9,
    items: [
      "Towing hook (detachable)",
      "Full-size spare wheel",
      "Car cover (custom-fitted)",
      "First aid kit",
      "Fire extinguisher",
      "Reflective warning triangle set",
      "Vehicle tool kit",
      "GPS tracker (factory installed)",
      "Jump-start cable set",
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

  const totalItems = EQUIPMENT.reduce((acc, c) => acc + c.count, 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top || 0 }]}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Feather name="list" size={18} color="#0EB5CA" />
            </View>
            <View>
              <Text style={styles.headerTitle}>All Equipment</Text>
              <Text style={styles.headerSub}>{trimName} trim · {totalItems} options</Text>
            </View>
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={10}>
            <Feather name="x" size={20} color="#1A1A1A" />
          </Pressable>
        </View>

        {/* Category filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chipRow}>
            {EQUIPMENT.map((cat) => {
              const active = expanded === cat.category;
              return (
                <Pressable
                  key={cat.category}
                  style={[
                    styles.catChip,
                    active && { backgroundColor: cat.iconColor, borderColor: cat.iconColor },
                  ]}
                  onPress={() => setExpanded(active ? null : cat.category)}
                >
                  <View style={[styles.catChipIconWrap, active ? { backgroundColor: "rgba(255,255,255,0.2)" } : { backgroundColor: cat.iconBg }]}>
                    <Feather name={cat.icon as any} size={12} color={active ? "#fff" : cat.iconColor} />
                  </View>
                  <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                    {cat.category}
                  </Text>
                  <View style={[styles.catChipBadge, active ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: cat.iconBg }]}>
                    <Text style={[styles.catChipBadgeText, active ? { color: "#fff" } : { color: cat.iconColor }]}>
                      {cat.count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Full list */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {EQUIPMENT.map((cat) => (
            <View key={cat.category} style={styles.catBlock}>

              {/* Category header */}
              <Pressable
                style={styles.catHeader}
                onPress={() => setExpanded(expanded === cat.category ? null : cat.category)}
              >
                <View style={[styles.catHeaderIconWrap, { backgroundColor: cat.iconBg }]}>
                  <Feather name={cat.icon as any} size={20} color={cat.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.catName}>{cat.category}</Text>
                  <Text style={[styles.catSubtitle, { color: cat.iconColor }]}>{cat.count} items</Text>
                </View>
                <View style={[styles.catCountBadge, { backgroundColor: cat.iconBg }]}>
                  <Text style={[styles.catCountBadgeText, { color: cat.iconColor }]}>{cat.count}</Text>
                </View>
                <Feather
                  name={expanded === cat.category ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#9E9E9E"
                  style={{ marginLeft: 8 }}
                />
              </Pressable>

              {/* Premium pill card grid — 2 columns */}
              {expanded === cat.category && (
                <View style={styles.itemGrid}>
                  {cat.items.map((item) => (
                    <View key={item} style={[styles.itemCard, { borderColor: cat.iconBg }]}>
                      {/* Left accent */}
                      <View style={[styles.itemCardAccent, { backgroundColor: cat.accentColor }]} />
                      {/* Check circle */}
                      <View style={[styles.itemCardCheck, { backgroundColor: cat.iconBg }]}>
                        <Feather name="check" size={11} color={cat.iconColor} />
                      </View>
                      {/* Text */}
                      <Text style={styles.itemCardText}>{item}</Text>
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

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "rgba(14,181,202,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  headerSub: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular", marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },

  // Chip filter bar
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
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  catChipIconWrap: {
    width: 20, height: 20, borderRadius: 6,
    alignItems: "center", justifyContent: "center",
  },
  catChipText: { fontSize: 12, fontFamily: "Manrope_600SemiBold", color: "#1A1A1A" },
  catChipTextActive: { color: "#fff" },
  catChipBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 8,
  },
  catChipBadgeText: { fontSize: 10, fontFamily: "Manrope_700Bold" },

  // Category blocks
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  catHeaderIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  catName: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  catSubtitle: { fontSize: 11, fontFamily: "Manrope_500Medium", marginTop: 1 },
  catCountBadge: {
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 12,
  },
  catCountBadgeText: { fontSize: 12, fontFamily: "Manrope_700Bold" },

  // Premium 2-column item card grid
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  itemCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FAFFFE",
    borderWidth: 1.5,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  itemCardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  itemCardCheck: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemCardText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
    color: "#1A1A1A",
    lineHeight: 16,
  },
});
