"use client";

import { useState, useEffect } from "react";

export interface OrientationState {
  isPortrait: boolean;
  isLandscape: boolean;
  isMobile: boolean;
  screenWidth: number;
  screenHeight: number;
  angle: number;
}

export function useOrientation(): OrientationState {
  const [orientation, setOrientation] = useState<OrientationState>({
    isPortrait: true,
    isLandscape: false,
    isMobile: false,
    screenWidth: 0,
    screenHeight: 0,
    angle: 0,
  });

  useEffect(() => {
    const updateOrientation = () => {
      if (typeof window !== "undefined") {
        const { innerWidth, innerHeight } = window;
        const isMobileDevice = innerWidth <= 768;
        const isPortraitMode = innerHeight > innerWidth;

        // Get screen orientation angle if available
        let angle = 0;
        if (window.screen?.orientation) {
          angle = window.screen.orientation.angle;
        }

        setOrientation({
          isPortrait: isPortraitMode,
          isLandscape: !isPortraitMode,
          isMobile: isMobileDevice,
          screenWidth: innerWidth,
          screenHeight: innerHeight,
          angle,
        });

        // Force landscape orientation on mobile devices when in game
        if (isMobileDevice && isPortraitMode) {
          // Try to lock to landscape if the Screen Orientation API is available
          if ("screen" in window && "orientation" in window.screen) {
            const screenOrientation = window.screen.orientation as any;
            if (typeof screenOrientation.lock === "function") {
              screenOrientation
                .lock("landscape-primary")
                .catch((err: unknown) => {
                  console.log("Landscape lock not supported or failed:", err);
                });
            }
          }
        }
      }
    };

    // Initial check
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener("orientationchange", updateOrientation);
    window.addEventListener("resize", updateOrientation);

    // Screen Orientation API event listener
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener("change", updateOrientation);
    }

    return () => {
      window.removeEventListener("orientationchange", updateOrientation);
      window.removeEventListener("resize", updateOrientation);

      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener(
          "change",
          updateOrientation
        );
      }
    };
  }, []);

  return orientation;
}

export function lockOrientation(
  orientation: "portrait" | "landscape"
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (
      typeof window !== "undefined" &&
      "screen" in window &&
      "orientation" in window.screen
    ) {
      const screenOrientation = window.screen.orientation as any;
      const lockValue =
        orientation === "portrait" ? "portrait-primary" : "landscape-primary";

      if (typeof screenOrientation.lock === "function") {
        screenOrientation
          .lock(lockValue)
          .then(() => resolve())
          .catch((err: unknown) => reject(err));
      } else {
        reject(new Error("Screen Orientation lock not supported"));
      }
    } else {
      reject(new Error("Screen Orientation API not supported"));
    }
  });
}

export function unlockOrientation(): void {
  if (
    typeof window !== "undefined" &&
    "screen" in window &&
    "orientation" in window.screen
  ) {
    const screenOrientation = window.screen.orientation as any;
    if (typeof screenOrientation.unlock === "function") {
      screenOrientation.unlock();
    }
  }
}
