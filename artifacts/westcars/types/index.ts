export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatar?: string;
  memberSince: string;
  isVerified: boolean;
  rating: number;
  totalReviews: number;
  totalListings: number;
}

export interface CarRating {
  overall: number;
  comfort: number;
  ergonomics: number;
  performance: number;
  safety: number;
  reliability: number;
  totalRatings: number;
}

export interface TechSpecs {
  // Quick overview
  bodyType: string;
  owners: number;
  color: string;
  trim: string;
  // General
  country: string;
  carClass: string;
  doors: number;
  seats: number;
  steering: string;
  // Dimensions (mm)
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  clearance: number;
  frontTrack: number;
  rearTrack: number;
  wheelSize: string;
  // Engine
  engineType: string;
  engineLayout: string;
  engineDisplacement: string;
  engineCode: string;
  horsepower: number;
  horsepowerRpm: string;
  torque: string;
  torqueRpm: string;
  cylinderConfig: string;
  fuelGrade: string;
  // Transmission
  gearbox: string;
  gears: number;
  drive: string;
  // Weight & Mass
  curbWeight: number;
  maxWeight: number;
  tankVolume: number;
  // Suspension & Brakes
  frontSuspension: string;
  rearSuspension: string;
  frontBrakes: string;
  rearBrakes: string;
  // Performance
  maxSpeed: number;
  acceleration: string;
  fuelCity: string;
  fuelHighway: string;
  fuelMixed: string;
  co2: string;
  euroStandard: string;
  annualTax: number;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  condition: string;
  location: string;
  description: string;
  images: string[];
  sellerId: string;
  seller?: User;
  isFeatured: boolean;
  isSponsored: boolean;
  rating: CarRating;
  createdAt: string;
  category: string;
  views?: number;
  techSpecs?: TechSpecs;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  color: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participant: User;
  carId: string;
  car: Car;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface SearchFilters {
  query: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  location: string;
  fuelType: string;
  transmission: string;
  year: number;
  condition: string;
  category: string;
}

export interface AdPackage {
  id: string;
  type: "flyer" | "video";
  duration?: number;
  period: "days" | "weeks" | "months";
  periodCount: number;
  price: number;
  label: string;
  description: string;
  popular?: boolean;
}
