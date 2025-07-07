import Image from "next/image";
import { Card as CardType } from "@/types/poker";

interface CardProps {
  card?: CardType;
  isHidden?: boolean;
  size?: "small" | "medium" | "large";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  card,
  isHidden = false,
  size = "medium",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-12 h-16",
    medium: "w-16 h-24",
    large: "w-20 h-32",
  };

  const cardImage = isHidden || !card ? "/images/cardback.png" : card.image;

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <Image
        src={cardImage}
        alt={isHidden || !card ? "Hidden card" : `${card.rank} of ${card.suit}`}
        fill
        sizes="(max-width: 768px) 48px, (max-width: 1200px) 64px, 80px"
        className="object-contain rounded-lg shadow-lg"
        priority={size === "large"}
      />
    </div>
  );
};
