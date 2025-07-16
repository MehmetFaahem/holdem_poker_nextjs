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
      <div
        className={`${className} flex flex-col items-center w-[225px] h-[132px]`}
      >
        <div
          className="relative w-[74.497px] h-16"
          style={{ marginBottom: "-16px" }}
        >
          <div className="absolute w-[42px] h-[54px] left-0 top-[3px] transform rotate-[-6.194deg] bg-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white/30 text-xs">?</span>
          </div>
          <div className="absolute w-[42px] h-[55px] left-[19px] top-0 transform rotate-[15deg] bg-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white/30 text-xs">?</span>
          </div>
        </div>

        <div
          className="flex items-center w-[225px]"
          style={{
            padding: "12px 28px 12px 14px",
            gap: "16px",
            borderRadius: "80px",
            border: "2px solid rgba(255, 255, 255, 0.20)",
            background: "rgba(0, 0, 0, 0.20)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            className="flex-shrink-0 bg-white/10 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center"
            style={{
              width: "56px",
              height: "56px",
            }}
          >
            <span className="text-white/40 text-xs font-medium">Empty</span>
          </div>
          <div className="flex flex-col items-start">
            <div
              style={{
                color: "#666",
                fontFamily: "Inter",
                fontSize: "20px",
                fontWeight: "700",
                lineHeight: "150%",
                letterSpacing: "-0.8px",
              }}
            >
              Seat {position + 1}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${className} flex flex-col items-center w-[225px] h-[132px] relative transition-all duration-300 ${
        isCurrentPlayer ? "animate-glow" : ""
      }`}
    >
      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -left-2 w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-pulse z-10">
          D
        </div>
      )}

      {/* Action Badge */}
      {playerAction && (
        <div className="absolute -top-1 -right-1 z-[100]">
          <ActionBadge
            action={playerAction.action}
            amount={playerAction.amount}
            isAutoAction={playerAction.isAutoAction}
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

      {/* Playing cards at the top */}
      <div
        className="relative w-[74.497px] h-16"
        style={{ marginBottom: "-16px" }}
      >
        {player.holeCards.length > 0 ? (
          player.holeCards.map((card, index) => (
            <div
              key={index}
              className={`absolute transition-all duration-300 ${
                player.isFolded ? "opacity-40 grayscale" : ""
              } animate-cardDeal`}
              style={{
                width: "42px",
                height: index === 0 ? "54px" : "55px",
                left: index === 0 ? "0px" : "19px",
                top: index === 0 ? "3px" : "0px",
                transform: index === 0 ? "rotate(-6.194deg)" : "rotate(15deg)",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <Card
                card={card}
                isHidden={!showCards && !player.isFolded}
                size="small"
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <>
            <div
              className="absolute bg-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center"
              style={{
                width: "42px",
                height: "54px",
                left: "0px",
                top: "3px",
                transform: "rotate(-6.194deg)",
              }}
            >
              <span className="text-white/30 text-xs">?</span>
            </div>
            <div
              className="absolute bg-white/10 border border-dashed border-white/20 rounded-lg flex items-center justify-center"
              style={{
                width: "42px",
                height: "55px",
                left: "19px",
                top: "0px",
                transform: "rotate(15deg)",
              }}
            >
              <span className="text-white/30 text-xs">?</span>
            </div>
          </>
        )}
      </div>

      {/* Player info card */}
      <div
        className="flex items-center w-[225px] relative"
        style={{
          padding: "12px 28px 12px 14px",
          gap: "16px",
          borderRadius: "80px",
          border: `2px solid ${
            isCurrentPlayer ? "#6e1818" : "rgba(255, 255, 255, 0.30)"
          }`,
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.10) 100%)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Current Player Indicator */}
        {isCurrentPlayer && (
          <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full shadow-lg animate-pulse">
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          </div>
        )}

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`rounded-full overflow-hidden ${
              player.isFolded ? "opacity-50 grayscale" : ""
            }`}
            style={{
              width: "56px",
              height: "56px",
            }}
          >
            {player.avatar ? (
              <Image
                src={player.avatar}
                alt={`${player.name} avatar`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full ${
                  player.isFolded
                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                    : isCurrentPlayer
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                } flex items-center justify-center text-white font-bold`}
              >
                <span className="text-xl">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* All-in indicator */}
          {player.isAllIn && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
              ALL-IN
            </div>
          )}
        </div>

        {/* Player info */}
        <div className="flex flex-col items-start min-w-0 flex-1">
          <div
            className={`truncate max-w-full ${
              player.isFolded ? "opacity-50" : ""
            }`}
            style={{
              color: "#C5C5C5",
              fontFamily: "Inter",
              fontSize: "20px",
              fontWeight: "700",
              lineHeight: "150%",
              letterSpacing: "-0.8px",
            }}
          >
            {player.name}
            {player.isFolded && (
              <span className="text-red-400 ml-2">FOLDED</span>
            )}
          </div>
          <div
            style={{
              color: "#FFF",
              fontFamily: "Inter",
              fontSize: "20px",
              fontWeight: "700",
              lineHeight: "150%",
              letterSpacing: "-0.8px",
            }}
          >
            $
            {player.chips > 1000
              ? `${(player.chips / 1000).toFixed(1)}k`
              : player.chips.toLocaleString()}
          </div>
        </div>

        {/* Current Bet Display */}
        {player.inPotThisRound > 0 && (
          <div className="absolute -bottom-2 right-4 bg-red-500/80 border border-red-400 text-white text-xs px-2 py-1 rounded-full font-bold animate-chipToss backdrop-blur-sm">
            $
            {player.inPotThisRound > 1000
              ? `${(player.inPotThisRound / 1000).toFixed(1)}k`
              : player.inPotThisRound.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};
