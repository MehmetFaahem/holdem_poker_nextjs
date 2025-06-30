import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

interface WelcomeProps {
  onProceed?: () => void;
}

type ViewType = "welcome" | "login" | "createAccount";

const Welcome: React.FC<WelcomeProps> = ({ onProceed }) => {
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const topLeftImageRef = useRef<HTMLImageElement>(null);
  const bottomRightImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (currentView !== "welcome") return;

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
  }, [currentView]);

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

  const Login = () => {
    return (
      <div className="w-full  flex flex-col items-center gap-10">
        {/* Back Button */}
        {/* <button
          onClick={() => setCurrentView("welcome")}
          className="absolute top-8 left-8 z-20 text-white hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-2">Back</span>
        </button> */}

        {/* Main Headline */}
        <h1 className="text-center font-blacklisted text-6xl md:text-7xl lg:text-8xl font-normal leading-[148%] uppercase tracking-wider">
          <span className="text-white">LOGIN TO </span>
          <span className="text-red-700">YOUR account</span>
        </h1>

        {/* Form Container */}
        <div className="w-full max-w-[469px] flex flex-col items-center gap-6">
          {/* Input Fields */}
          <div className="flex flex-col items-start gap-4 w-full">
            {/* Email Input */}
            <div className="w-full h-[72px] relative">
              <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
              <input
                type="email"
                placeholder="Email"
                className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="w-full h-[72px] relative">
              <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
              <input
                type="password"
                placeholder="Password"
                className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              />
            </div>
          </div>

          {/* Login Button */}
          <div className="w-full h-[72px] relative">
            <button className="w-full h-full rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <span className="text-black text-2xl font-medium leading-[148%] tracking-[-0.48px]">
                Login
              </span>
            </button>
          </div>

          {/* Forgot password link */}
          <div className="w-full text-center">
            <a
              href="#"
              className="text-[#C5C5C5] text-lg font-medium leading-[148%] tracking-[-0.36px] underline hover:text-white transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    );
  };

  const CreateAccount = () => {
    return (
      <div className="w-full flex flex-col items-center gap-10">
        {/* Back Button */}
        {/* <button
          onClick={() => setCurrentView("welcome")}
          className="absolute top-8 left-8 z-20 text-white hover:text-gray-300 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-2">Back</span>
        </button> */}

        {/* Main Headline */}
        <h1 className="text-center font-blacklisted text-6xl md:text-7xl lg:text-8xl font-normal leading-[148%] uppercase tracking-wider">
          <span className="text-white">Create a </span>
          <span className="text-red-700">free account</span>
        </h1>

        {/* Form Container */}
        <div className="w-full max-w-[469px] flex flex-col items-center gap-6">
          {/* Input Fields */}
          <div className="flex flex-col items-start gap-4 w-full">
            {/* Email Input */}
            <div className="w-full h-[72px] relative">
              <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
              <input
                type="email"
                placeholder="Email"
                className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="w-full h-[72px] relative">
              <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
              <input
                type="password"
                placeholder="Password"
                className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="w-full h-[72px] relative">
              <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
              <input
                type="password"
                placeholder="Confirm Password"
                className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
              />
            </div>
          </div>

          {/* Create Account Button */}
          <div className="w-full h-[72px] relative">
            <button className="w-full h-full rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors">
              <span className="text-black text-2xl font-medium leading-[148%] tracking-[-0.48px]">
                Create new account
              </span>
            </button>
          </div>

          {/* Already have account link */}
          <div className="w-full text-center">
            <button
              onClick={() => setCurrentView("login")}
              className="text-[#C5C5C5] text-lg font-medium leading-[148%] tracking-[-0.36px] underline hover:text-white transition-colors"
            >
              Already have an account?
            </button>
          </div>
        </div>
      </div>
    );
  };

  const WelcomeScreen = () => (
    <div
      id="welcome"
      className="relative z-10 flex flex-col items-center justify-center flex-1 w-full mx-auto"
    >
      <h1
        ref={titleRef}
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-blacklisted tracking-wider text-center px-4 leading-tight"
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
            onClick={() => setCurrentView("login")}
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
            onClick={() => setCurrentView("createAccount")}
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
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden px-4 sm:px-6 lg:px-0"
    >
      <div className="">
        <Image
          ref={topLeftImageRef}
          src="/images/welcome/cards.png"
          alt="top_left"
          width={1000}
          height={1000}
          className="absolute top-[-100px]  left-[-850px] w-1/3 sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          ref={bottomRightImageRef}
          src="/images/welcome/cards.png"
          alt="bottom_right"
          width={1000}
          height={1000}
          className="absolute bottom-[-800px] right-[-700px] w-1/3 sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          src="/images/welcome/bg.png"
          alt="bg"
          width={1000}
          height={1000}
          className="absolute top-0 right-0 w-full h-full opacity-60 sm:opacity-80 lg:opacity-100 z-0"
        />
      </div>

      {currentView === "welcome" && <WelcomeScreen />}
      {currentView === "login" && <Login />}
      {currentView === "createAccount" && <CreateAccount />}
    </div>
  );
};

export default Welcome;
