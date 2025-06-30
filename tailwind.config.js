/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Courier New", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "card-bg": "rgba(255, 255, 255, 0.05)",
        "card-border": "rgba(255, 255, 255, 0.1)",
        "table-felt": "#1e7e34",
        gold: "#ffd700",
        "poker-red": "#dc2626",
        "poker-blue": "#2563eb",
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out",
        slideInUp: "slideInUp 0.5s ease-out",
        cardDeal: "cardDeal 0.8s ease-out",
        chipToss: "chipToss 0.5s ease-out",
        glow: "glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
        winner: "winnerCelebration 0.6s ease-out",
        "bounce-in": "bounceIn 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInUp: {
          from: { opacity: "0", transform: "translateY(50px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        cardDeal: {
          from: {
            opacity: "0",
            transform: "scale(0.8) rotate(-10deg) translateY(-30px)",
          },
          to: {
            opacity: "1",
            transform: "scale(1) rotate(0deg) translateY(0)",
          },
        },
        chipToss: {
          "0%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.1)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 5px rgba(34, 197, 94, 0.5)" },
          "50%": {
            boxShadow:
              "0 0 20px rgba(34, 197, 94, 0.8), 0 0 30px rgba(34, 197, 94, 0.6)",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200px 0" },
          "100%": { backgroundPosition: "calc(200px + 100%) 0" },
        },
        winnerCelebration: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.05) rotate(1deg)" },
          "75%": { transform: "scale(1.05) rotate(-1deg)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3) translateY(-20px)" },
          "50%": { opacity: "1", transform: "scale(1.05) translateY(-5px)" },
          "70%": { transform: "scale(0.9) translateY(0)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
