"use client";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { getCookie } from "cookies-next";
import { setCredentials } from "@/store/authSlice";
import { AppDispatch } from "@/store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for token in cookies
    const token = getCookie("token");

    if (token) {
      // If token exists, try to get user data
      const getUserData = async () => {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
          const response = await fetch(`${baseUrl}/api/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Set user data in Redux store
            dispatch(
              setCredentials({
                user: userData.user,
                token: token.toString(),
              })
            );
          } else {
            // If token is invalid, redirect to login
            if (!pathname?.startsWith("/auth/")) {
              router.push("/auth/login");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      getUserData();
    } else {
      // If no token and on protected route, redirect to login
      const protectedPaths = ["/stakes", "/play-with-friends", "/game"];
      if (
        pathname &&
        protectedPaths.some((path) => pathname.startsWith(path))
      ) {
        router.push("/auth/login");
      }
    }
  }, [dispatch, router, pathname]);

  return <>{children}</>;
}
