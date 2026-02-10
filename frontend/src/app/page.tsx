"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Database,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
  Plane,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import type { DashboardDigest, DashboardStats } from "@/types";
import { getDashboardDigest, getDashboardStats, triggerCrawl, getCrawlStatus } from "@/lib/api";
import EventCard from "@/components/EventCard";
import TimelessSection from "@/components/TimelessSection";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

function useAnimatedNumber(target: number, duration = 800): number {
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

function AnimatedNumber({ value }: { value: number }) {
  const animated = useAnimatedNumber(value);
  return <>{animated}</>;
}

export default function DashboardPage() {
  const [digest, setDigest] = useState<DashboardDigest | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crawling, setCrawling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [digestData, statsData] = await Promise.all([
          getDashboardDigest(),
          getDashboardStats(),
        ]);
        setDigest(digestData);
        setStats(statsData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur de chargement"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function reloadData() {
    const [digestData, statsData] = await Promise.all([
      getDashboardDigest(),
      getDashboardStats(),
    ]);
    setDigest(digestData);
    setStats(statsData);
  }

  async function handleCrawl() {
    try {
      setCrawling(true);
      await triggerCrawl();
      // Poll status every 3s until crawl finishes
      await new Promise<void>((resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            const status = await getCrawlStatus();
            if (!status.is_running) {
              clearInterval(interval);
              resolve();
            }
          } catch {
            clearInterval(interval);
            reject(new Error("Erreur lors du suivi du crawl"));
          }
        }, 3000);
      });
      await reloadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur lors du crawl");
    } finally {
      setCrawling(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="card max-w-md text-center">
          <p className="mb-2 text-lg font-semibold text-red-600">Erreur</p>
          <p className="mb-4 text-sm text-slate-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  // Split deals into flight deals and other deals
  const flightDeals =
    digest?.deals.filter((e) => e.source_name === "google_flights") ?? [];
  const otherDeals =
    digest?.deals.filter((e) => e.source_name !== "google_flights") ?? [];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {getGreeting()} !
          </h1>
          <p className="text-sm capitalize text-slate-500 sm:text-base">{today}</p>
        </div>
        <button
          onClick={handleCrawl}
          disabled={crawling}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {crawling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{crawling ? "Crawl en cours..." : "Lancer un crawl"}</span>
        </button>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          <StatCard
            icon={<CalendarDays className="h-5 w-5 text-champagne-500" />}
            label="Aujourd'hui"
            value={stats.events_today}
            color="champagne"
          />
          <StatCard
            icon={<CalendarRange className="h-5 w-5 text-olive-500" />}
            label="Cette semaine"
            value={stats.events_this_week}
            color="olive"
          />
          <StatCard
            icon={<Database className="h-5 w-5 text-riviera-500" />}
            label="Total"
            value={stats.total_events}
            color="riviera"
          />
          <StatCard
            icon={<RefreshCw className="h-5 w-5 text-emerald-500" />}
            label="Dernier crawl"
            value={
              stats.last_crawl
                ? formatDistanceToNow(new Date(stats.last_crawl), {
                    locale: fr,
                    addSuffix: true,
                  })
                : "Jamais"
            }
            color="emerald"
            isText
          />
        </motion.div>
      )}

      {/* Featured Events — Bento Grid */}
      {digest && digest.featured.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader
            icon={<Sparkles className="h-5 w-5 text-champagne-500" />}
            title="A la une"
            count={digest.featured.length}
            countColor="bg-champagne-100/80 text-champagne-700 ring-1 ring-champagne-200/50"
            subtitle="Les evenements les mieux notes"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {digest.featured.map((event, i) => (
              <div
                key={event.id}
                className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}
              >
                <EventCard event={event} index={i} />
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Upcoming */}
      {digest && digest.top_upcoming.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5 text-olive-500" />}
            title="Top a venir"
            count={digest.top_upcoming.length}
            countColor="bg-olive-100/80 text-olive-700 ring-1 ring-olive-200/50"
            subtitle="Les meilleurs evenements des 3 prochains mois"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {digest.top_upcoming.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Other Deals */}
      {otherDeals.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionHeader
            icon={<Zap className="h-5 w-5 text-yellow-500" />}
            title="Bons plans"
            count={otherDeals.length}
            countColor="bg-yellow-100/80 text-yellow-700 ring-1 ring-yellow-200/50"
            subtitle="Offres et bons plans detectes"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherDeals.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Flight Deals */}
      {flightDeals.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SectionHeader
            icon={<Plane className="h-5 w-5 text-sky-500" />}
            title="Vols pas chers"
            count={flightDeals.length}
            countColor="bg-sky-100/80 text-sky-700 ring-1 ring-sky-200/50"
            subtitle="Meilleurs prix au depart de la Cote d'Azur"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {flightDeals.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} compact />
            ))}
          </div>
        </motion.section>
      )}

      {/* Timeless / Seasonal Activities */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <TimelessSection />
      </motion.section>

      {/* Empty state */}
      {digest &&
        digest.featured.length === 0 &&
        digest.top_upcoming.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100/80 ring-1 ring-slate-200/50">
              <CalendarDays className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">
              Aucun evenement
            </h3>
            <p className="max-w-sm text-sm text-slate-500">
              Le prochain crawl devrait ramener de nouveaux evenements.
              Revenez bientot !
            </p>
          </div>
        )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  count,
  countColor,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countColor: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <div className="mb-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-champagne-500 via-olive-400 to-transparent" />
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm">
          {icon}
        </div>
        <h2 className="font-serif text-xl text-slate-900 sm:text-2xl">{title}</h2>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${countColor}`}>
          {count}
        </span>
      </div>
      <p className="mt-1.5 pl-[42px] text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

const STAT_GRADIENTS: Record<string, string> = {
  champagne: "from-champagne-400 to-champagne-500",
  olive: "from-olive-400 to-olive-500",
  riviera: "from-riviera-400 to-riviera-500",
  emerald: "from-emerald-400 to-emerald-500",
};

const STAT_HOVERS: Record<string, string> = {
  champagne: "hover:shadow-glow-champagne",
  olive: "hover:shadow-glow-olive",
  riviera: "hover:shadow-glow-sm",
  emerald: "hover:shadow-glow-sm",
};

function StatCard({
  icon,
  label,
  value,
  color,
  isText = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  const gradient = STAT_GRADIENTS[color] || "from-slate-400 to-slate-500";
  const hoverClass = STAT_HOVERS[color] || "hover:shadow-glow-sm";

  return (
    <div className={`card overflow-hidden transition-shadow ${hoverClass}`}>
      <div className={`-mx-4 -mt-4 mb-3 h-0.5 bg-gradient-to-r ${gradient}`} />
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>
      {isText ? (
        <p className="text-sm font-medium text-slate-700">{value}</p>
      ) : (
        <p className="text-2xl font-bold tabular-nums text-slate-900">
          <AnimatedNumber value={value as number} />
        </p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-12 w-64 rounded-2xl bg-slate-200/60 shimmer" />
        <div className="h-5 w-44 rounded-xl bg-slate-200/60 shimmer" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="mb-3 h-4 w-24 rounded-lg bg-slate-200/60 shimmer" />
            <div className="h-8 w-14 rounded-lg bg-slate-200/60 shimmer" />
          </div>
        ))}
      </div>
      {/* Section skeleton */}
      <div>
        <div className="mb-5 space-y-2">
          <div className="h-7 w-40 rounded-lg bg-slate-200/60 shimmer" />
          <div className="h-4 w-56 rounded-lg bg-slate-200/60 shimmer" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Bento: first card takes 2 cols */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="h-80 rounded-2xl bg-slate-200/40 shimmer" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-slate-200/40 shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}
