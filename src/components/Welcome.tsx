import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

interface WelcomeProps {
  onProceed?: () => void;
}

type ViewType = "welcome" | "login" | "createAccount";

const Welcome: React.FC<WelcomeProps> = ({ onProceed }) => {
  const router = useRouter();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const topLeftImageRef = useRef<HTMLImageElement>(null);
  const bottomRightImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state - hide everything
    gsap.set([titleRef.current, buttonsRef.current], { opacity: 0, y: 50 });
    gsap.set([topLeftImageRef.current, bottomRightImageRef.current], {
      opacity: 0,
      scale: 0.8,
      rotation: -15,
    });

    // Animate background images first
    tl.to([topLeftImageRef.current, bottomRightImageRef.current], {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 1.5,
      ease: "power2.out",
      stagger: 0.3,
    })
      .to(
        titleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      )
      .to(
        buttonsRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Add floating animation to background images
    gsap.to(topLeftImageRef.current, {
      y: -20,
      duration: 4,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });

    gsap.to(bottomRightImageRef.current, {
      y: 20,
      duration: 3.5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
      delay: 0.5,
    });

    // Add subtle rotation to title
    gsap.to(titleRef.current, {
      rotation: 1,
      duration: 8,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });
  }, []);

  const handleButtonHover = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleButtonLeave = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    gsap.to(buttonRef.current, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const WelcomeScreen = () => (
    <div
      id="welcome"
      className="relative z-10 flex flex-col items-center justify-center flex-1 w-full mx-auto"
    >
      <h1
        ref={titleRef}
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-blacklisted tracking-wider text-center px-4 leading-tight"
      >
        Welcome to <span className="text-[#991D1D]">Poker</span>
      </h1>

      <div
        ref={buttonsRef}
        className="w-full flex flex-col items-center gap-4 mt-8 sm:mt-10 lg:mt-14 max-w-[469px] px-4 sm:px-6"
      >
        {/* Login with existing account button */}
        <div className="w-full h-[50px] sm:h-[60px] lg:h-[70px] relative">
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full h-full cursor-pointer rounded-lg bg-[#474747] flex items-center justify-center hover:bg-[#525252] transition-colors"
            onMouseEnter={() =>
              handleButtonHover(
                React.createRef() as React.RefObject<HTMLButtonElement>
              )
            }
            onMouseLeave={() =>
              handleButtonLeave(
                React.createRef() as React.RefObject<HTMLButtonElement>
              )
            }
          >
            <span className="text-white text-lg sm:text-xl lg:text-2xl font-medium leading-[148%] tracking-[-0.48px] px-2 text-center">
              Login with existing account
            </span>
          </button>
        </div>

        {/* Or divider */}
        <div className="w-full h-[30px] relative flex items-center">
          <div className="flex-1 h-px bg-[#464647]"></div>
          <span className="px-4 sm:px-[27px] text-[#C5C5C5] text-base sm:text-lg lg:text-xl font-normal leading-[148%] tracking-[-0.4px]">
            Or
          </span>
          <div className="flex-1 h-px bg-[#464647]"></div>
        </div>

        {/* Create new account button */}
        <div className="w-full h-[50px] sm:h-[60px] lg:h-[70px] relative">
          <button
            onClick={() => router.push("/auth/create-account")}
            className="w-full h-full cursor-pointer rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            onMouseEnter={() =>
              handleButtonHover(
                React.createRef() as React.RefObject<HTMLButtonElement>
              )
            }
            onMouseLeave={() =>
              handleButtonLeave(
                React.createRef() as React.RefObject<HTMLButtonElement>
              )
            }
          >
            <span className="text-black text-lg sm:text-xl lg:text-2xl font-medium leading-[148%] tracking-[-0.48px] px-2 text-center">
              Create new account
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-0">
      <div className="">
        <Image
          ref={topLeftImageRef}
          src="/images/welcome/cards.png"
          alt="top_left"
          width={1000}
          height={1000}
          className="absolute top-[0] left-[-55%] md:top-[-10%] md:left-[-45%] w-[80%] sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          ref={bottomRightImageRef}
          src="/images/welcome/cards.png"
          alt="bottom_right"
          width={1000}
          height={1000}
          className="absolute bottom-[-25%] rotate-360 right-[-35%] md:bottom-[-115%] md:right-[-30%] w-[80%] sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          src="/images/welcome/bg.png"
          alt="bg"
          width={1000}
          height={1000}
          className="absolute top-0 right-0 w-full h-full opacity-60 sm:opacity-80 lg:opacity-100 z-0 object-cover"
        />
      </div>

      <WelcomeScreen />
    </div>
  );
};

export default Welcome;
