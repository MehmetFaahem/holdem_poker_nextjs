"use client";

import { GameState, Player } from "@/types/poker";
import { PlayerSeat } from "./PlayerSeat";
import { Card } from "./Card";
import { ActionButtons } from "./ActionButtons";

interface PokerTableProps {
  gameState: GameState;
  currentPlayer: Player | null;
  onPlayerAction: (
    action: "fold" | "check" | "call" | "bet" | "raise" | "all-in",
    amount?: number
  ) => void;
}

// Hand ranking descriptions for better UX
const getHandDescription = (
  handRank: string
): { title: string; description: string; color: string } => {
  const handDescriptions: {
    [key: string]: { title: string; description: string; color: string };
  } = {
    "royal-flush": {
      title: "Royal Flush",
      description: "A, K, Q, J, 10 of the same suit - The ultimate hand!",
      color: "from-purple-500 to-pink-500",
    },
    "straight-flush": {
      title: "Straight Flush",
      description: "Five cards in sequence, all of the same suit",
      color: "from-blue-500 to-purple-500",
    },
    "four-of-a-kind": {
      title: "Four of a Kind",
      description: "Four cards of the same rank",
      color: "from-red-500 to-orange-500",
    },
    "full-house": {
      title: "Full House",
      description: "Three of a kind plus a pair",
      color: "from-green-500 to-blue-500",
    },
    flush: {
      title: "Flush",
      description: "Five cards of the same suit",
      color: "from-teal-500 to-green-500",
    },
    straight: {
      title: "Straight",
      description: "Five cards in sequence",
      color: "from-yellow-500 to-orange-500",
    },
    "three-of-a-kind": {
      title: "Three of a Kind",
      description: "Three cards of the same rank",
      color: "from-indigo-500 to-blue-500",
    },
    "two-pair": {
      title: "Two Pair",
      description: "Two different pairs",
      color: "from-pink-500 to-red-500",
    },
    pair: {
      title: "One Pair",
      description: "Two cards of the same rank",
      color: "from-gray-500 to-slate-500",
    },
    "high-card": {
      title: "High Card",
      description: "Highest card wins",
      color: "from-gray-400 to-gray-600",
    },
  };

  return handDescriptions[handRank] || handDescriptions["high-card"];
};

