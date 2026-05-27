export const CURRENCY = "GHS";
export const CURRENCY_SYMBOL = "₵";
export const COUNTRY_CODE = "+233";

export const FOREIGN_IMPORT_LOCATIONS = [
  "Foreign — Japan",
  "Foreign — USA",
  "Foreign — UK",
  "Foreign — Germany",
  "Foreign — China",
  "Foreign — UAE",
  "Foreign — South Korea",
  "Foreign — Belgium",
  "Foreign — Other",
];

/** Shown in sell flow when profile is marked Chinese seller / importer */
export const CHINA_SELLER_LISTING_LABEL = "Chinese Seller — Vehicle in China";

export const CHINA_CITIES = [
  "Guangzhou",
  "Shenzhen",
  "Shanghai",
  "Beijing",
  "Yiwu",
  "Ningbo",
  "Qingdao",
  "Tianjin",
  "Xiamen",
  "Chongqing",
  "Wuhan",
  "Chengdu",
  "Dongguan",
  "Foshan",
  "Hangzhou",
  "Nanjing",
  "Zhengzhou",
];

export const GHANA_PORT_LOCATIONS = [
  "Accra (Tema Port)",
  "Takoradi Port",
  "Tema Free Zone",
];

export type LocationSellerContext = {
  isChineseSeller?: boolean;
  locationInChina?: string;
};

/** Short label for listing cards (avoids clipping long "China — City" strings). */
export function formatLocationShort(location: string): string {
  const loc = location.trim();
  if (!loc) return "";
  if (loc.startsWith("China — ")) return loc.slice("China — ".length);
  if (loc === CHINA_SELLER_LISTING_LABEL) return "China";
  if (loc.includes(",")) return loc.split(",")[0].trim();
  return loc;
}

export function formatChinaLocation(city: string): string {
  const trimmed = city.trim();
  if (!trimmed) return CHINA_SELLER_LISTING_LABEL;
  if (trimmed.startsWith("China —")) return trimmed;
  return `China — ${trimmed}`;
}

export function isChinaListingLocation(location: string): boolean {
  return (
    location.startsWith("China —") ||
    location === CHINA_SELLER_LISTING_LABEL ||
    location === "Foreign — China"
  );
}

export function getLocationOptions(
  condition: string,
  seller?: LocationSellerContext,
): string[] {
  const importish = condition === "Foreign Used" || condition === "Tokunbo";

  if (!seller?.isChineseSeller) {
    if (importish) return [...GHANA_PORT_LOCATIONS, ...GHANA_CITIES];
    return [...GHANA_CITIES];
  }

  const profileCity = seller.locationInChina?.trim();
  const chinaLocs = CHINA_CITIES.map(formatChinaLocation);
  const profileLoc = profileCity ? formatChinaLocation(profileCity) : null;

  const chinaSection = [
    CHINA_SELLER_LISTING_LABEL,
    ...(profileLoc && !chinaLocs.includes(profileLoc) ? [profileLoc] : []),
    ...chinaLocs,
  ];

  return [...new Set([...chinaSection, ...GHANA_PORT_LOCATIONS, ...GHANA_CITIES])];
}

export const GHANA_CITIES = [
  "Accra", "Kumasi", "Takoradi", "Tamale", "Cape Coast",
  "Sunyani", "Koforidua", "Ho", "Wa", "Bolgatanga",
  "Tema", "Ashaiman", "Kasoa", "Winneba", "Saltpond",
  "Techiman", "Obuasi", "Tarkwa", "Dunkwa", "Ejura",
  "Kintampo", "Mampong", "Nkawkaw", "Sefwi Wiawso", "Berekum",
  "Wenchi", "Dormaa Ahenkro", "Goaso", "Bibiani", "Axim",
  "Half Assini", "Prestea", "Bogoso", "Agona Swedru", "Mankessim",
  "Elmina", "Apam", "Mumford", "Dawhenya", "Adentan",
];

/** Ghana + ports + China only (no overseas import countries for now). */
export const SEARCH_FILTER_LOCATIONS: string[] = [
  ...new Set([
    ...GHANA_CITIES,
    ...GHANA_PORT_LOCATIONS,
    ...CHINA_CITIES.map(formatChinaLocation),
    CHINA_SELLER_LISTING_LABEL,
  ]),
].sort((a, b) => a.localeCompare(b));

export const CAR_BRANDS: string[] = [
  // ── Japanese ──────────────────────────────────────────────────────────────
  "Toyota", "Honda", "Nissan", "Mazda", "Subaru", "Suzuki",
  "Mitsubishi", "Isuzu", "Lexus", "Infiniti", "Acura",
  // ── Korean ────────────────────────────────────────────────────────────────
  "Hyundai", "Kia", "Genesis",
  // ── German ────────────────────────────────────────────────────────────────
  "Mercedes", "BMW", "Audi", "Volkswagen", "Porsche", "Opel",
  // ── American ──────────────────────────────────────────────────────────────
  "Ford", "Chevrolet", "Cadillac", "GMC", "Dodge", "Ram",
  "Jeep", "Lincoln", "Hummer", "Tesla", "Rivian",
  // ── British ───────────────────────────────────────────────────────────────
  "Land Rover", "Volvo",
  // ── French ────────────────────────────────────────────────────────────────
  "Peugeot", "Renault", "Citroen", "Dacia",
  // ── Italian ───────────────────────────────────────────────────────────────
  "Fiat", "Alfa Romeo",
  // ── Swedish ───────────────────────────────────────────────────────────────
  "Polestar",
  // ── Czech / Spanish ───────────────────────────────────────────────────────
  "Skoda", "SEAT",
  // ── Chinese passenger cars ────────────────────────────────────────────────
  "BYD", "Chery", "Geely", "Haval", "MG", "JAC", "BAIC", "Changan",
  "Lifan", "SAIC", "GAC", "Great Wall", "Dongfeng", "FAW", "Foton", "Zotye",
  // ── Chinese buses & trucks ────────────────────────────────────────────────
  "King Long", "Yutong", "Higer", "Sinotruck", "Shacman",
  // ── Other ─────────────────────────────────────────────────────────────────
  "Other",
].sort((a, b) => {
  if (a === "Other") return 1;
  if (b === "Other") return -1;
  return a.localeCompare(b);
});

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const TRANSMISSIONS = ["Automatic", "Manual", "Semi-Auto", "CVT", "DCT"];

