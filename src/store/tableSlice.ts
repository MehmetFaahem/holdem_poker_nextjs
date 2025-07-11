import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCookie } from "cookies-next";
import { RootState } from "./index";
import {
  PokerTable,
  JoinTableRequest,
  JoinTableResponse,
  TablePlayer,
} from "@/types/poker";

interface TableState {
  currentTable: PokerTable | null;
  loading: boolean;
  error: string | null;
  isJoining: boolean;
  isLeaving: boolean;
  isConnectedToTable: boolean;
  tableChannel: string | null;
}

const initialState: TableState = {
  currentTable: null,
  loading: false,
  error: null,
  isJoining: false,
  isLeaving: false,
  isConnectedToTable: false,
  tableChannel: null,
};

// Get base URL from environment variable
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
};

// Join table thunk
export const joinTable = createAsyncThunk(
  "table/joinTable",
  async (
    { stakeId, buyIn }: { stakeId: number; buyIn: number },
    { rejectWithValue, getState }
  ) => {
    try {
      // Get token from cookie or Redux state
      const token = getCookie("token") || (getState() as RootState).auth.token;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${getBaseUrl()}/api/poker/tables/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          stake_id: stakeId,
          buy_in: buyIn,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to join table");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Leave table thunk (for future use)
export const leaveTable = createAsyncThunk(
  "table/leaveTable",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getCookie("token") || (getState() as RootState).auth.token;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${getBaseUrl()}/api/poker/tables/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to leave table");
      }

      return true;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTable: (state) => {
      state.currentTable = null;
      state.error = null;
      state.isJoining = false;
      state.isConnectedToTable = false;
      state.tableChannel = null;
    },
    setTableConnection: (
      state,
      action: PayloadAction<{ connected: boolean; channel?: string }>
    ) => {
      state.isConnectedToTable = action.payload.connected;
      if (action.payload.channel) {
        state.tableChannel = action.payload.channel;
      }
      if (!action.payload.connected) {
        state.tableChannel = null;
      }
    },
    addPlayerToTable: (state, action: PayloadAction<TablePlayer>) => {
      if (state.currentTable) {
        const existingPlayerIndex = state.currentTable.players.findIndex(
          (p) => p.id === action.payload.id
        );
        if (existingPlayerIndex === -1) {
          state.currentTable.players.push(action.payload);
        } else {
          // Update existing player
          state.currentTable.players[existingPlayerIndex] = action.payload;
        }
        state.currentTable.current_players = state.currentTable.players.length;

        // Log the update
        console.log("Table state updated after player join:", {
          players: state.currentTable.players,
          currentPlayers: state.currentTable.current_players,
        });
      }
    },
    removePlayerFromTable: (
      state,
      action: PayloadAction<{ id: number; position: number }>
    ) => {
      if (state.currentTable) {
        const playersBefore = state.currentTable.players.length;
        state.currentTable.players = state.currentTable.players.filter(
          (p) => p.id !== action.payload.id
        );
        state.currentTable.current_players = state.currentTable.players.length;

        // Log the update
        console.log("Table state updated after player leave:", {
          playerId: action.payload.id,
          playersBefore,
          playersAfter: state.currentTable.current_players,
        });
      }
    },
    updatePlayerInTable: (state, action: PayloadAction<TablePlayer>) => {
      if (state.currentTable) {
        const playerIndex = state.currentTable.players.findIndex(
          (p) => p.id === action.payload.id
        );
        if (playerIndex !== -1) {
          // Keep existing player data that might not be in the update
          const existingPlayer = state.currentTable.players[playerIndex];
          state.currentTable.players[playerIndex] = {
            ...existingPlayer,
            ...action.payload,
          };

          // Log the update
          console.log("Table state updated after player update:", {
            playerId: action.payload.id,
            oldData: existingPlayer,
            newData: state.currentTable.players[playerIndex],
          });
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Join table cases
    builder
      .addCase(joinTable.pending, (state) => {
        state.isJoining = true;
        state.error = null;
      })
      .addCase(joinTable.fulfilled, (state, action) => {
        state.isJoining = false;
        state.currentTable = action.payload;
        state.error = null;
        state.tableChannel = `poker.table.${action.payload.id}`;
      })
      .addCase(joinTable.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload as string;
      });

    // Leave table cases
    builder
      .addCase(leaveTable.pending, (state) => {
        state.isLeaving = true;
        state.error = null;
      })
      .addCase(leaveTable.fulfilled, (state) => {
        state.isLeaving = false;
        state.currentTable = null;
        state.error = null;
      })
      .addCase(leaveTable.rejected, (state, action) => {
        state.isLeaving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearTable,
  setTableConnection,
  addPlayerToTable,
  removePlayerFromTable,
  updatePlayerInTable,
} = tableSlice.actions;
export default tableSlice.reducer;
