import { ViewStyle } from "react-native";

/**
 * Shared 2-column listing grid — matches Profile › Listings tab sizing everywhere.
 */
export const LISTING_GRID = {
  paddingHorizontal: 4,
  gap: 4,
  rowMarginBottom: 4,
  sectionBreakout: -10,
  imageHeight: 128,
  cardRadius: 12,
  infoPadding: 8,
} as const;

export const listingGridRowStyle: ViewStyle = {
  flexDirection: "row",
  gap: LISTING_GRID.gap,
  marginBottom: LISTING_GRID.rowMarginBottom,
};

export const listingGridCardStyle: ViewStyle = {
  flex: 1,
  minWidth: 0,
};

export const listingGridContainerStyle: ViewStyle = {
  paddingHorizontal: LISTING_GRID.paddingHorizontal,
};

/**
 * Reference width for ad upload specs (typical phone). Card width scales with screen.
 */
const REF_SCREEN_W = 390;
export const GRID_CARD_W = Math.floor(
  (REF_SCREEN_W - LISTING_GRID.paddingHorizontal * 2 - LISTING_GRID.gap) / 2,
);
export const GRID_CARD_INFO_H = 52;
export const GRID_CARD_TOTAL_H = LISTING_GRID.imageHeight + GRID_CARD_INFO_H;
export const FEATURED_HERO_H = 230;
export const FEATURED_HERO_W = REF_SCREEN_W - 20;

export const AD_SLOT_LABELS = {
  gridCard: `${GRID_CARD_W} × ${GRID_CARD_TOTAL_H} px — 2×2 grid card (${LISTING_GRID.imageHeight}px image + info)`,
  featuredHero: `${FEATURED_HERO_W} × ${FEATURED_HERO_H} px — Full-width featured hero`,
  gridImage: `${GRID_CARD_W} × ${LISTING_GRID.imageHeight} px — Grid image area only`,
  featuredImage: `${FEATURED_HERO_W} × ${FEATURED_HERO_H} px — Featured image area`,
} as const;

export const listingGridImageStyle = {
  width: "100%" as const,
  height: LISTING_GRID.imageHeight,
  backgroundColor: "#1A2340",
};
