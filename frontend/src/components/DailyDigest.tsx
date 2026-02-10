"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

function useAnimatedCounter(target: number, duration = 800): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    startTime.current = null;

    function step(timestamp: number) {
      if (startTime.current === null) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId.current = requestAnimationFrame(step);
      }
    }

    rafId.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

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
  const animatedTotal = useAnimatedCounter(totalEvents);
  const animatedFeatured = useAnimatedCounter(featuredCount);
  const animatedDeals = useAnimatedCounter(dealsCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-white/50 p-6 shadow-elevated backdrop-blur-xl ring-1 ring-white/60"
    >
      {/* Floating gradient blobs */}
      <div className="absolute -right-12 -top-12 h-48 w-48 animate-float rounded-full bg-coral-300/30 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 animate-float rounded-full bg-azur-300/30 blur-3xl" style={{ animationDelay: "-3s" }} />
      <div className="absolute right-1/3 top-1/2 h-28 w-28 animate-float rounded-full bg-navy-300/20 blur-3xl" style={{ animationDelay: "-1.5s" }} />

      <div className="relative flex flex-wrap items-center gap-x-8 gap-y-3">
        {/* Total */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-azur-100/80 ring-1 ring-azur-200/50">
            <CalendarDays className="h-4.5 w-4.5 text-azur-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-slate-900">{animatedTotal}</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              evenements
            </p>
          </div>
        </div>

        {/* Featured */}
        {featuredCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-100/80 ring-1 ring-coral-200/50">
              <Sparkles className="h-4.5 w-4.5 text-coral-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{animatedFeatured}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                a la une
              </p>
            </div>
          </div>
        )}

        {/* Deals */}
        {dealsCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100/80 ring-1 ring-yellow-200/50">
              <Zap className="h-4.5 w-4.5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums text-slate-900">{animatedDeals}</p>
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
