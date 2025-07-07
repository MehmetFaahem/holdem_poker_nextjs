import { useState } from "react";

interface RaiseBetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRaise: (amount: number) => void;
  minBet?: number;
  maxBet?: number;
}

export function RaiseBetModal({
  isOpen,
  onClose,
  onRaise,
  minBet = 0,
  maxBet = 10000,
}: RaiseBetModalProps) {
  const [betAmount, setBetAmount] = useState(Math.max(750, minBet));

  if (!isOpen) return null;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBetAmount(parseInt(e.target.value));
  };

  const handleRaise = () => {
    onRaise(betAmount);
    onClose();
  };

  const sliderPercentage = ((betAmount - minBet) / (maxBet - minBet)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm top-[-40%] rounded-[24px]">
      <div
        className="relative w-[365px] h-[377px] rounded-[24px] border-2 flex flex-col justify-center items-center gap-6 p-6 pt-10 pb-6"
        style={{
          borderColor: "rgba(255, 255, 255, 0.20)",
          background:
            "linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, rgba(0, 0, 0, 0.10) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Bet Amount Display */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div
            className="flex justify-center items-center gap-2 w-full py-2 px-0 rounded border border-dashed"
            style={{
              borderColor: "#5D5D5D",
              background: "#151515",
            }}
          >
            <div
              className="text-white font-inter font-extrabold text-5xl leading-[148%]"
              style={{
                fontSize: "48px",
                letterSpacing: "-0.96px",
              }}
            >
              {betAmount}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center gap-10 w-full">
            <div
              className="text-white text-center font-inter font-medium text-2xl leading-[150%]"
              style={{ letterSpacing: "-0.96px" }}
            >
              Raise Bet amount
            </div>

            {/* Slider Section */}
            <div className="flex flex-col items-start gap-2 w-full">
              <div className="flex flex-col items-start gap-8 w-full">
                {/* Slider Track and Handle */}
                <div className="relative w-full">
                  {/* Background Track */}
                  <div
                    className="h-1.5 w-full rounded-full"
                    style={{ background: "#434343" }}
                  />

                  {/* Progress Track */}
                  <div
                    className="absolute top-0 h-1.5 rounded-full bg-white"
                    style={{ width: `${sliderPercentage}%` }}
                  />

                  {/* Slider Handle */}
                  <div
                    className="absolute top-[-9px] w-6 h-6 rounded-full"
                    style={{
                      left: `calc(${sliderPercentage}% - 12px)`,
                      background:
                        "linear-gradient(180deg, #991D1D -38.1%, #DB2626 114.29%)",
                    }}
                  />

                  {/* Hidden Input */}
                  <input
                    type="range"
                    min={minBet}
                    max={maxBet}
                    value={betAmount}
                    onChange={handleSliderChange}
                    className="absolute top-0 w-full h-1.5 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Min/Max Labels */}
              <div className="flex justify-between items-start w-full">
                <div
                  className="text-center font-inter font-medium text-base leading-[150%]"
                  style={{ letterSpacing: "-0.64px" }}
                >
                  <span style={{ color: "#8E8E8E" }}>Min: </span>
                  <span className="text-white">{minBet}</span>
                </div>
                <div
                  className="text-right font-inter font-medium text-base leading-[150%]"
                  style={{ letterSpacing: "-0.64px" }}
                >
                  <span style={{ color: "#8E8E8E" }}>Max: </span>
                  <span className="text-white">{maxBet}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Raise Button */}
        <button
          onClick={handleRaise}
          className="flex h-16 py-2 px-10 justify-center items-center gap-2 w-full rounded-lg"
          style={{
            background:
              "linear-gradient(180deg, #991D1D -38.1%, #DB2626 114.29%)",
          }}
        >
          <div
            className="text-white font-inter font-bold text-2xl leading-[148%]"
            style={{ letterSpacing: "-0.48px" }}
          >
            Raise
          </div>
        </button>

        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
