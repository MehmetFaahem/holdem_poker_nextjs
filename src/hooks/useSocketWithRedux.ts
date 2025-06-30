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
  resetGame,
  addActionBadge,
} from "@/store/gameSlice";
import { GameState, Player } from "@/types/poker";
import { showToast } from "@/utils/toast";

interface StakeData {
  stakes: string;
  buyIn: string;
  minCall: number;
  maxCall: number;
  startingChips: number;
}

export const useSocketWithRedux = () => {
  const dispatch = useAppDispatch();
  const { gameState, currentPlayer, connectionStatus, error, isLoading } =
    useAppSelector((state) => state.game);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    dispatch(setConnectionStatus("connecting"));

    // Determine the correct URL for Socket.IO connection
    const socketUrl =
      process.env.NODE_ENV === "production"
        ? window.location.origin // Use current domain in production
        : "http://localhost:3000"; // Use localhost in development

    // Check if we're on Vercel (which doesn't support WebSockets)
    const isVercel =
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("vercel.com"));

    socketRef.current = io(socketUrl, {
      path: "/api/socket",
      // Use polling for Vercel, WebSocket for other platforms
      transports: isVercel ? ["polling"] : ["websocket", "polling"],
      timeout: 10000,
      retries: 3,
      upgrade: !isVercel, // Don't try to upgrade to WebSocket on Vercel
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to socket server");
      dispatch(setConnectionStatus("connected"));
      dispatch(clearError());
      showToast.success("Connected to game server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      dispatch(setConnectionStatus("disconnected"));
      showToast.warning("Disconnected from server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      dispatch(setConnectionStatus("disconnected"));
      showToast.error("Failed to connect to game server");
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
      showToast.gameUpdate(`${player.name} joined the game`);
    });

    socket.on("player-left", (data: { playerId: string }) => {
      console.log("Player left:", data.playerId);
      // The resetGame dispatch in leaveGame should handle this
      // This event is mainly for other players to see who left
    });

    socket.on("error", (errorData: { message: string }) => {
      console.error("Socket error:", errorData.message);
      dispatch(playerActionFailed(errorData.message));

      // Use specific toast types based on error message
      const message = errorData.message.toLowerCase();
      if (message.includes("not enough chips") || message.includes("chips")) {
        showToast.chips(errorData.message);
      } else if (message.includes("minimum") || message.includes("maximum")) {
        showToast.warning(errorData.message);
      } else {
        showToast.error(errorData.message);
      }
    });

    // Listen for action performed events from server (for all players)
    socket.on(
      "player-action-performed",
      (actionData: {
        playerId: string;
        playerName: string;
        action: string;
        amount?: number;
      }) => {
        console.log(
          `🎯 ACTION BADGE RECEIVED: ${actionData.playerName} performed ${
            actionData.action
          }${actionData.amount ? ` $${actionData.amount}` : ""}`
        );

        // Add action badge for the player who performed the action
        dispatch(
          addActionBadge({
            playerId: actionData.playerId,
            action: actionData.action,
            amount: actionData.amount,
          })
        );

        console.log(
          `🎯 ACTION BADGE DISPATCHED for player ${actionData.playerId}`
        );
      }
    );

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
        showToast.info(`Joining game ${gameId}...`);
      } else {
        showToast.error("Not connected to server");
      }
    },
    [connectionStatus]
  );

  // Join game with custom stakes function
  const joinGameWithStakes = useCallback(
    (gameId: string, playerName: string, stakeData: StakeData) => {
      if (socketRef.current && connectionStatus === "connected") {
        console.log(
          "Joining game with stakes:",
          gameId,
          "as",
          playerName,
          stakeData
        );
        socketRef.current.emit("join-game-with-stakes", {
          gameId,
          playerName,
          stakeData,
        });
        showToast.gameUpdate(
          `Creating room with ${stakeData.stakes} stakes...`
        );
      } else {
        showToast.error("Not connected to server");
      }
    },
    [connectionStatus]
  );

  // Leave game function
  const leaveGame = useCallback(
    (gameId: string, playerId: string) => {
      if (socketRef.current && connectionStatus === "connected") {
        console.log("Leaving game:", gameId);
        socketRef.current.emit("leave-game", { gameId, playerId });
        showToast.info("Left the game");

        // Reset Redux state immediately when leaving
        dispatch(resetGame());
      }
    },
    [connectionStatus, dispatch]
  );

  // Start game function
  const startGame = useCallback(
    (gameId: string) => {
      console.log("=== START GAME DEBUG ===");
      console.log("gameId:", gameId);
      console.log("socketRef.current:", !!socketRef.current);
      console.log("connectionStatus:", connectionStatus);

      if (socketRef.current && connectionStatus === "connected") {
        console.log("Emitting start-game event to server");
        socketRef.current.emit("start-game", { gameId });
        showToast.gameUpdate("Starting game...");
      } else {
        console.log("Cannot start game - not connected");
        showToast.error("Not connected to server");
      }
    },
    [connectionStatus]
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
        showToast.error("Not connected to server");
        return;
      }

      if (!gameState || !currentPlayer) {
        showToast.error("Game state not available");
        return;
      }

      // Prevent rapid-fire actions while a request is being processed
      if (isLoading) {
        console.log("CLIENT: Action blocked - request already in progress");
        showToast.warning("Please wait for your previous action to complete");
        return;
      }

      // Check if it's the player's turn
      const currentPlayerInGame =
        gameState.players[gameState.currentPlayerIndex];
      if (!currentPlayerInGame || currentPlayerInGame.id !== playerId) {
        showToast.warning("Not your turn");
        return;
      }

      // Check if player has already acted this round (temporarily relaxed for debugging)
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

      console.log(
        `Double-check - Player in gameState hasActed: ${playerInGameState?.hasActedThisRound}`
      );

      // TEMPORARILY DISABLED: Client-side hasActedThisRound validation
      // The server will handle duplicate action prevention
      console.log(
        `🔍 CLIENT VALIDATION (DISABLED): playerInGameState.hasActed=${playerInGameState?.hasActedThisRound}, currentPlayer.hasActed=${currentPlayer.hasActedThisRound}`
      );

      // Note: Allowing client to send action - server will validate and prevent duplicates

      // Check if player is still active
      if (currentPlayer.isFolded || currentPlayer.isAllIn) {
        showToast.warning("You cannot act");
        return;
      }

      console.log(`Sending action: ${action}${amount ? ` ${amount}` : ""}`);

      // Show action toast
      const actionMessage = amount
        ? `${action.charAt(0).toUpperCase() + action.slice(1)} $${amount}`
        : action.charAt(0).toUpperCase() + action.slice(1);
      showToast.action(actionMessage);

      // Dispatch optimistic update
      dispatch(playerActionStarted({ playerId, action, amount }));

      // Send action to server (badge will be sent from server to all players)
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
    isLoading,

    // Actions
    joinGame,
    joinGameWithStakes,
    leaveGame,
    startGame,
    playerAction,
  };
};
