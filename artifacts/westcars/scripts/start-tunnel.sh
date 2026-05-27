#!/usr/bin/env sh
# Reliable Expo tunnel start (uses bundled ngrok + .env authtoken).
set -e
cd "$(dirname "$0")/.."

NGROK_BIN="$(find "$(cd ../.. && pwd)/node_modules" -path '*@expo/ngrok-bin-darwin-arm64*/ngrok' -type f 2>/dev/null | head -1)"
if [ -z "$NGROK_BIN" ]; then
  echo "ngrok binary not found. Run: pnpm install"
  exit 1
fi

export PATH="$(dirname "$NGROK_BIN"):$PATH"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -n "$NGROK_AUTHTOKEN" ]; then
  "$NGROK_BIN" authtoken "$NGROK_AUTHTOKEN" >/dev/null 2>&1 || true
fi

echo "Starting Expo (tunnel) — ngrok: $NGROK_BIN"
exec pnpm exec expo start --tunnel "$@"
