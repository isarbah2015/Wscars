#!/usr/bin/env bash
# Deploy Firestore rules, indexes, and Cloud Functions for Westcars marketplace features.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/firebase"

echo "==> Deploying Firestore rules + indexes..."
firebase deploy --only firestore:rules,firestore:indexes

echo ""
echo "==> Deploying Cloud Functions (Paystack, saved-search alerts, expiry reminders)..."
echo "    Ensure secret is set: firebase functions:secrets:set PAYSTACK_SECRET_KEY"
firebase deploy --only functions

echo ""
echo "Done. Next steps:"
echo "  1. artifacts/westcars/.env — set EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_..."
echo "  2. Paystack Dashboard webhook → https://us-central1-westcar-5c1e6.cloudfunctions.net/paystackWebhook"
echo "  3. Restart Expo: cd artifacts/westcars && npx expo start --clear"
