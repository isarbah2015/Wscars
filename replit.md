# Westcars — Ghana's Car Marketplace

## Overview
Westcars is a full-featured mobile application built with React Native and Expo, designed to be Ghana's trusted car marketplace. The project aims to provide a robust platform for buying and selling vehicles, featuring detailed listings, secure messaging, and comprehensive user profiles. The application incorporates a modern, glassmorphic design with a soft teal primary accent, and supports both light and dark modes. Key capabilities include advanced search and filtering, real-time simulated messaging, and a robust admin dashboard for moderation and analytics.

## User Preferences
I prefer detailed explanations and iterative development.

## System Architecture

### Design System
The application features a premium dark/light themed design. Typography: **Sora** (700Bold, 800ExtraBold) for display headings; **Plus Jakarta Sans** (400–700, capped at SemiBold for UI text) for body/interface text. Feather icons throughout. The global font weight cap is `PlusJakartaSans_600SemiBold` for all non-display UI text (previously 800ExtraBold was used but felt too heavy). Sora 800ExtraBold is preserved for section headings and brand display only.

A premium redesign (v4) introduces an `#FF6B00` orange accent for gradients, active tabs, and price badges. Condition tabs are horizontal pills with orange active states. Sub-category tiles use glassmorphic rgba colors. Car cards are upgraded with a linear gradient scrim, a floating orange price badge, and meta chips for car details. Sponsored and advertise banners feature distinct gradient designs. All screen headers consistently use an orange gradient.

### Technical Implementation
The mobile application (`westcars`) is built with Expo / React Native, using Expo Router for navigation. The backend is an Express API server (`api-server`) running on port 8080.

**Core Features:**
- Car listings with Ghana Cedis (GHS/₵) pricing.
- Detailed car ratings (comfort, ergonomics, performance, safety, reliability).
- Auto-rotating ad carousel and sponsored listings.
- Car selling screen with image upload (expo-image-picker).
- Real-time simulated messaging with auto-reply.
- User profiles with verification badges and a Trust Score (0–100) derived from verification, ratings, sales, and account age.
- Comprehensive search and filtering by brand, location, fuel type, transmission, condition, and price range.
- Ghana-specific data, including 20 cities and 28 brands, and mobile money payment methods.
- Category chips for various car types (SUVs, Sedans, Tokunbo, Budget, Luxury, Pickups).
- Flag & Report System for listings and users, with admin review.
- Safety Tips Modal displayed before new chats.
- "Mark as Sold" functionality for sellers.
- Anonymous contact option to hide phone numbers.
- User blocking feature.
- 30-day listing expiration with renewal option.
- Admin Dashboard (`/admin/index`) for managing reports, users, listings, and analytics.
- Phone safety warning in chat for mismatched numbers.
- Rich media messaging: image, video, and audio (voice) sending. Chat input has a "+" button that reveals a tray with Photo / Video / Audio options. Audio recording via `expo-audio` (AudioModule + useAudioRecorder). Audio playback in bubbles via `useAudioPlayer`. Video shows thumbnail + play overlay. Typing indicators, read receipts, timestamps.
- Dark/Light theme toggle with AsyncStorage persistence.

**Screens:**
- **Splash:** Animated logo leading to the app.
- **Login / Signup:** Simulated authentication with AsyncStorage.
- **Home:** Greeting, search bar, categories, sponsored content, car grid.
- **Search:** Live search and filter modal.
- **Sell:** Photo upload, spec pickers, price entry.
- **Messages:** Conversation list.
- **Profile:** User details, listings, saved items, reviews, settings, verification center, dark mode toggle, block list, admin access.
- **Car Detail:** Image carousel, specs, ratings, seller info, actions.
- **Conversation:** Chat interface with safety features and media support.
- **Admin Dashboard:** Reports, user management, listing moderation, analytics.

### System Design Choices
The application uses a dual-mode data layer: when Firebase secrets are present, it live-subscribes to Firestore; otherwise, it falls back to mock data (`MOCK_CARS`, `MOCK_USERS`) for continued development. Authentication supports Email + password, Google sign-in (via `expo-auth-session`), and a scaffolded Phone OTP (requires `@react-native-firebase/auth` or a Twilio-backed Cloud Function). Admin login verifies `users/{uid}.isAdmin == true` after Firebase Auth.

## External Dependencies

- **Expo 54 + Expo Router 6**
- **React Native 0.81**
- **TypeScript**
- **@expo-google-fonts/manrope**
- **expo-linear-gradient**
- **expo-blur**
- **expo-image-picker**
- **expo-auth-session**
- **expo-crypto**
- **expo-web-browser**
- **@expo/vector-icons** (Feather, AntDesign)
- **AsyncStorage** (for persistence)
- **react-native-safe-area-context**
- **Firebase JS SDK**:
    - **Firestore** (live data subscriptions, rules, indexes)
    - **Cloud Storage** (image uploads, rules)
    - **Cloud Functions** (sendMessageNotification, processCarImages, calculateCarRating, sendVerificationEmail, reportContent, expireListings)
- **Firebase Admin SDK** (for `scripts/seed-firestore.mjs`)
- **Google Play Android Developer API** (for `eas submit` to Play Console)