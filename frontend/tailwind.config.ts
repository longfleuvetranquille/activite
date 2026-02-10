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
        sans: ["var(--font-body)", "Plus Jakarta Sans", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-serif)", "Instrument Serif", "Georgia", "Times New Roman", "serif"],
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)",
        "card-hover":
          "0 20px 40px -12px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04)",
        "card-featured":
          "0 20px 40px -12px rgba(255,107,44,0.15), 0 4px 12px -2px rgba(255,107,44,0.08)",
        "glow-azur":
          "0 0 20px rgba(27,109,245,0.15), 0 0 60px rgba(27,109,245,0.05)",
        "glow-coral":
          "0 0 20px rgba(255,107,44,0.15), 0 0 60px rgba(255,107,44,0.05)",
        "glow-sm": "0 0 12px rgba(27,109,245,0.1)",
        elevated:
          "0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        "elevated-lg":
          "0 24px 50px -12px rgba(0,0,0,0.1), 0 8px 20px -8px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #1b6df5 0%, #ff6b2c 50%, #5340e5 100%)",
        "gradient-card":
          "linear-gradient(160deg, rgba(27,109,245,0.15) 0%, rgba(255,107,44,0.1) 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(27,109,245,0.06) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(255,107,44,0.04) 0%, transparent 50%), radial-gradient(at 50% 0%, rgba(99,96,241,0.04) 0%, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "fade-in-up": "fadeInUp 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "scale-in": "scaleIn 0.3s ease-out",
        "mesh-drift-1": "meshDrift1 22s ease-in-out infinite",
        "mesh-drift-2": "meshDrift2 26s ease-in-out infinite",
        "mesh-drift-3": "meshDrift3 30s ease-in-out infinite",
        "mesh-drift-4": "meshDrift4 24s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        meshDrift1: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(80px, 40px) scale(1.1)" },
          "66%": { transform: "translate(-40px, 80px) scale(0.95)" },
        },
        meshDrift2: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-60px, -50px) scale(1.05)" },
          "66%": { transform: "translate(50px, -30px) scale(1.1)" },
        },
        meshDrift3: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(40px, -60px) scale(1.08)" },
          "66%": { transform: "translate(-80px, 30px) scale(0.92)" },
        },
        meshDrift4: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-50px, 60px) scale(1.12)" },
          "66%": { transform: "translate(60px, -40px) scale(0.98)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
