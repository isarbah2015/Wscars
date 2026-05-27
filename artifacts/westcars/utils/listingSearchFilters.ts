import { Car } from "@/types";
import { isChinaListingLocation } from "@/utils/ghanaData";

export const SEARCH_PRICE_MIN = 0;
export const SEARCH_PRICE_MAX = 500_000;
export const SEARCH_YEAR_MIN = 1990;
export const SEARCH_YEAR_MAX = new Date().getFullYear() + 1;

export interface ListingSearchFilters {
  priceMin: number;
  priceMax: number;
  yearMin: number;
  yearMax: number;
  bodyTypes: string[];
  brands: string[];
  models: string[];
  transmissions: string[];
  conditions: string[];
  cities: string[];
}

export type QuickFilterKey =
  | "All"
  | "SUV"
  | "Sedan"
  | "Tokunbo"
  | "China"
  | "Budget"
  | "Luxury"
  | "Pickup"
  | "Truck"
  | "Bus"
  | "Heavy"
  | "Moto"
  | "New";

export const DEFAULT_LISTING_SEARCH_FILTERS: ListingSearchFilters = {
  priceMin: SEARCH_PRICE_MIN,
  priceMax: SEARCH_PRICE_MAX,
  yearMin: SEARCH_YEAR_MIN,
  yearMax: SEARCH_YEAR_MAX,
  bodyTypes: [],
  brands: [],
  models: [],
  transmissions: [],
  conditions: [],
  cities: [],
};

export function matchesQuickFilterKey(car: Car, key: QuickFilterKey): boolean {
  const cat = car.category?.toLowerCase() ?? "";
  if (key === "All") return true;
  if (key === "SUV") return cat.includes("suv") || cat.includes("4x4") || cat.includes("4×4");
  if (key === "Sedan") return cat.includes("sedan");
  if (key === "Tokunbo") return car.condition === "Foreign Used";
  if (key === "China") {
    return (
      isChinaListingLocation(car.location) ||
      !!car.seller?.chineseSellerProfile?.isChineseSeller
    );
  }
  if (key === "Budget") return car.price < 100_000;
  if (key === "Luxury") return car.price > 300_000;
  if (key === "Pickup") return cat.includes("pickup");
  if (key === "Truck") {
    return (
      cat.includes("cargo") ||
      cat.includes("tipper") ||
      cat.includes("tanker") ||
      cat.includes("flatbed") ||
      cat.includes("box truck")
    );
  }
  if (key === "Bus") return cat.includes("bus") || cat.includes("minibus") || cat.includes("coach");
  if (key === "Heavy") {
    return (
      cat.includes("excavator") ||
      cat.includes("bulldozer") ||
      cat.includes("crane") ||
      cat.includes("forklift") ||
      cat.includes("loader") ||
      cat.includes("grader") ||
      cat.includes("compactor") ||
      cat.includes("mixer") ||
      cat.includes("tractor") ||
      cat.includes("harvester") ||
      cat.includes("ambulance") ||
      cat.includes("fire truck")
    );
  }
  if (key === "Moto") {
    return (
      cat.includes("motorcycle") ||
      cat.includes("scooter") ||
      cat.includes("atv") ||
      cat.includes("dirt bike") ||
      cat.includes("quad")
    );
  }
  if (key === "New") return car.condition === "New";
  return true;
}

export function carMatchesListingFilters(car: Car, filters: ListingSearchFilters): boolean {
  const matchesBodyTypes =
    filters.bodyTypes.length === 0 ||
    filters.bodyTypes.some((type) => matchesQuickFilterKey(car, type as QuickFilterKey));

  return (
    matchesBodyTypes &&
    (filters.brands.length === 0 || filters.brands.includes(car.brand)) &&
    (filters.models.length === 0 || filters.models.includes(car.model)) &&
    (filters.transmissions.length === 0 || filters.transmissions.includes(car.transmission ?? "")) &&
    (filters.conditions.length === 0 || filters.conditions.includes(car.condition)) &&
    (filters.cities.length === 0 || filters.cities.includes(car.location)) &&
    car.price >= filters.priceMin &&
    car.price <= filters.priceMax &&
    car.year >= filters.yearMin &&
    car.year <= filters.yearMax
  );
}

export function carMatchesSavedSearch(
  car: Car,
  opts: {
    query?: string;
    quickFilter?: QuickFilterKey;
    filters?: ListingSearchFilters | null;
  },
): boolean {
  if (car.isHidden || car.isSold) return false;

  const q = (opts.query ?? "").trim().toLowerCase();
  if (q) {
    const hay = `${car.brand} ${car.model} ${car.location} ${car.condition} ${car.category ?? ""}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }

  const qf = opts.quickFilter ?? "All";
  if (qf !== "All" && !matchesQuickFilterKey(car, qf)) return false;

  if (opts.filters && !carMatchesListingFilters(car, opts.filters)) return false;

  return true;
}

export function buildSavedSearchLabel(opts: {
  query?: string;
  quickFilter?: QuickFilterKey;
  filters?: ListingSearchFilters | null;
}): string {
  const parts: string[] = [];
  if (opts.query?.trim()) parts.push(`"${opts.query.trim()}"`);
  if (opts.quickFilter && opts.quickFilter !== "All") parts.push(opts.quickFilter);
  const f = opts.filters;
  if (f) {
    if (f.brands.length === 1) parts.push(f.brands[0]);
    else if (f.brands.length > 1) parts.push(`${f.brands.length} brands`);
    if (f.conditions.length === 1) parts.push(f.conditions[0]);
    if (f.cities.length === 1) parts.push(f.cities[0]);
    if (f.priceMax < SEARCH_PRICE_MAX && f.priceMin === SEARCH_PRICE_MIN) {
      parts.push(`under GHS ${(f.priceMax / 1000).toFixed(0)}k`);
    } else if (f.priceMin !== SEARCH_PRICE_MIN || f.priceMax !== SEARCH_PRICE_MAX) {
      parts.push(`GHS ${f.priceMin.toLocaleString()}–${f.priceMax >= SEARCH_PRICE_MAX ? "any" : f.priceMax.toLocaleString()}`);
    }
  }
  return parts.length ? parts.join(" · ") : "Custom search";
}

export function filtersAreActive(filters: ListingSearchFilters | null | undefined): boolean {
  if (!filters) return false;
  return (
    filters.brands.length > 0 ||
    filters.models.length > 0 ||
    filters.bodyTypes.length > 0 ||
    filters.transmissions.length > 0 ||
    filters.conditions.length > 0 ||
    filters.cities.length > 0 ||
    filters.priceMin !== SEARCH_PRICE_MIN ||
    filters.priceMax !== SEARCH_PRICE_MAX ||
    filters.yearMin !== SEARCH_YEAR_MIN ||
    filters.yearMax !== SEARCH_YEAR_MAX
  );
}

export function daysUntilDate(isoDate: string): number {
  const end = new Date(isoDate);
  end.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - now.getTime()) / 86_400_000);
}
