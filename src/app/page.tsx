"use client";

import { useEffect, useState } from "react";
import { useSocketWithRedux } from "@/hooks/useSocketWithRedux";
import { GameLobby } from "@/components/GameLobby";
import { PokerTable } from "@/components/PokerTable";

export default function Home() {
  const {
    gameState,
    currentPlayer,
    connectionStatus,
    error,
    isLoading,
    joinGame,
    leaveGame,
    startGame,
    playerAction,
    clearError,
  } = useSocketWithRedux();

  const [gameId, setGameId] = useState<string | null>(null);
  const [isInGame, setIsInGame] = useState(false);

  // Initialize Socket.IO server on component mount
  useEffect(() => {
    fetch("/api/socket").catch(console.error);
  }, []);

  // Set isInGame when player joins successfully
  useEffect(() => {
    if (currentPlayer && gameState) {
      setIsInGame(true);
    }
  }, [currentPlayer, gameState]);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleJoinGame = (gameId: string, playerName: string) => {
    setGameId(gameId);
    joinGame(gameId, playerName);
  };

  const handleLeaveGame = () => {
    if (gameId && currentPlayer) {
      leaveGame(gameId, currentPlayer.id);
      setIsInGame(false);
      setGameId(null);
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
    if (gameId) {
      startGame(gameId);
    }
  };

  // Show lobby if not in a game
  if (!isInGame || !gameState || !currentPlayer) {
    return (
      <div className="relative">
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

        {/* Error Display */}
        {error && (
          <div className="fixed top-20 right-6 z-50 max-w-md animate-slideInUp">
            <div className="glass bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl shadow-lg">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm font-medium">{error}</p>
                </div>
                <button
                  onClick={clearError}
                  className="ml-4 text-red-400 hover:text-red-300 text-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        <GameLobby
          onJoinGame={handleJoinGame}
          isConnected={connectionStatus === "connected"}
          error={error}
          onClearError={clearError}
        />
      </div>
    );
  }

  return (
    <div className="relative">
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

      <PokerTable
        gameState={gameState}
        currentPlayer={currentPlayer}
        onPlayerAction={handlePlayerAction}
      />

      {/* Connection Status in Game */}
      <div className="fixed top-6 left-6 z-50">
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

      {/* Error Display in Game */}
      {error && (
        <div className="fixed top-20 left-6 z-50 max-w-md animate-slideInUp">
          <div className="glass bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-4 text-red-400 hover:text-red-300 text-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        {!gameState.isStarted && gameState.players.length >= 2 && (
          <button
            onClick={handleStartGame}
            disabled={isLoading}
            className="btn-modern bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none border border-green-400/30"
          >
            <span className="flex items-center">
              <span className="mr-2">🚀</span>
              Start Game
            </span>
          </button>
        )}

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
    </div>
  );
}
