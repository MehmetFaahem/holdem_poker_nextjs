"use client";

import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { leaveTable } from "@/store/tableSlice";
import { usePokerTableSocket } from "@/hooks/usePokerTableSocket";
import { useConfirmationModal } from "@/contexts/ConfirmationModalContext";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";
import { useSocketWithRedux } from "@/hooks/useSocketWithRedux";

export const PokerTableView: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showConfirmation } = useConfirmationModal();
  const [isStartingGame, setIsStartingGame] = useState(false);

  const { currentTable, isLeaving } = useAppSelector((state) => state.table);
  const { user } = useAppSelector((state) => state.auth);

  // Get socket functions for starting the game
  const { startGame } = useSocketWithRedux();

  // Connect to the poker table socket
  const { disconnect, isConnected } = usePokerTableSocket(
    currentTable?.id || null
  );

  const handleLeaveTable = async () => {
    const shouldLeave = await showConfirmation({
      title: "Leave Table",
      message:
        "Are you sure you want to leave the table? You will lose your current position and chips.",
      confirmText: "Leave Table",
      cancelText: "Stay",
      confirmButtonStyle: "danger",
    });

    if (!shouldLeave) return;

    try {
      await dispatch(leaveTable()).unwrap();
      disconnect();
      showToast.success("Left the table");
      router.push("/stakes");
    } catch (error) {
      console.error("Failed to leave table:", error);
      showToast.error("Failed to leave table");
    }
  };

  const handleStartGame = async () => {
    const shouldStart = await showConfirmation({
      title: "Start Game",
      message:
        "Are you sure you want to start the poker game? All players will be notified.",
      confirmText: "Start Game",
      cancelText: "Cancel",
      confirmButtonStyle: "primary",
    });

    if (!shouldStart) return;

    setIsStartingGame(true);
    try {
      if (!currentTable) {
        throw new Error("No table found");
      }

      // Generate a game ID based on the table ID
      const gameId = `table_${currentTable.id}`;

      // Store the game data for the actual game
      if (typeof window !== "undefined") {
        sessionStorage.setItem("gameTableId", currentTable.id.toString());
        sessionStorage.setItem("gameMode", "poker_table");
        sessionStorage.setItem("gameId", gameId);
      }

      // Start the game using the existing socket system
      startGame(gameId);

      showToast.success("Game started successfully!");

      // The game page will handle the transition to actual gameplay
      // The socket events will update the game state automatically
    } catch (error) {
      console.error("Failed to start game:", error);
      showToast.error("Failed to start game");
    } finally {
      setIsStartingGame(false);
    }
  };

  // Check if current user can start the game (e.g., is the table owner or has permission)
  const canStartGame = currentTable && currentTable.current_players >= 2;
  const isTableOwner =
    currentTable?.players.find((p) => p.user.id === user?.id)?.position === 1;

  if (!currentTable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🃏</div>
          <h1 className="text-2xl font-bold mb-2">No Table Found</h1>
          <p className="text-gray-400 mb-4">
            You are not currently at a poker table.
          </p>
          <button
            onClick={() => router.push("/stakes")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find a Table
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">
              Table #{currentTable.id}
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-sm text-gray-300">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Stakes</div>
              <div className="text-white font-mono">
                {currentTable.stake.blind.small_formatted}/
                {currentTable.stake.blind.big_formatted}
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Refresh table data"
            >
              🔄
            </button>
            <button
              onClick={handleLeaveTable}
              disabled={isLeaving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLeaving ? "Leaving..." : "Leave Table"}
            </button>
          </div>
        </div>
      </div>

      {/* Table Info */}
      <div className="p-6">
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-400">Players</div>
              <div className="text-white font-bold">
                {currentTable.current_players}/{currentTable.max_players}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Min Buy-in</div>
              <div className="text-white font-mono">
                {currentTable.stake.buy_in.min_formatted}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Max Buy-in</div>
              <div className="text-white font-mono">
                {currentTable.stake.buy_in.max_formatted}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Your Position</div>
              <div className="text-white font-bold">
                {currentTable.players.find((p) => p.user.id === user?.id)
                  ?.position || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: currentTable.max_players }, (_, index) => {
            const player = currentTable.players.find(
              (p) => p.position === index + 1
            );
            const isCurrentUser = player?.user.id === user?.id;
            const isOwner = player?.position === 1;

            return (
              <div
                key={index}
                className={`bg-gray-800 rounded-lg p-4 border-2 ${
                  player ? "border-blue-500" : "border-gray-700"
                } ${isCurrentUser ? "ring-2 ring-yellow-400" : ""}`}
              >
                {player ? (
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isOwner ? "bg-yellow-600" : "bg-blue-600"
                      }`}
                    >
                      <span className="text-white font-bold text-lg">
                        {player.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-white font-medium text-sm truncate">
                      {player.user.name}
                    </div>
                    <div className="text-gray-400 text-xs font-mono">
                      {player.balance.toLocaleString()} chips
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                      {isCurrentUser && (
                        <div className="text-yellow-400 text-xs font-bold">
                          YOU
                        </div>
                      )}
                      {isOwner && (
                        <div className="text-yellow-300 text-xs font-bold">
                          OWNER
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-400">?</span>
                    </div>
                    <div className="text-gray-400 text-sm">Empty Seat</div>
                    <div className="text-gray-500 text-xs">
                      Position {index + 1}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Game Status */}
        <div className="mt-6 text-center">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-2">Game Status</h3>
            <p className="text-gray-300 mb-4">
              {currentTable.current_players < 2
                ? "Waiting for more players to start the game..."
                : "Game is ready to start!"}
            </p>

            {/* Start Game Button */}
            {canStartGame && isTableOwner && (
              <button
                onClick={handleStartGame}
                disabled={isStartingGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isStartingGame ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Starting Game...
                  </div>
                ) : (
                  "Start Game"
                )}
              </button>
            )}

            {canStartGame && !isTableOwner && (
              <p className="text-gray-400 text-sm">
                Waiting for the table owner to start the game...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
