export interface Card {
  rank: string;
  suit: string;
  image: string;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  holeCards: Card[];
  inPotThisRound: number;
  totalPotContribution: number;
  isActive: boolean;
  isFolded: boolean;
  isAllIn: boolean;
  hasActedThisRound: boolean;
  position: number;
  avatar?: string;
}

export interface GameState {
  id: string;
  players: Player[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  minimumRaise: number;
  lastRaiseAmount: number;
  dealerPosition: number;
  currentPlayerIndex: number;
  roundStartPlayerIndex: number;
  gamePhase:
    | "waiting"
    | "preflop"
    | "flop"
    | "turn"
    | "river"
    | "showdown"
    | "ended";
  smallBlind: number;
  bigBlind: number;
  maxPlayers: number;
  isStarted: boolean;
  winners?: { playerId: string; amount: number; hand: string }[];
  nextHandCountdown?: number | null;
}

export interface SocketEvents {
  "join-game": { gameId: string; playerName: string };
  "leave-game": { gameId: string; playerId: string };
  "start-game": { gameId: string };
  "player-action": {
    gameId: string;
    playerId: string;
    action: "fold" | "check" | "call" | "bet" | "raise" | "all-in";
    amount?: number;
  };
  "game-updated": GameState;
  "player-joined": Player;
  "player-left": { playerId: string };
  error: { message: string };
}

export type HandRank =
  | "royal-flush"
  | "straight-flush"
  | "four-of-a-kind"
  | "full-house"
  | "flush"
  | "straight"
  | "three-of-a-kind"
  | "two-pair"
  | "pair"
  | "high-card";

export interface HandResult {
  rank: HandRank;
  cards: Card[];
  description: string;
  value: number;
}
