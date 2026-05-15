#!/bin/bash
echo "🔄 Syncing dependencies..."
pnpm install

echo "🧹 Clearing git locks..."
rm -f .git/index.lock

echo "📦 Staging all changes..."
git add .

echo "💬 Enter commit message:"
read msg

git commit -m "$msg"
git push

echo "🚀 Triggering EAS production build (AAB)..."
cd artifacts/westcars && eas build --platform android --profile production

echo "✅ Done! Check expo.dev for build status."
