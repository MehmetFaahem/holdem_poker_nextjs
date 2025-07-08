import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import authReducer from "./authSlice";
import stakesReducer from "./stakesSlice";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
    stakes: stakesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
