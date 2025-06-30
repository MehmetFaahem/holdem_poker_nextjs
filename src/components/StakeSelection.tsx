"use client";

import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

export interface StakeData {
  stakes: string;
  buyIn: string;
  minCall: number;
  maxCall: number;
  startingChips: number;
}

interface StakeSelectionProps {
  playerName: string;
  onStakeSelected: (playerName: string, stakeData: StakeData) => void;
  onBack: () => void;
  isVisible: boolean;
}

const stakesData: StakeData[] = [
  {
    stakes: "$25K/$75K",
    buyIn: "$2M - $10M",
    minCall: 25000,
    maxCall: 75000,
    startingChips: 2000000,
  },
  {
    stakes: "$50K/$100K",
    buyIn: "$2M - $10M",
    minCall: 50000,
    maxCall: 100000,
    startingChips: 2000000,
  },
  {
    stakes: "$10K/$50K",
    buyIn: "$2M - $10M",
    minCall: 10000,
    maxCall: 50000,
    startingChips: 2000000,
  },
  {
    stakes: "$5K/$25K",
    buyIn: "$1M - $5M",
    minCall: 5000,
    maxCall: 25000,
    startingChips: 1000000,
  },
  {
    stakes: "$100K/$200K",
    buyIn: "$5M - $20M",
    minCall: 100000,
    maxCall: 200000,
    startingChips: 5000000,
  },
  {
    stakes: "$1K/$5K",
    buyIn: "$500K - $2M",
    minCall: 1000,
    maxCall: 5000,
    startingChips: 500000,
  },
];

