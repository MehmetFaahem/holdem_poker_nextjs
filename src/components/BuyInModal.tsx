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
  } | null;
}

export const BuyInModal: React.FC<BuyInModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  stake,
}) => {
  const [buyInAmount, setBuyInAmount] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen && stake) {
      setBuyInAmount(stake.buy_in.min.toString());
      setError("");
    }
  }, [isOpen, stake]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Enter") {
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, buyInAmount, stake]);

  const handleConfirm = () => {
    if (!stake) return;

    const amount = parseInt(buyInAmount);

    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amount < stake.buy_in.min) {
      setError(`Minimum buy-in is ${stake.buy_in.min_formatted}`);
      return;
    }

    if (amount > stake.buy_in.max) {
      setError(`Maximum buy-in is ${stake.buy_in.max_formatted}`);
      return;
    }

    setError("");
    onConfirm(amount);
    onClose();
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ""); // Remove commas
    if (value === "" || /^\d+$/.test(value)) {
      setBuyInAmount(value);
      setError("");
    }
  };

  const setQuickAmount = (percentage: number) => {
    if (!stake) return;
    const range = stake.buy_in.max - stake.buy_in.min;
    const amount = stake.buy_in.min + range * percentage;
    setBuyInAmount(Math.floor(amount).toString());
    setError("");
  };

  if (!isOpen || !stake) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl border border-white/20 shadow-2xl max-w-md w-full mx-4 animate-slideInUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Join Table</h2>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors p-1"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Stake Info */}
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-center">
                <div className="text-[#991D1D] text-lg font-semibold mb-1">
                  STAKES
                </div>
                <div className="text-white text-2xl font-bold">
                  {stake.blind.small_formatted}/{stake.blind.big_formatted}
                </div>
                <div className="text-white/60 text-sm mt-2">
                  Buy-in range: {stake.buy_in.min_formatted} -{" "}
                  {stake.buy_in.max_formatted}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Buy-in Input */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-3">
                  Your Buy-in Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      buyInAmount ? formatNumber(parseInt(buyInAmount)) : ""
                    }
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">
                    chips
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setQuickAmount(0)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Min
                    <br />
                    <span className="text-xs text-white/60">
                      {stake.buy_in.min_formatted}
                    </span>
                  </button>
                  <button
                    onClick={() => setQuickAmount(0.5)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Mid
                    <br />
                    <span className="text-xs text-white/60">
                      {formatNumber(
                        Math.floor((stake.buy_in.min + stake.buy_in.max) / 2)
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setQuickAmount(1)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Max
                    <br />
                    <span className="text-xs text-white/60">
                      {stake.buy_in.max_formatted}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!buyInAmount || !!error}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
              >
                Join Table
              </button>
            </div>

            <p className="text-center text-white/60 text-xs mt-3">
              Press Enter to confirm • Press Escape to cancel
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
