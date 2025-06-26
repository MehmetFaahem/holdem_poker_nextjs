import Image from "next/image";
import { Player } from "@/types/poker";
import { Card } from "./Card";
import { ActionBadge } from "./ActionBadge";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useDispatch } from "react-redux";
import { removeActionBadge } from "@/store/gameSlice";

interface PlayerSeatProps {
  player: Player | null;
  isCurrentPlayer?: boolean;
  isDealer?: boolean;
  showCards?: boolean;
  position: number;
  className?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentPlayer = false,
  isDealer = false,
  showCards = false,
  position,
  className = "",
}) => {
  const dispatch = useDispatch();
  const { recentActions } = useAppSelector((state) => state.game);

  // Find the most recent action for this player
  const playerAction = player
    ? recentActions
        .filter((action) => action.playerId === player.id)
        .sort((a, b) => b.timestamp - a.timestamp)[0]
    : null;

  // Debug logging
  if (player && recentActions.length > 0) {
    console.log(
      `🎯 PlayerSeat ${player.name}: recent actions =`,
      recentActions.filter((a) => a.playerId === player.id)
    );
    console.log(`🎯 PlayerSeat ${player.name}: playerAction =`, playerAction);
  }
  if (!player) {
    return (
      <div className={`${className} flex flex-col items-center space-y-2`}>
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center backdrop-blur-sm transition-all duration-300 hover:border-white/40">
          <span className="text-white/40 text-xs font-medium">Empty</span>
        </div>
        <div className="text-xs text-white/40 font-medium">
          Seat {position + 1}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} flex flex-col items-center space-y-2 relative transition-all duration-300 ${
        isCurrentPlayer ? "animate-glow" : ""
      }`}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -left-2 w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse">
          D
        </div>
      )}

      {/* Action Badge - Always visible for any player */}
      {playerAction && (
        <div className="absolute -top-1 -right-1 z-[100]">
          <ActionBadge
            action={playerAction.action}
            amount={playerAction.amount}
            onExpire={() =>
              dispatch(
                removeActionBadge({
                  playerId: playerAction.playerId,
                  timestamp: playerAction.timestamp,
                })
              )
            }
          />
        </div>
      )}

      {/* Current Player Indicator */}
      {isCurrentPlayer && (
        <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg animate-pulse">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
      )}

      {/* Player Avatar Container */}
      <div className="relative">
        <div
          className={`w-12 h-12 md:w-16 md:h-16 rounded-full ${
            player.isFolded
              ? "bg-gradient-to-br from-gray-400 to-gray-600"
              : isCurrentPlayer
              ? "bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30"
              : "bg-gradient-to-br from-blue-500 to-blue-600"
          } flex items-center justify-center text-white font-bold relative overflow-hidden transition-all duration-300 border-2 md:border-3 ${
            isCurrentPlayer ? "border-green-300" : "border-white/20"
          }`}
        >
          {/* Avatar background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent"></div>
          </div>

          {player.avatar ? (
            <Image
              src={player.avatar}
              alt={player.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <span className="text-sm md:text-lg font-bold relative z-10">
              {player.name.charAt(0).toUpperCase()}
            </span>
          )}

          {/* All-in indicator */}
          {player.isAllIn && (
            <div className="absolute -bottom-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-bold shadow-lg">
              ALL-IN
            </div>
          )}
        </div>

        {/* Player status ring */}
        {!player.isFolded && (
          <div
            className={`absolute inset-0 rounded-full border-2 ${
              isCurrentPlayer
                ? "border-green-400 animate-pulse"
                : "border-transparent"
            } transition-all duration-300`}
          ></div>
        )}
      </div>

      {/* Player Name */}
      <div className="text-center">
        <div
          className={`text-xs md:text-sm font-bold ${
            player.isFolded ? "text-white/40" : "text-white"
          } max-w-16 md:max-w-20 truncate transition-all duration-300`}
        >
          {player.name}
        </div>
        {player.isFolded && (
          <div className="text-xs text-red-400 font-bold mt-1">FOLDED</div>
        )}
      </div>

      {/* Chips Display */}
      <div className="flex items-center space-x-1 glass-dark px-2 md:px-3 py-1 md:py-2 rounded-full">
        <div className="w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-sm"></div>
        <span className="text-xs md:text-sm font-bold text-yellow-300">
          $
          {player.chips > 1000
            ? `${(player.chips / 1000).toFixed(1)}k`
            : player.chips.toLocaleString()}
        </span>
      </div>

      {/* Current Bet */}
      {player.inPotThisRound > 0 && (
        <div className="glass bg-red-500/20 border-red-500/30 text-red-300 text-xs px-2 py-1 rounded-full font-bold animate-chipToss">
          $
          {player.inPotThisRound > 1000
            ? `${(player.inPotThisRound / 1000).toFixed(1)}k`
            : player.inPotThisRound.toLocaleString()}
        </div>
      )}

      {/* Hole Cards */}
      {player.holeCards.length > 0 && (
        <div className="flex space-x-1 mt-1">
          {player.holeCards.map((card, index) => (
            <div
              key={index}
              className={`transition-all duration-300 ${
                player.isFolded ? "opacity-40 grayscale" : ""
              } animate-cardDeal`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card
                card={card}
                isHidden={!showCards && !player.isFolded}
                size="small"
                className="poker-card transform scale-75 md:scale-90"
              />
            </div>
          ))}
        </div>
      )}

      {/* Action indicator */}
      {/* {isCurrentPlayer && !player.isFolded && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="glass bg-green-500/20 border-green-500/30 text-green-300 text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
            Your Turn
          </div>
        </div>
      )} */}
    </div>
  );
};
