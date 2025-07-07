"use client";

import { useState } from "react";
import { GameState, Player } from "@/types/poker";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RaiseBetModal } from "./RaiseBetModal";

interface ActionButtonsProps {
  gameState: GameState;
  currentPlayer: Player;
  onAction: (
    action: "fold" | "check" | "call" | "bet" | "raise" | "all-in",
    amount?: number
  ) => void;
  disabled?: boolean;
}

interface PokerActionButtonProps {
  label: string;
  icon: React.ReactNode;
  backgroundColor: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

function PokerActionButton({
  label,
  icon,
  backgroundColor,
  onClick,
  className = "",
  disabled = false,
}: PokerActionButtonProps) {
  return (
    <div className={`flex flex-col items-center gap-3 w-24 ${className}`}>
      <div
        className="text-white text-center font-inter font-bold text-xl leading-[150%] self-stretch"
        style={{ letterSpacing: "-0.8px", fontSize: "20px" }}
      >
        {label}
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-16 h-16 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        style={{ backgroundColor: disabled ? "#666" : backgroundColor }}
      >
        {icon}
      </button>
    </div>
  );
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  gameState,
  currentPlayer,
  onAction,
  disabled = false,
}) => {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  // Get loading state from Redux
  const { isLoading } = useAppSelector((state) => state.game);

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

  const isDisabled =
    disabled ||
    !isCurrentTurn ||
    currentPlayer.isFolded ||
    currentPlayer.isAllIn ||
    isLoading;

  const handleRaiseClick = () => {
    setIsRaiseModalOpen(true);
  };

  const handleRaiseConfirm = (amount: number) => {
    console.log(`Raising bet by ${amount}`);
    if (canBet) {
      onAction("bet", amount);
    } else if (canRaise) {
      onAction("raise", amount);
    }
    setIsRaiseModalOpen(false);
  };

  // Define action buttons based on current game state
  const getActionButtons = () => {
    const buttons = [];

    // Fold button - always available
    buttons.push({
      label: "Fold",
      backgroundColor: "#B80000",
      icon: (
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
          <path
            d="M41.3645 18.6328L31.9906 28.0067L22.6167 18.6328L18.6328 22.6167L28.0067 31.9906L18.6328 41.3645L22.6167 45.3328L31.9906 35.9745L41.3645 45.3328L45.3328 41.3645L35.9745 31.9906L45.3328 22.6167L41.3645 18.6328Z"
            fill="white"
          />
        </svg>
      ),
      onClick: () => {
        console.log("Fold button clicked");
        onAction("fold");
      },
      disabled: isDisabled,
    });

    // Check/Call button
    if (canCheck) {
      buttons.push({
        label: "Check",
        backgroundColor: "#079D61",
        icon: (
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M27.2405 35.9406L43.8481 19.333L48 23.5862L27.2405 44.3457L16 33.1052L20.2532 28.852L27.2405 35.9406Z"
              fill="white"
            />
          </svg>
        ),
        onClick: () => {
          console.log("Check button clicked");
          onAction("check");
        },
        disabled: isDisabled,
      });
    } else if (canCall) {
      buttons.push({
        label: `Call $${callAmount}`,
        backgroundColor: "#079D61",
        icon: (
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path
              d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 4c11.1 0 20 8.9 20 20s-8.9 20-20 20-20-8.9-20-20 8.9-20 20-20zm-8 16v8l6 6 6-6v-8h-12z"
              fill="white"
            />
          </svg>
        ),
        onClick: () => {
          console.log("Call button clicked, amount:", callAmount);
          onAction("call");
        },
        disabled: isDisabled || callAmount > currentPlayer.chips,
      });
    }

    // Bet/Raise button
    if (canBet || canRaise) {
      buttons.push({
        label: canBet ? "Bet" : "Raise",
        backgroundColor: "#D08A08",
        icon: (
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M32.2807 30.3512L43.405 41.0215L46.9996 37.2755L32.2807 23.1999L17.5996 37.2755L21.1942 41.0215L32.2807 30.3512Z"
              fill="white"
            />
          </svg>
        ),
        onClick: handleRaiseClick,
        disabled: isDisabled,
      });
    }

    return buttons;
  };

  const actionButtons = getActionButtons();

  return (
    <>
      <div className="glass-dark p-4 rounded-xl backdrop-blur-xl animate-slideInUp max-w-md w-full">
        {/* Turn Indicator */}
        <div className="text-center mb-4">
          {!isCurrentTurn ? (
            <div className="flex items-center justify-center space-x-2 text-amber-400">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold">
                Waiting for your turn...
              </span>
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

        {/* Action Buttons */}
        <div className="flex justify-center items-center gap-6 mb-4">
          {actionButtons.map((action, index) => (
            <PokerActionButton
              key={index}
              label={action.label}
              icon={action.icon}
              backgroundColor={action.backgroundColor}
              onClick={action.onClick}
              disabled={action.disabled}
            />
          ))}
        </div>

        {/* All-in Button - Full Width */}
        <button
          onClick={() => {
            console.log("All-in button clicked, chips:", currentPlayer.chips);
            onAction("all-in");
          }}
          disabled={isDisabled || currentPlayer.chips === 0}
          className="w-full h-12 rounded-lg font-bold text-white transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl text-sm flex items-center justify-center"
          style={{
            background:
              isDisabled || currentPlayer.chips === 0
                ? "#666"
                : "linear-gradient(180deg, #7C2D12 0%, #DC2626 100%)",
          }}
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

        {/* Player info - Compact */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex justify-between text-xs text-white/60">
            <span>Chips: ${currentPlayer.chips.toLocaleString()}</span>
            <span>Pot: ${gameState.pot.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <RaiseBetModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        onRaise={handleRaiseConfirm}
        minBet={canBet ? minimumBet : minimumRaise}
        maxBet={maxAmount}
      />
    </>
  );
};
