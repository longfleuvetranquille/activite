"use client";

import { CalendarDays, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface DailyDigestProps {
  totalEvents: number;
  featuredCount: number;
  dealsCount: number;
}

export default function DailyDigest({
  totalEvents,
  featuredCount,
  dealsCount,
}: DailyDigestProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-azur-600/20 via-coral-500/15 to-navy-600/20 p-5 ring-1 ring-white/5"
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-coral-500/10 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-azur-500/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* Total */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-azur-500/20">
            <CalendarDays className="h-4 w-4 text-azur-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{totalEvents}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              evenements
            </p>
          </div>
        </div>

        {/* Featured */}
        {featuredCount > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-500/20">
              <Sparkles className="h-4 w-4 text-coral-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{featuredCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                a la une
              </p>
            </div>
          </div>
        )}

        {/* Deals */}
        {dealsCount > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/20">
              <Zap className="h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{dealsCount}</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-500">
                bons plans
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
