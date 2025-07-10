"use client";

import React, { useRef } from "react";
import Image from "next/image";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topLeftImageRef = useRef<HTMLImageElement>(null);
  const bottomRightImageRef = useRef<HTMLImageElement>(null);

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
          className="absolute top-[0] left-[-55%] md:top-[-10%] md:left-[-45%] w-[80%] sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          ref={bottomRightImageRef}
          src="/images/welcome/cards.png"
          alt="bottom_right"
          width={1000}
          height={1000}
          className="absolute bottom-[-65vw] rotate-360 right-[-35%] md:bottom-[-56vw] md:right-[-30%] w-[80%] sm:w-1/2 lg:w-[70%] opacity-60 sm:opacity-80 lg:opacity-100 z-20"
        />
        <Image
          src="/images/welcome/bg.png"
          alt="bg"
          width={1000}
          height={1000}
          className="absolute top-0 right-0 w-full h-full opacity-60 sm:opacity-80 lg:opacity-100 z-0 object-cover"
        />
      </div>
      {children}
    </div>
  );
};

export default AuthLayout;
