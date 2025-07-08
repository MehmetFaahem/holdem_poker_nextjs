"use client";

import Welcome from "@/components/Welcome";

export default function Home() {
  const handleProceedFromWelcome = () => {
    // This will be handled by the Welcome component's internal navigation
  };

  return <Welcome onProceed={handleProceedFromWelcome} />;
}
