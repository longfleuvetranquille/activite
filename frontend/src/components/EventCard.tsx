"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

const TYPE_LABELS: Record<string, string> = {
  party: "Soiree",
  bar_rooftop: "Rooftop",
  dj_set: "DJ Set",
  concert: "Concert",
  show: "Spectacle",
  conference: "Conference",
  sport_match: "Sport",
  motorsport: "Motorsport",
  watersport: "Nautique",
  outdoor: "Outdoor",
  gaming: "Gaming",
  cinema: "Cinema",
  food: "Food",
  travel: "Voyage",
};

export const TYPE_STYLES: Record<string, { gradient: string; emoji: string }> = {
  party: { gradient: "from-violet-500 to-purple-600", emoji: "\uD83C\uDFB6" },
  bar_rooftop: { gradient: "from-amber-400 to-orange-500", emoji: "\uD83C\uDF78" },
  dj_set: { gradient: "from-indigo-500 to-blue-600", emoji: "\uD83C\uDFA7" },
  concert: { gradient: "from-rose-400 to-pink-600", emoji: "\uD83C\uDFA4" },
  show: { gradient: "from-fuchsia-500 to-pink-600", emoji: "\uD83C\uDFAD" },
  conference: { gradient: "from-slate-500 to-slate-700", emoji: "\uD83E\uDDE0" },
  poker_games: { gradient: "from-emerald-600 to-green-800", emoji: "\uD83C\uDCCF" },
  sport_match: { gradient: "from-slate-700 to-slate-900", emoji: "\uD83C\uDFC5" },
  motorsport: { gradient: "from-red-500 to-orange-600", emoji: "\uD83C\uDFCE\uFE0F" },
  watersport: { gradient: "from-cyan-400 to-teal-500", emoji: "\uD83C\uDF0A" },
  outdoor: { gradient: "from-emerald-400 to-green-600", emoji: "\uD83C\uDFD5\uFE0F" },
  gaming: { gradient: "from-purple-500 to-indigo-600", emoji: "\uD83C\uDFAE" },
  cinema: { gradient: "from-slate-600 to-zinc-800", emoji: "\uD83C\uDFAC" },
  food: { gradient: "from-orange-400 to-amber-600", emoji: "\uD83C\uDF7D\uFE0F" },
  travel: { gradient: "from-sky-400 to-blue-500", emoji: "\u2708\uFE0F" },
};

const DEFAULT_STYLE = { gradient: "from-champagne-400 to-champagne-600", emoji: "\uD83C\uDF34" };

interface EventCardProps {
  event: Event;
  index?: number;
  compact?: boolean;
  variant?: "default" | "wide";
}

