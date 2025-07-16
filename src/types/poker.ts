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

// New interfaces for poker table API
export interface TablePlayer {
  id: number;
  position: number;
  buy_in: number;
  balance: number;
  user: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
}

export interface TableStake {
  id: number;
  blind: {
    small: number;
    big: number;
    small_formatted: string;
    big_formatted: string;
  };
  buy_in: {
    min: number;
    max: number;
    min_formatted: string;
    max_formatted: string;
  };
}

export interface PokerTable {
  id: number;
  max_players: number;
  current_players: number;
  stake: TableStake;
  players: TablePlayer[];
}

export interface JoinTableRequest {
  stake_id: number;
  buy_in: number;
}

export interface JoinTableResponse {
  data: PokerTable;
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
  smallBlindPosition?: number; // Position of small blind player
  bigBlindPosition?: number; // Position of big blind player
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
  stakeInfo?: {
    stakes: string;
    buyIn: string;
    startingChips: number;
  };
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

// New socket events for poker table
export interface PokerTableSocketEvents {
  "poker.new-player": {
    event: "poker.new-player";
    data: {
      player: TablePlayer;
      socket: any;
    };
  };
  "poker.leave-player": {
    event: "poker.leave-player";
    data: {
      player: {
        id: number;
        position: number;
      };
      socket: any;
    };
  };
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

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: "message" | "system";
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  unreadCount: number;
}
