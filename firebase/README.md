# Firebase project for Westcars

This folder holds everything you deploy to Firebase. The Westcars Expo app and
Westcars Admin web app talk to it through the JS SDK using the
`EXPO_PUBLIC_FIREBASE_*` and `VITE_FIREBASE_*` secrets.

## One-time setup

1. **Create a Firebase project** at https://console.firebase.google.com.
2. **Upgrade to the Blaze plan** (Cloud Functions require it).
3. **Enable Auth providers**: Email/Password, Google, and Phone.
4. **Create a Firestore database** in production mode.
5. **Enable Storage**.
6. **Add a Web App** in Project Settings → "Your apps" → Web. Copy the 6
   config values into Replit secrets:
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - And the same values mirrored as `VITE_FIREBASE_*` for the admin app.
7. **For Google Sign-In on the mobile app**, also add (optional but
   recommended for native builds):
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Install the Firebase CLI (on your local machine)

```bash
npm install -g firebase-tools
firebase login
cd firebase
firebase use --add        # pick your project, alias it as "default"
```

## Deploy

```bash
# From the firebase/ folder
firebase deploy --only firestore:rules,storage,firestore:indexes
firebase deploy --only functions
```

## Seed sample data

After deploying rules, run:

```bash
node ../scripts/seed-firestore.mjs
```

You'll need a Service Account key:

1. Firebase Console → Project Settings → Service accounts → "Generate new
   private key". Save as `firebase/serviceAccount.json` (gitignored).
2. Then `GOOGLE_APPLICATION_CREDENTIALS=./firebase/serviceAccount.json node scripts/seed-firestore.mjs`.

## Files

- `firebase.json` — project config
- `firestore.rules` — owner-only writes, public reads, admin override, no
  client-side `isAdmin` spoofing
- `storage.rules` — owner-only uploads, ID docs are private
- `firestore.indexes.json` — composite indexes for the queries the apps run
- `functions/index.js` — 6 Cloud Functions:
  1. `sendMessageNotification` — FCM push on new chat messages
  2. `processCarImages` — sanitises image URLs on car create/update
  3. `calculateCarRating` — recomputes aggregate ratings on review create
  4. `sendVerificationEmail` — generates a verification link on user create
  5. `reportContent` — bumps report count + auto-hides @ 3 reports
  6. `expireListings` — daily sweep that hides expired listings

## Notes on Phone Auth

The mobile app uses the Firebase JS SDK. Phone OTP via the JS SDK requires a
RecaptchaVerifier that is unreliable in React Native. For Play-Store-grade
phone-OTP login, install `@react-native-firebase/auth` and use a custom EAS
dev client, or wire a Twilio Verify → Cloud Function → custom-token flow.
The phone screen at `artifacts/westcars/app/auth/phone.tsx` is wired for the
UI flow; swap the `sendOtp` / `verifyOtp` functions when the backend is ready.
