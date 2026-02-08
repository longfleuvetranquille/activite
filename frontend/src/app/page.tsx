"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  Database,
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
import { getDashboardDigest, getDashboardStats } from "@/lib/api";
import EventCard from "@/components/EventCard";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

export default function DashboardPage() {
  const [digest, setDigest] = useState<DashboardDigest | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="card max-w-md text-center">
          <p className="mb-2 text-lg font-semibold text-red-400">Erreur</p>
          <p className="mb-4 text-sm text-gray-300">{error}</p>
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
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {getGreeting()} !
        </h1>
        <p className="text-sm capitalize text-gray-400">{today}</p>
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
            icon={<CalendarDays className="h-5 w-5 text-coral-400" />}
            label="Aujourd'hui"
            value={stats.events_today}
            color="coral"
          />
          <StatCard
            icon={<CalendarRange className="h-5 w-5 text-azur-400" />}
            label="Cette semaine"
            value={stats.events_this_week}
            color="azur"
          />
          <StatCard
            icon={<Database className="h-5 w-5 text-navy-400" />}
            label="Total"
            value={stats.total_events}
            color="navy"
          />
          <StatCard
            icon={<RefreshCw className="h-5 w-5 text-emerald-400" />}
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

      {/* Featured Events */}
      {digest && digest.featured.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader
            icon={<Sparkles className="h-5 w-5 text-coral-400" />}
            title="A la une"
            count={digest.featured.length}
            countColor="bg-coral-500/15 text-coral-400"
            subtitle="Les evenements les mieux notes"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {digest.featured.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Top Today */}
      {digest && digest.top_today.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader
            icon={<TrendingUp className="h-5 w-5 text-azur-400" />}
            title="Top du jour"
            count={digest.today_count}
            countColor="bg-azur-500/15 text-azur-400"
            subtitle="Evenements a ne pas manquer aujourd'hui"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {digest.top_today.slice(0, 6).map((event, i) => (
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
            icon={<Zap className="h-5 w-5 text-yellow-400" />}
            title="Bons plans"
            count={otherDeals.length}
            countColor="bg-yellow-500/15 text-yellow-400"
            subtitle="Offres et bons plans detectes"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            icon={<Plane className="h-5 w-5 text-sky-400" />}
            title="Vols pas chers"
            count={flightDeals.length}
            countColor="bg-sky-500/15 text-sky-400"
            subtitle="Meilleurs prix au depart de Nice"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {flightDeals.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} compact />
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty state */}
      {digest &&
        digest.featured.length === 0 &&
        digest.top_today.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <CalendarDays className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Aucun evenement
            </h3>
            <p className="max-w-sm text-sm text-gray-400">
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
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        {icon}
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className={`badge ${countColor}`}>{count}</span>
      </div>
      <p className="mt-1.5 text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

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
  return (
    <div className="card">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
      </div>
      {isText ? (
        <p className="text-sm font-medium text-gray-200">{value}</p>
      ) : (
        <p className="text-2xl font-bold text-white">{value}</p>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
        <div className="h-4 w-36 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card">
            <div className="mb-3 h-4 w-20 animate-pulse rounded bg-white/5" />
            <div className="h-8 w-12 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div>
        <div className="mb-5 space-y-2">
          <div className="h-6 w-32 animate-pulse rounded bg-white/5" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/5" />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-80 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
