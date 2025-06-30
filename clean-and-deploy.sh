#!/bin/bash

echo "🧹 Cleaning up TailwindCSS configuration conflicts..."

# Remove node_modules and package-lock.json
rm -rf node_modules
rm -f package-lock.json

# Remove Next.js cache
rm -rf .next

# Remove any TailwindCSS v4 cache files
rm -rf .tailwindcss

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Testing build..."
npm run build

echo "✅ Ready for deployment!"
echo ""
echo "To deploy on Render:"
echo "1. Push these changes to GitHub"
echo "2. In Render dashboard, trigger a manual deploy"
echo "3. Build command: npm ci && npm run build"
echo "4. Start command: npm start" 