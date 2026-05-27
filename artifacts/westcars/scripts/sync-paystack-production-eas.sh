#!/usr/bin/env sh
# Push live Paystack public key to EAS production (never commits secrets).
set -e
cd "$(dirname "$0")/.."

KEY=""
if [ -n "$EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY" ]; then
  KEY="$EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY"
elif [ -f .env.production ]; then
  KEY=$(grep '^EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY=' .env.production | cut -d= -f2- | tr -d '\r')
fi

if [ -z "$KEY" ]; then
  echo "Missing EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY."
  echo "Set it in .env.production or export it, then re-run."
  exit 1
fi

case "$KEY" in
  pk_live_*) ;;
  *)
    echo "Refusing to sync: key must start with pk_live_ (got ${KEY%%_*}_***)."
    exit 1
    ;;
esac

npx eas env:create production \
  --name EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY \
  --value "$KEY" \
  --visibility plaintext \
  --environment production \
  --non-interactive --force

echo "EAS production EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY updated (live mode)."
