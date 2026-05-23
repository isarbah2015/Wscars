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

### 2. Deploy functions + Firestore rules

```bash
firebase deploy --only functions,firestore:rules
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

- Switch to `pk_live_` in the app `.env`
- Set `PAYSTACK_SECRET_KEY` to `sk_live_` in Firebase secrets
- Re-deploy functions
- Update Paystack webhook URL if the region/project changes
