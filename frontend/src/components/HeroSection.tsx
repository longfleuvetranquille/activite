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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

export default function HeroSection() {
  return (
    <div className="relative min-h-[50vh] lg:min-h-[55vh] overflow-hidden bg-gradient-to-b from-[#0f0d2e] via-[#112228] to-[#0f0d2e]">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-champagne-500/10 blur-[100px] animate-mesh-drift-1" />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-riviera-500/10 blur-[100px] animate-mesh-drift-2" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-olive-500/8 blur-[100px] animate-mesh-drift-3" />
      </div>

      {/* Content positioned at bottom */}
      <div className="relative flex min-h-[50vh] lg:min-h-[55vh] flex-col justify-end pb-20 sm:pb-24">
        <div className="content-container">
          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40"
          >
            {getGreeting()} — Cote d&apos;Azur
          </motion.p>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-hero max-w-3xl bg-gradient-to-r from-champagne-300 via-champagne-200 to-riviera-300 bg-clip-text text-transparent"
          >
            Decouvrez la Cote d&apos;Azur comme jamais
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 max-w-lg text-base text-white/40 sm:text-lg"
          >
            Evenements, sorties et bons plans selectionnes par l&apos;IA
          </motion.p>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {CATEGORY_PILLS.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-sm text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/80"
              >
                <span>{pill.emoji}</span>
                {pill.label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAF8F3] to-transparent" />
    </div>
  );
}
