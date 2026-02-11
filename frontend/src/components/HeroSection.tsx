"use client";

import { motion } from "framer-motion";

const CATEGORY_PILLS = [
  { emoji: "\uD83C\uDFB6", label: "Soirees" },
  { emoji: "\uD83C\uDF78", label: "Rooftops" },
  { emoji: "\uD83C\uDF0A", label: "Nautique" },
  { emoji: "\uD83C\uDFCE\uFE0F", label: "Adrenaline" },
  { emoji: "\u2708\uFE0F", label: "Voyages" },
  { emoji: "\uD83C\uDF7D\uFE0F", label: "Food" },
  { emoji: "\u2764\uFE0F", label: "Date" },
];

const FLOATING_EMOJIS = [
  { emoji: "\uD83C\uDFB6", x: "15%", y: "20%", delay: 0, size: "text-4xl" },
  { emoji: "\uD83C\uDF78", x: "75%", y: "30%", delay: 0.5, size: "text-3xl" },
  { emoji: "\uD83C\uDF0A", x: "85%", y: "65%", delay: 1.0, size: "text-5xl" },
  { emoji: "\u2708\uFE0F", x: "25%", y: "55%", delay: 1.5, size: "text-3xl" },
  { emoji: "\uD83C\uDFA7", x: "60%", y: "15%", delay: 2.0, size: "text-4xl" },
];

function getContextualTitle(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Aujourd\u2019hui sur la Riviera";
  if (hour < 18) return "Cet apres-midi sur la Riviera";
  return "Ce soir sur la Riviera";
}

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0f0d2e] via-[#112228] to-[#0f0d2e]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-champagne-500/10 blur-[100px] animate-mesh-drift-1" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-riviera-500/10 blur-[100px] animate-mesh-drift-2" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-olive-500/8 blur-[100px] animate-mesh-drift-3" />
      </div>

      {/* Floating emoji pictograms */}
      {FLOATING_EMOJIS.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} opacity-[0.06] pointer-events-none select-none`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -12, 0, 8, 0],
            x: [0, 6, 0, -6, 0],
            rotate: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Directional vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent" />

      {/* Content — glass card at bottom-left */}
      <div className="relative flex min-h-[280px] flex-col justify-end pb-16 sm:pb-20 lg:min-h-[280px]">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="glass-dark inline-block max-w-xl rounded-2xl px-6 py-5 sm:px-8 sm:py-6"
          >
            <h1 className="font-serif text-2xl text-white sm:text-3xl lg:text-4xl">
              {getContextualTitle()}
            </h1>

            {/* Category pills inside glass card */}
            <div className="mt-3.5 flex flex-wrap gap-2">
              {CATEGORY_PILLS.map((pill) => (
                <span
                  key={pill.label}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/60 transition-all duration-200 hover:scale-[1.03] hover:border-white/20 hover:bg-white/[0.12] hover:text-white/90"
                >
                  <span>{pill.emoji}</span>
                  {pill.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/80 to-transparent" />
    </div>
  );
}