export default function EventCard({
  event,
  index = 0,
  variant = "default",
}: EventCardProps) {
  const dateStart = new Date(event.date_start);
  const formattedDate = format(dateStart, "EEE d MMM", { locale: fr });
  const formattedTime = format(dateStart, "HH:mm");

  const priceDisplay =
    event.price_min < 0
      ? "N/C"
      : event.price_min === 0 && event.price_max === 0
        ? "Gratuit"
        : event.price_min === event.price_max
          ? `${event.price_min}\u00A0\u20AC`
          : `${event.price_min}-${event.price_max}\u00A0\u20AC`;

  const cleanLocation = (val: string | undefined) =>
    val && !/^lieu\s*#/i.test(val) ? val : "";
  const locationDisplay = cleanLocation(event.location_name) || cleanLocation(event.location_city);

  const firstType = event.tags_type[0] || "";
  const typeLabel = TYPE_LABELS[firstType] || "";
  const typeStyle = TYPE_STYLES[firstType] || DEFAULT_STYLE;
  const isSportWithLogo = firstType === "sport_match" && !!event.image_url;
  const isSoldOut = event.tags_exclusivity.includes("sold_out");

  // Collect tags for display
  const allTags: { code: string; category: string }[] = [];
  const tagSources: [string[], string][] = [
    [event.tags_type, "type"],
    [event.tags_vibe, "vibe"],
    [event.tags_budget, "budget"],
    [event.tags_exclusivity, "exclusivity"],
    [event.tags_deals, "deals"],
  ];
  for (const [tags, category] of tagSources) {
    for (const code of tags) {
      if (allTags.length < 3) {
        allTags.push({ code, category });
      }
    }
  }

  // Wide variant — featured hero card
  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      >
        <Link
          href={`/event/${event.id}`}
          className="group relative block aspect-[3/1] overflow-hidden rounded-2xl shadow-card transition-all duration-500 hover:shadow-elevated-lg"
        >
          {/* Full gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${typeStyle.gradient}`} />

          {/* Giant watermark emoji or team logo */}
          {isSportWithLogo ? (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-3">
              <img src={event.image_url} alt="" className="h-32 w-32 object-contain opacity-20" />
            </div>
          ) : (
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[160px] leading-none opacity-[0.08] transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-3">
              {typeStyle.emoji}
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Score on hover */}
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-xs font-bold text-white">{event.interest_score}</span>
          </div>

          {/* Featured ring */}
          {event.is_featured && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-champagne-400/40" />
          )}

          {/* Content overlaid at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm text-white/70">
              {typeLabel && <span className="text-white/90 font-medium">{typeLabel}</span>}
              {typeLabel && <span className="text-white/30">|</span>}
              <span className="capitalize">{formattedDate}</span>
              <span className="text-white/30">&middot;</span>
              <span>{formattedTime}</span>
            </div>
            <h3 className="mt-1.5 font-serif text-xl leading-snug text-white sm:text-2xl">
              {event.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-sm text-white/60">
              {locationDisplay && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {locationDisplay}
                </span>
              )}
              <span className="font-medium text-white/80">{priceDisplay}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/event/${event.id}`}
        className={`group block overflow-hidden rounded-2xl border bg-white/60 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg ${
          event.is_featured
            ? "border-champagne-200/60 ring-2 ring-champagne-400/20"
            : "border-white/60"
        }`}
      >
        {/* Mobile: compact horizontal layout */}
        <div className="flex sm:hidden">
          {/* Gradient emoji circle or team logo */}
          <div className="flex shrink-0 items-center justify-center pl-3 py-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${typeStyle.gradient} shadow-sm`}>
              {isSportWithLogo ? (
                <img src={event.image_url} alt="" className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-lg leading-none">{typeStyle.emoji}</span>
              )}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-2.5">
            <h3 className="line-clamp-1 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-riviera-600">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="capitalize font-medium text-slate-700">{formattedDate}</span>
              <span>&middot;</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {locationDisplay && (
                <span className="truncate">{locationDisplay}</span>
              )}
              {isSoldOut ? (
                <span className="ml-auto shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">Complet</span>
              ) : (
                <span className="ml-auto shrink-0 font-semibold text-slate-700">{priceDisplay}</span>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: horizontal card with left accent strip */}
        <div className="hidden sm:flex">
          {/* Left accent strip */}
          <div className={`w-[3px] shrink-0 rounded-l-2xl bg-gradient-to-b ${typeStyle.gradient}`} />

          {/* Gradient icon zone */}
          <div className="flex shrink-0 items-center justify-center px-4 py-4">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${typeStyle.gradient} shadow-md`}>
              {isSportWithLogo ? (
                <img src={event.image_url} alt="" className="h-8 w-8 object-contain" />
              ) : (
                <span className="text-xl leading-none">{typeStyle.emoji}</span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-3 pr-3.5">
            {/* Type + date row */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {typeLabel && (
                <>
                  <span className="font-medium text-champagne-600">{typeLabel}</span>
                  <span className="text-slate-300">|</span>
                </>
              )}
              <span className="capitalize">{formattedDate}</span>
              <span className="text-slate-300">&middot;</span>
              <span>{formattedTime}</span>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 font-serif text-base leading-snug text-slate-900 transition-colors group-hover:text-riviera-600">
              {event.title}
            </h3>

            {/* Location + Price + Score row */}
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              {locationDisplay && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {locationDisplay}
                  </span>
                </span>
              )}
              {isSoldOut ? (
                <span className="ml-auto shrink-0 rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-600">Complet</span>
              ) : (
                <>
                  <span className="ml-auto shrink-0 font-semibold text-slate-700">
                    {priceDisplay}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {event.interest_score}/100
                  </span>
                </>
              )}
            </div>

            {/* Tags — always visible */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {allTags.map((tag, i) => (
                  <TagBadge
                    key={`${tag.category}-${tag.code}-${i}`}
                    code={tag.code}
                    category={tag.category}
                    small
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
