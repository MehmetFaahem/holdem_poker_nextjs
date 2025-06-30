"use client";

import { useState } from "react";
import { GameState, Player } from "@/types/poker";
import { useAppSelector } from "@/hooks/useAppSelector";

interface ActionButtonsProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (
    action: "fold" | "check" | "call" | "bet" | "raise" | "all-in",
    amount?: number
  ) => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameState,
  currentPlayer,
  onAction,
  disabled = false,
}) => {
  const [betRaiseAmount, setBetRaiseAmount] = useState(gameState.bigBlind);
  const [showBetRaiseInput, setShowBetRaiseInput] = useState(false);

  // Get loading state from Redux
  const { isLoading, error } = useAppSelector((state) => state.game);

  // Calculate action availability based on proper poker rules
  const callAmount = Math.max(
    0,
    gameState.currentBet - currentPlayer.inPotThisRound
  );
  const canCheck = gameState.currentBet === currentPlayer.inPotThisRound;
  const canBet = gameState.currentBet === 0; // Can only bet when no bet exists
  const canCall = gameState.currentBet > currentPlayer.inPotThisRound;
  const canRaise =
    gameState.currentBet > 0 &&
    currentPlayer.chips > callAmount &&
    !currentPlayer.isAllIn;

  // Minimum amounts
  const minimumBet = gameState.bigBlind;
  const minimumRaise = gameState.minimumRaise || gameState.bigBlind;
  const maxAmount = currentPlayer.chips;

  const isCurrentTurn =
    gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

  const handleBetOrRaise = () => {
    if (canBet) {
      if (betRaiseAmount >= minimumBet && betRaiseAmount <= maxAmount) {
        onAction("bet", betRaiseAmount);
        setShowBetRaiseInput(false);
      }
    } else if (canRaise) {
      if (betRaiseAmount >= minimumRaise && betRaiseAmount <= maxAmount) {
        onAction("raise", betRaiseAmount);
        setShowBetRaiseInput(false);
      }
    }
  };

  const buttonBaseClass =
    "px-4 py-2 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl text-sm";

  const isDisabled =
    disabled ||
    !isCurrentTurn ||
    currentPlayer.isFolded ||
    currentPlayer.isAllIn ||
    isLoading;

  return (
    <div className="glass-dark p-4 rounded-xl backdrop-blur-xl animate-slideInUp max-w-md w-full">
      {/* Turn Indicator */}
      <div className="text-center mb-4">
        {!isCurrentTurn ? (
          <div className="flex items-center justify-center space-x-2 text-amber-400">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">Waiting for your turn...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">
              Your turn - Choose an action
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons - Compact Layout */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Fold Button */}
        <button
          onClick={() => {
            console.log("Fold button clicked");
            onAction("fold");
          }}
          disabled={isDisabled}
          className={`${buttonBaseClass} bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 border border-red-400/30`}
        >
          <span className="flex flex-col items-center">
            <span className="text-xs">❌</span>
            <span>Fold</span>
          </span>
        </button>

        {/* Check/Call Button */}
        {canCheck ? (
          <button
            onClick={() => {
              console.log("Check button clicked");
              onAction("check");
            }}
            disabled={isDisabled}
            className={`${buttonBaseClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border border-blue-400/30`}
          >
            <span className="flex flex-col items-center">
              <span className="text-xs">✅</span>
              <span>Check</span>
            </span>
          </button>
        ) : canCall ? (
          <button
            onClick={() => {
              console.log("Call button clicked, amount:", callAmount);
              onAction("call");
            }}
            disabled={isDisabled || callAmount > currentPlayer.chips}
            className={`${buttonBaseClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 border border-green-400/30`}
          >
            <span className="flex flex-col items-center">
              <span className="text-xs">📞</span>
              <span>Call</span>
              <span className="text-xs">${callAmount}</span>
            </span>
          </button>
        ) : (
          <div></div>
        )}

        {/* Bet/Raise Button */}
        {(canBet || canRaise) && (
          <button
            onClick={() => setShowBetRaiseInput(!showBetRaiseInput)}
            disabled={isDisabled}
            className={`${buttonBaseClass} bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 border border-orange-400/30`}
          >
            <span className="flex flex-col items-center">
              <span className="text-xs">{canBet ? "💰" : "📈"}</span>
              <span>{canBet ? "Bet" : "Raise"}</span>
            </span>
          </button>
        )}
      </div>

      {/* All-in Button - Full Width */}
      <button
        onClick={() => {
          console.log("All-in button clicked, chips:", currentPlayer.chips);
          onAction("all-in");
        }}
        disabled={isDisabled || currentPlayer.chips === 0}
        className={`${buttonBaseClass} bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 border border-purple-400/30 w-full`}
      >
        <span className="flex items-center justify-center">
          <span className="mr-2">🚀</span>
          All-in
          {currentPlayer.chips > 0 && (
            <span className="ml-2 text-xs opacity-75">
              (${currentPlayer.chips.toLocaleString()})
            </span>
          )}
        </span>
      </button>

      {/* Bet/Raise Input Section */}
      {showBetRaiseInput && (
        <div className="glass bg-white/5 border border-white/10 rounded-lg p-3 mt-3 animate-slideInUp">
          <label className="block text-white text-xs font-bold mb-3">
            {canBet
              ? `💰 Bet Amount (Min: $${minimumBet.toLocaleString()}, Max: $${maxAmount.toLocaleString()})`
              : `📈 Raise Amount (Min: $${minimumRaise.toLocaleString()}, Max: $${maxAmount.toLocaleString()})`}
          </label>

          <div className="space-y-3">
            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min={canBet ? minimumBet : minimumRaise}
                max={maxAmount}
                value={betRaiseAmount}
                onChange={(e) => setBetRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${
                    ((betRaiseAmount - (canBet ? minimumBet : minimumRaise)) /
                      (maxAmount - (canBet ? minimumBet : minimumRaise))) *
                    100
                  }%, #ffffff20 ${
                    ((betRaiseAmount - (canBet ? minimumBet : minimumRaise)) /
                      (maxAmount - (canBet ? minimumBet : minimumRaise))) *
                    100
                  }%, #ffffff20 100%)`,
                }}
              />
              <div className="absolute -bottom-5 left-0 text-xs text-white/60">
                ${(canBet ? minimumBet : minimumRaise).toLocaleString()}
              </div>
              <div className="absolute -bottom-5 right-0 text-xs text-white/60">
                ${maxAmount.toLocaleString()}
              </div>
            </div>

            {/* Manual Input */}
            <div className="flex items-center space-x-2">
              <span className="text-white text-xs font-medium mt-6">$</span>
              <input
                type="number"
                min={canBet ? minimumBet : minimumRaise}
                max={maxAmount}
                value={betRaiseAmount}
                onChange={(e) => setBetRaiseAmount(Number(e.target.value))}
                className="flex-1 px-3 py-1 mt-[20px] bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm"
              />
            </div>

            {/* Quick bet buttons */}
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => {
                  const halfPot = Math.floor(gameState.pot / 2);
                  const safeHalfPot = Math.min(halfPot, maxAmount);
                  console.log(
                    `🎲 HALF POT: pot=${gameState.pot}, halfPot=${halfPot}, safeHalfPot=${safeHalfPot}, maxAmount=${maxAmount}`
                  );
                  setBetRaiseAmount(safeHalfPot);
                }}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-medium transition-all duration-300"
              >
                1/2 Pot
              </button>
              <button
                onClick={() => {
                  const potAmount = gameState.pot;
                  const safePotAmount = Math.min(potAmount, maxAmount);
                  console.log(
                    `🎲 POT: pot=${gameState.pot}, safePotAmount=${safePotAmount}, maxAmount=${maxAmount}`
                  );
                  setBetRaiseAmount(safePotAmount);
                }}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-medium transition-all duration-300"
              >
                Pot
              </button>
              <button
                onClick={() => {
                  console.log(`🎲 MAX: maxAmount=${maxAmount}`);
                  setBetRaiseAmount(maxAmount);
                }}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs font-medium transition-all duration-300"
              >
                Max
              </button>
            </div>

            {/* Confirm/Cancel buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={handleBetOrRaise}
                disabled={
                  betRaiseAmount < (canBet ? minimumBet : minimumRaise) ||
                  betRaiseAmount > maxAmount
                }
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-50 text-sm"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBetRaiseInput(false)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all duration-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player info - Compact */}
      <div className="mt-3 pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-white/60">
          <span>Chips: ${currentPlayer.chips.toLocaleString()}</span>
          <span>Pot: ${gameState.pot.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
