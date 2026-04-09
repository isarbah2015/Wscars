import React from "react";
import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  Polygon,
  Text as SvgText,
} from "react-native-svg";

// Pointy-top regular hexagon (vertex at top & bottom, flat sides)
// Center (cx, cy), circumradius R
// Points at angles: -90°, -30°, 30°, 90°, 150°, 210°
function hexPoints(cx: number, cy: number, R: number): string {
  const angles = [-90, -30, 30, 90, 150, 210];
  return angles
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      return `${cx + R * Math.cos(rad)},${cy + R * Math.sin(rad)}`;
    })
    .join(" ");
}

interface Props {
  size?: number;
  textColor?: string;
  mottoColor?: string;
  showMotto?: boolean;
}

export function WestcarsBadge({
  size = 200,
  textColor = "#0F172A",
  mottoColor,
  showMotto = false,
}: Props) {
  // ViewBox is 200 wide x 250 tall — hexagon top, WESTCARS below
  const VW = 200;
  const VH = showMotto ? 280 : 252;

  // Hexagon: center at (100, 92), radius 84
  // spans from y=8 (top vertex) to y=176 (bottom vertex)
  const cx = 100;
  const cy = 92;
  const R  = 84;
  const pts = hexPoints(cx, cy, R);

  const height = size * (VH / VW);

  return (
    <Svg width={size} height={height} viewBox={`0 0 ${VW} ${VH}`}>
      <Defs>
        <ClipPath id="hexClip">
          <Polygon points={pts} />
        </ClipPath>
      </Defs>

      {/* Badge image clipped to hexagon — scaled large so only the car body
          sits inside the clip; the badge's own WESTCARS text falls below y=176 */}
      <SvgImage
        href={require("@/assets/images/wc-badge.png")}
        x={-70}
        y={-55}
        width={340}
        height={340}
        clipPath="url(#hexClip)"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Closed hexagon outline drawn on top */}
      <Polygon
        points={pts}
        fill="none"
        stroke="#0EB5CA"
        strokeWidth={6.5}
        strokeLinejoin="round"
      />

      {/* WESTCARS wordmark — sits just below the hexagon */}
      <SvgText
        x="100"
        y="213"
        textAnchor="middle"
        fill={textColor}
        fontSize="28"
        fontWeight="800"
        fontFamily="Manrope_800ExtraBold"
        letterSpacing="2.5"
      >
        WESTCARS
      </SvgText>

      {/* Optional motto line */}
      {showMotto && (
        <SvgText
          x="100"
          y="240"
          textAnchor="middle"
          fill={mottoColor ?? "#0098AA"}
          fontSize="10.5"
          fontFamily="Manrope_600SemiBold"
          letterSpacing="1.4"
        >
          Ghana's Trusted Car Marketplace
        </SvgText>
      )}
    </Svg>
  );
}