export const CONDITIONS = ["New", "Foreign Used", "Ghana Used", "Tokunbo"];

export const CAR_CATEGORIES = [
  { id: "all",       label: "All",           icon: "grid" },
  { id: "suv",       label: "SUVs",          icon: "truck" },
  { id: "sedan",     label: "Sedans",        icon: "navigation" },
  { id: "hatchback", label: "Hatchbacks",    icon: "square" },
  { id: "coupe",     label: "Coupes",        icon: "navigation" },
  { id: "wagon",     label: "Station Wagons",icon: "navigation" },
  { id: "van",       label: "Vans",          icon: "box" },
  { id: "minibus",   label: "Minibuses",     icon: "users" },
  { id: "bus",       label: "Buses",         icon: "users" },
  { id: "pickup",    label: "Pickup Trucks", icon: "package" },
  { id: "cargo",     label: "Cargo Trucks",  icon: "package" },
  { id: "tipper",    label: "Tipper Trucks", icon: "package" },
  { id: "tanker",    label: "Tankers",       icon: "package" },
  { id: "flatbed",   label: "Flatbeds",      icon: "package" },
  { id: "excavator", label: "Excavators",    icon: "tool" },
  { id: "bulldozer", label: "Bulldozers",    icon: "tool" },
  { id: "crane",     label: "Cranes",        icon: "tool" },
  { id: "forklift",  label: "Forklifts",     icon: "tool" },
  { id: "grader",    label: "Graders",       icon: "tool" },
  { id: "loader",    label: "Front Loaders", icon: "tool" },
  { id: "compactor", label: "Compactors",    icon: "tool" },
  { id: "mixer",     label: "Concrete Mixers", icon: "tool" },
  { id: "tractor",   label: "Tractors",      icon: "tool" },
  { id: "harvester", label: "Harvesters",    icon: "tool" },
  { id: "motorcycle",label: "Motorcycles",   icon: "zap" },
  { id: "scooter",   label: "Scooters",      icon: "zap" },
  { id: "atv",       label: "ATVs / Quads",  icon: "zap" },
  { id: "dirtbike",  label: "Dirt Bikes",    icon: "zap" },
  { id: "tokunbo",   label: "Tokunbo",       icon: "star" },
  { id: "budget",    label: "Budget",        icon: "tag" },
  { id: "luxury",    label: "Luxury",        icon: "award" },
];

export const VEHICLE_TYPES = [
  // Cars
  "Sedan",
  "SUV / 4×4",
  "Hatchback",
  "Coupe",
  "Station Wagon",
  // Vans & People Carriers
  "Van",
  "Minibus",
  "Minivan",
  // Trucks
  "Pickup Truck",
  "Cargo Truck",
  "Tipper Truck",
  "Tanker Truck",
  "Flatbed Truck",
  "Box Truck",
  // Buses
  "Bus",
  "Coach Bus",
  "School Bus",
  // Heavy Equipment
  "Excavator",
  "Bulldozer",
  "Crane",
  "Forklift",
  "Front Loader",
  "Grader",
  "Compactor",
  "Concrete Mixer",
  // Agricultural
  "Tractor",
  "Combine Harvester",
  // Specialty
  "Ambulance",
  "Fire Truck",
  // Motorcycles & Powersport
  "Motorcycle",
  "Scooter",
  "ATV / Quad",
  "Dirt Bike",
];

export const PAYMENT_METHODS = [
  { id: "mtn", label: "MTN Mobile Money", icon: "smartphone" },
  { id: "vodafone", label: "Vodafone Cash", icon: "smartphone" },
  { id: "airteltigo", label: "AirtelTigo Money", icon: "smartphone" },
  { id: "bank", label: "Bank Transfer", icon: "credit-card" },
  { id: "cash", label: "Cash Payment", icon: "dollar-sign" },
];

export const RATING_CATEGORIES = [
  { id: "comfort", label: "Comfort", icon: "wind" },
  { id: "ergonomics", label: "Ergonomics", icon: "sliders" },
  { id: "performance", label: "Performance", icon: "zap" },
  { id: "safety", label: "Safety", icon: "shield" },
  { id: "reliability", label: "Reliability", icon: "check-circle" },
];

export const formatPrice = (price: number): string => {
  return `${CURRENCY_SYMBOL}${price.toLocaleString("en-GH")}`;
};

export const formatMileage = (km: number): string => {
  return `${km.toLocaleString("en-GH")} km`;
};
