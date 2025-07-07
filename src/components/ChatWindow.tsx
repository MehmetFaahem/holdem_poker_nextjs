"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/types/poker";

interface ChatWindowProps {
  isOpen: boolean;
  messages: ChatMessage[];
  currentPlayerId: string | null;
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  messages,
  currentPlayerId,
  onSendMessage,
  onClose,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    // Method 1: Scroll using scrollIntoView
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    // Method 2: Backup scroll using scrollTop (more reliable)
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Also scroll when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        scrollToBottom();
      }, 150);
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
      // Scroll to bottom immediately after sending
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="chat-window fixed bottom-16 md:bottom-24 left-2 md:left-6 z-50 w-[calc(100vw-1rem)] md:w-80 h-64 md:h-96 bg-slate-800 rounded-lg shadow-2xl border border-slate-600 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-600 bg-slate-700 rounded-t-lg">
        <h3 className="text-white font-semibold text-sm">Room Chat</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {messages.length === 0 ? (
          <div className="text-slate-400 text-sm text-center py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col space-y-1 ${
                message.playerId === currentPlayerId
                  ? "items-end"
                  : "items-start"
              }`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.playerId === currentPlayerId
                    ? "bg-blue-600 text-white"
                    : "bg-slate-600 text-white"
                }`}
              >
                {message.playerId !== currentPlayerId && (
                  <div className="text-xs text-slate-300 mb-1 font-medium">
                    {message.playerName}
                  </div>
                )}
                <div className="break-words">{message.message}</div>
              </div>
              <div className="text-xs text-slate-400">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-600 bg-slate-700 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-blue-500 focus:outline-none"
            maxLength={200}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
