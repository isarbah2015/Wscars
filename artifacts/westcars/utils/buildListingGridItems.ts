import { Car } from "@/types";

export type ListingGridItem =
  | { kind: "car"; car: Car; key: string }
  | { kind: "featured-wide"; car: Car; key: string };

export type GridLayoutRow =
  | { type: "wide"; item: Extract<ListingGridItem, { kind: "featured-wide" }> }
  | { type: "pair"; items: ListingGridItem[] };

function isPaidListing(car: Car): boolean {
  return !!(car.isSponsored || car.isFeatured);
}

function isPromoItem(item: ListingGridItem): boolean {
  return item.kind !== "car";
}

/** Score paid listings for smart wide-slot rotation. */
function promotionScore(car: Car): number {
  let score = 0;
  if (car.isSponsored) score += 120;
  if (car.isFeatured) score += 80;
  score += Math.min(50, Math.floor((car.views ?? 0) / 8));
  return score;
}

function hashKey(key: string): number {
  return [...key].reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) >>> 0, 17);
}

/** Pick a stable pseudo-random slot with minimum spacing from other promo items. */
function pickInsertSlot(items: ListingGridItem[], insertKey: string, minGap: number): number {
  const spread = Math.max(minGap + 2, items.length + 1);
  let slot = 1 + (hashKey(insertKey) % spread);

  for (let attempt = 0; attempt < 8; attempt++) {
    const ok = items.every((item, idx) => {
      if (!isPromoItem(item)) return true;
      return Math.abs(idx - slot) >= minGap;
    });
    if (ok) return Math.min(slot, items.length);
    slot = 1 + ((hashKey(insertKey) + attempt * 7) % spread);
  }

  return Math.min(slot, items.length);
}

/**
 * Browse feed builder:
 * - 2×2 rows = organic listings only
 * - Paid boosts = full-width featured hero rows (only when a listing is actually boosted)
 * - No empty "Advertise Here" placeholders — slots appear only for real paid ads
 */
export function buildListingGridItems(
  cars: Car[],
  options?: {
    injectPromotions?: boolean;
    promotionPool?: Car[];
  },
): ListingGridItem[] {
  const seen = new Set<string>();
  const baseCars = cars.filter((c) => {
    if (seen.has(c.id)) return false;
    if (options?.injectPromotions && isPaidListing(c)) return false;
    seen.add(c.id);
    return true;
  });

  if (!options?.injectPromotions || baseCars.length === 0) {
    return baseCars.map((car) => ({ kind: "car", car, key: car.id }));
  }

  let merged: ListingGridItem[] = baseCars.map((car) => ({
    kind: "car",
    car,
    key: car.id,
  }));

  const pool = options.promotionPool ?? cars;
  const paidExtras = pool
    .filter((c) => isPaidListing(c) && !seen.has(c.id))
    .sort((a, b) => promotionScore(b) - promotionScore(a))
    .slice(0, 4);

  paidExtras.forEach((car) => {
    const item: ListingGridItem = {
      kind: "featured-wide",
      car,
      key: `wide-${car.id}`,
    };
    const slot = pickInsertSlot(merged, `promo-${car.id}`, 4);
    merged.splice(slot, 0, item);
    seen.add(car.id);
  });

  return merged;
}

export function buildGridLayout(items: ListingGridItem[]): GridLayoutRow[] {
  const rows: GridLayoutRow[] = [];
  let buffer: ListingGridItem[] = [];

  const flushPair = () => {
    if (buffer.length === 0) return;
    rows.push({ type: "pair", items: [...buffer] });
    buffer = [];
  };

  for (const item of items) {
    if (item.kind === "featured-wide") {
      flushPair();
      rows.push({ type: "wide", item });
      continue;
    }
    buffer.push(item);
    if (buffer.length >= 2) flushPair();
  }
  flushPair();
  return rows;
}

/** @deprecated Use buildGridLayout instead */
export function chunkGridItems<T>(items: T[], size = 2): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}
