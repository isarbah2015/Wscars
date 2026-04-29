# Westcars — Ghana's Car Marketplace

## Overview
A full-featured React Native / Expo mobile app called **Westcars** — Ghana's trusted car marketplace. Built with Expo Router for navigation. Glassmorphic design: soft teal `#0EB5CA` primary accent, `#EDF4F7` background, white card surfaces.

## Artifacts

### westcars (Mobile App)
- **Kind**: Expo / React Native
- **Dir**: `artifacts/westcars`
- **Preview**: Mobile Expo app

### api-server (Backend)
- **Kind**: Express API server
- **Dir**: `artifacts/api-server`
- **Port**: 8080

## Design System
- **Primary accent**: #0EB5CA (teal-cyan), secondary: #0098AA, dark: #004D5A
- **Background**: #EDF4F7, card surfaces: white with teal glow shadows
- **Fonts**: Manrope body, Raleway_800ExtraBold for brand wordmarks
- **Logo**: `wc-badge.png` — teal sports car in hexagonal shield with WESTCARS text + "Ghana's Trusted Car Marketplace" motto
- **App icon**: `icon.png` — same design on dark navy background
- **Theme**: Full dark/light mode via `ThemeContext` — all screens themed
- **Icons**: Feather icons throughout
- **Key screens**: Home, Search, Sell, Messages, Profile, Car Detail, Favourites, Advertise, Admin

