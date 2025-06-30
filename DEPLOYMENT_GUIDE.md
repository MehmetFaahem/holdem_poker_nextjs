# Deployment Guide - Texas Hold'em Poker Game

## ⚠️ Important: WebSocket Requirements

This application requires **persistent WebSocket connections** for real-time multiplayer functionality. **Vercel's serverless functions DO NOT support WebSockets**, which is why you're getting connection errors.

## Deployment Options

### Option 1: Railway.app (Recommended - Free Tier Available)

**Why Railway?** Supports WebSockets, easy deployment, free tier available.

1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub repository
3. **Deploy**: Railway will automatically detect the `railway.json` config
4. **Environment Variables**: Set in Railway dashboard:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://your-app.railway.app`

**Deploy Command:**

```bash
# Railway CLI (optional)
npm install -g @railway/cli
railway login
railway link
railway up
```

### Option 2: Render.com (Free Tier Available)

**Why Render?** Supports WebSockets, similar to Heroku, free tier.

1. **Create Render Account**: Go to [render.com](https://render.com)
2. **Connect GitHub**: Link your repository
3. **Create Web Service**: Choose your repo
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Environment Variables**:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_APP_URL=https://your-app.onrender.com`

### Option 3: Heroku (Paid - $5/month minimum)

**Why Heroku?** Mature platform, excellent WebSocket support.

1. **Install Heroku CLI**: [Download here](https://devcenter.heroku.com/articles/heroku-cli)
2. **Deploy**:

```bash
heroku create your-app-name
git push heroku main
heroku config:set NODE_ENV=production
heroku config:set NEXT_PUBLIC_APP_URL=https://your-app.herokuapp.com
```

### Option 4: DigitalOcean App Platform

**Why DigitalOcean?** Good performance, WebSocket support.

1. **Create DigitalOcean Account**
2. **Create App**: Choose GitHub source
3. **Configure**:
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Environment Variables: `NODE_ENV=production`

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Test production build locally
npm start
```

## Environment Variables

Set these in your deployment platform:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-deployed-domain.com
PORT=3000  # Usually auto-set by platform
```

## Why Vercel Doesn't Work

- **Serverless Functions**: Vercel uses serverless functions that can't maintain persistent connections
- **WebSocket Limitation**: Socket.IO requires persistent connections for real-time gaming
- **Timeout Issues**: Serverless functions have execution time limits
- **Memory Constraints**: Game state needs to persist between connections

## Migrating from Vercel

If you're currently on Vercel:

1. **Choose Alternative Platform**: Railway, Render, or Heroku
2. **Export Environment Variables**: Copy from Vercel dashboard
3. **Update Domain**: Update any hardcoded URLs
4. **Test Thoroughly**: Ensure WebSocket connections work

## Testing WebSocket Connection

After deployment, open browser dev tools and check:

```javascript
// Should see successful connection
console.log("Connected to socket server");

// Should NOT see these errors
("WebSocket connection failed");
("Socket connection error");
```

## Platform Comparison

| Platform     | WebSocket Support | Free Tier | Ease of Use | Cost     |
| ------------ | ----------------- | --------- | ----------- | -------- |
| Railway      | ✅ Yes            | ✅ Yes    | ✅ Easy     | Free/$5+ |
| Render       | ✅ Yes            | ✅ Yes    | ✅ Easy     | Free/$7+ |
| Heroku       | ✅ Yes            | ❌ No     | ✅ Easy     | $5+      |
| Vercel       | ❌ No             | ✅ Yes    | ✅ Easy     | Free     |
| DigitalOcean | ✅ Yes            | ❌ No     | ⚠️ Medium   | $5+      |

## Recommendation

For this poker game, **Railway.app** is the best choice because:

- ✅ Free tier available
- ✅ Excellent WebSocket support
- ✅ Easy deployment
- ✅ Good performance for real-time games
- ✅ Automatic HTTPS
- ✅ Simple environment variable management

## Need Help?

If you encounter issues:

1. Check the platform's logs for error messages
2. Verify environment variables are set correctly
3. Test the WebSocket connection in browser dev tools
4. Ensure you're using `npm start` not `next start`
