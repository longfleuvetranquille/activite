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
      className="relative overflow-hidden rounded-xl bg-gradient-to-r from-azur-50 via-coral-50 to-navy-50 p-4 ring-1 ring-slate-200"
    >
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-coral-200/30 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-azur-200/30 blur-3xl" />

      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* Total */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-azur-100">
            <CalendarDays className="h-4 w-4 text-azur-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalEvents}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              evenements
            </p>
          </div>
        </div>

        {/* Featured */}
        {featuredCount > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral-100">
              <Sparkles className="h-4 w-4 text-coral-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{featuredCount}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                a la une
              </p>
            </div>
          </div>
        )}

        {/* Deals */}
        {dealsCount > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100">
              <Zap className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{dealsCount}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                bons plans
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
