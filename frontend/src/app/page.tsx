"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  Plane,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

import type { DashboardDigest, Event } from "@/types";
import { getDashboardDigest, getTodayEvents, getWeekEvents, getWeekendEvents } from "@/lib/api";
import { parseEventDate } from "@/lib/api";
import EventCard from "@/components/EventCard";
import HeroSection from "@/components/HeroSection";
import HorizontalCarousel from "@/components/HorizontalCarousel";
import CollectionCard from "@/components/CollectionCard";
import TimelessSection, { getSeasonalActivities } from "@/components/TimelessSection";
import DateIdeasSection from "@/components/DateIdeasSection";
import FoodGuideSection from "@/components/FoodGuideSection";
import BeachSection from "@/components/BeachSection";
import FeaturedRanking from "@/components/FeaturedRanking";

export default function DashboardPage() {
  const [digest, setDigest] = useState<DashboardDigest | null>(null);
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [weekEvents, setWeekEvents] = useState<Event[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [digestData, todayData, weekData, weekendData] = await Promise.all([
          getDashboardDigest(),
          getTodayEvents().catch(() => [] as Event[]),
          getWeekEvents().catch(() => [] as Event[]),
          getWeekendEvents().catch(() => [] as Event[]),
        ]);
        setDigest(digestData);
        setTodayEvents(todayData);
        setWeekEvents(weekData);
        setWeekendEvents(weekendData);
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

  // Flight deals come pre-deduplicated (5 unique destinations) from backend
  const flightDeals = digest?.deals ?? [];

  // Weekend events: max 1 flight, no duplicate destinations
  const weekendFlightDests = new Set<string>();
  let weekendFlightCount = 0;
  const filteredWeekendEvents = weekendEvents.filter((e) => {
    if (e.source_name === "google_flights") {
      const dest = (e.location_city || "").toLowerCase();
      if (weekendFlightCount >= 1 || weekendFlightDests.has(dest)) return false;
      weekendFlightDests.add(dest);
      weekendFlightCount++;
    }
    return true;
  });

  // Week events: exclude flights
  const filteredWeekEvents = weekEvents.filter((e) => e.source_name !== "google_flights");

  return (
    <div>
      {/* 1. Hero Section — full-bleed */}
      <HeroSection />

      <div className="space-y-0">
        {/* Nos activités — right under hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="content-container py-4 sm:py-6"
        >
          <SectionHeader
            title="Nos activités"
            subtitle="Selections thematiques de la Cote d'Azur"
          />
          <HorizontalCarousel>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\uD83E\uDDED"}
                title="Intemporelles"
                description="Activites permanentes et saisonnieres"
                count={getSeasonalActivities().length}
                href="#timeless"
                gradient="from-emerald-50 to-teal-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\u2764\uFE0F"}
                title="Idees de date"
                description="Les meilleurs spots pour un rendez-vous"
                count={11}
                href="#dates"
                gradient="from-rose-50 to-pink-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\u2615"}
                title="Cafes & brunchs"
                description="Les meilleurs cafes de la Riviera"
                count={4}
                href="#cafes"
                gradient="from-amber-50 to-orange-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\uD83C\uDF7D\uFE0F"}
                title="Restos date"
                description="Les meilleures adresses pour un diner en amoureux"
                count={10}
                href="#restaurants-date"
                gradient="from-violet-50 to-purple-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\uD83D\uDD7A"}
                title="Restos dansants"
                description="Diner et danser dans la meme soiree"
                count={3}
                href="#resto-dansant"
                gradient="from-fuchsia-50 to-pink-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\u2728"}
                title="Clubs branches"
                description="Les clubs ou sortir danser le soir"
                count={3}
                href="#clubs"
                gradient="from-fuchsia-50 to-purple-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\uD83C\uDF78"}
                title="Bars branches"
                description="Les bars ou sortir boire un verre"
                count={2}
                href="#bars"
                gradient="from-indigo-50 to-violet-50"
              />
            </div>
            <div className="w-[70vw] sm:w-[240px] lg:w-[260px] shrink-0">
              <CollectionCard
                emoji={"\uD83C\uDFD6\uFE0F"}
                title="Plages & criques"
                description="Spots secrets et plages paradisiaques"
                count={8}
                href="#beaches"
                gradient="from-sky-50 to-cyan-50"
              />
            </div>
          </HorizontalCarousel>
        </motion.section>

        {/* 2. "Ce soir" — carousel */}
        {todayEvents.length > 0 && (
          <motion.section
            id="tonight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="content-container py-6 sm:py-10"
          >
            <SectionHeader
              title="Ce soir"
              count={todayEvents.length}
              linkHref="/today"
              linkLabel="Voir tout"
            />
            <HorizontalCarousel>
              {todayEvents.map((event, i) => (
                <div key={event.id} className="w-[75vw] sm:w-[260px] shrink-0">
                  <EventCard event={event} index={i} />
                </div>
              ))}
            </HorizontalCarousel>
          </motion.section>
        )}

        {/* 3. "A la une" — editorial asymmetric grid */}
        {digest && digest.featured.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="content-container py-6 sm:py-8"
          >
            <SectionHeader
              title="A la une"
              subtitle="Les evenements les mieux notes"
            />
            <FeaturedRanking events={digest.featured} />
          </motion.section>
        )}

        <div className="editorial-divider content-container" />

        {/* 4. "Ce week-end" — grid (max 1 flight) */}
        {filteredWeekendEvents.length > 0 && (
          <motion.section
            id="weekend"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="content-container py-6 sm:py-8"
          >
            <SectionHeader
              title="Ce week-end"
              count={filteredWeekendEvents.length}
              linkHref="/weekend"
              linkLabel="Tout voir"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredWeekendEvents.slice(0, 8).map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* 4b. "Cette semaine" — grid (no flights) */}
        {filteredWeekEvents.length > 0 && (
          <motion.section
            id="week"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="content-container py-6 sm:py-8"
          >
            <SectionHeader
              title="Cette semaine"
              count={filteredWeekEvents.length}
              linkHref="/week"
              linkLabel="Tout voir"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredWeekEvents.slice(0, 8).map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* 5. Flight Deals — dark strip full-bleed */}
        {flightDeals.length > 0 && (
          <motion.section
            id="flights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-[#0f0d2e] via-[#112228] to-[#0f0d2e] py-8 sm:py-16"
          >
            <div className="content-container">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-champagne-400/70">
                Depuis la Cote d&apos;Azur
              </p>
              <h2 className="font-serif text-section-title text-white">
                Vols pas chers
              </h2>
              <p className="mt-1.5 text-sm text-white/40">
                Meilleurs prix au depart de Nice &middot; {flightDeals.length} offres
              </p>
              <div className="mt-4 sm:mt-6">
                <HorizontalCarousel dark>
                  {flightDeals.map((event, i) => (
                    <div key={event.id} className="w-[75vw] sm:w-[260px] shrink-0">
                      <FlightDealCard event={event} index={i} />
                    </div>
                  ))}
                </HorizontalCarousel>
              </div>
            </div>
          </motion.section>
        )}


        {/* 6. "Les gros events" — top upcoming, no flights, diversified */}
        {digest && digest.top_upcoming.length > 0 && (() => {
          // Exclude flights, cap sport_match to 2
          const typeCounts: Record<string, number> = {};
          const diversified = digest.top_upcoming
            .filter((e) => e.source_name !== "google_flights")
            .filter((e) => {
              const t = e.tags_type[0] || "_none";
              typeCounts[t] = (typeCounts[t] || 0) + 1;
              if (t === "sport_match" && typeCounts[t] > 2) return false;
              return true;
            });

          return (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="content-container py-6 sm:py-8"
            >
              <SectionHeader
                title="Les gros events"
                subtitle="Dans les 6 prochains mois"
                count={diversified.length}
                linkHref="/upcoming"
                linkLabel="Voir tout"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {diversified.slice(0, 8).map((event, i) => (
                  <EventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            </motion.section>
          );
        })()}

        <div className="editorial-divider content-container" />

        {/* 8. Curated sections — carousels */}
        <div id="timeless" className="content-container py-6 sm:py-8">
          <TimelessSection />
        </div>

        <div id="dates" className="content-container py-6 sm:py-8">
          <DateIdeasSection />
        </div>

        <div className="content-container py-6 sm:py-8">
          <FoodGuideSection />
        </div>

        <div id="beaches" className="content-container py-6 sm:py-8">
          <BeachSection />
        </div>

        {/* Empty state */}
        {digest &&
          digest.featured.length === 0 &&
          digest.top_upcoming.length === 0 &&
          todayEvents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center content-container">
              <div className="mb-4 text-5xl">
                {"\uD83C\uDF34"}
              </div>
              <h3 className="mb-2 font-serif text-xl text-slate-900">
                Aucun evenement
              </h3>
              <p className="max-w-sm text-sm text-slate-500">
                Le prochain crawl devrait ramener de nouveaux evenements.
                Revenez bientot !
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  count,
  linkHref,
  linkLabel,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  linkHref?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-4 sm:mb-5 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-serif text-section-title text-slate-900">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-[0.6em] font-sans font-normal text-slate-400">
              {count}
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className="group inline-flex shrink-0 items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-champagne-600 transition-colors hover:text-champagne-700"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function FlightDealCard({ event, index }: { event: Event; index: number }) {
  const dateStart = parseEventDate(event.date_start);
  const formattedDate = format(dateStart, "EEE d MMM", { locale: fr });

  const priceDisplay =
    event.price_min < 0
      ? "N/C"
      : event.price_min === 0 && event.price_max === 0
        ? "Gratuit"
        : `${event.price_min}\u00A0\u20AC`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/event/${event.id}`}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
      >
        {/* Gradient header with plane emoji */}
        <div className="relative flex h-24 sm:h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-sky-500 to-blue-600">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] leading-none opacity-[0.1]">{"\u2708\uFE0F"}</span>
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Plane className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="p-3.5">
          <p className="text-xs font-medium text-champagne-400/70 capitalize">
            {formattedDate}
          </p>
          <h3 className="mt-1 line-clamp-2 font-serif text-base leading-snug text-white">
            {event.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
              <Plane className="h-3.5 w-3.5" />
              {event.location_city || "Vol"}
            </span>
            <span className="text-lg font-bold text-champagne-300">
              {priceDisplay}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      {/* Hero skeleton — newspaper style */}
      <div className="bg-[#FAF8F3]">
        <div className="content-container pb-6 pt-6 sm:pt-8">
          {/* Meta row */}
          <div className="flex items-center justify-between">
            <div className="h-3 w-40 rounded bg-champagne-200/50 shimmer" />
            <div className="h-3 w-24 rounded bg-champagne-200/50 shimmer" />
          </div>
          {/* Thick divider */}
          <div className="mt-3 h-[3px] bg-champagne-200/30 shimmer" />
          {/* Masthead */}
          <div className="mx-auto mt-6 h-14 w-56 rounded-lg bg-champagne-200/40 shimmer sm:h-16 sm:w-64" />
          {/* Tagline */}
          <div className="mx-auto mt-4 h-5 w-52 rounded bg-champagne-200/30 shimmer" />
          {/* Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-full border border-champagne-200/40 bg-champagne-100/20 shimmer" />
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="content-container space-y-12 py-10">
        {/* Carousel skeleton — compact cards */}
        <div>
          <div className="mb-5 space-y-2">
            <div className="h-8 w-40 rounded-lg bg-slate-200/60 shimmer" />
            <div className="h-4 w-56 rounded-lg bg-slate-200/60 shimmer" />
          </div>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 w-[260px] shrink-0 rounded-2xl bg-slate-200/40 shimmer" />
            ))}
          </div>
        </div>

        {/* Grid skeleton — wide + 2 stacked */}
        <div>
          <div className="mb-5 h-8 w-48 rounded-lg bg-slate-200/60 shimmer" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="h-40 rounded-2xl bg-slate-200/40 shimmer lg:col-span-7" />
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="h-28 rounded-2xl bg-slate-200/40 shimmer" />
              <div className="h-28 rounded-2xl bg-slate-200/40 shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
