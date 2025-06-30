@echo off

echo 🧹 Cleaning up TailwindCSS configuration conflicts...

REM Remove node_modules and package-lock.json
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Remove Next.js cache
if exist .next rmdir /s /q .next

REM Remove any TailwindCSS v4 cache files
if exist .tailwindcss rmdir /s /q .tailwindcss

echo 📦 Installing dependencies...
npm install

echo 🏗️ Testing build...
npm run build

echo ✅ Ready for deployment!
echo.
echo To deploy on Render:
echo 1. Push these changes to GitHub
echo 2. In Render dashboard, trigger a manual deploy
echo 3. Build command: npm ci ^&^& npm run build
echo 4. Start command: npm start

pause 