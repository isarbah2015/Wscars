/**
 * One-time Firestore seeder.
 *
 * Pushes the original mock cars + users into Firestore so the live app has
 * something to display before real users sign up.
 *
 * Usage:
 *   1. Download a service-account key from Firebase Console
 *      → Project Settings → Service Accounts → Generate New Private Key.
 *      Save it as ./firebase/serviceAccount.json (gitignored).
 *
 *   2. Run from the repo root:
 *      GOOGLE_APPLICATION_CREDENTIALS=./firebase/serviceAccount.json \
 *        node scripts/seed-firestore.mjs
 *
 *   The script is idempotent — re-running overwrites the same doc IDs.
 */
import admin from "firebase-admin";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root      = resolve(__dirname, "..");

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || resolve(root, "firebase", "serviceAccount.json");

if (!existsSync(credPath)) {
  console.error(`✗ Service account key not found at: ${credPath}`);
  console.error("  Set GOOGLE_APPLICATION_CREDENTIALS or save it to firebase/serviceAccount.json.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(readFileSync(credPath, "utf-8"))),
});
const db = admin.firestore();

// ── Hand-curated mirror of the mobile-app mock data ───────────────────────
const USERS = [
  { id: "user1", name: "Kwame Asante",   phone: "+233241234567", email: "kwame@example.com",   location: "Accra",    memberSince: "2022-01-15", isVerified: true,  isDealer: false, totalListings: 12, trustScore: 88, totalSales: 11, rating: 4.8, totalReviews: 47, verification: { phone: true,  id: true,  dealer: false }, avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: "user2", name: "Ama Mensah",     phone: "+233209876543", email: "ama@example.com",     location: "Kumasi",   memberSince: "2021-06-10", isVerified: false, isDealer: false, totalListings: 5,  trustScore: 52, totalSales: 4,  rating: 4.2, totalReviews: 18, verification: { phone: true,  id: false, dealer: false }, avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "user3", name: "Kofi Boateng",   phone: "+233554567890", email: "kofi@example.com",    location: "Takoradi", memberSince: "2023-03-22", isVerified: true,  isDealer: true,  totalListings: 8,  trustScore: 94, totalSales: 7,  rating: 4.9, totalReviews: 23, verification: { phone: true,  id: true,  dealer: true  }, avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { id: "user4", name: "Abena Osei",     phone: "+233207654321", email: "abena@example.com",   location: "Accra",    memberSince: "2023-07-05", isVerified: false, isDealer: false, totalListings: 2,  trustScore: 40, totalSales: 1,  rating: 3.8, totalReviews: 4,  verification: { phone: false, id: false, dealer: false }, avatar: "https://randomuser.me/api/portraits/women/28.jpg" },
  { id: "user5", name: "Yaw Darko",      phone: "+233246789012", email: "yaw@example.com",     location: "Tema",     memberSince: "2022-11-18", isVerified: true,  isDealer: true,  totalListings: 19, trustScore: 91, totalSales: 16, rating: 4.7, totalReviews: 38, verification: { phone: true,  id: true,  dealer: true  }, avatar: "https://randomuser.me/api/portraits/men/51.jpg" },
];

const carData = (id, brand, model, year, price, mileage, condition, location, category, sellerId, views, isSponsored, isFeatured, image) => ({
  id, brand, model, year, price, mileage, condition, location, category,
  sellerId,
  seller: USERS.find((u) => u.id === sellerId)
    ? { id: sellerId, name: USERS.find((u) => u.id === sellerId).name, isVerified: USERS.find((u) => u.id === sellerId).isVerified }
    : { id: sellerId, name: "Unknown", isVerified: false },
  views, isSponsored, isFeatured,
  isHidden: false, isSold: false, reportCount: 0,
  rating: { overall: 0, comfort: 0, ergonomics: 0, performance: 0, safety: 0, reliability: 0, totalRatings: 0 },
  images: [image],
});

const CARS = [
  carData("car1",  "Toyota",        "Land Cruiser V8",  2020, 380000, 45000,  "Foreign Used", "Accra",    "suv",       "user1", 1243, false, true,  "https://images.unsplash.com/photo-1621993202908-12f2ca6c5a41?w=600"),
  carData("car2",  "Mercedes-Benz", "GLE 350",          2019, 450000, 62000,  "Foreign Used", "Kumasi",   "suv",       "user2", 876,  true,  false, "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600"),
  carData("car3",  "Toyota",        "Camry",            2018, 95000,  78000,  "Ghana Used",   "Accra",    "sedan",     "user3", 534,  false, false, "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=600"),
  carData("car4",  "Honda",         "CR-V",             2021, 195000, 28000,  "Foreign Used", "Tema",     "suv",       "user1", 2018, false, true,  "https://images.unsplash.com/photo-1617814076229-5f2ce43d6c1a?w=600"),
  carData("car5",  "Hyundai",       "Sonata",           2017, 72000,  105000, "Ghana Used",   "Accra",    "sedan",     "user2", 312,  false, false, "https://images.unsplash.com/photo-1601250504083-8e607a18edd1?w=600"),
  carData("car6",  "BMW",           "X5 xDrive40i",     2020, 520000, 32000,  "Foreign Used", "Accra",    "luxury",    "user3", 3401, true,  true,  "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600"),
  carData("car7",  "Kia",           "Sportage",         2019, 148000, 55000,  "Foreign Used", "Kumasi",   "suv",       "user1", 689,  false, false, "https://images.unsplash.com/photo-1607853202273-232359f50c94?w=600"),
  carData("car8",  "Toyota",        "Hilux",            2022, 290000, 18000,  "Foreign Used", "Takoradi", "pickup",    "user2", 921,  false, false, "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600"),
  carData("car9",  "Toyota",        "Corolla Cross",    2024, 185000, 0,      "New",          "Accra",    "suv",       "user3", 410,  false, true,  "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600"),
  carData("car10", "Nissan",        "Patrol",           2021, 410000, 38000,  "Foreign Used", "Accra",    "suv",       "user5", 1543, false, false, "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600"),
  carData("car11", "Ford",          "Ranger",           2020, 185000, 67000,  "Foreign Used", "Tema",     "pickup",    "user5", 712,  false, false, "https://images.unsplash.com/photo-1605893477799-b99e3b400b06?w=600"),
  carData("car12", "Volkswagen",    "Passat",           2019, 105000, 81000,  "Ghana Used",   "Kumasi",   "sedan",     "user1", 489,  false, false, "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600"),
  carData("car13", "Audi",          "Q7",               2018, 380000, 92000,  "Foreign Used", "Accra",    "luxury",    "user3", 1872, true,  true,  "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600"),
  carData("car14", "Mazda",         "CX-5",             2021, 168000, 24000,  "Foreign Used", "Takoradi", "suv",       "user2", 933,  false, false, "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600"),
];

const REVIEWS = [
  { id: "rev1", fromUserId: "user2", fromUserName: "Ama Mensah",   toUserId: "user1", carId: "car1", rating: 5, comment: "Very honest seller. Car was exactly as described. Smooth transaction!", fromUserAvatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "rev2", fromUserId: "user3", fromUserName: "Kofi Boateng", toUserId: "user1", carId: "car2", rating: 4, comment: "Good experience. Seller was responsive and fair on price.",                fromUserAvatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { id: "rev3", fromUserId: "user1", fromUserName: "Kwame Asante", toUserId: "user2",                rating: 4, comment: "Reliable buyer. Payment was fast. Recommended!",                          fromUserAvatar: "https://randomuser.me/api/portraits/men/32.jpg" },
];

// ── Push to Firestore ─────────────────────────────────────────────────────
async function seed() {
  console.log("→ Seeding users…");
  for (const u of USERS) {
    const { id, ...data } = u;
    await db.doc(`users/${id}`).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  console.log(`  ✓ ${USERS.length} users`);

  console.log("→ Seeding cars…");
  for (const c of CARS) {
    const { id, ...data } = c;
    await db.doc(`cars/${id}`).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }, { merge: true });
  }
  console.log(`  ✓ ${CARS.length} cars`);

  console.log("→ Seeding reviews…");
  for (const r of REVIEWS) {
    const { id, ...data } = r;
    await db.doc(`reviews/${id}`).set({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  }
  console.log(`  ✓ ${REVIEWS.length} reviews`);

  console.log("\n✅  Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
