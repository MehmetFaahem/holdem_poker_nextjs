"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { useSocketWithRedux } from "@/hooks/useSocketWithRedux";
import { useOrientation, lockOrientation } from "@/hooks/useOrientation";
import { useConfirmationModal } from "@/contexts/ConfirmationModalContext";
import { PokerTable } from "@/components/PokerTable";
import { GameLobby } from "@/components/GameLobby";
import Welcome from "@/components/Welcome";
import { PokerTableView } from "@/components/PokerTableView";
import { LandscapeWarning } from "@/components/LandscapeWarning";
import { ChatIcon } from "@/components/ChatIcon";
import { ChatWindow } from "@/components/ChatWindow";
import { resetGame } from "@/store/gameSlice";
import { toggleChat, closeChat } from "@/store/gameSlice";
import type { StakeData } from "@/components/Stakes";

export default function GamePage() {
  // Check if user is at a poker table first
  const { currentTable } = useAppSelector((state) => state.table);

  // Only initialize the game socket if not at a poker table
  const {
    gameState,
    currentPlayer,
    connectionStatus,
    isLoading,
    chat,
    joinGame,
    joinGameWithStakes,
    leaveGame,
    startGame,
    playerAction,
    sendChatMessage,
  } = useSocketWithRedux();

  const orientation = useOrientation();
  const { showConfirmation } = useConfirmationModal();
  const dispatch = useAppDispatch();

  const [gameId, setGameId] = useState<string | null>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFromStakes, setIsFromStakes] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [clientStartedGameId, setClientStartedGameId] = useState<string | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  // Initialize Socket.IO server on component mount
  useEffect(() => {
    fetch("/api/socket").catch(console.error);
  }, []);

  // Handle orientation lock on mobile devices
  useEffect(() => {
    if (orientation.isMobile && !showWelcome) {
      // Try to lock orientation to landscape when entering the game on mobile
      lockOrientation("landscape").catch((err) => {
        console.log("Could not lock orientation:", err);
      });
    }
  }, [orientation.isMobile, showWelcome]);

  // Handle client-side sessionStorage values to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
    setIsClient(true);
    const gameTableId = sessionStorage.getItem("gameTableId");
    const gameMode = sessionStorage.getItem("gameMode");
    const startedGameId = sessionStorage.getItem("gameId");

    if (startedGameId) {
      setClientStartedGameId(startedGameId);
    }
  }, []);

  // Check if user is coming from stakes with selected data OR joining existing room
  useEffect(() => {
    const selectedStake =
      typeof window !== "undefined"
        ? sessionStorage.getItem("selectedStake")
        : null;
    const playerName =
      typeof window !== "undefined"
        ? sessionStorage.getItem("playerName")
        : null;
    const goToLobby =
      typeof window !== "undefined"
        ? sessionStorage.getItem("goToLobby")
        : null;
    const joinRoomId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("joinRoomId")
        : null;
    const joinExistingRoom =
      typeof window !== "undefined"
        ? sessionStorage.getItem("joinExistingRoom")
        : null;

    // Check if game was started from poker table
    const startedGameId = isClient ? clientStartedGameId : null;
    const gameMode =
      typeof window !== "undefined" ? sessionStorage.getItem("gameMode") : null;

    // Handle joining existing room
    if (joinRoomId && playerName && joinExistingRoom === "true") {
      setIsFromStakes(true);
      setShowWelcome(false);

      // Clear the session storage after using it
      sessionStorage.removeItem("joinRoomId");
      sessionStorage.removeItem("playerName");
      sessionStorage.removeItem("joinExistingRoom");

      // Join the existing room
      handleJoinGame(joinRoomId, playerName);
      return;
    }

    // Handle creating room with stakes
    if (selectedStake && playerName && goToLobby === "true") {
      setIsFromStakes(true);
      setShowWelcome(false);

      try {
        const stakeData = JSON.parse(selectedStake);
        // Clear the session storage after using it
        sessionStorage.removeItem("selectedStake");
        sessionStorage.removeItem("playerName");
        sessionStorage.removeItem("goToLobby");

        // Create room with the selected stakes and go directly to lobby
        handleCreateRoomWithStakes(playerName, stakeData);
      } catch (error) {
        console.error("Error parsing stake data:", error);
        // Clear session storage on error
        sessionStorage.removeItem("selectedStake");
        sessionStorage.removeItem("playerName");
        sessionStorage.removeItem("goToLobby");
        // Fallback to welcome screen
        setIsFromStakes(false);
        setShowWelcome(true);
      }
    }

    // Handle game started from poker table
    if (startedGameId && gameMode === "poker_table" && currentTable) {
      console.log("Game started from poker table:", startedGameId);
      setGameId(startedGameId);
      // setIsInGame(true); // This will be set by the useEffect below

      // Clear the session storage after using it
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("gameId");
        sessionStorage.removeItem("gameMode");
        sessionStorage.removeItem("gameTableId");
      }
    }
  }, [currentTable]);

  // Set isInGame when player joins successfully and sync gameId
  useEffect(() => {
    if (currentPlayer && gameState) {
      setIsInGame(true);
      // Sync gameId with the actual game state id
      if (gameState.id && gameId !== gameState.id) {
        setGameId(gameState.id);
      }
    } else if (!currentPlayer || !gameState) {
      // Reset local state if Redux state is cleared (e.g., when leaving game)
      setIsInGame(false);
      setGameId(null);
      setCreatedRoomId(null);
    }
  }, [currentPlayer, gameState, gameId]);

  // Auto-start game when 3 players join
  useEffect(() => {
    if (gameState && !gameState.isStarted && gameState.players.length === 3) {
      console.log("Auto-starting game with 3 players");
      handleStartGame();
    }
  }, [gameState?.players.length]);

  // Handle cleanup when Redux state is reset
  useEffect(() => {
    if (!gameState && !currentPlayer && isInGame) {
      console.log("Redux state cleared - resetting local state");
      setIsInGame(false);
      setGameId(null);
      setCreatedRoomId(null);
    }
  }, [gameState, currentPlayer, isInGame]);

  const handleJoinGame = (gameId: string, playerName: string) => {
    setGameId(gameId);
    joinGame(gameId, playerName);
  };

  const handleCreateRoom = (playerName: string) => {
    // Auto-generate a room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedRoomId(roomId);
    setGameId(roomId);

    // Join the newly created room
    joinGame(roomId, playerName);
  };

  const handleCreateRoomWithStakes = (
    playerName: string,
    stakeData: StakeData
  ) => {
    // Auto-generate a room ID
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setCreatedRoomId(roomId);
    setGameId(roomId);

    console.log("Creating room with stakes:", stakeData);

    // Join the newly created room with custom stakes
    joinGameWithStakes(roomId, playerName, stakeData);
  };

  const handleLeaveGame = async () => {
    // Show custom confirmation modal
    const shouldLeave = await showConfirmation({
      title: "Leave Game",
      message:
        "Are you sure you want to leave the game? This action cannot be undone and you will lose your current position.",
      confirmText: "Leave Game",
      cancelText: "Stay",
      confirmButtonStyle: "danger",
    });

    if (!shouldLeave) return;

    if (gameId && currentPlayer) {
      console.log(`Leaving game ${gameId} as player ${currentPlayer.name}`);
      leaveGame(gameId, currentPlayer.id);

      // Reset local state immediately
      setIsInGame(false);
      setGameId(null);
      setCreatedRoomId(null);
    } else {
      // Fallback - reset state even if gameId/currentPlayer is missing
      console.log("Force leaving game - resetting all state");
      setIsInGame(false);
      setGameId(null);
      setCreatedRoomId(null);
    }
  };

  const handlePlayerAction = (
    action: "fold" | "check" | "call" | "bet" | "raise" | "all-in",
    amount?: number
  ) => {
    if (gameId && currentPlayer) {
      playerAction(gameId, currentPlayer.id, action, amount);
    }
  };

  const handleStartGame = () => {
    console.log("=== HANDLE START GAME DEBUG ===");
    console.log("gameId:", gameId);
    console.log("gameState:", gameState);
    console.log("currentPlayer:", currentPlayer);

    const actualGameId = gameId || gameState?.id;

    if (actualGameId) {
      console.log("Calling startGame with gameId:", actualGameId);
      startGame(actualGameId);
      // Update local gameId if it was missing
      if (!gameId && gameState?.id) {
        setGameId(gameState.id);
      }
    } else {
      console.log("No gameId available in either gameId state or gameState.id");
    }
  };

  // Chat functions
  const handleToggleChat = () => {
    dispatch(toggleChat());
  };

  const handleCloseChat = () => {
    dispatch(closeChat());
  };

  const handleSendChatMessage = (message: string) => {
    const actualGameId = gameId || gameState?.id;
    if (actualGameId) {
      sendChatMessage(actualGameId, message);
    }
  };

  const handleProceedFromWelcome = () => {
    setShowWelcome(false);
  };

  // Remove these duplicate lines:
  // const gameTableId = typeof window !== "undefined" ? sessionStorage.getItem("gameTableId") : null;
  // const gameMode = typeof window !== "undefined" ? sessionStorage.getItem("gameMode") : null;
  // const startedGameId = isClient ? clientStartedGameId : null;

  // Instead, use only the client state:
  const startedGameId = isClient ? clientStartedGameId : null;

  // Prevent hydration mismatch by not rendering conditional content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🃏</div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show poker table view if user is at a table and game hasn't started
  if (currentTable && !startedGameId) {
    return <PokerTableView />;
  }

  // Show welcome screen first
  if (showWelcome) {
    return <Welcome onProceed={handleProceedFromWelcome} />;
  }

  // Show lobby if not in a game
  if (!isInGame || !gameState || !currentPlayer) {
    return (
      <div
        className={`relative ${
          orientation.isMobile ? "poker-table-container" : ""
        }`}
      >
        {/* Landscape Warning for Mobile */}
        <LandscapeWarning
          isVisible={
            orientation.isMobile && orientation.isPortrait && !showWelcome
          }
        />

        {/* Connection Status */}
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`glass px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              connectionStatus === "connected"
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : connectionStatus === "connecting"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected"
                    ? "bg-green-400 animate-pulse"
                    : connectionStatus === "connecting"
                    ? "bg-amber-400 animate-pulse"
                    : "bg-red-400 animate-pulse"
                }`}
              ></div>
              <span>
                {connectionStatus.charAt(0).toUpperCase() +
                  connectionStatus.slice(1)}
                {isLoading && " (Processing...)"}
              </span>
            </div>
          </div>
        </div>

        <div className={orientation.isMobile ? "poker-table-mobile" : ""}>
          <GameLobby
            onJoinGame={handleJoinGame}
            onCreateRoom={handleCreateRoom}
            isConnected={connectionStatus === "connected"}
            createdRoomId={createdRoomId}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${
        orientation.isMobile ? "poker-table-container" : ""
      }`}
    >
      {/* Landscape Warning for Mobile */}
      <LandscapeWarning
        isVisible={
          orientation.isMobile && orientation.isPortrait && !showWelcome
        }
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-dark p-8 rounded-2xl shadow-2xl animate-slideInUp">
            <div className="flex flex-col items-center space-x-0 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-blue-500"></div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold text-lg">
                  Processing Action
                </div>
                <div className="text-white/60 text-sm">Please wait...</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={orientation.isMobile ? "poker-table-mobile" : ""}>
        <PokerTable
          gameState={gameState}
          currentPlayer={currentPlayer}
          onPlayerAction={handlePlayerAction}
          onStartGame={handleStartGame}
        />
      </div>

      {/* Connection Status in Game */}
      <div className="fixed top-6 left-6 z-50 scale-70 lg:scale-100">
        <div
          className={`glass px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
            connectionStatus === "connected"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : connectionStatus === "connecting"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-400 animate-pulse"
                  : connectionStatus === "connecting"
                  ? "bg-amber-400 animate-pulse"
                  : "bg-red-400 animate-pulse"
              }`}
            ></div>
            <span>
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
              {isLoading && " (Processing...)"}
            </span>
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3 scale-60 lg:scale-100">
        {/* Leave Game Button */}
        <button
          onClick={handleLeaveGame}
          disabled={isLoading}
          className="btn-modern bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none border border-red-400/30"
        >
          <span className="flex items-center">
            <span className="mr-2">🚪</span>
            Leave Game
          </span>
        </button>
      </div>

      {/* Chat Components - Only show when game is started */}
      {gameState.isStarted && (
        <>
          <ChatIcon
            isOpen={chat.isOpen}
            unreadCount={chat.unreadCount}
            onClick={handleToggleChat}
          />
          <ChatWindow
            isOpen={chat.isOpen}
            messages={chat.messages}
            currentPlayerId={currentPlayer?.id || null}
            onSendMessage={handleSendChatMessage}
            onClose={handleCloseChat}
          />
        </>
      )}
    </div>
  );
}
