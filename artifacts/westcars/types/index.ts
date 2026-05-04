export interface VerificationStatus {
  phone: boolean;
  id: boolean;
  dealer: boolean;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  carId?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: "listing" | "user";
  reason: string;
  createdAt: string;
  status: "pending" | "reviewed" | "dismissed";
}

export interface Transaction {
  id: string;
  carId: string;
  sellerId: string;
  buyerId: string;
  confirmedAt: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  avatar?: string;
  memberSince: string;
  isVerified: boolean;
  isAdmin?: boolean;
  verification?: VerificationStatus;
  rating: number;
  totalReviews: number;
  totalListings: number;
  trustScore?: number;
  isAnonymous?: boolean;
  blockedUsers?: string[];
  totalSales?: number;
  isDealer?: boolean;
  favorites?: string[];
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
  bodyType: string;
  owners: number;
  color: string;
  trim: string;
  country: string;
  carClass: string;
  doors: number;
  seats: number;
  steering: string;
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  clearance: number;
  frontTrack: number;
  rearTrack: number;
  wheelSize: string;
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
  gearbox: string;
  gears: number;
  drive: string;
  curbWeight: number;
  maxWeight: number;
  tankVolume: number;
  frontSuspension: string;
  rearSuspension: string;
  frontBrakes: string;
  rearBrakes: string;
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
  isSold?: boolean;
  rating: CarRating;
  createdAt: string;
  expiresAt?: string;
  category: string;
  views?: number;
  techSpecs?: TechSpecs;
  reportCount?: number;
  isHidden?: boolean;
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
  mediaUrl?: string;
  mediaType?: "image" | "video" | "audio";
  isRead?: boolean;
  isDeletedForSelf?: boolean;
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
