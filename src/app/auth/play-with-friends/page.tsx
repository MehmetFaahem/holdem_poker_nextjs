"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PlayWithFriends() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a room ID");
      return;
    }

    if (!playerName.trim()) {
      alert("Please enter your player name");
      return;
    }

    setIsLoading(true);

    // Store the join room data
    sessionStorage.setItem("joinRoomId", roomId.trim().toUpperCase());
    sessionStorage.setItem("playerName", playerName.trim());
    sessionStorage.setItem("joinExistingRoom", "true");

    // Navigate to the main game page to join the room
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setRoomId(value);
  };

  return (
    <div className="w-full flex flex-col items-center gap-10">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999] backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Joining Room...</h2>
            <p className="text-gray-300">Connecting to room {roomId}</p>
          </div>
        </div>
      )}

      {/* Main Headline */}
      <h1 className="text-center font-blacklisted text-5xl md:text-7xl lg:text-8xl font-normal leading-[148%] uppercase tracking-wider z-10">
        <span className="text-white">PLAY WITH </span>
        <span className="text-red-700">FRIENDS!</span>
      </h1>
      <h3 className="text-center text-white text-xl font-normal tracking-[-0.48px] z-10">
        Enter Room ID and your name to join existing room
      </h3>

      {/* Form Container */}
      <div className="w-full max-w-[469px] flex flex-col items-center gap-6">
        {/* Input Fields */}
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Player Name Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="text"
              placeholder="Your Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="absolute text-center inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              maxLength={20}
            />
          </div>

          {/* Room ID Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="text"
              placeholder="ROOM ID (e.g. ABC123)"
              value={roomId}
              onChange={handleRoomIdChange}
              className="absolute text-center inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none font-mono"
              maxLength={6}
            />
          </div>
        </div>

        {/* Join Room Button */}
        <div className="w-full h-[50px] md:h-[72px] relative z-10">
          <button
            className={`w-full h-full cursor-pointer rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
            onClick={handleJoinRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin"></div>
                <span className="text-black text-2xl font-medium leading-[148%] tracking-[-0.48px]">
                  Joining...
                </span>
              </div>
            ) : (
              <span className="text-black text-2xl font-medium leading-[148%] tracking-[-0.48px]">
                Join Room
              </span>
            )}
          </button>
        </div>

        {/* Room ID Help */}
        <div className="w-full text-center z-10 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-[#C5C5C5] text-sm font-medium leading-[148%] tracking-[-0.36px]">
            💡 Ask your friend for the 6-character room ID
          </p>
          <p className="text-[#C5C5C5] text-xs font-normal leading-[148%] tracking-[-0.36px] mt-1">
            Room IDs look like: ABC123, XYZ789, etc.
          </p>
        </div>

        {/* Go Back link */}
        <div className="w-full text-center z-10 flex justify-center items-center">
          <button
            onClick={() => router.push("/")}
            className="text-[#C5C5C5] flex items-center justify-center gap-2 text-sm md:text-lg font-medium leading-[148%] tracking-[-0.36px] hover:text-white transition-colors"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="#fcfcfc"
                viewBox="0 0 256 256"
              >
                <path d="M224,128a8,8,0,0,1-8,8H120v64a8,8,0,0,1-13.66,5.66l-72-72a8,8,0,0,1,0-11.32l72-72A8,8,0,0,1,120,56v64h96A8,8,0,0,1,224,128Z"></path>
              </svg>
            </span>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
