"use client";

import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

export default function FeaturedRanking({ events }: { events: Event[] }) {
  return (
    <div className="divide-y divide-champagne-200/40">
      {events.map((event, i) => (
        <FeaturedRow key={event.id} event={event} rank={i + 1} />
      ))}
    </div>
  );
}

function FeaturedRow({ event, rank }: { event: Event; rank: number }) {
  const dateStart = new Date(event.date_start);
  const formattedDate = format(dateStart, "EEEE d MMM", { locale: fr });
  const formattedTime = format(dateStart, "HH:mm");

  const priceDisplay =
    event.price_min < 0
      ? ""
      : event.price_min === 0 && event.price_max === 0
        ? "Gratuit"
        : event.price_min === event.price_max
          ? `${event.price_min}\u00A0\u20AC`
          : `${event.price_min}-${event.price_max}\u00A0\u20AC`;

  const cleanLocation = (val: string | undefined) =>
    val && !/^lieu\s*#/i.test(val) ? val : "";
  const location = cleanLocation(event.location_name) || cleanLocation(event.location_city);

  const isTop = rank === 1;

  // Collect tags for display (max 3)
  const allTags: { code: string; category: string }[] = [];
  const tagSources: [string[], string][] = [
    [event.tags_type, "type"],
    [event.tags_vibe, "vibe"],
    [event.tags_budget, "budget"],
  ];
  for (const [tags, category] of tagSources) {
    for (const code of tags) {
      if (allTags.length < 3) allTags.push({ code, category });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.08, ease: "easeOut" }}
      className={isTop ? "py-5" : "py-4"}
    >
      <Link
        href={`/event/${event.id}`}
        className={`group flex items-start gap-4 rounded-2xl px-3 py-3 transition-all duration-300 hover:bg-champagne-50/50 sm:gap-5 ${
          isTop ? "sm:gap-6" : ""
        }`}
      >
        {/* Rank number */}
        <div className="flex shrink-0 flex-col items-center pt-1">
          <span
            className={`font-[family-name:var(--font-logo)] leading-none tracking-tight ${
              isTop
                ? "text-5xl font-bold text-champagne-500 sm:text-6xl"
                : "text-3xl font-semibold text-champagne-300 sm:text-4xl"
            }`}
          >
            {String(rank).padStart(2, "0")}
          </span>
          {isTop && (
            <Star className="mt-1 h-4 w-4 fill-champagne-400 text-champagne-400" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <h3
            className={`font-serif leading-snug text-slate-900 transition-colors group-hover:text-champagne-700 ${
              isTop
                ? "text-xl font-semibold sm:text-2xl"
                : "text-base font-medium sm:text-lg"
            }`}
          >
            {event.title}
          </h3>

          {/* Date + Location row */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-slate-500">
            <span className="capitalize">{formattedDate}</span>
            <span className="text-champagne-300">&middot;</span>
            <span>{formattedTime}</span>
            {location && (
              <>
                <span className="text-champagne-300">&middot;</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  {location}
                </span>
              </>
            )}
            {priceDisplay && (
              <>
                <span className="text-champagne-300">&middot;</span>
                <span className="font-semibold text-slate-700">{priceDisplay}</span>
              </>
            )}
          </div>

          {/* Summary for #1 */}
          {isTop && event.summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
              {event.summary}
            </p>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {allTags.map((tag, j) => (
                <TagBadge
                  key={`${tag.category}-${tag.code}-${j}`}
                  code={tag.code}
                  category={tag.category}
                  small
                />
              ))}
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex shrink-0 flex-col items-center gap-1 pt-1">
          <div
            className={`flex items-center justify-center rounded-full ${
              isTop
                ? "h-12 w-12 bg-gradient-to-br from-champagne-400 to-champagne-600 shadow-lg shadow-champagne-400/25"
                : "h-10 w-10 bg-slate-100"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                isTop ? "text-white" : "text-slate-600"
              }`}
            >
              {event.interest_score}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">/100</span>
        </div>
      </Link>
    </motion.div>
  );
}
