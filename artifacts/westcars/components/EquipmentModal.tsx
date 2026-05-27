import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const EQUIPMENT: {
  icon: string;
  category: string;
  iconColor: string;
  accentColor: string;
  chipBg: string;
  count: number;
  items: string[];
}[] = [
  {
    icon: "shield",
    category: "Safety",
    iconColor: "#DC2626",
    accentColor: "#DC2626",
    chipBg: "#FEF2F2",
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
    iconColor: "#1D4ED8",
    accentColor: "#1D4ED8",
    chipBg: "#EFF6FF",
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
    iconColor: "#D97706",
    accentColor: "#D97706",
    chipBg: "#FFFBEB",
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
    iconColor: "#7C3AED",
    accentColor: "#7C3AED",
    chipBg: "#F5F3FF",
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
    iconColor: "#FF6B00",
    accentColor: "#FF6B00",
    chipBg: "#FFF1E5",
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
    iconColor: "#16A34A",
    accentColor: "#16A34A",
    chipBg: "#F0FDF4",
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
    iconColor: "#475569",
    accentColor: "#475569",
    chipBg: "#F8FAFC",
    count: 2,
    items: [
      "Immobiliser",
      "Perimeter alarm system",
    ],
  },
  {
    icon: "more-horizontal",
    category: "Other",
    iconColor: "#EA580C",
    accentColor: "#EA580C",
    chipBg: "#FFF7ED",
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

const useNative = Platform.OS !== "web";

export function EquipmentModal({ visible, trimName = "Standard", onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const line = isDark ? colors.border : "#E9EEF4";
  const rowLine = isDark ? colors.border : "#F1F5F9";
  const scrollRef = useRef<ScrollView>(null);
  const chipScrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({}).current;
  const sectionsWrapY = useRef(0);
  const [activeCategory, setActiveCategory] = useState<string>("Safety");

  const sectionAnims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(EQUIPMENT.map((c) => [c.category, new Animated.Value(0)]))
  ).current;

  useEffect(() => {
    if (!visible) return;
    EQUIPMENT.forEach((c, i) => {
      sectionAnims[c.category].setValue(0);
      Animated.timing(sectionAnims[c.category], {
        toValue: 1,
        duration: 420,
        delay: 60 + i * 55,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: useNative,
      }).start();
    });
  }, [visible, sectionAnims]);

  const totalItems = EQUIPMENT.reduce((acc, c) => acc + c.count, 0);
  const totalCategories = EQUIPMENT.length;

  const jumpToCategory = (category: string) => {
    setActiveCategory(category);
    const y = sectionPositions[category];
    if (typeof y === "number") {
      scrollRef.current?.scrollTo({
        y: Math.max(0, sectionsWrapY.current + y - 12),
        animated: true,
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top || 0, backgroundColor: colors.background }]}>

        {/* ── Header ── */}
        <LinearGradient
          colors={["#0A1628", "#0D2137", "#0A3554"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Top row */}
          <View style={styles.headerTopRow}>
            <View style={styles.headerIconRing}>
              <Feather name="award" size={19} color="#FF6B00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>All Equipment</Text>
              <Text style={styles.headerSub}>{trimName} trim</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
              onPress={onClose}
              hitSlop={14}
            >
              <Feather name="x" size={16} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>OPTIONS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalCategories}</Text>
              <Text style={styles.statLabel}>CATEGORIES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: "#34D399" }]}>100%</Text>
              <Text style={styles.statLabel}>VERIFIED</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Category chip rail ── */}
        <View style={[styles.chipRailWrap, { backgroundColor: colors.card, borderBottomColor: line }]}>
          <ScrollView
            ref={chipScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRail}
          >
            {EQUIPMENT.map((cat) => {
              const active = activeCategory === cat.category;
              return (
                <Pressable
                  key={cat.category}
                  style={({ pressed }) => [
                    styles.chip,
                    active
                      ? [styles.chipActive, { backgroundColor: cat.accentColor }]
                      : { backgroundColor: cat.chipBg },
                    pressed && { opacity: 0.78 },
                  ]}
                  onPress={() => jumpToCategory(cat.category)}
                >
                  <Feather
                    name={cat.icon as any}
                    size={13}
                    color={active ? "#fff" : cat.iconColor}
                  />
                  <Text
                    style={[
                      styles.chipLabel,
                      { color: active ? "#fff" : cat.iconColor },
                    ]}
                  >
                    {cat.category}
                  </Text>
                  <View
                    style={[
                      styles.chipBadge,
                      { backgroundColor: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.07)" },
                    ]}
                  >
                    <Text style={[styles.chipBadgeText, { color: active ? "#fff" : cat.iconColor }]}>
                      {cat.count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Sections ── */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            onLayout={(e) => { sectionsWrapY.current = e.nativeEvent.layout.y; }}
          >
            {EQUIPMENT.map((cat, catIdx) => {
              const opac = sectionAnims[cat.category];
              const slide = opac.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

              return (
                <Animated.View
                  key={cat.category}
                  onLayout={(e) => { sectionPositions[cat.category] = e.nativeEvent.layout.y; }}
                  style={[
                    styles.section,
                    { backgroundColor: colors.card, borderColor: line, opacity: opac, transform: [{ translateY: slide }] },
                  ]}
                >
                  {/* Section header */}
                  <View style={[styles.sectionHead, { borderBottomColor: rowLine }]}>
                    <View style={[styles.sectionAccentDot, { backgroundColor: cat.accentColor }]} />
                    <View style={[styles.sectionIconWrap, { backgroundColor: isDark ? `${cat.accentColor}22` : cat.chipBg }]}>
                      <Feather name={cat.icon as any} size={15} color={cat.iconColor} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{cat.category}</Text>
                    <View style={[styles.sectionBadge, { backgroundColor: isDark ? `${cat.accentColor}22` : cat.chipBg }]}>
                      <Text style={[styles.sectionBadgeText, { color: cat.accentColor }]}>
                        {cat.count}
                      </Text>
                    </View>
                  </View>

                  {/* Item rows */}
                  <View style={styles.itemList}>
                    {cat.items.map((item, idx) => (
                      <View
                        key={item}
                        style={[
                          styles.itemRow,
                          idx < cat.items.length - 1 && [styles.itemRowBorder, { borderBottomColor: rowLine }],
                        ]}
                      >
                        <View style={[styles.itemCheckWrap, { backgroundColor: isDark ? `${cat.accentColor}22` : cat.chipBg }]}>
                          <Feather name="check" size={11} color={cat.iconColor} />
                        </View>
                        <Text style={[styles.itemText, { color: colors.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          <View style={{ height: 36 + (insets.bottom || 0) }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8FAFC" },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  headerIconRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,107,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,107,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingVertical: 13,
    paddingHorizontal: 8,
  },
  statBox: { flex: 1, alignItems: "center", gap: 3 },
  statValue: {
    fontSize: 22,
    fontFamily: "Manrope_800ExtraBold",
    color: "#fff",
    letterSpacing: -0.6,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  /* Chip rail */
  chipRailWrap: {
    borderBottomWidth: 1,
    borderBottomColor: "#E9EEF4",
    backgroundColor: "#fff",
  },
  chipRail: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipActive: {},
  chipLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },
  chipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  chipBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },

  /* Scroll */
  scrollContent: { paddingTop: 14, paddingHorizontal: 16 },

  /* Section */
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#0A1628",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionAccentDot: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 2,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Manrope_800ExtraBold",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sectionBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },

  /* Items */
  itemList: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemCheckWrap: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#334155",
    lineHeight: 18,
  },
});
