# Westcars — Ghana's Car Marketplace

A full-stack mobile + web platform for buying and selling cars in Ghana.

## Run & Operate

| Command | What it does |
|---|---|
| `pnpm --filter @workspace/westcars run dev` | Start Expo mobile app (Metro bundler) |
| `pnpm --filter @workspace/westcars-admin run dev` | Start admin dashboard (Vite) |
| `pnpm --filter @workspace/api-server run dev` | Start API server |
| `cd artifacts/westcars && npx tsc --noEmit` | Type-check mobile app |
| `cd artifacts/westcars-admin && npx tsc --noEmit` | Type-check admin (2 pre-existing @types/react version warnings in calendar.tsx + spinner.tsx — not our code) |

**Required secrets (all set):**
- `EXPO_PUBLIC_FIREBASE_*` — 6 vars for mobile app
- `VITE_FIREBASE_*` — 6 vars for admin dashboard
- `EXPO_TOKEN` — EAS build/submit

## Stack

- **Mobile**: Expo 54, Expo Router 6, React Native 0.81, TypeScript, `newArchEnabled: true`
- **Admin**: Vite + React + TypeScript, TailwindCSS, Wouter router, Recharts, Firebase v12
- **Backend**: Express API server (port from `$PORT`)
- **Database**: Firebase Firestore (named DB: `westcar-5c1e6`), Firebase Auth, Firebase Storage
- **Fonts**: Inter (body), Manrope (display)
- **Android package**: `gh.westcars.app`

## Where things live

```
artifacts/westcars/          — Expo mobile app
  lib/firebase.ts            — Firebase init (auth + db + storage) ← single source of truth
  context/AppContext.tsx     — global state, Firebase ↔ mock data switch
  services/firebase/         — Firestore CRUD (cars, users, messages, reports, reviews, storage)
  app/                       — Expo Router screens
  utils/mockData.ts          — fallback mock data (only used if Firebase secrets missing)

artifacts/westcars-admin/src/
  lib/firebase.ts            — Admin Firebase init (same project, same DB: westcar-5c1e6)
  lib/firestore.ts           — Firestore subscriptions + mutations for admin
  context/AdminContext.tsx   — live Firestore state for all admin pages
  pages/                     — Dashboard, Listings, Users, Reports, Analytics
```

## Architecture decisions

- **Single named Firestore DB (`westcar-5c1e6`)**: Both mobile app and admin hardcode this ID as default. Override via `EXPO_PUBLIC_FIREBASE_DATABASE_ID` / `VITE_FIREBASE_DATABASE_ID` for staging.
- **Firebase auth init via `require()`**: `initializeAuth` + `getReactNativePersistence` + `AsyncStorage` are all loaded with `require()` in `lib/firebase.ts`. This (a) keeps the TypeScript import layer clean, (b) prevents web bundlers from trying to import the RN-only AsyncStorage package, and (c) avoids pnpm duplicate-module issues between firebase@11 (mobile) and firebase@12 (admin) in the monorepo.
- **Metro `resolveRequest` pins all `@firebase/*`**: Intercepts every bare `@firebase/` import before normal resolution and forces v11-compatible copies from the pnpm store. `pinnedMain()` respects the `browser` field for web, `react-native` for native — this prevents `@firebase/firestore`'s Node.js build (which contains `@grpc/grpc-js`) from landing in the web bundle.
- **Auth errors propagate from context to UI**: `AppContext` auth methods (`login`, `signup`, `loginWithGoogle`, `loginWithGooglePopup`) do NOT catch Firebase errors — they let them throw. All call-sites wrap in `try/catch` and call `authErrorMessage(err)` to show the exact Firebase error (wrong password, email in use, network error, etc.).
- **Single splash flow**: Only the OS-level native splash from `app.json` (`wc-logo.png` on `#0A1628`) is shown. There is NO `app/splash.tsx` JS animation route — `app/index.tsx` redirects straight to `/auth/login` once fonts load and `SplashScreen.hideAsync()` is called. This avoids the duplicate WC logo flash users were reporting.
- **Auth screens use TouchableWithoutFeedback + `Keyboard.dismiss`** wrapper inside the ScrollView, with `keyboardShouldPersistTaps="handled"` and TextInputs that have `blurOnSubmit={false}`, `underlineColorAndroid="transparent"` and `pointerEvents="auto"`. Both screens are wrapped with `React.memo` to reduce re-render churn from parent context changes.
- **Dual-mode data layer**: `isFirebaseReady()` gates all data access. When `true`, live Firestore subscriptions run. When `false` (secrets missing), mock data renders. Auth guards exist on like/contact/chat screens.
- **Admin `isAdmin` check**: Login verifies `users/{uid}.isAdmin === true` in Firestore after Firebase Auth sign-in. Non-admin accounts are immediately signed out.

## Product

- **Mobile app**: Browse/search car listings, contact sellers (call/WhatsApp), save favourites, create listings with photo upload, real-time messaging with safety tips, user profiles with Trust Score, flag/report system, dark/light theme.
- **Admin dashboard**: Login with admin credentials → live Dashboard (stats), Listings (approve/hide/delete with double-confirm), Users (verify/block), Reports (resolve/dismiss), Analytics (charts by category, location, condition, views).

## User preferences

- Ghana Cedis (GHS / ₵) pricing throughout
- Ghana-specific data: 20 cities, 28 car brands
- Fonts: Inter (body), Manrope (display)
- Target: Google Play Store

## Gotchas

- `firebase-persistence.native.ts` and `firebase-persistence.ts` were deleted — auth init is now inlined in `lib/firebase.ts` using `require()`.
- Admin has 2 pre-existing TypeScript warnings in `src/components/ui/calendar.tsx` and `src/components/ui/spinner.tsx` caused by a `@types/react` version conflict in the pnpm monorepo. These do not affect runtime.
- `EAS_NO_VCS=1` must be set for EAS builds in this environment.
- `newArchEnabled: true` in `app.json` — new React Native architecture is on.
- Firestore collections (`cars`, `users`, `messages`, `reports`, `reviews`) are created automatically on first write — no manual setup needed.

## Pointers

- Firebase init: `artifacts/westcars/lib/firebase.ts`
- Admin Firebase: `artifacts/westcars-admin/src/lib/firebase.ts`
- Metro config: `artifacts/westcars/metro.config.js`
- Firestore security rules: set in Firebase Console for project matching `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
