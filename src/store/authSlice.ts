import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { setCookie, deleteCookie } from "cookies-next";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface ValidationErrors {
  [key: string]: string[];
}

interface ErrorResponse {
  message: string;
  errors?: ValidationErrors;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  validationErrors: ValidationErrors | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  validationErrors: null,
};

// Get base URL from environment variable
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BASE_URL || "";
};

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        // Return both the message and validation errors
        return rejectWithValue({
          message: data.message || "Login failed",
          errors: data.errors || null,
        });
      }

      // Store token in cookie for SSR compatibility
      setCookie("token", data.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return data;
    } catch (error) {
      return rejectWithValue({
        message: "Network error. Please try again.",
      });
    }
  }
);

// Register thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${getBaseUrl()}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Return both the message and validation errors
        return rejectWithValue({
          message: data.message || "Registration failed",
          errors: data.errors || null,
        });
      }

      return data;
    } catch (error) {
      return rejectWithValue({
        message: "Network error. Please try again.",
      });
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      // Remove token cookie
      deleteCookie("token");
      return null;
    } catch (error) {
      return rejectWithValue("Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.validationErrors = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // Set token cookie when credentials are manually set
      setCookie("token", action.payload.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as ErrorResponse;
        state.error = payload.message;
        state.validationErrors = payload.errors || null;
      });

    // Register cases
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.validationErrors = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as ErrorResponse;
        state.error = payload.message;
        state.validationErrors = payload.errors || null;
      });

    // Logout cases
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
    });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
