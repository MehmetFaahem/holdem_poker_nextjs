# Texas Hold'em Poker Game

A real-time multiplayer Texas Hold'em poker game built with Next.js 13+ and Socket.IO.

## Features

- Real-time multiplayer gameplay
- Complete Texas Hold'em poker rules
- Player actions: fold, check, call, bet, raise, all-in
- Automatic game flow (preflop, flop, turn, river, showdown)
- Responsive design with modern UI
- Toast notifications for game events

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), React, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit
- **Real-time Communication**: Socket.IO
- **Backend**: Integrated Socket.IO server with Next.js custom server

## Architecture

This application uses an integrated Socket.IO server that runs alongside Next.js, eliminating the need for a separate server process. The Socket.IO server is initialized within a custom Next.js server.

### File Structure

```
texas_holdem/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utility libraries
│   ├── store/                  # Redux store configuration
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── server-with-socketio.js     # Custom Next.js server with Socket.IO
├── socket-lib.js               # Socket.IO server logic
└── server.js                   # Legacy standalone server (deprecated)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd texas_holdem
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` with Socket.IO integrated.

### Available Scripts

- `npm run dev` - Start the integrated development server (Next.js + Socket.IO)
- `npm run dev:next-only` - Start only the Next.js development server
- `npm run dev:old-server` - Start the legacy standalone Socket.IO server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## How to Play

1. Open the application in your browser
2. Enter a game ID and your player name
3. Wait for other players to join (minimum 2 players)
4. Click "Start Game" when ready
5. Use the action buttons to play:
   - **Fold**: Give up your hand
   - **Check**: Pass without betting (when no bet is required)
   - **Call**: Match the current bet
   - **Bet**: Place the first bet in a round
   - **Raise**: Increase the current bet
   - **All-in**: Bet all your remaining chips

## Socket.IO Integration

The application uses a custom Next.js server that integrates Socket.IO for real-time communication:

### Server Setup

- Custom server file: `server-with-socketio.js`
- Socket.IO logic: `socket-lib.js`
- Socket.IO path: `/api/socket`
- Default port: 3000 (same as Next.js)

### Client Connection

The frontend connects to Socket.IO using the same port as the Next.js application:

```typescript
const socket = io("http://localhost:3000", {
  path: "/api/socket",
  transports: ["websocket"],
});
```

### Game Events

**Client → Server:**

- `join-game` - Join a game room
- `leave-game` - Leave a game room
- `start-game` - Start the game
- `player-action` - Perform a poker action

**Server → Client:**

- `game-updated` - Game state changed
- `player-joined` - New player joined
- `player-left` - Player left the game
- `error` - Error occurred

## Game Logic

The poker game implements standard Texas Hold'em rules:

1. **Pre-flop**: Players receive 2 hole cards, blinds are posted
2. **Flop**: 3 community cards are revealed
3. **Turn**: 4th community card is revealed
4. **River**: 5th community card is revealed
5. **Showdown**: Players reveal hands, best hand wins

### Betting Rules

- Small blind: 10 chips
- Big blind: 20 chips
- Minimum raise: Equal to the big blind
- Players start with 1000 chips

## Development

### Adding New Features

1. **Frontend Components**: Add to `src/components/`
2. **Game Logic**: Modify `socket-lib.js`
3. **State Management**: Update Redux slices in `src/store/`
4. **Types**: Add TypeScript definitions in `src/types/`

### Debugging

- Socket.IO events are logged to the browser console
- Server logs are visible in the terminal
- Redux state can be inspected with Redux DevTools

## Production Deployment

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

For production deployment, ensure:

- Environment variables are properly set
- Socket.IO CORS is configured for your domain
- The custom server is supported by your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]
