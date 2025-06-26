# Build and Deployment Guide

This guide explains how to build and deploy the Texas Hold'em poker application with integrated Socket.IO support.

## Important Notes

⚠️ **This application uses a custom server that integrates Socket.IO with Next.js. Standard Next.js deployment methods (like `next start`) will NOT work because they don't include the Socket.IO server.**

## Development

```bash
# Install dependencies
npm install

# Start development server (includes Next.js + Socket.IO)
npm run dev
```

The application will be available at `http://localhost:3000` with Socket.IO integration.

## Production Build and Start

### 1. Build the Application

```bash
npm run build
```

This creates the optimized production build in the `.next` directory.

### 2. Start Production Server

```bash
npm start
```

This starts the custom server with integrated Socket.IO support in production mode.

**Note**: The start script uses `cross-env` to ensure compatibility across Windows, macOS, and Linux.

## Alternative Scripts

- `npm run dev:next-only` - Start only Next.js (no Socket.IO, for debugging)
- `npm run start:next-only` - Start standard Next.js production server (no Socket.IO)
- `npm run dev:old-server` - Start legacy separate Socket.IO server

## Environment Variables

### Required for Production

- `NODE_ENV=production` - Automatically set by the start script
- `PORT` - Server port (defaults to 3000)
- `HOSTNAME` - Server hostname (defaults to localhost)

### Optional for Production

- `NEXT_PUBLIC_APP_URL` - Your production domain (e.g., https://yourdomain.com)
- `VERCEL_URL` - Automatically set by Vercel deployment

## Deployment Platforms

### Vercel Deployment

1. **Important**: You need to configure Vercel to use the custom server:

```json
// vercel.json
{
  "builds": [
    {
      "src": "server-with-socketio.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server-with-socketio.js"
    }
  ]
}
```

2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_APP_URL`: Your Vercel domain

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Railway/Render Deployment

1. Set build command: `npm run build`
2. Set start command: `npm start`
3. Set environment variables as needed

### Heroku Deployment

1. Create `Procfile`:

```
web: npm start
```

2. Set environment variables in Heroku dashboard

## Troubleshooting

### "Failed to connect to server" after build

- **Cause**: Using `next start` instead of the custom server
- **Solution**: Use `npm start` which runs the custom server

### Socket.IO connection errors in production

- **Cause**: CORS or domain configuration issues
- **Solution**: Set `NEXT_PUBLIC_APP_URL` environment variable to your production domain

### Port issues in production

- **Cause**: Platform assigns dynamic ports
- **Solution**: The server automatically uses `process.env.PORT` when available

## Testing Production Build Locally

```bash
# Build the application
npm run build

# Start production server locally
npm start
```

The application should work identically to development, but optimized for production.

## Files Used by Custom Server

- `server-with-socketio.js` - Main custom server file
- `socket-lib.js` - Socket.IO game logic (CommonJS)
- `src/lib/socket-server.ts` - Socket.IO game logic (TypeScript, for library use)
- `package.json` - Scripts configuration

## Key Differences from Standard Next.js

1. **Custom Server**: Uses Node.js HTTP server instead of Next.js default server
2. **Socket.IO Integration**: Real-time communication built into the same process
3. **Single Port**: Both HTTP and WebSocket traffic on the same port
4. **Production Start**: Must use `npm start`, not `next start`
