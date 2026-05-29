# Android production + Paystack (live)

## Checkout flow (hosted)

Boost payments use **Paystack hosted checkout** (not an in-app WebView SDK):

1. App calls `initializeBoostPayment` (Firebase Auth) → server POSTs to Paystack `/transaction/initialize` with `sk_live_` / `sk_test_` (secret never in the app).
2. App opens `authorization_url` via `expo-web-browser` (`westcars://paystack/callback`).
3. App calls `verifyBoostPayment` → server GETs `/transaction/verify/:reference`.
4. Webhook `paystackWebhook` handles `charge.success` as backup (HMAC `x-paystack-signature`).

Set Paystack Dashboard → **Settings → Profile/Business** business name to **Westcars** (shown on checkout).

## Live keys (required for real charges)

| Where | Variable | Value |
|-------|----------|--------|
| EAS production | `EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY` | `pk_live_...` |
| Firebase secret | `PAYSTACK_SECRET_KEY` | `sk_live_...` |

Test keys (`pk_test_` / `sk_test_`) only work with Paystack test cards.

### Sync public key to EAS

```bash
cd artifacts/westcars
cp .env.production.example .env.production
# Edit .env.production — paste pk_live_... from Paystack Dashboard (Live tab)
sh scripts/sync-paystack-production-eas.sh
```

### Sync secret to Firebase

```bash
cd firebase
firebase use westcar-5c1e6
firebase functions:secrets:set PAYSTACK_SECRET_KEY
# Paste sk_live_...
firebase deploy --only functions
```

Register the live webhook URL in Paystack (Live mode):  
`https://us-central1-westcar-5c1e6.cloudfunctions.net/paystackWebhook`

## Build Android AAB

```bash
cd artifacts/westcars
npx eas build --platform android --profile production --clear-cache
```

Monitor: https://expo.dev/accounts/davidsarb/projects/westcars/builds
