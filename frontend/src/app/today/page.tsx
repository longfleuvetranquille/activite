"use client";

import { useEffect, useState } from "react";
import { CalendarDays, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Event } from "@/types";
import { getTodayEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";
import FilterBar from "@/components/FilterBar";
import DailyDigest from "@/components/DailyDigest";

export default function TodayPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filtered, setFiltered] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTodayEvents();
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

  const today = format(new Date(), "EEEE d MMMM", { locale: fr });
  const featuredCount = events.filter((e) => e.is_featured).length;
  const dealsCount = events.filter((e) => e.tags_deals.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/15">
          <CalendarDays className="h-5 w-5 text-coral-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Aujourd&apos;hui
          </h1>
          <p className="text-sm capitalize text-gray-400">{today}</p>
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
            <div key={i} className="card h-72 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card text-center">
          <p className="mb-2 text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4" />
            Reessayer
          </button>
        </div>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <>
          {filtered.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <CalendarDays className="mb-4 h-12 w-12 text-gray-600" />
              <h3 className="mb-1 text-lg font-semibold text-white">
                Rien pour aujourd&apos;hui
              </h3>
              <p className="text-sm text-gray-400">
                {events.length > 0
                  ? "Aucun evenement ne correspond a vos filtres."
                  : "Aucun evenement prevu aujourd'hui."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
