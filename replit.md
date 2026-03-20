# Westcars — Ghana's Car Marketplace

## Overview
A full-featured React Native / Expo mobile app called **Westcars** — Ghana's trusted car marketplace. Built with Expo Router for navigation.

## Artifacts

### westcars (Mobile App)
- **Kind**: Expo / React Native
- **Dir**: `artifacts/westcars`
- **Preview**: Mobile Expo app

### api-server (Backend)
- **Kind**: Express API server
- **Dir**: `artifacts/api-server`
- **Port**: 8080

## Features
- Car listings with Ghana Cedis (GHS/₵) pricing
- Comfort, ergonomics, performance, safety, reliability rating bars
- Auto-rotating ad carousel (3 sponsored ads)
- Sponsored listings in the feed
- Sell car screen with image upload (expo-image-picker)
- Real-time-simulated messaging with auto-reply
- User profiles with verified badges
- Search/filter by brand, location, fuel type, transmission, condition, price range
- Ghana-specific data: 20 cities, 28 brands, mobile money payment methods
- Category chips: All, SUVs, Sedans, Tokunbo, Budget, Luxury, Pickups, Buses

## Screens
1. **Splash** — animated logo with Ghana city rotation → navigates to Login after 3.2s
2. **Login / Signup** — simulated auth with AsyncStorage persistence
3. **Home (tab)** — greeting header, search bar, categories, ad carousel, 2-column car grid
4. **Search (tab)** — live search + filter modal (brand, location, fuel, transmission, condition, price)
5. **Sell (tab)** — photo upload, picker dropdowns for specs, price entry → adds to listings
6. **Messages (tab)** — conversation list with unread badges
7. **Profile (tab)** — listings/saved/settings tabs, stats, verification center
8. **Car Detail** — image carousel, full specs, rating bars, seller card, payment methods, related cars, Call/WhatsApp/Message CTAs
9. **Conversation** — chat bubbles, auto-reply simulation, car reference banner
10. **User Profile** — seller's listings, follow button, stats

## Tech Stack
- Expo 54 + Expo Router 6
- React Native 0.81
- TypeScript
- Inter font (400/500/600/700) via @expo-google-fonts/inter
- expo-linear-gradient, expo-blur, expo-image-picker, expo-symbols
- @expo/vector-icons (Feather)
- AsyncStorage for auth/favorites persistence
- react-native-safe-area-context
- react-native-keyboard-controller
- @tanstack/react-query

## Theme
- Primary: #FF6B00 (orange)
- Charcoal dark backgrounds
- Inter font family throughout
- Ghana flag colors influence branding

## Key Files
- `artifacts/westcars/app/_layout.tsx` — root layout with AppProvider, font loading
- `artifacts/westcars/app/(tabs)/_layout.tsx` — tab navigation (BlurView on iOS)
- `artifacts/westcars/context/AppContext.tsx` — global state, auth, favorites, messages
- `artifacts/westcars/constants/colors.ts` — theme colors
- `artifacts/westcars/utils/ghanaData.ts` — Ghana cities, brands, formatPrice()
- `artifacts/westcars/utils/mockData.ts` — 8 mock cars, 3 users, 3 ads, 2 conversations
- `artifacts/westcars/types/index.ts` — TypeScript interfaces
