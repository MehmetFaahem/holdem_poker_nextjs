"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  return (
    <div className="w-full  flex flex-col items-center gap-10">
      {/* Main Headline */}
      <h1 className="text-center z-10  font-blacklisted text-5xl md:text-7xl lg:text-8xl font-normal leading-[148%] uppercase tracking-wider">
        <span className="text-white">LOGIN TO </span>
        <span className="text-red-700">YOUR account</span>
      </h1>

      {/* Form Container */}
      <div className="w-full max-w-[469px] flex flex-col items-center gap-6">
        {/* Input Fields */}
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Email Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="email"
              placeholder="Email"
              className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="password"
              placeholder="Password"
              className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full h-[50px] md:h-[72px] relative z-10">
          <button
            className="w-full h-full cursor-pointer rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
            onClick={() => router.push("/stakes")}
          >
            <span className="text-black text-xl md:text-2xl font-medium leading-[148%] tracking-[-0.48px]">
              Login
            </span>
          </button>
        </div>

        {/* Forgot password link */}
        <div className="w-full text-center z-10">
          <button
            onClick={() => router.push("/auth/create-account")}
            className="text-[#C5C5C5] text-lg font-medium leading-[148%] tracking-[-0.36px] underline hover:text-white transition-colors"
          >
            Don't have an account?
          </button>
        </div>
      </div>
    </div>
  );
}
