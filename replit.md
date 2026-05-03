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

### Deploying Firebase backend
1. Create a Firebase project and **upgrade to Blaze** (Cloud Functions require it).
2. Enable Auth providers: Email/Password, Google, Phone.
3. Enable Firestore (production mode) and Storage.
4. Add the 6 Web SDK config values to Replit secrets (both `EXPO_PUBLIC_*` and `VITE_*`).
5. From your local machine: `npm i -g firebase-tools && cd firebase && firebase login && firebase use --add`.
6. `firebase deploy --only firestore:rules,storage,firestore:indexes` then `firebase deploy --only functions`.
7. `node scripts/seed-firestore.mjs` to populate sample data.

### Building the mobile app for Play Store / App Store
The Expo project intentionally has **no `android/` or `ios/` directory** — that is normal for Expo's managed workflow. Native projects are generated on demand at build time. Two options:

**Option A — EAS Build (recommended, no local Xcode/Android Studio required):**
1. `npm i -g eas-cli && eas login`
2. `cd artifacts/westcars && eas init` (this creates the EAS project and writes the real `projectId` into `app.json` → `extra.eas.projectId`, replacing the `REPLACE_WITH_EAS_PROJECT_ID` placeholder).
3. `eas build --profile production --platform android` → produces a signed `.aab` ready for Play Store internal testing.
4. `eas submit --profile production --platform android` to upload to Play Console (requires `play-store-service-account.json` — see `eas.json` `submit.production.android.serviceAccountKeyPath`).
5. For iOS: `eas build --profile production --platform ios` (requires Apple Developer membership) and update the `submit.production.ios` placeholders in `eas.json`.

**Option B — Local prebuild (eject to bare workflow):**
- `cd artifacts/westcars && npx expo prebuild` will generate `android/` and `ios/` folders from `app.json`. After this, you build with Gradle (`cd android && ./gradlew bundleRelease`) or Xcode. Most teams skip this and use EAS Build.

App identifiers in `app.json`: Android `package` = `gh.westcars.app`, iOS `bundleIdentifier` = `gh.westcars.app`. Change these BEFORE the first store submission if you want a different ID — once published, they cannot be changed.

### Play Store service account (for `eas submit`)
To let `eas submit` upload builds to Play Console without manual drag-and-drop, you need a Google service account with Play Console access:

1. **Create a Play Console developer account** ($25 one-time, https://play.google.com/console).
2. **Create your app** in Play Console → "Create app". Use package name `gh.westcars.app` (must match `app.json`).
3. **Create the service account in Google Cloud:**
   - Go to https://console.cloud.google.com/iam-admin/serviceaccounts
   - Pick the same Google Cloud project that's linked to your Firebase project (or create one).
   - Click **+ Create service account** → name it `westcars-play-publisher` → **Create and continue**.
   - Skip the optional "Grant access" step → **Done**.
   - Click the new service account → **Keys** tab → **Add key** → **Create new key** → **JSON** → downloads `xxx.json`.
4. **Save the key file** as `artifacts/westcars/play-store-service-account.json` (this path is referenced in `eas.json`). **Add this filename to `.gitignore`** — never commit it.
5. **Grant the service account Play Console access:**
   - Play Console → **Users and permissions** → **Invite new users**.
   - Email: paste the service account email (looks like `westcars-play-publisher@yourproject.iam.gserviceaccount.com`).
   - **App permissions** → add Westcars → grant **Admin (all permissions)** for first setup, or just **Release manager** + **View app information**.
   - Send invitation. The service account auto-accepts.
6. **Enable the Google Play Android Developer API** in Google Cloud Console (https://console.cloud.google.com/apis/library/androidpublisher.googleapis.com) for the same project.
7. **First submission must be manual:** Play Console requires you to upload the very first `.aab` through the web UI to create the app listing. After that, `eas submit --profile production --platform android` will push subsequent builds straight to the **internal** track (configured in `eas.json`).

Once configured: `eas build --profile production --platform android` then `eas submit --latest --platform android` is your full release loop.

### Privacy policy (required by Play Store)
Play Console requires a publicly accessible privacy-policy URL for any app that requests sensitive permissions or collects user data. The full policy is in `artifacts/westcars/PRIVACY_POLICY.md`.

**To host it (pick one):**
- **GitHub raw URL** (fastest): push the file to your `Westcar-Mobile` GitHub repo and use `https://raw.githubusercontent.com/Lyon7Sarbah/Westcar-Mobile/master/PRIVACY_POLICY.md`. Works but renders as plain text.
- **GitHub Pages** (recommended): in repo Settings → Pages → enable from `master` branch → root. Then the URL is `https://lyon7sarbah.github.io/Westcar-Mobile/PRIVACY_POLICY` (renders as HTML).
- **Notion / Google Sites / any free static host**: paste the markdown content and publish.

Then in Play Console → **App content** → **Privacy policy** → paste the URL.

### Permissions hardening (Play Store compliance)
The app now declares **only** the permissions it actually uses:
- `ACCESS_FINE_LOCATION` + `ACCESS_COARSE_LOCATION` — used in `app/(tabs)/profile.tsx` to set the user's region.
- Photo-library access is added automatically by `expo-image-picker` for the gallery picker used in `sell.tsx` and `conversation/[id].tsx`.

`app.json` explicitly **blocks** `CAMERA`, `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, and `WRITE_EXTERNAL_STORAGE` via the `android.blockedPermissions` array, and `expo-image-picker` is configured with `cameraPermission: false` and `microphonePermission: false` so the plugin does not silently re-add them. This eliminates the Play Console "permissions that require a privacy policy: CAMERA" warning and avoids being flagged for sensitive permissions the app does not use. If you ever add an in-app camera flow, re-enable `CAMERA` here.

## Branding
- Logo: `wc-badge.png` (navy rounded square with silver chrome W)
- Colors: #0066CC primary blue, #E8192C red, #0A1628 dark navy, #F5F5F5 light bg
- Font: Manrope (premium sans-serif with wide weight range)
- Dark theme: #111827 background, #1E293B card, #3B9EFF accent
