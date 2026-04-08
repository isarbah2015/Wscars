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
- @expo/vector-icons (Feather)
- AsyncStorage for auth/favorites/theme/blocks/reviews persistence
- ThemeContext (dark/light mode)
- AppContext (all app state + 15 feature actions)
- react-native-safe-area-context

## Branding
- Logo: `wc-badge.png` (navy rounded square with silver chrome W)
- Colors: #0066CC primary blue, #E8192C red, #0A1628 dark navy, #F5F5F5 light bg
- Font: Manrope (premium sans-serif with wide weight range)
- Dark theme: #111827 background, #1E293B card, #3B9EFF accent
