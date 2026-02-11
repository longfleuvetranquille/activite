"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInCalendarWeeks } from "date-fns";

import type { Event } from "@/types";
import { getMonthEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import FilterBar from "@/components/FilterBar";
import DailyDigest from "@/components/DailyDigest";

function groupByWeek(events: Event[]): { label: string; events: Event[] }[] {
  const today = new Date();
  const groups = new Map<number, Event[]>();

  for (const event of events) {
    const date = new Date(event.date_start);
    const weekOffset = differenceInCalendarWeeks(date, today, { weekStartsOn: 1 });
    const key = Math.max(0, weekOffset);
    const existing = groups.get(key);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(key, [event]);
    }
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => a - b);

  return sortedKeys.map((key) => {
    let label: string;
    if (key === 0) {
      label = "Cette semaine";
    } else if (key === 1) {
      label = "Semaine prochaine";
    } else {
      label = `Dans ${key} semaines`;
    }

    const weekEvents = groups.get(key)!;
    weekEvents.sort((a, b) => b.interest_score - a.interest_score);

    return { label, events: weekEvents };
  });
}

export default function MonthPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMonthEvents();
        setEvents(data);
        setFiltered(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleFilter = (filters: {
    city?: string;
    type?: string;
    vibe?: string;
    budget?: string;
    search?: string;
  }) => {
    let result = [...events];

    if (filters.city) {
      result = result.filter((e) =>
        e.location_city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }
    if (filters.type) {
      result = result.filter((e) => e.tags_type.includes(filters.type!));
    }
    if (filters.vibe) {
      result = result.filter((e) => e.tags_vibe.includes(filters.vibe!));
    }
    if (filters.budget) {
      result = result.filter((e) => e.tags_budget.includes(filters.budget!));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location_name.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  };

  const groups = useMemo(() => groupByWeek(filtered), [filtered]);

  const featuredCount = events.filter((e) => e.is_featured).length;
  const dealsCount = events.filter((e) => e.tags_deals.length > 0).length;

  return (
    <div className="content-container space-y-6 py-5 lg:py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-riviera-100/80 ring-1 ring-riviera-200/50">
          <CalendarClock className="h-5 w-5 text-riviera-600" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl">
            Le mois a venir
          </h1>
          <p className="text-sm text-slate-500">
            Les evenements a ne pas manquer dans les 30 prochains jours
          </p>
        </div>
      </motion.div>

      {/* Digest */}
      {!loading && events.length > 0 && (
        <DailyDigest
          totalEvents={events.length}
          featuredCount={featuredCount}
          dealsCount={dealsCount}
        />
      )}

      {/* Filters */}
      <FilterBar onFilter={handleFilter} />

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/40 shimmer" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card text-center">
          <p className="mb-2 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Reessayer
          </button>
        </div>
      )}

      {/* Events grouped by week */}
      {!loading && !error && (
        <>
          {groups.length > 0 ? (
            <div className="space-y-8">
              {groups.map((group) => (
                <motion.section
                  key={group.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="mb-4 border-b border-slate-200/60 pb-2 font-serif text-lg font-semibold text-slate-800">
                    {group.label}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.events.map((event, i) => (
                      <EventCard key={event.id} event={event} index={i} />
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarClock className="mb-4 h-12 w-12 text-slate-300" />
              <h3 className="mb-1 text-lg font-semibold text-slate-900">
                Rien ce mois-ci
              </h3>
              <p className="text-sm text-slate-500">
                {events.length > 0
                  ? "Aucun evenement ne correspond a vos filtres."
                  : "Aucun evenement prevu ce mois-ci."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
