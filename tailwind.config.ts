import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: "#fef9ef",
        paper: "#ffffff",
        "paper-border": "#c8b89a",
        "paper-shadow": "#b09a7a",
        "mario-red": "#e8635a",
        "sky-blue": "#4a90d9",
        "leaf-green": "#5cb85c",
        "pm-yellow": "#f5d76e",
        "pm-dark": "#3d2b1f",
        "pm-gray": "#8a7a6a",
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"],
      },
      boxShadow: {
        paper: "4px 4px 0 #b09a7a",
        "paper-sm": "2px 2px 0 #b09a7a",
        "paper-lg": "6px 6px 0 #b09a7a",
        "paper-inset": "inset 2px 2px 0 #b09a7a",
      },
      borderWidth: {
        "3": "3px",
      },
      animation: {
        "bounce-in": "bounceIn 0.3s ease-out",
        "slide-up": "slideUp 0.2s ease-out",
        "fold-down": "foldDown 0.25s ease-out",
      },
      keyframes: {
        bounceIn: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "70%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        foldDown: {
          "0%": { transform: "scaleY(0)", opacity: "0", transformOrigin: "top" },
          "100%": { transform: "scaleY(1)", opacity: "1", transformOrigin: "top" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
