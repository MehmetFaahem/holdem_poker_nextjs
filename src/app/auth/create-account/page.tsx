"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "@/store/authSlice";
import { AppDispatch, RootState } from "@/store";
import { showToast } from "@/utils/toast";

export default function CreateAccount() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user, validationErrors } = useSelector(
    (state: RootState) => state.auth
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({
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

  // Handle auth errors - show toast only for server errors, not validation errors
  useEffect(() => {
    if (error && !validationErrors) {
      // Only show general error toast if there are no validation errors
      // This prevents duplicate toasts when both error and validationErrors exist
      showToast.error(error);
    }
  }, [error, validationErrors]);

  // Handle validation errors from server
  useEffect(() => {
    if (validationErrors) {
      // Display each validation error as a separate toast
      Object.entries(validationErrors).forEach(([field, messages]) => {
        messages.forEach((message) => {
          showToast.error(`${field}: ${message}`);
        });
      });
    }
  }, [validationErrors]);

  // Clear errors when component unmounts or when starting a new submission
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateField = (name: string, value: string) => {
    let errorMessage = "";

    switch (name) {
      case "name":
        if (value.trim().length < 2) {
          errorMessage = "Name must be at least 2 characters";
        }
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = "Please enter a valid email address";
        }
        break;
      case "password":
        if (value.length < 6) {
          errorMessage = "Password must be at least 6 characters";
        }
        break;
      case "password_confirmation":
        if (value !== formData.password) {
          errorMessage = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    return errorMessage;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate the field
    const errorMessage = validateField(name, value);

    // If this is the password confirmation field, we need to revalidate it when password changes
    if (name === "password") {
      const confirmErrorMessage = formData.password_confirmation
        ? validateField("password_confirmation", formData.password_confirmation)
        : "";

      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
        password_confirmation: confirmErrorMessage,
      }));
    } else {
      // Update error state for the current field
      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    // Validate each field
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof typeof formData;
      const errorMessage = validateField(fieldName, formData[fieldName]);

      newErrors[fieldName] = errorMessage;

      if (errorMessage) {
        isValid = false;
        // Don't show toast here - validation errors are shown inline
        // This prevents duplicate toasts when the same validation fails
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors before submitting
    dispatch(clearError());

    // Validate form before submission
    if (!validateForm()) {
      // Show a single toast for client-side validation failure
      showToast.error("Please fix the errors above before submitting");
      return;
    }

    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      showToast.success("Account created successfully!");
      router.push("/auth/login");
    }
    // Note: Error handling is done by the useEffect hooks above
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
          <div className="w-full relative">
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
            {errors.name && (
              <p className="text-red-400 text-sm mt-1 ml-2">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="w-full relative">
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
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 ml-2">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="w-full relative">
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
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 ml-2">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="w-full relative">
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
            {errors.password_confirmation && (
              <p className="text-red-400 text-sm mt-1 ml-2">
                {errors.password_confirmation}
              </p>
            )}
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