export const PokerTable: React.FC<PokerTableProps> = ({
  gameState,
  currentPlayer,
  onPlayerAction,
}) => {
  const isCurrentPlayerTurn =
    currentPlayer &&
    gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

  const myPlayer = currentPlayer
    ? gameState.players.find((p) => p.id === currentPlayer.id)
    : null;

  // Function to render a player seat
  const renderPlayerSeat = (position: number, className: string) => {
    const player = gameState.players.find((p) => p.position === position);
    const isDealer = gameState.dealerPosition === position;
    const isCurrentPlayerAtSeat =
      gameState.currentPlayerIndex ===
      gameState.players.findIndex((p) => p.position === position);

    return (
      <div className={`absolute ${className} z-20`}>
        <PlayerSeat
          player={player || null}
          isCurrentPlayer={isCurrentPlayerAtSeat}
          isDealer={isDealer}
          showCards={
            player?.id === currentPlayer?.id ||
            gameState.gamePhase === "showdown"
          }
          position={position}
          className="player-seat transform scale-90"
        />
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Main Table Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
        <div className="relative w-full max-w-6xl h-full max-h-[800px] min-h-[600px]">
          {/* Poker Table */}
          <div className="relative w-full h-full">
            {/* Table Surface - Oval Shape */}
            <div className="absolute inset-4 md:inset-8 bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-full shadow-2xl border-4 md:border-8 border-yellow-600">
              {/* Inner felt with border */}
              <div className="absolute inset-2 md:inset-4 bg-gradient-to-br from-green-700 to-green-800 rounded-full border-2 md:border-4 border-yellow-500 shadow-inner">
                {/* Community Cards Area - Center */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="flex flex-col items-center space-y-3 md:space-y-4">
                    {/* Game Phase */}
                    <div className="glass px-3 md:px-4 py-2 rounded-xl">
                      <div className="text-white font-bold text-sm md:text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        {gameState.gamePhase.toUpperCase()}
                      </div>
                    </div>

                    {/* Community Cards */}
                    <div className="flex space-x-1 md:space-x-2">
                      {gameState.communityCards.map((card, index) => (
                        <div
                          key={index}
                          className="animate-cardDeal"
                          style={{ animationDelay: `${index * 0.2}s` }}
                        >
                          <Card
                            card={card}
                            size="medium"
                            className="poker-card transform hover:scale-105 transition-all duration-300"
                          />
                        </div>
                      ))}

                      {/* Placeholder cards */}
                      {Array.from({
                        length: 5 - gameState.communityCards.length,
                      }).map((_, index) => (
                        <div
                          key={`placeholder-${index}`}
                          className="w-12 h-18 md:w-14 md:h-20 border-2 border-dashed border-white/20 rounded-lg bg-white/5 backdrop-blur-sm flex items-center justify-center"
                        >
                          <span className="text-white/30 text-xs">?</span>
                        </div>
                      ))}
                    </div>

                    {/* Pot Display */}
                    <div className="glass-dark px-4 md:px-6 py-2 md:py-3 rounded-2xl shadow-lg">
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg md:text-xl">
                          ${gameState.pot.toLocaleString()}
                        </div>
                        <div className="text-white/60 text-xs md:text-sm font-medium">
                          Total Pot
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Seats - 10 Players Oval Layout */}
                {/* Top Row - Positions 0, 1 */}
                {renderPlayerSeat(
                  0,
                  "top-2 md:top-[-100px] left-[40%] transform -translate-x-1/2"
                )}
                {renderPlayerSeat(
                  1,
                  "top-2 md:top-[-100px] left-1/2 transform -translate-x-1/2 translate-x-12 md:translate-x-16"
                )}

                {/* Top-Right - Position 2 */}
                {renderPlayerSeat(2, "top-8 md:top-12 right-4 md:right-8")}

                {/* Middle-Right - Position 3 */}
                {renderPlayerSeat(
                  3,
                  "top-1/2 right-2 md:right-4 transform -translate-y-1/2"
                )}

                {/* Bottom-Right - Position 4 */}
                {renderPlayerSeat(
                  4,
                  "bottom-8 md:bottom-12 right-4 md:right-8"
                )}

                {/* Bottom Row - Positions 5, 6 */}
                {renderPlayerSeat(
                  5,
                  "bottom-2 md:bottom-4 left-[40%] transform -translate-x-1/2 -translate-x-12 md:-translate-x-16"
                )}
                {renderPlayerSeat(
                  6,
                  "bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 translate-x-12 md:translate-x-16"
                )}

                {/* Bottom-Left - Position 7 */}
                {renderPlayerSeat(7, "bottom-8 md:bottom-12 left-4 md:left-8")}

                {/* Middle-Left - Position 8 */}
                {renderPlayerSeat(
                  8,
                  "top-1/2 left-2 md:left-4 transform -translate-y-1/2"
                )}

                {/* Top-Left - Position 9 */}
                {renderPlayerSeat(9, "top-8 md:top-12 left-4 md:left-8")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      {isCurrentPlayerTurn && myPlayer && gameState.gamePhase !== "ended" && (
        <div className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <ActionButtons
            gameState={gameState}
            currentPlayer={myPlayer}
            onAction={onPlayerAction}
          />
        </div>
      )}

      {/* Game Status Overlay - Fixed Position */}
      <div className="fixed top-4 md:top-6 left-4 md:left-6 glass-dark p-3 md:p-4 rounded-xl z-40">
        <div className="text-xs md:text-sm space-y-1 md:space-y-2">
          <div className="text-white font-semibold border-b border-white/20 pb-1 md:pb-2">
            Game Info
          </div>
          <div className="text-slate-300">
            <span className="text-blue-400">ID:</span> {gameState.id}
          </div>
          <div className="text-slate-300">
            <span className="text-green-400">Players:</span>{" "}
            {gameState.players.length}/{gameState.maxPlayers}
          </div>
          <div className="text-slate-300">
            <span className="text-purple-400">Blinds:</span> $
            {gameState.smallBlind}/${gameState.bigBlind}
          </div>
          <div className="text-slate-300">
            <span className="text-orange-400">Active:</span>{" "}
            {gameState.players.filter((p) => !p.isFolded).length}
          </div>
        </div>
      </div>

      {/* Enhanced Winners Display */}
      {gameState.gamePhase === "ended" && gameState.winners && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="winner-modal max-w-lg w-full mx-4 animate-winner">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="text-center mb-6 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <span className="text-2xl md:text-3xl">🏆</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                  Hand Complete!
                </h2>
                <p className="text-slate-600">
                  Winner{(gameState.winners?.length || 0) > 1 ? "s" : ""}{" "}
                  revealed
                </p>
              </div>

              {/* Winners List */}
              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {gameState.winners?.map((winner, index) => {
                  const winnerPlayer = gameState.players.find(
                    (p) => p.id === winner.playerId
                  );
                  const handInfo = getHandDescription(
                    winner.hand.toLowerCase().replace(/\s+/g, "-")
                  );

                  return (
                    <div
                      key={index}
                      className="glass p-4 md:p-6 rounded-xl border-l-4 border-yellow-400 animate-slideInUp"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg">
                            {winnerPlayer?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-base md:text-lg">
                              {winnerPlayer?.name || "Unknown Player"}
                            </div>
                            <div className="text-slate-600 text-xs md:text-sm">
                              {(gameState.winners?.length || 0) > 1 &&
                              index === 0
                                ? "Winner"
                                : (gameState.winners?.length || 0) > 1
                                ? `Tied ${index + 1}`
                                : "Winner"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600 text-lg md:text-xl">
                            +${winner.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Hand Details */}
                      <div className="bg-white/50 rounded-lg p-3 md:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`hand-rank-badge bg-gradient-to-r ${handInfo.color} text-white text-xs`}
                          >
                            {handInfo.title}
                          </span>
                          <span className="text-slate-600 text-xs md:text-sm font-medium">
                            {winner.hand}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs md:text-sm">
                          {handInfo.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Countdown Timer */}
              {gameState.nextHandCountdown !== null &&
                gameState.nextHandCountdown !== undefined && (
                  <div className="text-center">
                    <div className="text-base md:text-lg font-semibold text-slate-700 mb-4">
                      Next Hand Starting In:
                    </div>
                    <div className="relative inline-block">
                      {/* Enhanced countdown circle */}
                      <div className="w-20 h-20 md:w-24 md:h-24 relative">
                        <svg
                          className="w-20 h-20 md:w-24 md:h-24 transform -rotate-90"
                          viewBox="0 0 100 100"
                        >
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={
                              gameState.nextHandCountdown <= 3
                                ? "#dc2626"
                                : "#3b82f6"
                            }
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${
                              2 *
                              Math.PI *
                              45 *
                              (1 - gameState.nextHandCountdown / 10)
                            }`}
                            className="transition-all duration-1000 ease-linear"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span
                            className={`text-3xl md:text-4xl font-bold transition-all duration-300 ${
                              gameState.nextHandCountdown <= 3
                                ? "text-red-600 animate-pulse"
                                : "text-blue-600"
                            }`}
                          >
                            {gameState.nextHandCountdown}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-slate-600 font-medium text-sm md:text-base">
                      🃏 Shuffling deck for next hand...
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Waiting for Players */}
      {!gameState.isStarted && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="winner-modal max-w-md w-full mx-4">
            <div className="p-6 md:p-8 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-xl md:text-2xl">⏳</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4">
                Waiting for Players
              </h2>
              <p className="text-slate-600 mb-6">
                {gameState.players.length < 2
                  ? "Need at least 2 players to start the game"
                  : "Ready to deal! Any player can start the game."}
              </p>

              <div className="bg-white/50 rounded-lg p-4 mb-6">
                <div className="text-sm text-slate-600 mb-3">
                  Players: {gameState.players.length}/{gameState.maxPlayers}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {gameState.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium"
                    >
                      {player.name}
                    </div>
                  ))}
                </div>
              </div>

              {gameState.players.length >= 2 && (
                <div className="text-green-600 font-semibold flex items-center justify-center text-sm md:text-base">
                  <span className="mr-2">✓</span>
                  Ready to start! Look for the "Start Game" button.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