export const StakeSelection: React.FC<StakeSelectionProps> = ({
  playerName,
  onStakeSelected,
  onBack,
  isVisible,
}) => {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with middle card
  const [isLoading, setIsLoading] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  const handleStakeSelection = (stakeIndex: number) => {
    const selectedStake = stakesData[stakeIndex];
    if (!playerName) {
      alert("Player name is required. Please go back and enter your name.");
      return;
    }

    setIsLoading(true);
    onStakeSelected(playerName, selectedStake);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isVisible) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        swiperRef.current?.slidePrev();
        break;
      case "ArrowRight":
        event.preventDefault();
        swiperRef.current?.slideNext();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleStakeSelection(currentIndex);
        break;
      case "Escape":
        event.preventDefault();
        onBack();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="stake-selection-screen">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Creating Room...</h2>
            <p>Setting up your poker room with the selected stakes</p>
          </div>
        </div>
      )}

      <div className="container">
        <div className="main-content">
          {/* Back Button */}
          {/* <button
            onClick={onBack}
            className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button> */}

          {/* Desktop Layout */}
          <div className="desktop-layout">
            {/* Left Arrow */}
            <button
              className="arrow-button"
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Navigate left"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32 40.7693L33.836 38.9333L28.236 33.3333H41.3333V30.6667H28.236L33.836 25.0667L32 23.2307L23.2307 32L32 40.7693ZM32.0087 56C28.69 56 25.5698 55.3702 22.648 54.1107C19.7267 52.8511 17.1853 51.1418 15.024 48.9827C12.8627 46.8236 11.1518 44.2844 9.89133 41.3653C8.63044 38.4467 8 35.3278 8 32.0087C8 28.69 8.62978 25.5698 9.88933 22.648C11.1489 19.7267 12.8582 17.1853 15.0173 15.024C17.1764 12.8627 19.7156 11.1518 22.6347 9.89133C25.5533 8.63044 28.6722 8 31.9913 8C35.31 8 38.4302 8.62978 41.352 9.88934C44.2733 11.1489 46.8147 12.8582 48.976 15.0173C51.1373 17.1764 52.8482 19.7156 54.1087 22.6347C55.3696 25.5533 56 28.6722 56 31.9913C56 35.31 55.3702 38.4302 54.1107 41.352C52.8511 44.2733 51.1418 46.8147 48.9827 48.976C46.8236 51.1373 44.2844 52.8482 41.3653 54.1087C38.4467 55.3696 35.3278 56 32.0087 56ZM32 53.3333C37.9556 53.3333 43 51.2667 47.1333 47.1333C51.2667 43 53.3333 37.9556 53.3333 32C53.3333 26.0444 51.2667 21 47.1333 16.8667C43 12.7333 37.9556 10.6667 32 10.6667C26.0444 10.6667 21 12.7333 16.8667 16.8667C12.7333 21 10.6667 26.0444 10.6667 32C10.6667 37.9556 12.7333 43 16.8667 47.1333C21 51.2667 26.0444 53.3333 32 53.3333Z"
                  fill="white"
                />
              </svg>
            </button>

            {/* Swiper Container */}
            <div className="stakes-swiper-container">
              <Swiper
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView="auto"
                initialSlide={currentIndex}
                spaceBetween={10}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 50,
                  modifier: 1,
                }}
                keyboard={{
                  enabled: true,
                  onlyInViewport: true,
                }}
                loop={true}
                modules={[EffectCoverflow, Navigation, Keyboard]}
                onSwiper={(swiper: SwiperType) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={(swiper: SwiperType) => {
                  setCurrentIndex(swiper.realIndex);
                }}
                className="stakes-swiper"
              >
                {stakesData.map((stake, index) => (
                  <SwiperSlide key={index}>
                    <div
                      className="stake-card"
                      onDoubleClick={() => handleStakeSelection(currentIndex)}
                    >
                      <div className="card-container">
                        <div className="card-top">
                          <div className="stakes-label">STAKES</div>
                          <div className="stakes-amount">{stake.stakes}</div>
                        </div>
                        <div className="card-bottom">
                          <button
                            className="buy-in-button"
                            onClick={() => handleStakeSelection(currentIndex)}
                          >
                            BUY IN
                          </button>
                          <div className="buy-in-amount">{stake.buyIn}</div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Right Arrow */}
            <button
              className="arrow-button"
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Navigate right"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M32 40.7693L40.7693 32L32 23.2307L30.164 25.0667L35.764 30.6667H22.6667V33.3333H35.764L30.164 38.9333L32 40.7693ZM32.0087 56C28.69 56 25.5698 55.3702 22.648 54.1107C19.7267 52.8511 17.1853 51.1418 15.024 48.9827C12.8627 46.8236 11.1518 44.2844 9.89133 41.3653C8.63044 38.4467 8 35.3278 8 32.0087C8 28.69 8.62978 25.5698 9.88933 22.648C11.1489 19.7267 12.8582 17.1853 15.0173 15.024C17.1764 12.8627 19.7156 11.1518 22.6347 9.89133C25.5533 8.63044 28.6722 8 31.9913 8C35.31 8 38.4302 8.62978 41.352 9.88934C44.2733 11.1489 46.8147 12.8582 48.976 15.0173C51.1373 17.1764 52.8482 19.7156 54.1087 22.6347C55.3696 25.5533 56 28.6722 56 31.9913C56 35.31 55.3702 38.4302 54.1107 41.352C52.8511 44.2733 51.1418 46.8147 48.9827 48.976C46.8236 51.1373 44.2844 52.8482 41.3653 54.1087C38.4467 55.3696 35.3278 56 32.0087 56ZM32 53.3333C37.9556 53.3333 43 51.2667 47.1333 47.1333C51.2667 43 53.3333 37.9556 53.3333 32C53.3333 26.0444 51.2667 21 47.1333 16.8667C43 12.7333 37.9556 10.6667 32 10.6667C26.0444 10.6667 21 12.7333 16.8667 16.8667C12.7333 21 10.6667 26.0444 10.6667 32C10.6667 37.9556 12.7333 43 16.8667 47.1333C21 51.2667 26.0444 53.3333 32 53.3333Z"
                  fill="white"
                />
              </svg>
            </button>
          </div>

          {/* Selection Instructions */}
          <div className="selection-instructions">
            <p>Double-click a card to select your stakes and create a room</p>
            <p className="keyboard-hint">
              Use arrow keys to navigate • Press Enter to select • Press Escape
              to go back
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stake-selection-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #0f0f0f;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .main-content {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
        }

        .desktop-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          gap: 3rem;
        }

        .stakes-swiper-container {
          width: 80%;
          padding: 50px 0;
          overflow: visible;
        }

        .stakes-swiper {
          width: 100%;
          padding-top: 50px;
          padding-bottom: 50px;
          overflow: visible;
        }

        :global(.stakes-swiper .swiper-slide) {
          background-position: center;
          background-size: cover;
          width: 380px;
          height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stake-card {
          position: relative;
          width: 100%;
          height: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .card-container {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          border: 2px solid #576d67;
          transition: all 0.3s ease;
        }

        :global(.swiper-slide .stake-card) {
          opacity: 0.4;
          transform: scale(0.8);
        }

        :global(.swiper-slide-active .stake-card),
        :global(.swiper-slide-duplicate-active .stake-card) {
          opacity: 1;
          transform: scale(1);
        }

        :global(.swiper-slide-active .card-container),
        :global(.swiper-slide-duplicate-active .card-container) {
          border-color: #20dca4;
        }

        :global(.swiper-slide-next .stake-card),
        :global(.swiper-slide-prev .stake-card) {
          opacity: 0.7;
          transform: scale(0.85);
        }

        .stake-card:hover .card-container {
          border-color: #20dca4;
        }

        .card-top {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 1rem 0 1rem;
        }

        .stakes-label {
          color: #9effe2;
          text-align: center;
          font-size: 23px;
          font-weight: 600;
          letter-spacing: -1.61px;
          margin-bottom: 8px;
        }

        .stakes-amount {
          text-align: center;
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -3.12px;
          line-height: 1;
          background: linear-gradient(180deg, #fff 50%, #797272 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .card-bottom {
          position: absolute;
          bottom: 6px;
          left: 6px;
          right: 6px;
          height: 249px;
          border-radius: 20px;
          background: linear-gradient(180deg, #117658 0%, #20dca4 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .buy-in-button {
          display: inline-flex;
          padding: 12px 20px;
          justify-content: center;
          align-items: center;
          border-radius: 104px;
          background: #fff;
          color: #0c0c0c;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: -0.96px;
          transition: all 0.2s ease;
        }

        .stake-card:hover .buy-in-button {
          transform: scale(1.05);
        }

        .buy-in-amount {
          color: #fff;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1.68px;
        }

        .arrow-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 3;
        }

        .arrow-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.1);
        }

        .arrow-button svg {
          width: 48px;
          height: 48px;
          transition: transform 0.2s ease;
        }

        .arrow-button:hover svg {
          transform: scale(1.1);
        }

        .selection-instructions {
          text-align: center;
          margin-top: 2rem;
          color: #9effe2;
        }

        .selection-instructions p {
          margin: 0.5rem 0;
          font-size: 16px;
          font-weight: 500;
          font-family: "Inter", -apple-system, "Roboto", "Helvetica", sans-serif;
        }

        .keyboard-hint {
          font-size: 14px !important;
          color: #576d67 !important;
          font-weight: 400 !important;
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 15, 15, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(10px);
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #576d67;
          border-top: 4px solid #20dca4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-content h2 {
          margin: 0 0 0.5rem 0;
          font-size: 24px;
          font-weight: 600;
        }

        .loading-content p {
          margin: 0;
          font-size: 16px;
          opacity: 0.8;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          :global(.stakes-swiper .swiper-slide) {
            width: 304px;
            height: 384px;
          }

          .desktop-layout {
            padding: 0 1rem;
          }

          .card-top {
            padding-top: 3rem;
          }

          .stakes-label {
            font-size: 18.4px;
            letter-spacing: -1.288px;
          }

          .stakes-amount {
            font-size: 41.6px;
            letter-spacing: -2.496px;
          }

          .card-bottom {
            height: 199px;
            gap: 9.6px;
          }

          .buy-in-button {
            padding: 9.6px 16px;
            font-size: 12.8px;
            letter-spacing: -0.768px;
          }

          .buy-in-amount {
            font-size: 22.4px;
            letter-spacing: -1.344px;
          }
        }

        @media (max-width: 768px) {
          .desktop-layout {
            gap: 1rem;
          }

          .stakes-swiper-container {
            width: 90%;
          }

          :global(.stakes-swiper .swiper-slide) {
            width: 280px;
            height: 380px;
          }

          .card-top {
            padding-top: 2rem;
          }

          .stakes-label {
            font-size: 16px;
            letter-spacing: -0.8px;
            margin-bottom: 6px;
          }

          .stakes-amount {
            font-size: 32px;
            letter-spacing: -1.8px;
          }

          .card-bottom {
            height: 180px;
            gap: 8px;
          }

          .buy-in-button {
            padding: 8px 16px;
            font-size: 12px;
            letter-spacing: -0.6px;
          }

          .buy-in-amount {
            font-size: 20px;
            letter-spacing: -1px;
          }

          .container {
            padding: 1rem;
          }

          .arrow-button {
            width: 48px;
            height: 48px;
          }

          .arrow-button svg {
            width: 32px;
            height: 32px;
          }
        }

        @media (max-width: 480px) {
          .desktop-layout {
            gap: 0.5rem;
          }

          .stakes-swiper-container {
            width: 95%;
          }

          :global(.stakes-swiper .swiper-slide) {
            width: 240px;
            height: 320px;
          }

          .stakes-amount {
            font-size: 24px;
          }

          .card-bottom {
            height: 140px;
          }

          .buy-in-amount {
            font-size: 16px;
          }

          .arrow-button {
            width: 40px;
            height: 40px;
          }

          .arrow-button svg {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </div>
  );
};
