# iOS production build (EAS)

Build from **`artifacts/westcars`** only (not the repo root).

## One-time: Apple credentials (required)

Non-interactive CI builds fail until distribution credentials exist on Expo. Run **once** on your Mac (interactive):

```bash
cd "/Users/apple/Desktop/FUTURE APPS/Wscars/artifacts/westcars"
npx eas credentials:configure-build -p ios -e production
```

Sign in with your Apple Developer account when prompted. EAS will create or validate:

- Distribution certificate  
- Provisioning profile for `gh.westcars.app`

After this, GitHub Actions and `eas build --non-interactive` can build iOS.

## EAS production environment

These should be set under [Expo → westcars → Environment variables → production](https://expo.dev/accounts/davidsarb/projects/westcars/environment-variables):

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_FIREBASE_*` | Firebase (use the **Web** app id in Firebase console) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Sign-In on device |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Required with iOS client for id token |
| `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` | Boost checkout (`pk_live_...` for App Store) |
| `EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION` | e.g. `us-central1` |

Android keystore secrets are **not** required for iOS-only workflow runs.

## Local production build

```bash
cd "/Users/apple/Desktop/FUTURE APPS/Wscars/artifacts/westcars"
npx eas build --platform ios --profile production --clear-cache
```

## GitHub Actions

Actions → **EAS Build** → Run workflow → platform **ios** (or **all**).

Monitor: https://expo.dev/accounts/davidsarb/projects/westcars/builds

## App Store Connect (before submit)

1. Create app **Westcars**, bundle ID `gh.westcars.app` (must match `app.json`).
2. Note **Apple ID** (numeric App Store Connect app id) and **Team ID**.
3. Submit when ready:

```bash
npx eas submit --platform ios --profile production
```

Configure submit credentials interactively the first time, or add an `ios` block under `submit.production` in `eas.json` with your `appleId`, `ascAppId`, and `appleTeamId`.

## Firebase / Google

- **Firebase Auth**: production builds use `EXPO_PUBLIC_FIREBASE_*` (web app config). Do not rely on the Android-only `google-services.json` app id on iOS.
- **Google Sign-In**: `app.json` includes `iosUrlScheme` for client `778261594022-mn0nqerq73nktnl1il1878e9gk4vha9a`. Register the same bundle id in [Google Cloud Console](https://console.cloud.google.com/) → Credentials → iOS client.

## Encryption export compliance

`ITSAppUsesNonExemptEncryption` is set to `false` in `app.json` (standard HTTPS-only apps). Answer “No” for export compliance in App Store Connect if asked.
