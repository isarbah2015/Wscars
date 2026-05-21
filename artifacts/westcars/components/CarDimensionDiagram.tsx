import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  imageUri?: string;
  title?: string;
};

const DIAGRAM_W = 320;
const DIAGRAM_H = 168;
const PAD = 28;

/** Side-profile schematic with proportional L / H / wheelbase callouts. */
export function CarDimensionDiagram({
  length,
  width,
  height,
  wheelbase,
  imageUri,
  title,
}: Props) {
  const { isDark } = useTheme();

  const layout = useMemo(() => {
    const innerW = DIAGRAM_W - PAD * 2;
    const innerH = DIAGRAM_H - PAD * 2 - 22;
    const scale = Math.min(innerW / length, (innerH - 16) / height) * 0.82;
    const carL = length * scale;
    const carH = height * scale;
    const wb = Math.min(wheelbase * scale, carL * 0.72);
    const originX = PAD + (innerW - carL) / 2;
    const groundY = PAD + innerH - 8;
    const roofY = groundY - carH;
    const cx = originX + carL / 2;

    const bodyPath = [
      `M ${originX} ${groundY}`,
      `L ${originX + carL * 0.08} ${groundY}`,
      `L ${originX + carL * 0.14} ${roofY + carH * 0.42}`,
      `L ${originX + carL * 0.32} ${roofY + carH * 0.08}`,
      `L ${originX + carL * 0.58} ${roofY}`,
      `L ${originX + carL * 0.78} ${roofY + carH * 0.12}`,
      `L ${originX + carL * 0.92} ${roofY + carH * 0.38}`,
      `L ${originX + carL} ${groundY}`,
      "Z",
    ].join(" ");

    return {
      scale,
      carL,
      carH,
      wb,
      originX,
      groundY,
      roofY,
      cx,
      bodyPath,
      lenY: groundY + 18,
      hLineX: originX + carL + 10,
    };
  }, [length, height, wheelbase]);

  const stroke = isDark ? "#38D1E5" : "#0A9BB0";
  const dimStroke = isDark ? "#94A3B8" : "#64748B";
  const fill = isDark ? "rgba(14,181,202,0.18)" : "rgba(14,181,202,0.14)";
  const bg = isDark ? "#0F172A" : "#F0F9FB";
  const grid = isDark ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.10)";

  return (
    <View style={[styles.wrap, { backgroundColor: bg, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#D8EEF2" }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? "#E2E8F0" : "#0F172A" }]}>Dimension diagram</Text>
        {title ? (
          <Text style={[styles.headerSub, { color: isDark ? "#94A3B8" : "#64748B" }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.diagramCol}>
        <Svg width="100%" height={DIAGRAM_H} viewBox={`0 0 ${DIAGRAM_W} ${DIAGRAM_H}`}>
          {/* Grid */}
          {[0, 1, 2, 3, 4].map((i) => (
            <Line
              key={`g-${i}`}
              x1={PAD}
              y1={PAD + i * ((DIAGRAM_H - PAD * 2) / 4)}
              x2={DIAGRAM_W - PAD}
              y2={PAD + i * ((DIAGRAM_H - PAD * 2) / 4)}
              stroke={grid}
              strokeWidth={1}
            />
          ))}

          {/* Ground line */}
          <Line
            x1={PAD}
            y1={layout.groundY}
            x2={DIAGRAM_W - PAD}
            y2={layout.groundY}
            stroke={dimStroke}
            strokeWidth={1}
            strokeDasharray="4 3"
          />

          {/* Car body */}
          <Path d={layout.bodyPath} fill={fill} stroke={stroke} strokeWidth={2} />

          {/* Wheels */}
          {[0.22, 0.72].map((t) => {
            const wx = layout.originX + layout.carL * t;
            const r = layout.carH * 0.14;
            return (
              <Circle key={t} cx={wx} cy={layout.groundY} r={r} fill={isDark ? "#1E293B" : "#CBD5E1"} stroke={stroke} strokeWidth={1.5} />
            );
          })}

          {/* Wheelbase */}
          <Line
            x1={layout.originX + layout.carL * 0.22}
            y1={layout.groundY - layout.carH * 0.22}
            x2={layout.originX + layout.carL * 0.22 + layout.wb}
            y2={layout.groundY - layout.carH * 0.22}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <Line x1={layout.originX + layout.carL * 0.22} y1={layout.groundY - layout.carH * 0.18} x2={layout.originX + layout.carL * 0.22} y2={layout.groundY - layout.carH * 0.26} stroke={stroke} strokeWidth={1} />
          <Line x1={layout.originX + layout.carL * 0.22 + layout.wb} y1={layout.groundY - layout.carH * 0.18} x2={layout.originX + layout.carL * 0.22 + layout.wb} y2={layout.groundY - layout.carH * 0.26} stroke={stroke} strokeWidth={1} />
          <SvgText
            x={layout.originX + layout.carL * 0.22 + layout.wb / 2}
            y={layout.groundY - layout.carH * 0.28}
            fill={stroke}
            fontSize={9}
            fontWeight="600"
            textAnchor="middle"
          >
            {wheelbase} mm WB
          </SvgText>

          {/* Length dimension */}
          <Line x1={layout.originX} y1={layout.lenY} x2={layout.originX + layout.carL} y2={layout.lenY} stroke={dimStroke} strokeWidth={1.5} />
          <Line x1={layout.originX} y1={layout.lenY - 4} x2={layout.originX} y2={layout.lenY + 4} stroke={dimStroke} strokeWidth={1.5} />
          <Line x1={layout.originX + layout.carL} y1={layout.lenY - 4} x2={layout.originX + layout.carL} y2={layout.lenY + 4} stroke={dimStroke} strokeWidth={1.5} />
          <SvgText x={layout.cx} y={layout.lenY + 12} fill={dimStroke} fontSize={10} fontWeight="700" textAnchor="middle">
            L {length} mm
          </SvgText>

          {/* Height dimension */}
          <Line x1={layout.hLineX} y1={layout.roofY} x2={layout.hLineX} y2={layout.groundY} stroke={dimStroke} strokeWidth={1.5} />
          <Line x1={layout.hLineX - 4} y1={layout.roofY} x2={layout.hLineX + 4} y2={layout.roofY} stroke={dimStroke} strokeWidth={1.5} />
          <Line x1={layout.hLineX - 4} y1={layout.groundY} x2={layout.hLineX + 4} y2={layout.groundY} stroke={dimStroke} strokeWidth={1.5} />
          <SvgText
            x={layout.hLineX + 8}
            y={layout.roofY + layout.carH / 2}
            fill={dimStroke}
            fontSize={9}
            fontWeight="700"
          >
            H {height}
          </SvgText>
        </Svg>

        {imageUri ? (
          <View style={[styles.photoPanel, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "#D8EEF2", backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="contain" />
            <Text style={[styles.photoCaption, { color: isDark ? "#94A3B8" : "#64748B" }]}>
              Listing photo · front 3/4 reference
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.legend}>
        {[
          { k: "Length", v: `${length} mm` },
          { k: "Width", v: `${width} mm` },
          { k: "Height", v: `${height} mm` },
          { k: "Wheelbase", v: `${wheelbase} mm` },
        ].map((item) => (
          <View key={item.k} style={[styles.legendChip, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#FFFFFF", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }]}>
            <Text style={[styles.legendKey, { color: isDark ? "#94A3B8" : "#64748B" }]}>{item.k}</Text>
            <Text style={[styles.legendVal, { color: isDark ? "#F1F5F9" : "#0F172A" }]}>{item.v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 12,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 2,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  diagramCol: {
    alignItems: "stretch",
    paddingHorizontal: 8,
    gap: 10,
  },
  photoPanel: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
  },
  photo: {
    width: "100%",
    height: 108,
  },
  photoCaption: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    paddingVertical: 6,
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  legendChip: {
    flexGrow: 1,
    minWidth: "45%",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  legendKey: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.35,
  },
  legendVal: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
});
