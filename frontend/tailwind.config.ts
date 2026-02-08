import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        azur: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eccff",
          400: "#59b0ff",
          500: "#338dff",
          600: "#1b6df5",
          700: "#1457e1",
          800: "#1746b6",
          900: "#193d8f",
          950: "#142757",
        },
        coral: {
          50: "#fff5f0",
          100: "#ffe8dd",
          200: "#ffd0b9",
          300: "#ffae86",
          400: "#ff8347",
          500: "#ff6b2c",
          600: "#f04a0e",
          700: "#c7370a",
          800: "#9e2e10",
          900: "#802a12",
          950: "#451207",
        },
        navy: {
          50: "#f0f3ff",
          100: "#e0e6ff",
          200: "#c7d0fe",
          300: "#a4b0fc",
          400: "#7f87f8",
          500: "#6360f1",
          600: "#5340e5",
          700: "#4732ca",
          800: "#3a2ba3",
          900: "#332981",
          950: "#0f0d2e",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #1b6df5 0%, #ff6b2c 50%, #5340e5 100%)",
        "gradient-card":
          "linear-gradient(160deg, rgba(27,109,245,0.15) 0%, rgba(255,107,44,0.1) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
