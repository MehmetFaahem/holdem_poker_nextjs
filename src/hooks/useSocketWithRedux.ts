import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "./useAppSelector";
import {
  setConnectionStatus,
  updateGameState,
  setCurrentPlayer,
  playerActionStarted,
  playerActionCompleted,
  playerActionFailed,
  setError,
  clearError,
} from "@/store/gameSlice";
import { GameState, Player } from "@/types/poker";

export const useSocketWithRedux = () => {
  const dispatch = useAppDispatch();
  const { gameState, currentPlayer, connectionStatus, error, isLoading } =
    useAppSelector((state) => state.game);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    dispatch(setConnectionStatus("connecting"));

    socketRef.current = io("http://localhost:3001", {
      transports: ["websocket"],
      timeout: 5000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to socket server");
      dispatch(setConnectionStatus("connected"));
      dispatch(clearError());
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      dispatch(setConnectionStatus("disconnected"));
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      dispatch(setConnectionStatus("disconnected"));
      dispatch(setError("Failed to connect to game server"));
    });

    // Game event handlers
    socket.on("game-updated", (newGameState: GameState) => {
      console.log("Game state updated:", newGameState);
      dispatch(updateGameState(newGameState));
      dispatch(playerActionCompleted());
    });

    socket.on("player-joined", (player: Player) => {
      console.log("Player joined:", player);
      dispatch(setCurrentPlayer(player));
    });

    socket.on("error", (errorData: { message: string }) => {
      console.error("Socket error:", errorData.message);
      dispatch(playerActionFailed(errorData.message));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      dispatch(setConnectionStatus("disconnected"));
    };
  }, [dispatch]);

  // Join game function
  const joinGame = useCallback(
    (gameId: string, playerName: string) => {
      if (socketRef.current && connectionStatus === "connected") {
        console.log("Joining game:", gameId, "as", playerName);
        socketRef.current.emit("join-game", { gameId, playerName });
      } else {
        dispatch(setError("Not connected to server"));
      }
    },
    [connectionStatus, dispatch]
  );

  // Leave game function
  const leaveGame = useCallback(
    (gameId: string, playerId: string) => {
      if (socketRef.current && connectionStatus === "connected") {
        console.log("Leaving game:", gameId);
        socketRef.current.emit("leave-game", { gameId, playerId });
      }
    },
    [connectionStatus]
  );

  // Start game function
  const startGame = useCallback(
    (gameId: string) => {
      if (socketRef.current && connectionStatus === "connected") {
        console.log("Starting game:", gameId);
        socketRef.current.emit("start-game", { gameId });
      } else {
        dispatch(setError("Not connected to server"));
      }
    },
    [connectionStatus, dispatch]
  );

  // Player action function with Redux integration
  const playerAction = useCallback(
    (
      gameId: string,
      playerId: string,
      action: "fold" | "check" | "call" | "bet" | "raise" | "all-in",
      amount?: number
    ) => {
      if (!socketRef.current || connectionStatus !== "connected") {
        dispatch(setError("Not connected to server"));
        return;
      }

      if (!gameState || !currentPlayer) {
        dispatch(setError("Game state not available"));
        return;
      }

      // Check if it's the player's turn
      const currentPlayerInGame =
        gameState.players[gameState.currentPlayerIndex];
      if (!currentPlayerInGame || currentPlayerInGame.id !== playerId) {
        dispatch(setError("Not your turn"));
        return;
      }

      // Check if player has already acted this round
      console.log(`=== CLIENT ACTION VALIDATION ===`);
      console.log(
        `Player ${currentPlayer.name}: hasActedThisRound = ${currentPlayer.hasActedThisRound}`
      );
      console.log(`Current phase: ${gameState.gamePhase}`);
      console.log(
        `All players: ${gameState.players
          .map((p) => `${p.name}:acted=${p.hasActedThisRound}`)
          .join(", ")}`
      );

      // Double-check with the player in gameState (more reliable than currentPlayer)
      const playerInGameState = gameState.players.find(
        (p) => p.id === playerId
      );
      const hasActedCheck =
        playerInGameState?.hasActedThisRound || currentPlayer.hasActedThisRound;

      console.log(
        `Double-check - Player in gameState hasActed: ${playerInGameState?.hasActedThisRound}`
      );
      console.log(`Final hasActed check: ${hasActedCheck}`);

      if (hasActedCheck) {
        console.log(
          `CLIENT ERROR: Player ${currentPlayer.name} has already acted this round!`
        );
        dispatch(setError("You have already acted this round"));
        return;
      }

      // Check if player is still active
      if (currentPlayer.isFolded || currentPlayer.isAllIn) {
        dispatch(setError("You cannot act"));
        return;
      }

      console.log(`Sending action: ${action}${amount ? ` ${amount}` : ""}`);

      // Dispatch optimistic update
      dispatch(playerActionStarted({ playerId, action, amount }));

      // Send action to server
      socketRef.current.emit("player-action", {
        gameId,
        playerId,
        action,
        amount,
      });
    },
    [connectionStatus, gameState, currentPlayer, dispatch]
  );

  return {
    // State
    gameState,
    currentPlayer,
    connectionStatus,
    error,
    isLoading,

    // Actions
    joinGame,
    leaveGame,
    startGame,
    playerAction,

    // Utilities
    clearError: () => dispatch(clearError()),
  };
};
