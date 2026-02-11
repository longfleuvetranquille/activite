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
        champagne: {
          50: "#fdf9f0",
          100: "#f9f0dc",
          200: "#f2deb5",
          300: "#e8c784",
          400: "#d9a84e",
          500: "#C49A4C",
          600: "#a87d34",
          700: "#8c632c",
          800: "#744f29",
          900: "#614225",
          950: "#362112",
        },
        olive: {
          50: "#f6f7ec",
          100: "#ebefd5",
          200: "#d7dfaf",
          300: "#bcc97f",
          400: "#a1b15a",
          500: "#819647",
          600: "#657736",
          700: "#4d5b2c",
          800: "#3f4a27",
          900: "#363f25",
          950: "#1b2211",
        },
        riviera: {
          50: "#effefa",
          100: "#c8fff2",
          200: "#91fee6",
          300: "#52f5d6",
          400: "#1ee0c1",
          500: "#329E96",
          600: "#04a08a",
          700: "#098070",
          800: "#0d655b",
          900: "#10534c",
          950: "#023330",
        },
        navy: {
          950: "#0f0d2e",
        },
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'section-title': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15' }],
      },
      fontFamily: {
        sans: ["var(--font-body)", "Outfit", "system-ui", "-apple-system", "sans-serif"],
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
          "0 20px 40px -12px rgba(196,154,76,0.15), 0 4px 12px -2px rgba(196,154,76,0.08)",
        "glow-champagne":
          "0 0 20px rgba(196,154,76,0.15), 0 0 60px rgba(196,154,76,0.05)",
        "glow-olive":
          "0 0 20px rgba(129,150,71,0.15), 0 0 60px rgba(129,150,71,0.05)",
        "glow-sm": "0 0 12px rgba(196,154,76,0.1)",
        elevated:
          "0 8px 30px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
        "elevated-lg":
          "0 24px 50px -12px rgba(0,0,0,0.1), 0 8px 20px -8px rgba(0,0,0,0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-brand":
          "linear-gradient(135deg, #C49A4C 0%, #819647 50%, #329E96 100%)",
        "gradient-card":
          "linear-gradient(160deg, rgba(196,154,76,0.15) 0%, rgba(129,150,71,0.1) 100%)",
        "gradient-mesh":
          "radial-gradient(at 20% 20%, rgba(196,154,76,0.06) 0%, transparent 50%), radial-gradient(at 80% 80%, rgba(129,150,71,0.04) 0%, transparent 50%), radial-gradient(at 50% 0%, rgba(50,158,150,0.04) 0%, transparent 50%)",
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
