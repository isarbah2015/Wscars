export const CURRENCY = "GHS";
export const CURRENCY_SYMBOL = "₵";
export const COUNTRY_CODE = "+233";

export const GHANA_CITIES = [
  "Accra",
  "Kumasi",
  "Tamale",
  "Takoradi",
  "Cape Coast",
  "Koforidua",
  "Sunyani",
  "Ho",
  "Wa",
  "Bolgatanga",
  "Tema",
  "Obuasi",
  "Techiman",
  "Winneba",
  "Kasoa",
  "Teshie",
  "Madina",
  "Ashaiman",
  "Bawku",
  "Berekum",
];

export const CAR_BRANDS = [
  // Japanese
  "Toyota",
  "Honda",
  "Nissan",
  "Mitsubishi",
  "Suzuki",
  "Mazda",
  "Subaru",
  "Isuzu",
  "Lexus",
  // Korean
  "Hyundai",
  "Kia",
  // German
  "Mercedes-Benz",
  "BMW",
  "Volkswagen",
  "Audi",
  "Opel",
  "Porsche",
  "Volvo",
  // American
  "Ford",
  "Chevrolet",
  "Jeep",
  // British / European
  "Land Rover",
  "Peugeot",
  "Renault",
  // Chinese
  "BYD",
  "Chery",
  "Haval",
  "GAC",
  "JAC",
  "Changan",
  "Geely",
  "MG",
  "Foton",
  "BAIC",
  "Dongfeng",
  // Other
  "Tata",
  "Great Wall",
  "Lifan",
  "Brilliance",
];

export const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];

export const TRANSMISSIONS = ["Automatic", "Manual"];

export const CONDITIONS = ["New", "Foreign Used", "Ghana Used", "Tokunbo"];

export const CAR_CATEGORIES = [
  { id: "all", label: "All Cars", icon: "grid" },
  { id: "suv", label: "SUVs", icon: "truck" },
  { id: "sedan", label: "Sedans", icon: "navigation" },
  { id: "tokunbo", label: "Tokunbo", icon: "star" },
  { id: "budget", label: "Budget", icon: "tag" },
  { id: "luxury", label: "Luxury", icon: "award" },
  { id: "pickup", label: "Pickups", icon: "package" },
  { id: "bus", label: "Buses", icon: "users" },
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
