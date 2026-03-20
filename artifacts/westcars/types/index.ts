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
