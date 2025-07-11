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
}

// Load table state from localStorage on initialization
const loadTableState = (): TableState => {
  if (typeof window === "undefined") {
    return {
      currentTable: null,
      loading: false,
      error: null,
      isJoining: false,
      isLeaving: false,
    };
  }

  try {
    const savedTable = localStorage.getItem("pokerTable");
    if (savedTable) {
      const parsedTable = JSON.parse(savedTable);
      return {
        currentTable: parsedTable,
        loading: false,
        error: null,
        isJoining: false,
        isLeaving: false,
      };
    }
  } catch (error) {
    console.error("Failed to load table state from localStorage:", error);
  }

  return {
    currentTable: null,
    loading: false,
    error: null,
    isJoining: false,
    isLeaving: false,
  };
};

const initialState: TableState = loadTableState();

// Get base URL from environment variable
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
};

// Join table thunk
export const joinTable = createAsyncThunk(
  "table/joinTable",
  async (request: JoinTableRequest, { rejectWithValue, getState }) => {
    try {
      const token = getCookie("token") || (getState() as RootState).auth.token;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${getBaseUrl()}/api/poker/tables/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to join table");
      }

      const data: JoinTableResponse = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

// Leave table thunk
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
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to leave table");
      }

      return null;
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
    setCurrentTable: (state, action: PayloadAction<PokerTable>) => {
      state.currentTable = action.payload;
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("pokerTable", JSON.stringify(action.payload));
      }
    },
    updateTablePlayer: (state, action: PayloadAction<TablePlayer>) => {
      if (state.currentTable) {
        const existingPlayerIndex = state.currentTable.players.findIndex(
          (p) => p.id === action.payload.id
        );
        if (existingPlayerIndex >= 0) {
          state.currentTable.players[existingPlayerIndex] = action.payload;
        } else {
          state.currentTable.players.push(action.payload);
          state.currentTable.current_players =
            state.currentTable.players.length;
        }
        // Save updated table to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "pokerTable",
            JSON.stringify(state.currentTable)
          );
        }
      }
    },
    removeTablePlayer: (state, action: PayloadAction<number>) => {
      if (state.currentTable) {
        state.currentTable.players = state.currentTable.players.filter(
          (p) => p.id !== action.payload
        );
        state.currentTable.current_players = state.currentTable.players.length;
        // Save updated table to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "pokerTable",
            JSON.stringify(state.currentTable)
          );
        }
      }
    },
    clearTable: (state) => {
      state.currentTable = null;
      state.error = null;
      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("pokerTable");
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
      .addCase(
        joinTable.fulfilled,
        (state, action: PayloadAction<PokerTable>) => {
          state.isJoining = false;
          state.currentTable = action.payload;
          state.error = null;
          // Save to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem("pokerTable", JSON.stringify(action.payload));
          }
        }
      )
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
        // Clear from localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("pokerTable");
        }
      })
      .addCase(leaveTable.rejected, (state, action) => {
        state.isLeaving = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentTable,
  updateTablePlayer,
  removeTablePlayer,
  clearTable,
} = tableSlice.actions;

export default tableSlice.reducer;
