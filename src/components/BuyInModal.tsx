"use client";

import React, { useState, useEffect } from "react";

interface BuyInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (buyIn: number) => void;
  stake: {
    id: number;
    blind: {
      small: number;
      big: number;
      small_formatted: string;
      big_formatted: string;
    };
    buy_in: {
      min: number;
      max: number;
      min_formatted: string;
      max_formatted: string;
    };
  };
  isLoading?: boolean;
}

export const BuyInModal: React.FC<BuyInModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stake,
  isLoading = false,
}) => {
  const [buyIn, setBuyIn] = useState(stake.buy_in.min);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setBuyIn(stake.buy_in.min);
      setError("");
    }
  }, [isOpen, stake.buy_in.min]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBuyIn(value);
    setError("");

    if (value < stake.buy_in.min) {
      setError(`Minimum buy-in is ${stake.buy_in.min_formatted}`);
    } else if (value > stake.buy_in.max) {
      setError(`Maximum buy-in is ${stake.buy_in.max_formatted}`);
    }
  };

  const handleConfirm = () => {
    if (buyIn < stake.buy_in.min || buyIn > stake.buy_in.max) {
      setError("Please enter a valid buy-in amount");
      return;
    }
    onConfirm(buyIn);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999] backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Join Table</h2>
          <p className="text-gray-300">
            Stakes: {stake.blind.small_formatted}/{stake.blind.big_formatted}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buy-in Amount
            </label>
            <div className="relative">
              <input
                type="number"
                value={buyIn}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                min={stake.buy_in.min}
                max={stake.buy_in.max}
                step={1000}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg font-mono focus:outline-none focus:border-blue-500"
                placeholder={`${stake.buy_in.min_formatted} - ${stake.buy_in.max_formatted}`}
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                chips
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>

          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Min Buy-in:</span>
              <span className="text-white font-mono">
                {stake.buy_in.min_formatted}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Max Buy-in:</span>
              <span className="text-white font-mono">
                {stake.buy_in.max_formatted}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !!error}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Joining...
              </div>
            ) : (
              "Join Table"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
