import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getCookie } from "cookies-next";
import { RootState } from "./index";

export interface StakeBlind {
  small: number;
  big: number;
  small_formatted: string;
  big_formatted: string;
}

export interface StakeBuyIn {
  min: number;
  max: number;
  min_formatted: string;
  max_formatted: string;
}

export interface Stake {
  id: number;
  blind: StakeBlind;
  buy_in: StakeBuyIn;
}

interface StakesState {
  stakes: Stake[];
  loading: boolean;
  error: string | null;
}

const initialState: StakesState = {
  stakes: [],
  loading: false,
  error: null,
};

// Get base URL from environment variable
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
};

// Fetch stakes thunk
export const fetchStakes = createAsyncThunk(
  "stakes/fetchStakes",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from cookie (for client-side) or from Redux state (if available)
      const token = getCookie("token") || (getState() as RootState).auth.token;

      if (!token) {
        return rejectWithValue("Authentication required");
      }

      const response = await fetch(`${getBaseUrl()}/api/poker/stakes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return rejectWithValue("Failed to fetch stakes data");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue("Network error. Please try again.");
    }
  }
);

const stakesSlice = createSlice({
  name: "stakes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStakes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchStakes.fulfilled,
        (state, action: PayloadAction<Stake[]>) => {
          state.loading = false;
          state.stakes = action.payload;
        }
      )
      .addCase(fetchStakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = stakesSlice.actions;
export default stakesSlice.reducer;
