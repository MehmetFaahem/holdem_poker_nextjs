"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store";
import { toast } from "react-toastify";

export default function CreateAccount() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  // Redirect if already registered
  useEffect(() => {
    if (user) {
      router.push("/auth/login");
    }
  }, [user, router]);

  // Show error toast if registration fails
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      toast.success("Account created successfully!");
      router.push("/auth/login");
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-10">
      {/* Main Headline */}
      <h1 className="text-center z-10 font-blacklisted text-5xl md:text-7xl lg:text-8xl font-normal leading-[148%] uppercase tracking-wider">
        <span className="text-white">Create a </span>
        <span className="text-red-700">free account</span>
      </h1>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[469px] flex flex-col items-center gap-6"
      >
        {/* Input Fields */}
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Name Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>

          {/* Email Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="absolute inset-0 w-full h-full px-6 py-5  bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>

          {/* Password Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="w-full h-[50px] md:h-[72px] relative">
            <div className="absolute inset-0 rounded-lg border border-white/30 bg-gradient-to-b from-black/30 to-black/10 backdrop-blur-sm"></div>
            <input
              type="password"
              name="password_confirmation"
              placeholder="Confirm Password"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="absolute inset-0 w-full h-full px-6 py-5 bg-transparent text-white placeholder-[#C5C5C5] text-xl font-normal leading-[148%] tracking-[-0.4px] rounded-lg border-none outline-none"
            />
          </div>
        </div>

        {/* Create Account Button */}
        <div className="w-full h-[50px] md:h-[72px] relative z-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-full cursor-pointer rounded-lg bg-white flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="text-black text-xl md:text-2xl font-medium leading-[148%] tracking-[-0.48px]">
              {loading ? "Creating account..." : "Create new account"}
            </span>
          </button>
        </div>

        {/* Already have account link */}
        <div className="w-full text-center z-10">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-[#C5C5C5] cursor-pointer text-lg font-medium leading-[148%] tracking-[-0.36px] underline hover:text-white transition-colors"
          >
            Already have an account?
          </button>
        </div>
      </form>
    </div>
  );
}
