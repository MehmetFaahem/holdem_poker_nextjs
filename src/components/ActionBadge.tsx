import { useEffect, useState } from "react";

interface ActionBadgeProps {
  action: string;
  amount?: number;
  isAutoAction?: boolean;
  onExpire: () => void;
}

export const ActionBadge: React.FC<ActionBadgeProps> = ({
  action,
  amount,
  isAutoAction = false,
  onExpire,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Start fade out animation after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    // Remove badge after 3 seconds total
    const expireTimer = setTimeout(() => {
      onExpire();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(expireTimer);
    };
  }, [onExpire]);

  const getBadgeConfig = (action: string) => {
    const actionConfig: {
      [key: string]: {
        emoji: string;
        text: string;
        bgColor: string;
        borderColor: string;
        textColor: string;
      };
    } = {
      fold: {
        emoji: "❌",
        text: "FOLD",
        bgColor: "bg-red-500/80",
        borderColor: "border-red-400",
        textColor: "text-white",
      },
      check: {
        emoji: "✅",
        text: "CHECK",
        bgColor: "bg-blue-500/80",
        borderColor: "border-blue-400",
        textColor: "text-white",
      },
      call: {
        emoji: "📞",
        text: "CALL",
        bgColor: "bg-green-500/80",
        borderColor: "border-green-400",
        textColor: "text-white",
      },
      bet: {
        emoji: "💰",
        text: "BET",
        bgColor: "bg-orange-500/80",
        borderColor: "border-orange-400",
        textColor: "text-white",
      },
      raise: {
        emoji: "📈",
        text: "RAISE",
        bgColor: "bg-purple-500/80",
        borderColor: "border-purple-400",
        textColor: "text-white",
      },
      "all-in": {
        emoji: "🚀",
        text: "ALL-IN",
        bgColor: "bg-pink-500/80",
        borderColor: "border-pink-400",
        textColor: "text-white",
      },
    };

    return actionConfig[action] || actionConfig.fold;
  };

  const config = getBadgeConfig(action);

  return (
    <div
      className={`absolute -top-8 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500 ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2"
      }`}
    >
      <div
        className={`${config.bgColor} ${config.borderColor} ${config.textColor} 
          px-3 py-1 rounded-full border-2 backdrop-blur-sm shadow-lg
          text-xs font-bold flex items-center space-x-1
          animate-bounce-in whitespace-nowrap ${
            isAutoAction ? "opacity-75" : ""
          }`}
      >
        <span className="text-sm">{config.emoji}</span>
        <span>{config.text}</span>
        {isAutoAction && <span className="text-xs opacity-75">(Auto)</span>}
        {amount && amount > 0 && (
          <span className="ml-1">${amount.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
};
