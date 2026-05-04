import { Feather } from "@expo/vector-icons";
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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EQUIPMENT: {
  icon: string;
  category: string;
  iconColor: string;
  iconBg: string;
  gradientFrom: string;
  gradientTo: string;
  count: number;
  items: string[];
}[] = [
  {
    icon: "shield",
    category: "Safety",
    iconColor: "#E53935",
    iconBg: "#FCE4EC",
    gradientFrom: "#EF5350",
    gradientTo: "#E53935",
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
    gradientFrom: "#42A5F5",
    gradientTo: "#1565C0",
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
    gradientFrom: "#FBBF24",
    gradientTo: "#F59E0B",
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
    gradientFrom: "#AB47BC",
    gradientTo: "#7B1FA2",
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
    gradientFrom: "#26C6DA",
    gradientTo: "#0EB5CA",
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
    gradientFrom: "#66BB6A",
    gradientTo: "#2E7D32",
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
    gradientFrom: "#546E7A",
    gradientTo: "#37474F",
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
    gradientFrom: "#FB8C00",
    gradientTo: "#E65100",
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
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({}).current;
  const sectionsWrapY = useRef(0);
  const [activeCategory, setActiveCategory] = useState<string>("Safety");

  // Per-section appear animation
  const sectionAnims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(EQUIPMENT.map((c) => [c.category, new Animated.Value(0)]))
  ).current;

  useEffect(() => {
    if (!visible) return;
    EQUIPMENT.forEach((c, i) => {
      sectionAnims[c.category].setValue(0);
      Animated.timing(sectionAnims[c.category], {
        toValue: 1,
        duration: 380,
        delay: 80 + i * 60,
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
        y: Math.max(0, sectionsWrapY.current + y - 8),
        animated: true,
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top || 0 }]}>
        {/* ── Premium Header ── */}
        <LinearGradient
          colors={["#0EB5CA", "#0098AA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconWrap}>
                <Feather name="award" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>All Equipment</Text>
                <Text style={styles.headerSub}>{trimName} trim</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
              <Feather name="x" size={18} color="#fff" />
            </Pressable>
          </View>

          {/* Stats strip */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>Total options</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalCategories}</Text>
              <Text style={styles.statLabel}>Categories</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ── Category Card Grid ── */}
          <View style={styles.gridWrap}>
            <View style={styles.gridHeaderRow}>
              <Text style={styles.gridTitle}>Browse by category</Text>
              <Text style={styles.gridSubtitle}>Tap a card to jump</Text>
            </View>
            <View style={styles.grid}>
              {EQUIPMENT.map((cat) => {
                const isActive = activeCategory === cat.category;
                return (
                  <Pressable
                    key={cat.category}
                    style={({ pressed }) => [
                      styles.gridCard,
                      isActive && styles.gridCardActive,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => jumpToCategory(cat.category)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                  >
                    {/* Top accent bar */}
                    <View style={[styles.gridCardAccent, { backgroundColor: cat.iconColor }]} />
                    {/* Icon bubble */}
                    <View style={[styles.gridIconWrap, { backgroundColor: cat.iconBg }]}>
                      <Feather name={cat.icon as any} size={18} color={cat.iconColor} />
                    </View>
                    {/* Category name */}
                    <Text style={styles.gridCardName} numberOfLines={1}>{cat.category}</Text>
                    {/* Count row */}
                    <View style={styles.gridCardFooter}>
                      <Text style={[styles.gridCardCount, { color: cat.iconColor }]}>
                        {cat.count}
                      </Text>
                      <Text style={styles.gridCardCountLabel}>items</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Section List (always expanded — premium feel) ── */}
          <View
            style={styles.sectionsWrap}
            onLayout={(e) => {
              sectionsWrapY.current = e.nativeEvent.layout.y;
            }}
          >
            <Text style={styles.sectionsHeader}>Detailed list</Text>

            {EQUIPMENT.map((cat) => {
              const opac = sectionAnims[cat.category];
              const translate = opac.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              });

              return (
                <Animated.View
                  key={cat.category}
                  onLayout={(e) => {
                    sectionPositions[cat.category] = e.nativeEvent.layout.y;
                  }}
                  style={[
                    styles.sectionCard,
                    { opacity: opac, transform: [{ translateY: translate }] },
                  ]}
                >
                  {/* Premium gradient header */}
                  <LinearGradient
                    colors={[cat.gradientFrom, cat.gradientTo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sectionHeader}
                  >
                    <View style={styles.sectionHeaderIcon}>
                      <Feather name={cat.icon as any} size={20} color="#fff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.sectionHeaderTitle}>{cat.category}</Text>
                      <Text style={styles.sectionHeaderSub}>{cat.count} included options</Text>
                    </View>
                    <View style={styles.sectionHeaderBadge}>
                      <Feather name="check" size={11} color="#fff" />
                      <Text style={styles.sectionHeaderBadgeText}>{cat.count}</Text>
                    </View>
                  </LinearGradient>

                  {/* Items in 2-column layout */}
                  <View style={styles.itemsGrid}>
                    {cat.items.map((item) => (
                      <View key={item} style={styles.itemPill}>
                        <View style={[styles.itemCheck, { backgroundColor: cat.iconBg }]}>
                          <Feather name="check" size={11} color={cat.iconColor} />
                        </View>
                        <Text style={styles.itemText} numberOfLines={2}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          <View style={{ height: 32 + (insets.bottom || 0) }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F5F9" },

  /* Header */
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "PlusJakartaSans_500Medium",
    marginTop: 2,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1, height: 26,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  /* Scroll */
  scrollContent: { paddingTop: 16 },

  /* Grid */
  gridWrap: {
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  gridHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  gridSubtitle: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#64748B",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  gridCardActive: {
    borderColor: "#0EB5CA",
    shadowColor: "#0EB5CA",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  gridCardAccent: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 3,
  },
  gridIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  gridCardName: {
    fontSize: 13,
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0F172A",
    letterSpacing: -0.1,
  },
  gridCardFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4,
  },
  gridCardCount: {
    fontSize: 18,
    fontFamily: "PlusJakartaSans_600SemiBold",
    letterSpacing: -0.5,
  },
  gridCardCountLabel: {
    fontSize: 10,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* Sections */
  sectionsWrap: { paddingHorizontal: 14 },
  sectionsHeader: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#0F172A",
    letterSpacing: -0.2,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  sectionHeaderIcon: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: -0.2,
  },
  sectionHeaderSub: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_500Medium",
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  sectionHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sectionHeaderBadgeText: {
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#fff",
    letterSpacing: 0.3,
  },

  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  itemPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    width: "48.5%",
  },
  itemCheck: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  itemText: {
    flex: 1,
    fontSize: 11,
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#0F172A",
    lineHeight: 14,
  },
});
