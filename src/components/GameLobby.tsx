"use client";

import { useState } from "react";
import { showToast } from "@/utils/toast";

interface GameLobbyProps {
  onJoinGame: (gameId: string, playerName: string) => void;
  onCreateRoom?: (playerName: string) => void;
  isConnected: boolean;
  createdRoomId?: string | null;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  onJoinGame,
  onCreateRoom,
  isConnected,
  createdRoomId,
}) => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [activeTab, setActiveTab] = useState<"join" | "create">("join");
  const [createPlayerName, setCreatePlayerName] = useState("");

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim() && playerName.trim()) {
      onJoinGame(gameId.trim(), playerName.trim());
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (createPlayerName.trim() && onCreateRoom) {
      onCreateRoom(createPlayerName.trim());
    }
  };

  const generateGameId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGameId(id);
  };

  const copyRoomId = async (roomId: string) => {
    try {
      await navigator.clipboard.writeText(roomId);
      showToast.success(`Room ID ${roomId} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy room ID:", err);
      showToast.error("Failed to copy room ID to clipboard");
    }
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
        <div className="glass rounded-xl animate-slideInUp">
          <div className="p-8 bg-transparent rounded-xl">
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

            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab("join")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeTab === "join"
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-white  hover:bg-white/10"
                  }`}
                >
                  Join Room
                </button>
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                    activeTab === "create"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-white  hover:bg-white/10"
                  }`}
                >
                  Create Room
                </button>
              </div>
            </div>

            {/* Join Room Tab */}
            {activeTab === "join" && (
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
                    className="w-full text-white px-4 py-3 bg-white/5 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
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
                      className="flex-1 text-white px-4 py-3 bg-white/5 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
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
                    Enter the room ID shared by the host
                  </p>
                </div>

                {/* Join Game Button */}
                <button
                  type="submit"
                  disabled={
                    !isConnected || !gameId.trim() || !playerName.trim()
                  }
                  className="w-full  bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 disabled:hover:scale-100"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Join Game Room
                  </span>
                </button>
              </form>
            )}

            {/* Create Room Tab */}
            {activeTab === "create" && (
              <div className="space-y-6">
                {!createdRoomId ? (
                  <form onSubmit={handleCreateRoom} className="space-y-6">
                    {/* Player Name Input for Create */}
                    <div>
                      <label
                        htmlFor="createPlayerName"
                        className="block text-sm font-semibold text-slate-300 mb-3"
                      >
                        Your Player Name
                      </label>
                      <input
                        type="text"
                        id="createPlayerName"
                        value={createPlayerName}
                        onChange={(e) => setCreatePlayerName(e.target.value)}
                        placeholder="Enter your display name"
                        className="w-full text-white px-4 py-3 bg-white/5 border border-white/10 rounded-xl placeholder-slate-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
                        required
                        maxLength={20}
                      />
                    </div>

                    <div className="text-center p-4 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-sm text-slate-300 mb-2">
                        🎯 Room ID will be auto-generated
                      </div>
                      <div className="text-xs text-slate-400">
                        You'll be able to share it with friends after creation
                      </div>
                    </div>

                    {/* Create Room Button */}
                    <button
                      type="submit"
                      disabled={!isConnected || !createPlayerName.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/25 disabled:hover:scale-100"
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-2">✨</span>
                        Create New Room
                      </span>
                    </button>
                  </form>
                ) : (
                  /* Room Created - Show ID with Copy */
                  <div className="text-center space-y-6">
                    <div className="p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
                      <div className="text-lg font-bold text-green-400 mb-4">
                        🎉 Room Created Successfully!
                      </div>

                      <div className="mb-4">
                        <div className="text-sm text-slate-300 mb-2">
                          Room ID:
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                          <div className="text-2xl font-mono font-bold text-white bg-black/30 px-4 py-2 rounded-lg">
                            {createdRoomId}
                          </div>
                          <button
                            onClick={() => copyRoomId(createdRoomId)}
                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all duration-300 hover:scale-105"
                            title="Copy Room ID"
                          >
                            📋
                          </button>
                        </div>
                      </div>

                      <div className="text-sm text-slate-300">
                        Share this ID with friends to invite them to your game!
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab("join")}
                      className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white font-bold py-3 px-6 rounded-xl hover:from-slate-500 hover:to-slate-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Back to Join Room
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Game Rules */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Game Information
              </h3>

              <div className=" pt-1 border-t border-white/10">
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
