"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const CATEGORY_PILLS = [
  { emoji: "\uD83C\uDFB6", label: "Soirees" },
  { emoji: "\uD83C\uDF78", label: "Rooftops" },
  { emoji: "\uD83C\uDF0A", label: "Nautique" },
  { emoji: "\uD83C\uDFCE\uFE0F", label: "Adrenaline" },
  { emoji: "\u2708\uFE0F", label: "Voyages" },
  { emoji: "\uD83C\uDF7D\uFE0F", label: "Food" },
  { emoji: "\u2764\uFE0F", label: "Date" },
];

function getContextualTitle(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Aujourd\u2019hui sur la Riviera";
  if (hour < 18) return "Cet apres-midi sur la Riviera";
  return "Ce soir sur la Riviera";
}

export default function HeroSection() {
  const today = format(new Date(), "d MMM yyyy", { locale: fr });

  return (
    <div className="relative bg-[#FAF8F3]">
      {/* Subtle warm gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-champagne-50/30 via-transparent to-transparent" />

      <div className="relative content-container pb-6 pt-6 sm:pt-8">
        {/* Meta row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-champagne-600">
            Nice &middot; Cannes &middot; Monaco
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-champagne-600">
            {today}
          </p>
        </motion.div>

        {/* Thick divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mt-3 h-[3px] origin-left bg-champagne-300/40"
        />

        {/* Masthead */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-6 text-center font-[family-name:var(--font-logo)] text-5xl font-semibold tracking-wide text-slate-900 sm:text-6xl lg:text-7xl"
          style={{ textShadow: "0.5px 0.5px 0px rgba(0,0,0,0.15)" }}
        >
          Palmier
        </motion.h1>

        {/* Tagline with decorative lines */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
          className="mt-4 flex items-center justify-center gap-4"
        >
          <div className="h-px w-12 bg-champagne-400/50 sm:w-16" />
          <p className="whitespace-nowrap font-[family-name:var(--font-serif)] text-base italic text-slate-500 sm:text-lg">
            {getContextualTitle()}
          </p>
          <div className="h-px w-12 bg-champagne-400/50 sm:w-16" />
        </motion.div>

        {/* Thin divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="mx-auto mt-5 h-px w-full max-w-md origin-center bg-champagne-200/60"
        />

        {/* Category pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {CATEGORY_PILLS.map((pill, i) => (
            <motion.span
              key={pill.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.35 + i * 0.05,
                ease: "easeOut",
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-champagne-200 bg-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-600 transition-all duration-200 hover:border-champagne-300 hover:bg-champagne-50 hover:text-slate-800"
            >
              <span className="text-sm">{pill.emoji}</span>
              {pill.label}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div className="h-6 bg-gradient-to-b from-[#FAF8F3] to-[#FAF8F3]/0" />
    </div>
  );
}
