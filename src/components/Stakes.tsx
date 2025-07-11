"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppSelector";
import { fetchStakes, Stake } from "@/store/stakesSlice";
import { joinTable, clearError } from "@/store/tableSlice";
import { BuyInModal } from "@/components/BuyInModal";

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

// Define stake card image mapping
const stakeCardImages = [
  "https://cdn.builder.io/api/v1/image/assets/TEMP/676484fa5e92e4a8ab9696be1e5c9aa6046dded9?width=730",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/d6085ad4e9c281bdcf12066c25d783e3c9af1ef3?width=912",
  "https://cdn.builder.io/api/v1/image/assets/TEMP/0379b9025e0bf263cb6d3d6ea666d6de6d679d46?width=730",
];

export default function Stakes() {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showBuyInModal, setShowBuyInModal] = useState(false);
  const [selectedStake, setSelectedStake] = useState<Stake | null>(null);

  const dispatch = useAppDispatch();
  const { stakes, loading, error } = useAppSelector((state) => state.stakes);
  const { token } = useAppSelector((state) => state.auth);
  const {
    isJoining,
    currentTable,
    error: tableError,
  } = useAppSelector((state) => state.table);

  // Fetch stakes data on component mount
  useEffect(() => {
    dispatch(fetchStakes());
  }, [dispatch]);

  // Redirect to login if authentication error
  useEffect(() => {
    if (error === "Authentication required" && !token) {
      router.push("/auth/login");
    }
  }, [error, token, router]);

  // Redirect to game if already at a table
  useEffect(() => {
    if (currentTable) {
      router.push("/game");
    }
  }, [currentTable, router]);

  const handlePrevious = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleStakeSelection = (stake: Stake) => {
    setSelectedStake(stake);
    setShowBuyInModal(true);
  };

  const handleBuyInConfirm = async (buyIn: number) => {
    if (!selectedStake) return;

    try {
      const result = await dispatch(
        joinTable({
          stake_id: selectedStake.id,
          buy_in: buyIn,
        })
      ).unwrap();

      // Navigate directly to the game page with table data
      router.push("/game");
    } catch (error) {
      console.error("Failed to join table:", error);
      // Error handling is done in the slice
    }
  };

  const handleBuyInCancel = () => {
    setShowBuyInModal(false);
    setSelectedStake(null);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        handlePrevious();
        break;
      case "ArrowRight":
        event.preventDefault();
        handleNext();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (stakes.length > 0) {
          handleStakeSelection(stakes[currentIndex]);
        }
        break;
    }
  };

  // Add keyboard event listeners
  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, stakes]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(97.64% 97.64% at 50% 35.09%, #626262 0%, #060606 95.33%)",
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999] backdrop-blur-sm">
          <div className="text-center text-white px-4">
            <div className="loading-spinner w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Loading Stakes...
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Fetching available stakes
            </p>
          </div>
        </div>
      )}

      {/* Buy-in Modal */}
      {selectedStake && (
        <BuyInModal
          isOpen={showBuyInModal}
          onClose={handleBuyInCancel}
          onConfirm={handleBuyInConfirm}
          stake={selectedStake}
          isLoading={isJoining}
        />
      )}

      {/* Error display for table joining */}
      {tableError && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999] backdrop-blur-sm">
          <div className="text-center text-white px-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Error Joining Table
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4">
              {tableError}
            </p>
            <button
              onClick={() => {
                // Clear the error and close modal
                dispatch(clearError());
                setShowBuyInModal(false);
                setSelectedStake(null);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999] backdrop-blur-sm">
          <div className="text-center text-white px-4">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Error Loading Stakes
            </h2>
            <p className="text-gray-300 text-sm sm:text-base mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchStakes())}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Background overlay image */}
      <div
        className="absolute inset-0 w-full h-full opacity-50"
        style={{
          backgroundImage:
            "url('https://cdn.builder.io/api/v1/image/assets/TEMP/45f45d068bd0c7cae775e29c90959604bf8342ad?width=3840')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />

      {/* Navigation arrows - better positioning for mobile */}
      <button
        onClick={handlePrevious}
        className="absolute hidden sm:block left-2 sm:left-4 md:left-20 top-1/2 -translate-y-1/2 z-[99999] p-2 sm:p-4 hover:opacity-75 transition-opacity touch-manipulation"
        aria-label="Previous slide"
      >
        <svg
          width="40"
          height="32"
          viewBox="0 0 64 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32.8753 44.2725L18.9194 30.4992H64V20.7017H19.3569L33.316 6.92761L26.2952 0L0 25.6845L25.8554 51.2L32.8753 44.2725Z"
            fill="white"
          />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute hidden sm:block right-2 sm:right-4 md:right-20 top-1/2 -translate-y-1/2 z-[99999] p-2 sm:p-4 hover:opacity-75 transition-opacity touch-manipulation"
        aria-label="Next slide"
      >
        <svg
          width="40"
          height="32"
          viewBox="0 0 64 52"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M31.1247 44.2725L45.0806 30.4992H0V20.7017H44.6431L30.684 6.92761L37.7048 0L64 25.6845L38.1446 51.2L31.1247 44.2725Z"
            fill="white"
          />
        </svg>
      </button>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-4">
        {/* Swiper slider - improved mobile spacing */}
        <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 px-[10%] sm:px-[8%] md:px-[10%]">
          {stakes.length > 0 && (
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={(swiper) => setCurrentIndex(swiper.realIndex)}
              modules={[Navigation, EffectCoverflow]}
              spaceBetween={10}
              slidesPerView={1}
              centeredSlides={true}
              effect="coverflow"
              coverflowEffect={{
                rotate: 0,
                stretch: 0,
                depth: 80,
                modifier: 1,
                slideShadows: false,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1.2,
                  spaceBetween: 15,
                  coverflowEffect: {
                    depth: 60,
                  },
                },
                640: {
                  slidesPerView: 1.5,
                  spaceBetween: 20,
                  coverflowEffect: {
                    depth: 80,
                  },
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                  coverflowEffect: {
                    depth: 100,
                  },
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 40,
                  coverflowEffect: {
                    depth: 100,
                  },
                },
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 60,
                  coverflowEffect: {
                    depth: 100,
                  },
                },
              }}
              className="!overflow-visible"
              loop={true}
            >
              {stakes.map((stake, index) => (
                <SwiperSlide key={stake.id} className="!h-auto">
                  {({ isActive }) => (
                    <div
                      className={`relative cursor-pointer ${
                        isActive
                          ? "transform scale-105 sm:scale-110"
                          : "transform scale-95 sm:scale-95 opacity-70 sm:opacity-80"
                      } transition-all duration-300 touch-manipulation`}
                      onClick={() => handleStakeSelection(stake)} // Single tap on mobile
                      onDoubleClick={() => handleStakeSelection(stake)} // Double click on desktop
                    >
                      {/* Card container */}
                      <div
                        className={`relative w-full aspect-[0.75] sm:aspect-[0.8] rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-300 ${
                          isActive
                            ? "border-2 border-white shadow-2xl"
                            : "border border-white/20"
                        }`}
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.10) 100%)",
                        }}
                      >
                        {/* Stakes section */}
                        <div className="absolute top-7 md:top-8 left-1/2 -translate-x-1/2 text-center z-10">
                          <div className="text-[#991D1D] text-2xl font-blacklisted tracking-wider mb-1 sm:mb-2 md:mb-4">
                            STAKES
                          </div>
                          <div className="text-white font-impact text-6xl md:text-5xl mt-6 md:mt-4">
                            {stake.blind.small_formatted}/
                            {stake.blind.big_formatted}
                          </div>
                        </div>

                        {/* Card image and buy-in section */}
                        <div className="absolute bottom-0 left-0 right-0 h-3/5 overflow-hidden rounded-b-2xl sm:rounded-b-3xl">
                          <img
                            src={
                              stakeCardImages[index % stakeCardImages.length]
                            }
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ mixBlendMode: "luminosity" }}
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <div className="text-white text-2xl sm:text-base md:text-lg lg:text-2xl font-blacklisted tracking-wider mb-1 sm:mb-2 md:mb-3">
                              BUY IN
                            </div>
                            <div className="text-[#991D1D] font-impact text-6xl md:text-5xl mt-6 md:mt-4">
                              {stake.buy_in.min_formatted} -{" "}
                              {stake.buy_in.max_formatted}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Instructions - improved mobile text sizing */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 px-4">
          <p
            className="text-gray-300 text-xs sm:text-sm md:text-lg lg:text-[22px] font-medium mb-1 sm:mb-2"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="sm:hidden">
              Tap a card to select your stakes and create a room
            </span>
            <span className="hidden sm:inline">
              Double click a card to select your stakes and create a room
            </span>
          </p>
          <p
            className="text-poker-gray text-xs sm:text-sm md:text-base lg:text-[20px] font-medium"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="hidden sm:inline">
              Use arrow keys to navigate • Press Enter to Select
            </span>
            <span className="sm:hidden">Swipe to navigate between options</span>
          </p>
        </div>

        {/* Play button - improved mobile positioning and sizing */}
        <div className="flex justify-center relative mb-8 sm:mb-0">
          <button
            onClick={() => router.push("/auth/play-with-friends")}
            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl touch-manipulation"
            style={{
              background:
                "linear-gradient(180deg, #991D1D -14.86%, #330A0A 127.7%)",
              border: "1px solid #F84C4C",
              boxShadow: "0px 12px 68px -8px #991D1D",
            }}
          >
            <svg
              width="32"
              height="22"
              viewBox="0 0 45 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-3 sm:w-6 sm:h-4 md:w-8 md:h-6"
            >
              <defs>
                <linearGradient
                  id="playButtonGradient"
                  x1="22"
                  y1="15"
                  x2="22"
                  y2="43.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M23.5 13.9C24.351 12.9743 24.9805 11.9115 25.3885 10.7115C25.7962 9.5115 26 8.27433 26 7C26 5.72567 25.7962 4.4885 25.3885 3.2885C24.9805 2.0885 24.351 1.02567 23.5 0.1C25.2563 0.302667 26.7147 1.061 27.875 2.375C29.035 3.68933 29.615 5.231 29.615 7C29.615 8.76933 29.035 10.311 27.875 11.625C26.7147 12.939 25.2563 13.6973 23.5 13.9ZM34 29.231V24.5385C34 23.4482 33.7782 22.4108 33.3345 21.4265C32.8908 20.4422 32.2613 19.5975 31.446 18.8925C32.9793 19.4028 34.3908 20.0913 35.6805 20.958C36.9702 21.8247 37.615 23.0182 37.615 24.5385V29.231H34ZM37.615 16.1155V12.1155H33.615V9.1155H37.615V5.1155H40.615V9.1155H44.615V12.1155H40.615V16.1155H37.615ZM15 14C13.075 14 11.427 13.3147 10.056 11.944C8.68533 10.573 8 8.925 8 7C8 5.075 8.68533 3.42717 10.056 2.0565C11.427 0.6855 13.075 0 15 0C16.925 0 18.5728 0.6855 19.9435 2.0565C21.3145 3.42717 22 5.075 22 7C22 8.925 21.3145 10.573 19.9435 11.944C18.5728 13.3147 16.925 14 15 14ZM0 29.231V24.7845C0 23.8052 0.266 22.8982 0.798 22.0635C1.33 21.2288 2.04083 20.5872 2.9305 20.1385C4.9075 19.1695 6.90183 18.4427 8.9135 17.958C10.9248 17.4733 12.9537 17.231 15 17.231C17.046 17.231 19.0748 17.4733 21.0865 17.958C23.0978 18.4427 25.092 19.1695 27.069 20.1385C27.9587 20.5872 28.6695 21.2288 29.2015 22.0635C29.7338 22.8982 30 23.8052 30 24.7845V29.231H0Z"
                fill="url(#playButtonGradient)"
              />
            </svg>
            <span
              className="font-inter font-bold text-center text-white text-sm sm:text-lg md:text-2xl"
              style={{
                background:
                  "linear-gradient(180deg, #FFF 62.54%, rgba(255, 255, 255, 0.00) 175.58%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.04em",
              }}
            >
              Play With Your Friends
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
