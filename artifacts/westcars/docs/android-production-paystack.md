# Android production + Paystack (live)

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
