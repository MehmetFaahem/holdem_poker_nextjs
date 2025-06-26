"use client";

import { useState } from "react";

interface GameLobbyProps {
  onJoinGame: (gameId: string, playerName: string) => void;
  isConnected: boolean;
  error: string | null;
  onClearError: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  onJoinGame,
  isConnected,
  error,
  onClearError,
}) => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim() && playerName.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  const generateGameId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Floating cards animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-12 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg opacity-20 animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-12 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg opacity-20 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-32 left-20 w-12 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg opacity-20 animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-10 w-12 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg opacity-20 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "2.8s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass winner-modal animate-slideInUp">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">♠</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                Texas Hold'em
              </h1>
              <p className="text-slate-300 text-lg">
                Premium Multiplayer Poker
              </p>
            </div>

            {/* Connection Status */}
            <div className="mb-6 text-center">
              <div
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isConnected
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-3 ${
                    isConnected
                      ? "bg-green-400 animate-pulse"
                      : "bg-amber-400 animate-pulse"
                  }`}
                ></div>
                {isConnected
                  ? "Connected to Server"
                  : "Connecting to Server..."}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl animate-slideInUp">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{error}</span>
                  <button
                    onClick={onClearError}
                    className="text-red-400 hover:text-red-300 ml-3 text-lg transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleJoinGame} className="space-y-6">
              {/* Player Name Input */}
              <div>
                <label
                  htmlFor="playerName"
                  className="block text-sm font-semibold text-slate-300 mb-3"
                >
                  Player Name
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full text-black px-4 py-3 bg-white/5 border border-white/10 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                  required
                  maxLength={20}
                />
              </div>

              {/* Game ID Input */}
              <div>
                <label
                  htmlFor="gameId"
                  className="block text-sm font-semibold text-slate-300 mb-3"
                >
                  Game Room ID
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    id="gameId"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value.toUpperCase())}
                    placeholder="Enter room ID"
                    className="flex-1 text-black px-4 py-3 bg-white/5 border border-white/10 rounded-xl placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                    required
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={generateGameId}
                    className="btn-modern px-4 py-3 hover:scale-105 transition-all duration-300"
                    title="Generate Random Room ID"
                  >
                    🎲
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Share this ID with friends to join the same game
                </p>
              </div>

              {/* Join Game Button */}
              <button
                type="submit"
                disabled={!isConnected || !gameId.trim() || !playerName.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100"
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚀</span>
                  Join Game Room
                </span>
              </button>
            </form>

            {/* Game Rules */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Game Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-slate-300">
                  <div className="font-semibold text-blue-400">Players</div>
                  <div>2-6 per room</div>
                </div>
                <div className="text-slate-300">
                  <div className="font-semibold text-green-400">
                    Starting Chips
                  </div>
                  <div>$1,000</div>
                </div>
                <div className="text-slate-300">
                  <div className="font-semibold text-purple-400">
                    Small Blind
                  </div>
                  <div>$10</div>
                </div>
                <div className="text-slate-300">
                  <div className="font-semibold text-orange-400">Big Blind</div>
                  <div>$20</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-400 space-y-1">
                  <div>• Standard Texas Hold'em rules apply</div>
                  <div>• Real-time multiplayer gameplay</div>
                  <div>• Automatic hand evaluation</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <div className="text-xs text-slate-500 flex items-center justify-center">
                <span className="mr-1">Made with</span>
                <span className="text-red-400 animate-pulse">❤️</span>
                <span className="ml-1">for poker enthusiasts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
