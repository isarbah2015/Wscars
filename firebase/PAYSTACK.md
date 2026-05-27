# Paystack backend (Westcars)

Boost payments are **verified on the server** — the mobile app never activates boosts directly.

## Architecture

```
App (Paystack WebView)
  → initializeBoostPayment (callable) — creates boostPayments/{reference} pending
  → Paystack checkout
  → verifyBoostPayment (callable) — verifies with Paystack API + activates boost
  → paystackWebhook (HTTP) — same activation on charge.success (backup)
```

## One-time setup

### 1. Set the secret key (never in the app)

```bash
cd firebase
firebase login
firebase use westcar-5c1e6
firebase functions:secrets:set PAYSTACK_SECRET_KEY
# Paste sk_test_... or sk_live_...
```

### 2. Deploy functions + Firestore rules + indexes

From repo root (recommended):

```bash
./scripts/deploy-marketplace-backend.sh
```

Or from `firebase/`:

```bash
firebase deploy --only functions,firestore:rules,firestore:indexes
```

Note the webhook URL from the deploy output, e.g.:

`https://us-central1-westcar-5c1e6.cloudfunctions.net/paystackWebhook`

### 3. Register webhook in Paystack

1. [Paystack Dashboard](https://dashboard.paystack.com) → **Settings** → **API Keys & Webhooks**
2. Add webhook URL from step 2
3. Enable **charge.success**

### 4. App `.env` (public key only)

In `artifacts/westcars/.env`:

```bash
EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

Restart Expo after changes.

## Firestore

| Collection | Doc ID | Purpose |
|------------|--------|---------|
| `boostPayments` | Paystack reference | Pending → completed payment audit trail |

Clients can **read** their own payment docs; only Cloud Functions **write** boosts to `cars` and `users.sponsorship`.

## Going live

1. Paystack Dashboard → **Live** tab → copy `pk_live_` and `sk_live_`.
2. EAS: `artifacts/westcars/scripts/sync-paystack-production-eas.sh` (see `docs/android-production-paystack.md`).
3. Firebase: `firebase functions:secrets:set PAYSTACK_SECRET_KEY` with `sk_live_...`, then `firebase deploy --only functions`.
4. Paystack **Live** webhooks → same `paystackWebhook` URL, event `charge.success`.
5. EAS Android production build (`--clear-cache` after key change).
