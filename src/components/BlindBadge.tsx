interface BlindBadgeProps {
  type: "small" | "big";
  className?: string;
}

export const BlindBadge: React.FC<BlindBadgeProps> = ({
  type,
  className = "",
}) => {
  const isSmallBlind = type === "small";

  return (
    <div
      className={`w-8 h-8 md:w-9 md:h-9 border-2 border-white rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg z-10 ${
        isSmallBlind
          ? "bg-gradient-to-br from-blue-500 to-blue-700"
          : "bg-gradient-to-br from-red-500 to-red-700"
      } ${className}`}
    >
      {isSmallBlind ? "SB" : "BB"}
    </div>
  );
};
