"use client";

import { useState } from "react";
import { GameState, Player } from "@/types/poker";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDispatch } from "react-redux";
import { setQuickAction, clearQuickAction } from "@/store/gameSlice";
import { RaiseBetModal } from "./RaiseBetModal";
import PokerActionButton from "./PokerActionButton";

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
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const dispatch = useDispatch();

  // Get loading state and quick action from Redux
  const { isLoading, quickAction } = useAppSelector((state) => state.game);

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
      icon: "fold" as const,
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
        icon: "check" as const,
        onClick: () => {
          console.log("Check button clicked");
          onAction("check");
        },
        disabled: isDisabled,
      });
    } else if (canCall) {
      buttons.push({
        label: `Call $${callAmount}`,
        icon: "call" as const,
        onClick: () => {
          console.log("Call button clicked, amount:", callAmount);
          onAction("call");
        },
        disabled: isDisabled || callAmount > currentPlayer.chips,
      });
    }

    // Bet/Raise button - using check icon for now, you might want to add a "bet" icon to PokerActionButton
    if (canBet || canRaise) {
      buttons.push({
        label: canBet ? "Bet" : "Raise",
        icon: "call" as const, // Using call icon as placeholder for bet/raise
        onClick: handleRaiseClick,
        disabled: isDisabled,
      });
    }

    return buttons;
  };

  const actionButtons = getActionButtons();

  // Quick action handlers for spectators
  const handleQuickAction = (action: string) => {
    if (quickAction === action) {
      dispatch(clearQuickAction());
    } else {
      dispatch(setQuickAction(action));
    }
  };

  // Get available quick actions based on game state
  const getQuickActions = () => {
    const actions = [];

    // Always show fold
    actions.push({
      label: "Fold",
      icon: "fold" as const,
      onClick: () => handleQuickAction("fold"),
      isSelected: quickAction === "fold",
    });

    // Check/Fold option
    if (canCheck) {
      actions.push({
        label: "Check/Fold",
        icon: "check-fold" as const,
        onClick: () => handleQuickAction("check-fold"),
        isSelected: quickAction === "check-fold",
      });
    }

    // Check option
    if (canCheck) {
      actions.push({
        label: "Check",
        icon: "check" as const,
        onClick: () => handleQuickAction("check"),
        isSelected: quickAction === "check",
      });
    }

    // Call option
    if (canCall) {
      actions.push({
        label: "Call Any",
        icon: "call" as const,
        onClick: () => handleQuickAction("call"),
        isSelected: quickAction === "call",
      });
    }

    return actions;
  };

  const quickActions = getQuickActions();

  // Show spectator buttons when it's not the current player's turn
  if (
    !isCurrentTurn &&
    gameState.isStarted &&
    !currentPlayer.isFolded &&
    gameState.gamePhase !== "ended"
  ) {
    return (
      <div className="spectator-buttons-container glass-dark p-3 md:p-4 rounded-xl backdrop-blur-xl animate-slideInUp max-w-lg w-full">
        {/* Turn Indicator */}
        <div className="text-center mb-3 md:mb-4">
          <div className="flex items-center justify-center space-x-2 text-amber-400">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold">
              Pre-select your next action
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex justify-center items-center gap-2 md:gap-4 mb-3 md:mb-4">
          {quickActions.map((action, index) => (
            <PokerActionButton
              key={index}
              label={action.label}
              icon={action.icon}
              onClick={action.onClick}
              isSelected={action.isSelected}
            />
          ))}
        </div>

        {/* Selected action indicator */}
        {quickAction && (
          <div className="text-center">
            <div className="text-xs text-green-400 font-medium">
              ✓ {quickAction.charAt(0).toUpperCase() + quickAction.slice(1)}{" "}
              pre-selected
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
  }

  return (
    <>
      <div className="action-buttons-container  glass-dark p-3 md:p-4 rounded-xl backdrop-blur-xl animate-slideInUp max-w-md w-full">
        {/* Turn Indicator */}
        <div className="text-center mb-3 md:mb-4">
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
        <div className="flex justify-center items-center gap-3 md:gap-6 mb-3 md:mb-4">
          {actionButtons.map((action, index) => (
            <PokerActionButton
              key={index}
              label={action.label}
              icon={action.icon}
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
