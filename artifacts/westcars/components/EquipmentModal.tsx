import { Feather } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Animated,
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
  const [expandedCat, setExpandedCat] = useState<string | null>("Safety");

  const animVals = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(
      EQUIPMENT.map((c) => [c.category, new Animated.Value(c.category === "Safety" ? 1 : 0)])
    )
  ).current;

  const toggle = (category: string) => {
    const isOpen = expandedCat === category;
    EQUIPMENT.forEach((c) => {
      if (c.category !== category) {
        Animated.timing(animVals[c.category], {
          toValue: 0,
          duration: 180,
          useNativeDriver: false,
        }).start();
      }
    });
    Animated.timing(animVals[category], {
      toValue: isOpen ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setExpandedCat(isOpen ? null : category);
  };

  const totalItems = EQUIPMENT.reduce((acc, c) => acc + c.count, 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top || 0 }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Feather name="list" size={18} color="#0EB5CA" />
            </View>
            <View>
              <Text style={styles.headerTitle}>All Equipment</Text>
              <Text style={styles.headerSub}>
                {trimName} trim · {totalItems} options
              </Text>
            </View>
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Feather name="x" size={20} color="#1A1A1A" />
          </Pressable>
        </View>

        {/* ── Category filter chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipRow}
        >
          {EQUIPMENT.map((cat) => {
            const active = expandedCat === cat.category;
            return (
              <Pressable
                key={cat.category}
                style={[
                  styles.catChip,
                  active && { backgroundColor: cat.iconColor, borderColor: cat.iconColor },
                ]}
                onPress={() => toggle(cat.category)}
              >
                <View
                  style={[
                    styles.catChipIconWrap,
                    active
                      ? { backgroundColor: "rgba(255,255,255,0.22)" }
                      : { backgroundColor: cat.iconBg },
                  ]}
                >
                  <Feather
                    name={cat.icon as any}
                    size={14}
                    color={active ? "#fff" : cat.iconColor}
                  />
                </View>
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {cat.category}
                </Text>
                <View
                  style={[
                    styles.catChipBadge,
                    active
                      ? { backgroundColor: "rgba(255,255,255,0.28)" }
                      : { backgroundColor: cat.iconBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipBadgeText,
                      active ? { color: "#fff" } : { color: cat.iconColor },
                    ]}
                  >
                    {cat.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Full accordion list ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {EQUIPMENT.map((cat) => {
            const isOpen = expandedCat === cat.category;
            const maxH = animVals[cat.category].interpolate({
              inputRange: [0, 1],
              outputRange: [0, cat.count * 50 + 24],
            });
            const opac = animVals[cat.category];

            return (
              <View key={cat.category} style={styles.catBlock}>
                {/* Category header row */}
                <Pressable
                  style={styles.catHeader}
                  onPress={() => toggle(cat.category)}
                  android_ripple={{ color: "rgba(0,0,0,0.05)" }}
                >
                  <View
                    style={[styles.catHeaderIconWrap, { backgroundColor: cat.iconBg }]}
                  >
                    <Feather name={cat.icon as any} size={22} color={cat.iconColor} />
                  </View>
                  <View style={styles.catHeaderInfo}>
                    <Text style={styles.catName}>{cat.category}</Text>
                    <Text style={[styles.catSubtitle, { color: cat.iconColor }]}>
                      {cat.count} items
                    </Text>
                  </View>
                  <View
                    style={[styles.catCountBadge, { backgroundColor: cat.iconBg }]}
                  >
                    <Text style={[styles.catCountBadgeText, { color: cat.iconColor }]}>
                      {cat.count}
                    </Text>
                  </View>
                  <Animated.View
                    style={{
                      marginLeft: 10,
                      transform: [
                        {
                          rotate: animVals[cat.category].interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", "180deg"],
                          }),
                        },
                      ],
                    }}
                  >
                    <Feather name="chevron-down" size={18} color="#9E9E9E" />
                  </Animated.View>
                </Pressable>

                {/* Animated content */}
                <Animated.View
                  style={[
                    styles.itemsWrap,
                    { maxHeight: maxH, opacity: opac, overflow: "hidden" },
                  ]}
                >
                  <View style={styles.itemsList}>
                    {cat.items.map((item, idx) => (
                      <View
                        key={item}
                        style={[
                          styles.itemRow,
                          idx < cat.items.length - 1 && styles.itemRowBorder,
                        ]}
                      >
                        <View
                          style={[
                            styles.itemCheck,
                            { backgroundColor: cat.iconBg },
                          ]}
                        >
                          <Feather name="check" size={12} color={cat.iconColor} />
                        </View>
                        <Text style={styles.itemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F7FA" },

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
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "rgba(14,181,202,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  headerSub: { fontSize: 12, color: "#6B6B6B", fontFamily: "Manrope_400Regular", marginTop: 2 },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#F0F0F0",
    alignItems: "center", justifyContent: "center",
  },

  chipScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    flexGrow: 0,
  },
  chipRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    alignItems: "center",
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  catChipIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: "center", justifyContent: "center",
  },
  catChipText: {
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
    color: "#1A1A1A",
  },
  catChipTextActive: { color: "#fff" },
  catChipBadge: {
    minWidth: 24,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 10,
    alignItems: "center",
  },
  catChipBadgeText: { fontSize: 11, fontFamily: "Manrope_700Bold" },

  listContent: { paddingBottom: 48 },

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
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  catHeaderIconWrap: {
    width: 48, height: 48, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  catHeaderInfo: { flex: 1 },
  catName: { fontSize: 15, fontFamily: "Manrope_700Bold", color: "#1A1A1A" },
  catSubtitle: { fontSize: 11, fontFamily: "Manrope_500Medium", marginTop: 2 },
  catCountBadge: {
    minWidth: 30, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 12, alignItems: "center",
  },
  catCountBadgeText: { fontSize: 13, fontFamily: "Manrope_700Bold" },

  itemsWrap: {},
  itemsList: {
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 14,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemCheck: {
    width: 28, height: 28, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Manrope_500Medium",
    color: "#1A1A1A",
    lineHeight: 18,
  },
});
