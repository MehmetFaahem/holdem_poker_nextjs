import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameState, Player } from "@/types/poker";

interface PlayerAction {
  playerId: string;
  action: string;
  amount?: number;
  timestamp: number;
}

interface GameStateSlice {
  gameState: GameState | null;
  currentPlayer: Player | null;
  connectionStatus: "disconnected" | "connecting" | "connected";
  error: string | null;
  isLoading: boolean;
  recentActions: PlayerAction[];
}

const initialState: GameStateSlice = {
  gameState: null,
  currentPlayer: null,
  connectionStatus: "disconnected",
  error: null,
  isLoading: false,
  recentActions: [],
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Connection management
    setConnectionStatus: (
      state,
      action: PayloadAction<"disconnected" | "connecting" | "connected">
    ) => {
      state.connectionStatus = action.payload;
    },

    // Game state updates
    updateGameState: (state, action: PayloadAction<GameState>) => {
      state.gameState = action.payload;
      state.error = null;

      // Update current player if they exist in the new game state
      // This ensures we get the latest server state, including hasActedThisRound flag
      if (state.currentPlayer) {
        const updatedPlayer = action.payload.players.find(
          (p) => p.id === state.currentPlayer!.id
        );
        if (updatedPlayer) {
          console.log(`=== SYNCING CURRENT PLAYER WITH SERVER ===`);
          console.log(
            `Before: hasActedThisRound = ${state.currentPlayer.hasActedThisRound}`
          );
          console.log(
            `Server: hasActedThisRound = ${updatedPlayer.hasActedThisRound}`
          );
          state.currentPlayer = updatedPlayer;
          console.log(
            `After: hasActedThisRound = ${state.currentPlayer.hasActedThisRound}`
          );
        }
      }
    },

    // Player management
    setCurrentPlayer: (state, action: PayloadAction<Player>) => {
      state.currentPlayer = action.payload;
    },

    updateCurrentPlayer: (state, action: PayloadAction<Partial<Player>>) => {
      if (state.currentPlayer) {
        state.currentPlayer = { ...state.currentPlayer, ...action.payload };
      }
    },

    // Player actions (optimistic updates)
    playerActionStarted: (
      state,
      action: PayloadAction<{
        playerId: string;
        action: string;
        amount?: number;
      }>
    ) => {
      console.log(`=== REDUX OPTIMISTIC UPDATE ===`);
      console.log(
        `Player ${action.payload.playerId} action: ${action.payload.action}`
      );

      if (state.gameState && state.currentPlayer) {
        // Mark the player as having acted (optimistic update)
        const player = state.gameState.players.find(
          (p) => p.id === action.payload.playerId
        );
        if (player) {
          console.log(
            `Marking ${player.name} as hasActedThisRound = true (optimistic)`
          );
          player.hasActedThisRound = true;
        }

        // Update current player if it's them
        if (state.currentPlayer.id === action.payload.playerId) {
          console.log(
            `Updating current player hasActedThisRound = true (optimistic)`
          );
          state.currentPlayer.hasActedThisRound = true;
        }
      }
      state.isLoading = true;
      state.error = null;
    },

    playerActionCompleted: (state) => {
      state.isLoading = false;
    },

    playerActionFailed: (state, action: PayloadAction<string>) => {
      console.log(`=== REDUX ACTION FAILED ===`);
      console.log(`Error: ${action.payload}`);

      state.error = action.payload;
      state.isLoading = false;

      // Revert optimistic updates - be more thorough
      if (state.gameState && state.currentPlayer) {
        const player = state.gameState.players.find(
          (p) => p.id === state.currentPlayer!.id
        );
        if (player) {
          console.log(
            `Reverting ${player.name} hasActedThisRound from ${player.hasActedThisRound} to false`
          );
          player.hasActedThisRound = false;
        }
        console.log(
          `Reverting current player hasActedThisRound from ${state.currentPlayer.hasActedThisRound} to false`
        );
        state.currentPlayer.hasActedThisRound = false;
      }
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Action badge management
    addActionBadge: (
      state,
      action: PayloadAction<{
        playerId: string;
        action: string;
        amount?: number;
      }>
    ) => {
      const newAction: PlayerAction = {
        playerId: action.payload.playerId,
        action: action.payload.action,
        amount: action.payload.amount,
        timestamp: Date.now(),
      };
      console.log(`🎯 REDUX: Adding action badge`, newAction);
      state.recentActions.push(newAction);
      console.log(
        `🎯 REDUX: Total recent actions:`,
        state.recentActions.length
      );
    },

    removeActionBadge: (
      state,
      action: PayloadAction<{ playerId: string; timestamp: number }>
    ) => {
      state.recentActions = state.recentActions.filter(
        (a) =>
          !(
            a.playerId === action.payload.playerId &&
            a.timestamp === action.payload.timestamp
          )
      );
    },

    clearExpiredActions: (state) => {
      const now = Date.now();
      state.recentActions = state.recentActions.filter(
        (action) => now - action.timestamp < 3000
      );
    },

    // Reset state
    resetGame: (state) => {
      state.gameState = null;
      state.currentPlayer = null;
      state.error = null;
      state.isLoading = false;
      state.recentActions = [];
    },
  },
});

export const {
  setConnectionStatus,
  updateGameState,
  setCurrentPlayer,
  updateCurrentPlayer,
  playerActionStarted,
  playerActionCompleted,
  playerActionFailed,
  setError,
  clearError,
  setLoading,
  addActionBadge,
  removeActionBadge,
  clearExpiredActions,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