## High-Tech Premium Redesign (v4)
- **Primary accent**: #FF6B00 orange (all gradient headers, active tabs, price badges)
- **Condition tabs**: Equal-width horizontal pills — all use orange (#CC3D00→#FF6B00) when active; transparent with white border when inactive
- **Sub-category tiles**: Glassmorphic rgba colors (indigo/pink/amber/green etc) on dark gradient header; no car count numbers; tap to navigate to search
- **ATV/Quad + Dirt Bike images**: Fixed with correct vehicle photos from Unsplash
- **CarCard upgraded**: LinearGradient scrim (transparent→dark), floating orange price badge at image bottom-left with glow shadow, orange "AD" badge for sponsored, meta chips for year/mileage/location; active heart turns red
- **Sponsored banner**: Orange gradient (#7A2000→#CC3D00→#FF6B00) with glass "View Offer" button
- **Advertise banner**: Purple→pink gradient (distinct from sponsored)
- **All screen headers**: Orange gradient — Home, Search, Sell, Messages, Saved, Profile
- **Sell screen**: Orange gradient header + "SELL YOUR CAR" badge; Boost card orange gradient; Submit button orange gradient
- **Messages header**: Dark red→orange gradient
- **Section headers**: Colored left accent bars (blue=For You, amber=Special Offers)
- **Tab bar**: Floating rounded tab bar with per-tab active pill highlights

## Features

### Core
- Car listings with Ghana Cedis (GHS/₵) pricing
- Comfort, ergonomics, performance, safety, reliability rating bars
- Auto-rotating ad carousel (3 sponsored ads)
- Sponsored listings in the feed
- Sell car screen with image upload (expo-image-picker)
- Real-time-simulated messaging with auto-reply
- User profiles with verified badges
- Search/filter by brand, location, fuel type, transmission, condition, price range
- Ghana-specific data: 20 cities, 28 brands, mobile money payment methods
- Category chips: SUVs, Sedans, Tokunbo, Budget, Luxury, Pickups

### 15 New Features (v2)
1. **Verification Badges** — Phone/ID/Dealer tiers shown on profile, car cards, car detail, chat
2. **Reviews & Ratings** — Star ratings + comments, aggregate display on profile
3. **Trust Score** — 0–100 calculated from verification, ratings, sales, account age; shown on profile and listings
4. **Flag & Report System** — Report listings or users with reason; auto-hide after 3 reports; admin review
5. **Safety Tips Modal** — Full safety checklist shown before every new chat opens
6. **Mark as Sold** — Seller marks car sold from 3-dot menu; SOLD overlay on card
7. **Anonymous Contact** — Toggle in settings to hide phone number from buyers
8. **Block Users** — Block from chat header; blocked users can't message, listings hidden
9. **Listing Expiration** — 30-day expiry shown on listing card; renew from 3-dot menu
10. **Admin Dashboard** — `/admin/index` route with tabs: Reports, Users, Listings, Analytics
11. **Phone Safety Warning** — Detects mismatched phone numbers in chat messages; shows inline warning
12. **Rich Media Messaging** — Image picker in chat (expo-image-picker); image preview in bubbles
13. **Chat Enhancements** — Typing indicator, read receipts (✓ / ✓✓), timestamps, delete message for self
14. **Dark/Light Theme** — ThemeContext with AsyncStorage persistence; toggle in Profile → Settings
15. **Banner Before Recommended** — Dark sponsored banner above "Personally for you" on home screen

## Screens
1. **Splash** — animated logo with cinematic dark background → navigates after 3.2s
2. **Login / Signup** — simulated auth with AsyncStorage persistence
3. **Home (tab)** — greeting header, search bar, categories, sponsored banner, 2-column car grid
4. **Search (tab)** — live search + filter modal (brand, location, fuel, transmission, condition, price)
5. **Sell (tab)** — photo upload, picker dropdowns for specs, price entry → adds to listings
6. **Messages (tab)** — conversation list with unread badges
7. **Profile (tab)** — listings/saved/reviews/settings tabs, trust score bar, verification center, dark mode toggle, block list, admin access
8. **Car Detail** — image carousel, full specs, rating bars, seller card + trust score + verification badges, mark-as-sold, report, renew listing
9. **Conversation** — safety tips modal, chat bubbles with typing indicator + read receipts + timestamps + delete, image sending, phone warning, block/report from header
10. **Admin Dashboard** — reports management, dealer approvals, listing moderation, analytics with region/category charts

## Tech Stack
- Expo 54 + Expo Router 6
- React Native 0.81
- TypeScript
- Manrope font (400/500/600/700/800) via @expo-google-fonts/manrope
- expo-linear-gradient, expo-blur, expo-image-picker
- expo-auth-session, expo-crypto, expo-web-browser (Google sign-in)
- @expo/vector-icons (Feather, AntDesign)
- AsyncStorage for auth/favorites/theme/blocks/reviews persistence
- ThemeContext (dark/light mode)
- AppContext (all app state + 15 feature actions; live Firestore subscriptions when configured)
- react-native-safe-area-context
- **Firebase JS SDK** (auth + firestore + storage) — see Firebase Backend below

## Firebase Backend

The mobile app and admin dashboard share a single Firebase project. Live data
flows through `firebase/firestore` with `onSnapshot` subscriptions; storage
uploads go to `firebase/storage`; logic lives in `firebase/functions`.

### Project layout
- `firebase/` — deployable Firebase project (rules, indexes, functions, README)
  - `firestore.rules` — owner-write / public-read; admins via `users/{uid}.isAdmin`; clients can't spoof `isAdmin` / `isVerified`
  - `storage.rules` — owner-write; ID docs are private; 10 MB cap
  - `firestore.indexes.json` — 6 composite indexes for the queries the apps run
  - `functions/index.js` — 6 Cloud Functions (sendMessageNotification, processCarImages, calculateCarRating, sendVerificationEmail, reportContent, expireListings)
  - `README.md` — full deploy + setup guide
- `scripts/seed-firestore.mjs` — one-shot seeder (firebase-admin) that pushes the original mock cars/users/reviews to Firestore
- `artifacts/westcars/lib/firebase.ts` + `artifacts/westcars-admin/src/lib/firebase.ts` — SDK init (gracefully no-ops when secrets are missing)
- `artifacts/westcars/services/firebase/*.ts` — 8 service modules (auth, cars, users, messages, reviews, reports, storage, index)
- `artifacts/westcars-admin/src/lib/firestore.ts` — admin Firestore service with mappers (mobile shape ↔ admin shape; `status` computed from `isHidden`/`isSold`/`reportCount`)

### Dual-mode data layer
Both `AppContext` (mobile) and `AdminContext` (admin) check `isFirebaseReady()`:
when secrets are present they live-subscribe to Firestore; otherwise they fall
back to `MOCK_CARS` / `MOCK_USERS` so the app keeps building without setup.

### Auth
- **Email + password** (default), **Google sign-in** (expo-auth-session), and **Phone OTP** (UI scaffolded — needs `@react-native-firebase/auth` or a Twilio-backed Cloud Function for production; see `app/auth/phone.tsx`).
- Admin login signs in with Firebase Auth, then verifies `users/{uid}.isAdmin == true` before granting access.

### Required secrets
Mobile (Expo): `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`.
Admin (Vite): mirror the same six values as `VITE_FIREBASE_*`.

Optional: `EXPO_PUBLIC_FIREBASE_DATABASE_ID` / `VITE_FIREBASE_DATABASE_ID` — set these only if your Firestore database has a custom ID instead of `(default)` (e.g. when the database was created via gcloud or named in the console). Both apps pass this as the second arg to `getFirestore(app, databaseId)` when set.
Optional Google sign-in: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.

### Deploying
1. Create a Firebase project and **upgrade to Blaze** (Cloud Functions require it).
2. Enable Auth providers: Email/Password, Google, Phone.
3. Enable Firestore (production mode) and Storage.
4. Add the 6 Web SDK config values to Replit secrets (both `EXPO_PUBLIC_*` and `VITE_*`).
5. From your local machine: `npm i -g firebase-tools && cd firebase && firebase login && firebase use --add`.
6. `firebase deploy --only firestore:rules,storage,firestore:indexes` then `firebase deploy --only functions`.
7. `node scripts/seed-firestore.mjs` to populate sample data.

## Branding
- Logo: `wc-badge.png` (navy rounded square with silver chrome W)
- Colors: #0066CC primary blue, #E8192C red, #0A1628 dark navy, #F5F5F5 light bg
- Font: Manrope (premium sans-serif with wide weight range)
- Dark theme: #111827 background, #1E293B card, #3B9EFF accent
