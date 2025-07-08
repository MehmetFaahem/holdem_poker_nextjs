"use client";

import React from "react";

interface LandscapeWarningProps {
  isVisible: boolean;
}

export const LandscapeWarning: React.FC<LandscapeWarningProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="landscape-warning">
      <div className="rotate-icon">📱</div>
      <h2>Please Rotate Your Device</h2>
      <p>
        For the best poker experience, please rotate your device to landscape
        mode.
      </p>
      <p className="text-sm opacity-60">
        The poker table is optimized for landscape orientation on mobile
        devices.
      </p>
    </div>
  );
};
