"use client";

import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { leaveTable } from "@/store/tableSlice";
import { usePokerTableSocket } from "@/hooks/usePokerTableSocket";
import { useConfirmationModal } from "@/contexts/ConfirmationModalContext";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";
import { useSocketWithRedux } from "@/hooks/useSocketWithRedux";
import Image from "next/image";
import { useOrientation } from "@/hooks/useOrientation";

export const PokerTableView: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showConfirmation } = useConfirmationModal();
  const [isStartingGame, setIsStartingGame] = useState(false);
  const orientation = useOrientation();
  const [isMobile, setIsMobile] = useState(false);

  const { currentTable, isLeaving } = useAppSelector((state) => state.table);
  const { user } = useAppSelector((state) => state.auth);

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

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

  // Check if current user can start the game (need at least 2 players)
  const canStartGame = currentTable && currentTable.current_players >= 2;

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

  // Show landscape warning on mobile
  if (isMobile && orientation.isPortrait) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center text-white max-w-sm">
          <div className="text-5xl mb-6 animate-pulse">📱↔️</div>
          <h1 className="text-2xl font-bold mb-4">Please Rotate Your Device</h1>
          <p className="text-gray-300 mb-6">
            For the best poker experience, please rotate your device to
            landscape mode.
          </p>
          <div className="w-32 h-32 mx-auto border-4 border-gray-500 rounded-lg flex items-center justify-center animate-rotate">
            <span className="text-4xl transform rotate-90">📱</span>
          </div>
        </div>
      </div>
    );
  }

  // Function to render a player seat
  const renderPlayerSeat = (position: number, className: string) => {
    const player = currentTable.players.find((p) => p.position === position);
    const isCurrentUser = player?.user.id === user?.id;

    // Adjust seat size based on screen size
    const seatSize = isMobile ? "scale-75" : "sm:scale-90 md:scale-100";

    return (
      <div className={`absolute ${className} ${seatSize} transform-gpu`}>
        <div
          className={`bg-black w-[100px] h-[120px] rounded-full p-2 sm:p-3 border-2 ${
            player ? "border-blue-500" : "border-gray-700"
          } ${isCurrentUser ? "ring-2 ring-yellow-400" : ""}`}
        >
          {player ? (
            <div className="text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-1 bg-blue-600">
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                  {player.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px]">
                {player.user.name}
              </div>
              <div className="text-gray-400 text-xs font-mono">
                {player.balance.toLocaleString()}
              </div>
              <div className="flex flex-col gap-1 mt-1">
                {isCurrentUser && (
                  <div className="text-yellow-400 text-xs font-bold">YOU</div>
                )}
                {/* {isOwner && (
                  <div className="text-yellow-300 text-xs font-bold hidden sm:block">
                    OWNER
                  </div>
                )} */}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1">
                <span className="text-gray-400 text-xs sm:text-sm">?</span>
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Empty</div>
              <div className="text-gray-500 text-xs hidden sm:block">
                Seat {position}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-base sm:text-xl font-bold text-white">
              Table #{currentTable.id}
            </h1>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div
                className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs sm:text-sm text-gray-300">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-400">Stakes</div>
              <div className="text-white font-mono text-xs sm:text-base">
                {currentTable.stake.blind.small_formatted}/
                {currentTable.stake.blind.big_formatted}
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Refresh table data"
            >
              🔄
            </button>
            <button
              onClick={handleLeaveTable}
              disabled={isLeaving}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLeaving ? "Leaving..." : "Leave"}
            </button>
          </div>
        </div>
      </div>

      {/* Poker Table */}
      <div className="relative w-full h-[calc(100vh-60px)] sm:h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="relative w-full max-w-5xl h-full max-h-[800px]">
          {/* Table Surface - Oval Shape */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[95%] sm:w-[90%] h-[60%] sm:h-[70%]">
              {/* Poker table background */}
              <Image
                src="/images/poker_table.png"
                alt="Poker Table"
                fill
                priority
                className="object-cover rounded-[50%]"
              />

              {/* Player positions - responsive positioning */}
              {/* Top players */}
              {renderPlayerSeat(
                1,
                "top-0 left-1/4 -translate-x-1/2 -translate-y-1/2"
              )}
              {renderPlayerSeat(
                2,
                "top-0 left-3/4 -translate-x-1/2 -translate-y-1/2"
              )}

              {/* Right side player */}
              {renderPlayerSeat(
                3,
                "top-1/4 right-0 translate-x-1/2 -translate-y-1/2"
              )}
              {renderPlayerSeat(
                4,
                "top-3/4 right-0 translate-x-1/2 -translate-y-1/2"
              )}

              {/* Bottom players */}
              {renderPlayerSeat(
                5,
                "bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2"
              )}
              {renderPlayerSeat(
                6,
                "bottom-0 left-3/4 -translate-x-1/2 translate-y-1/2"
              )}

              {/* Left side player */}
              {renderPlayerSeat(
                7,
                "top-1/4 left-0 -translate-x-1/2 -translate-y-1/2"
              )}
              {renderPlayerSeat(
                8,
                "top-3/4 left-0 -translate-x-1/2 -translate-y-1/2"
              )}

              {/* Center content - Game status */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="bg-black/50 backdrop-blur-sm px-3 sm:px-6 py-2 sm:py-4 rounded-xl text-center">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">
                    Game Status
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-base mb-2 sm:mb-4">
                    {currentTable.current_players < 2
                      ? "Waiting for more players to start the game..."
                      : currentTable.current_players === 3
                      ? "3 players joined! Game will start automatically."
                      : currentTable.current_players > 3
                      ? "Game is ready to start!"
                      : "Game will start automatically when 3 players join."}
                  </p>

                  {/* Start Game Button - Any player can start when there are enough players */}
                  {canStartGame && currentTable.current_players !== 3 && (
                    <button
                      onClick={handleStartGame}
                      disabled={isStartingGame}
                      className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {isStartingGame ? (
                        <div className="flex items-center justify-center">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                          Starting...
                        </div>
                      ) : (
                        "Start Game"
                      )}
                    </button>
                  )}
                  {canStartGame && currentTable.current_players === 3 && (
                    <div className="flex items-center justify-center text-yellow-300 text-xs sm:text-sm animate-pulse">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                      Starting game automatically...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Info - Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-2 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-3xl mx-auto">
          <div>
            <div className="text-xs sm:text-sm text-gray-400">Players</div>
            <div className="text-white font-bold text-sm sm:text-base">
              {currentTable.current_players}/{currentTable.max_players}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-400">Min Buy-in</div>
            <div className="text-white font-mono text-sm sm:text-base">
              {currentTable.stake.buy_in.min_formatted}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-400">Max Buy-in</div>
            <div className="text-white font-mono text-sm sm:text-base">
              {currentTable.stake.buy_in.max_formatted}
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-gray-400">
              Your Position
            </div>
            <div className="text-white font-bold text-sm sm:text-base">
              {currentTable.players.find((p) => p.user.id === user?.id)
                ?.position || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
