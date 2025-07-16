import { useEffect, useState } from "react";

interface ActionTimerProps {
  timeRemaining: number; // in milliseconds
  totalTime: number; // in milliseconds
  isActive: boolean;
  playerName?: string;
}

export const ActionTimer: React.FC<ActionTimerProps> = ({
  timeRemaining,
  totalTime,
  isActive,
  playerName,
}) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  useEffect(() => {
    setDisplayTime(timeRemaining);
  }, [timeRemaining]);

  // Calculate percentage for progress circle
  const percentage = totalTime > 0 ? (displayTime / totalTime) * 100 : 0;
  const seconds = Math.ceil(displayTime / 1000);

  // Get color based on remaining time
  const getTimerColor = () => {
    if (percentage > 50) return "#10b981"; // green
    if (percentage > 25) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const circumference = 2 * Math.PI * 45; // radius is 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (!isActive) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Player name indicator */}
      {playerName && (
        <div className="text-xs text-white/80 mb-2 font-medium">
          {playerName}'s turn
        </div>
      )}

      {/* Timer circle */}
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        <svg
          className="w-16 h-16 md:w-20 md:h-20 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getTimerColor()}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            style={{
              filter: "drop-shadow(0 0 6px currentColor)",
            }}
          />
        </svg>

        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-lg md:text-xl font-bold"
            style={{ color: getTimerColor() }}
          >
            {seconds}
          </span>
        </div>
      </div>

      {/* Warning indicator */}
      {percentage <= 25 && (
        <div className="text-xs text-red-400 mt-1 animate-pulse font-medium">
          Time running out!
        </div>
      )}
    </div>
  );
};
