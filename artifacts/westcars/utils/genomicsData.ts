export type AspectRating = {
  label: string;
  value: number;
  icon: string;
};

export type CarGenomicsData = {
  overallRating: number;
  totalReviews: number;
  aspects: AspectRating[];
  positiveKeywords: string[];
  negativeKeywords: string[];
};

const DEFAULT_GENOMICS: CarGenomicsData = {
  overallRating: 4.4,
  totalReviews: 128,
  aspects: [
    { label: "Comfort",          value: 4.6, icon: "star" },
    { label: "Performance",      value: 4.3, icon: "zap" },
    { label: "Safety",           value: 4.7, icon: "shield" },
    { label: "Interior Quality", value: 4.2, icon: "sun" },
    { label: "Value",            value: 4.1, icon: "tag" },
  ],
  positiveKeywords: ["spacious", "smooth ride", "reliable", "quiet cabin", "good resale"],
  negativeKeywords: ["thirsty", "small trunk", "firm seats", "pricey parts", "road noise"],
};

const MOCK_GENOMICS: Record<string, CarGenomicsData> = {
  "Toyota Camry": {
    overallRating: 4.7,
    totalReviews: 312,
    aspects: [
      { label: "Comfort",          value: 4.8, icon: "star" },
      { label: "Performance",      value: 4.4, icon: "zap" },
      { label: "Safety",           value: 4.9, icon: "shield" },
      { label: "Interior Quality", value: 4.6, icon: "sun" },
      { label: "Value",            value: 4.7, icon: "tag" },
    ],
    positiveKeywords: ["fuel efficient", "reliable", "spacious", "smooth ride", "low maintenance"],
    negativeKeywords: ["bland styling", "road noise", "soft brakes", "dated infotainment", "firm rear seat"],
  },
  "Toyota Corolla": {
    overallRating: 4.6,
    totalReviews: 285,
    aspects: [
      { label: "Comfort",          value: 4.5, icon: "star" },
      { label: "Performance",      value: 4.0, icon: "zap" },
      { label: "Safety",           value: 4.8, icon: "shield" },
      { label: "Interior Quality", value: 4.3, icon: "sun" },
      { label: "Value",            value: 4.9, icon: "tag" },
    ],
    positiveKeywords: ["economical", "easy to park", "reliable", "low fuel", "cheap parts"],
    negativeKeywords: ["slow uphill", "small boot", "basic interior", "noisy at speed", "thin paint"],
  },
  "Honda Accord": {
    overallRating: 4.5,
    totalReviews: 198,
    aspects: [
      { label: "Comfort",          value: 4.6, icon: "star" },
      { label: "Performance",      value: 4.5, icon: "zap" },
      { label: "Safety",           value: 4.7, icon: "shield" },
      { label: "Interior Quality", value: 4.4, icon: "sun" },
      { label: "Value",            value: 4.3, icon: "tag" },
    ],
    positiveKeywords: ["sporty", "spacious cabin", "great handling", "smooth engine", "premium feel"],
    negativeKeywords: ["road noise", "stiff suspension", "expensive service", "average fuel", "small cup holders"],
  },
  "Honda CR-V": {
    overallRating: 4.6,
    totalReviews: 224,
    aspects: [
      { label: "Comfort",          value: 4.7, icon: "star" },
      { label: "Performance",      value: 4.2, icon: "zap" },
      { label: "Safety",           value: 4.8, icon: "shield" },
      { label: "Interior Quality", value: 4.5, icon: "sun" },
      { label: "Value",            value: 4.6, icon: "tag" },
    ],
    positiveKeywords: ["roomy", "fuel saver", "great visibility", "smooth ride", "family friendly"],
    negativeKeywords: ["slow acceleration", "noisy CVT", "plain interior", "limited towing", "dated screen"],
  },
  "Hyundai Elantra": {
    overallRating: 4.4,
    totalReviews: 167,
    aspects: [
      { label: "Comfort",          value: 4.4, icon: "star" },
      { label: "Performance",      value: 4.2, icon: "zap" },
      { label: "Safety",           value: 4.6, icon: "shield" },
      { label: "Interior Quality", value: 4.3, icon: "sun" },
      { label: "Value",            value: 4.7, icon: "tag" },
    ],
    positiveKeywords: ["modern design", "warranty", "feature packed", "fuel saver", "comfy seats"],
    negativeKeywords: ["road noise", "soft brakes", "small trunk", "cheap plastics", "engine drone"],
  },
  "Kia Sportage": {
    overallRating: 4.5,
    totalReviews: 189,
    aspects: [
      { label: "Comfort",          value: 4.5, icon: "star" },
      { label: "Performance",      value: 4.3, icon: "zap" },
      { label: "Safety",           value: 4.6, icon: "shield" },
      { label: "Interior Quality", value: 4.4, icon: "sun" },
      { label: "Value",            value: 4.6, icon: "tag" },
    ],
    positiveKeywords: ["bold styling", "long warranty", "comfy ride", "good tech", "spacious"],
    negativeKeywords: ["thirsty engine", "average handling", "pricey trims", "small spare", "stiff bumps"],
  },
  "Nissan Rogue": {
    overallRating: 4.3,
    totalReviews: 156,
    aspects: [
      { label: "Comfort",          value: 4.5, icon: "star" },
      { label: "Performance",      value: 4.0, icon: "zap" },
      { label: "Safety",           value: 4.6, icon: "shield" },
      { label: "Interior Quality", value: 4.2, icon: "sun" },
      { label: "Value",            value: 4.3, icon: "tag" },
    ],
    positiveKeywords: ["comfy seats", "quiet cabin", "good safety", "easy parking", "smooth"],
    negativeKeywords: ["sluggish CVT", "average fuel", "plain looks", "tight rear", "stiff plastic"],
  },
};

export function getCarGenomics(brand: string, model: string): CarGenomicsData {
  const key = `${brand} ${model}`;
  return MOCK_GENOMICS[key] || DEFAULT_GENOMICS;
}

export const GENOMICS_ACCENT = "#FF6B00";
