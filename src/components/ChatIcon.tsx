"use client";

import React from "react";

interface ChatIconProps {
  isOpen: boolean;
  unreadCount: number;
  onClick: () => void;
}

export const ChatIcon: React.FC<ChatIconProps> = ({
  isOpen,
  unreadCount,
  onClick,
}) => {
  return (
    <div className="fixed bottom-6 left-6 z-40">
      <button
        onClick={onClick}
        className={`relative text-white group p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isOpen
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
      >
        {/* Chat Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="#f5f5f5"
          viewBox="0 0 256 256"
        >
          <path d="M132,24A100.11,100.11,0,0,0,32,124v84a16,16,0,0,0,16,16h84a100,100,0,0,0,0-200Zm32,128H96a8,8,0,0,1,0-16h68a8,8,0,0,1,0,16Zm0-32H96a8,8,0,0,1,0-16h68a8,8,0,0,1,0,16Z"></path>
        </svg>

        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {isOpen ? "Close Chat" : "Open Chat"}
          </div>
        </div>
      </button>
    </div>
  );
};
