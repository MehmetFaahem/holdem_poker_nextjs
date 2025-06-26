# Texas Hold'em Poker - Multiplayer Online

A real-time multiplayer Texas Hold'em poker game built with Next.js, Socket.IO, and TypeScript. Features a responsive design with a custom poker table layout and professional card handling.

## Features

- **Real-time Multiplayer**: Up to 6 players per game using Socket.IO
- **Responsive Design**: Fully responsive poker table that works on all devices
- **Professional UI**: Custom-designed poker table with realistic card and chip graphics
- **Complete Poker Logic**: Full Texas Hold'em implementation with hand evaluation
- **Interactive Controls**: Intuitive betting interface with raise sliders and quick-bet buttons
- **Game Management**: Create/join games with shareable game IDs

## Game Features

- **Texas Hold'em Rules**: Standard poker rules with preflop, flop, turn, and river
- **Blind System**: Configurable small blind ($10) and big blind ($20)
- **Starting Chips**: Each player starts with $1,000
- **Hand Evaluation**: Automatic hand ranking and winner determination
- **Player Actions**: Fold, Check, Call, Raise, and All-in options
- **Real-time Updates**: Instant game state synchronization across all players

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

### Running the Game

The game requires both a Next.js frontend and a Socket.IO backend server.

#### Option 1: Run both servers simultaneously (recommended)

```bash
npm run dev:all
```

#### Option 2: Run servers separately

Terminal 1 - Next.js frontend:

```bash
npm run dev
```

Terminal 2 - Socket.IO backend:

```bash
npm run dev:server
```

### Access the Game

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Enter your name and a game ID (or generate one)
3. Share the game ID with friends to play together
4. Start the game when you have at least 2 players

## How to Play

1. **Join a Game**: Enter your name and either create a new game ID or join an existing one
2. **Wait for Players**: Games need 2-6 players to start
3. **Start Game**: Click "Start Game" when ready (requires at least 2 players)
4. **Play Poker**: Use the action buttons to fold, check, call, raise, or go all-in
5. **Win Chips**: Best hand wins the pot, games continue with rotating dealer button

## Game Controls

- **Fold**: Give up your hand
- **Check**: Pass if no bet is required
- **Call**: Match the current bet
- **Raise**: Increase the bet (use slider or input field)
- **All-in**: Bet all remaining chips

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
│   ├── Card.tsx        # Individual card display
│   ├── PlayerSeat.tsx  # Player seat with info and cards
│   ├── ActionButtons.tsx # Betting action controls
│   ├── PokerTable.tsx  # Main game table layout
│   └── GameLobby.tsx   # Game joining interface
├── hooks/              # Custom React hooks
│   └── useSocket.ts    # Socket.IO client management
├── lib/                # Server-side logic
│   └── socket-server.ts # Socket.IO server with game logic
├── types/              # TypeScript type definitions
│   └── poker.ts        # Game types and interfaces
└── utils/              # Utility functions
    └── poker-logic.ts  # Poker hand evaluation and deck management
```

## Technical Details

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Real-time**: Socket.IO for multiplayer communication
- **State Management**: React hooks with Socket.IO integration
- **Card Images**: High-quality PNG card graphics included

## Responsive Design

The poker table automatically scales for different screen sizes:

- **Desktop**: Full-size table with all features
- **Tablet**: Scaled table (80%) optimized for touch
- **Mobile**: Compact view (60%) with touch-friendly controls

## Contributing

Feel free to contribute to this project! Some areas for improvement:

- Tournament mode
- Betting history
- Player statistics
- Sound effects
- Additional poker variants

## License

This project is for educational and entertainment purposes.
