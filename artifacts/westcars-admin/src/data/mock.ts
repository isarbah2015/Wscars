export type CarCondition = "Foreign Used" | "Ghana Used" | "New";
export type CarCategory = "suv" | "sedan" | "luxury" | "pickup" | "van" | "hatchback" | "motorcycle";

export interface Seller {
  id: string;
  name: string;
  isVerified: boolean;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: CarCondition;
  location: string;
  category: CarCategory;
  seller: Seller;
  views: number;
  isSponsored: boolean;
  isFeatured: boolean;
  status: "active" | "pending" | "hidden" | "sold";
  createdAt: string;
  images: string[];
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  isVerified: boolean;
  isDealer: boolean;
  totalListings: number;
  trustScore: number;
  status: "active" | "blocked";
  avatar: string;
}

export interface Report {
  id: string;
  type: "listing" | "user" | "message";
  targetId: string;
  targetName: string;
  reason: string;
  reportedBy: string;
  createdAt: string;
  status: "open" | "resolved" | "dismissed";
}

export const MOCK_USERS: AppUser[] = [
  { id: "user1", name: "Kwame Asante", email: "kwame@example.com", phone: "+233241234567", location: "Accra", memberSince: "2022-01-15", isVerified: true, isDealer: false, totalListings: 12, trustScore: 88, status: "active", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "user2", name: "Ama Mensah", email: "ama@example.com", phone: "+233209876543", location: "Kumasi", memberSince: "2021-06-10", isVerified: false, isDealer: false, totalListings: 5, trustScore: 52, status: "active", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "user3", name: "Kofi Boateng", email: "kofi@example.com", phone: "+233554567890", location: "Takoradi", memberSince: "2023-03-22", isVerified: true, isDealer: true, totalListings: 8, trustScore: 94, status: "active", avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { id: "user4", name: "Abena Osei", email: "abena@example.com", phone: "+233207654321", location: "Accra", memberSince: "2023-07-05", isVerified: false, isDealer: false, totalListings: 2, trustScore: 40, status: "blocked", avatar: "https://randomuser.me/api/portraits/women/28.jpg" },
  { id: "user5", name: "Yaw Darko", email: "yaw@example.com", phone: "+233246789012", location: "Tema", memberSince: "2022-11-18", isVerified: true, isDealer: true, totalListings: 19, trustScore: 91, status: "active", avatar: "https://randomuser.me/api/portraits/men/51.jpg" },
  { id: "user6", name: "Akosua Frimpong", email: "akosua@example.com", phone: "+233203456789", location: "Kumasi", memberSince: "2024-01-10", isVerified: false, isDealer: false, totalListings: 1, trustScore: 30, status: "active", avatar: "https://randomuser.me/api/portraits/women/63.jpg" },
];

const sellers: Record<string, Seller> = {
  user1: { id: "user1", name: "Kwame Asante", isVerified: true },
  user2: { id: "user2", name: "Ama Mensah", isVerified: false },
  user3: { id: "user3", name: "Kofi Boateng", isVerified: true },
  user5: { id: "user5", name: "Yaw Darko", isVerified: true },
};

export const MOCK_CARS: Car[] = [
  { id: "car1", brand: "Toyota", model: "Land Cruiser V8", year: 2020, price: 380000, mileage: 45000, condition: "Foreign Used", location: "Accra", category: "suv", seller: sellers.user1, views: 1243, isSponsored: false, isFeatured: true, status: "active", createdAt: "2024-01-10", images: ["https://images.unsplash.com/photo-1621993202908-12f2ca6c5a41?w=400"] },
  { id: "car2", brand: "Mercedes-Benz", model: "GLE 350", year: 2019, price: 450000, mileage: 62000, condition: "Foreign Used", location: "Kumasi", category: "suv", seller: sellers.user2, views: 876, isSponsored: true, isFeatured: false, status: "active", createdAt: "2024-01-08", images: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400"] },
  { id: "car3", brand: "Toyota", model: "Camry", year: 2018, price: 95000, mileage: 78000, condition: "Ghana Used", location: "Accra", category: "sedan", seller: sellers.user3, views: 534, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-05", images: ["https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=400"] },
  { id: "car4", brand: "Honda", model: "CR-V", year: 2021, price: 195000, mileage: 28000, condition: "Foreign Used", location: "Tema", category: "suv", seller: sellers.user1, views: 2018, isSponsored: false, isFeatured: true, status: "active", createdAt: "2024-01-12", images: ["https://images.unsplash.com/photo-1617814076229-5f2ce43d6c1a?w=400"] },
  { id: "car5", brand: "Hyundai", model: "Sonata", year: 2017, price: 72000, mileage: 105000, condition: "Ghana Used", location: "Accra", category: "sedan", seller: sellers.user2, views: 312, isSponsored: false, isFeatured: false, status: "pending", createdAt: "2024-01-02", images: ["https://images.unsplash.com/photo-1601250504083-8e607a18edd1?w=400"] },
  { id: "car6", brand: "BMW", model: "X5 xDrive40i", year: 2020, price: 520000, mileage: 32000, condition: "Foreign Used", location: "Accra", category: "luxury", seller: sellers.user3, views: 3401, isSponsored: true, isFeatured: true, status: "active", createdAt: "2024-01-14", images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400"] },
  { id: "car7", brand: "Kia", model: "Sportage", year: 2019, price: 148000, mileage: 55000, condition: "Foreign Used", location: "Kumasi", category: "suv", seller: sellers.user1, views: 689, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-07", images: ["https://images.unsplash.com/photo-1607853202273-232359f50c94?w=400"] },
  { id: "car8", brand: "Toyota", model: "Hilux", year: 2022, price: 290000, mileage: 18000, condition: "Foreign Used", location: "Takoradi", category: "pickup", seller: sellers.user2, views: 921, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-09", images: ["https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400"] },
  { id: "car9", brand: "Toyota", model: "Corolla Cross", year: 2024, price: 185000, mileage: 0, condition: "New", location: "Accra", category: "suv", seller: sellers.user3, views: 410, isSponsored: false, isFeatured: true, status: "pending", createdAt: "2024-01-15", images: ["https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400"] },
  { id: "car10", brand: "Lexus", model: "ES 300h", year: 2023, price: 420000, mileage: 0, condition: "New", location: "Accra", category: "luxury", seller: sellers.user1, views: 893, isSponsored: true, isFeatured: true, status: "active", createdAt: "2024-01-16", images: ["https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400"] },
  { id: "car11", brand: "Toyota", model: "HiAce GL", year: 2020, price: 165000, mileage: 38000, condition: "Foreign Used", location: "Kumasi", category: "van", seller: sellers.user2, views: 455, isSponsored: false, isFeatured: false, status: "hidden", createdAt: "2024-01-06", images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"] },
  { id: "car12", brand: "Volkswagen", model: "Golf 8 GTI", year: 2021, price: 220000, mileage: 22000, condition: "Foreign Used", location: "Accra", category: "hatchback", seller: sellers.user3, views: 1102, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-11", images: ["https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=400"] },
  { id: "car13", brand: "Honda", model: "CB650R", year: 2022, price: 38000, mileage: 8500, condition: "Foreign Used", location: "Accra", category: "motorcycle", seller: sellers.user1, views: 334, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-08", images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400"] },
  { id: "car14", brand: "Yamaha", model: "MT-07", year: 2021, price: 32000, mileage: 14000, condition: "Foreign Used", location: "Tema", category: "motorcycle", seller: sellers.user2, views: 218, isSponsored: false, isFeatured: false, status: "active", createdAt: "2024-01-04", images: ["https://images.unsplash.com/photo-1594819047050-99defaec5e38?w=400"] },
];

export const MOCK_REPORTS: Report[] = [
  { id: "r1", type: "listing", targetId: "car5", targetName: "Hyundai Sonata 2017", reason: "Misleading description — odometer may have been tampered.", reportedBy: "Yaw Darko", createdAt: "2024-01-16", status: "open" },
  { id: "r2", type: "user", targetId: "user4", targetName: "Abena Osei", reason: "Multiple fake listings and no response to buyers.", reportedBy: "Kwame Asante", createdAt: "2024-01-15", status: "open" },
  { id: "r3", type: "listing", targetId: "car11", targetName: "Toyota HiAce GL 2020", reason: "Price listed is significantly above market — suspected fraud.", reportedBy: "Ama Mensah", createdAt: "2024-01-14", status: "resolved" },
  { id: "r4", type: "message", targetId: "conv1", targetName: "Conversation #conv1", reason: "Buyer was asked to pay via external bank transfer upfront.", reportedBy: "Kofi Boateng", createdAt: "2024-01-13", status: "dismissed" },
  { id: "r5", type: "listing", targetId: "car3", targetName: "Toyota Camry 2018", reason: "Images appear to be taken from internet, not the actual car.", reportedBy: "Akosua Frimpong", createdAt: "2024-01-12", status: "open" },
];

export function formatPrice(p: number) {
  return `GHS ${p.toLocaleString()}`;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
