"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

// Map event types to emojis for placeholders
const TYPE_EMOJIS: Record<string, string> = {
  party: "\uD83C\uDFB6",
  bar_rooftop: "\uD83C\uDF78",
  dj_set: "\uD83C\uDFA7",
  concert: "\uD83C\uDFA4",
  show: "\uD83C\uDFAD",
  conference: "\uD83E\uDDE0",
  sport_match: "\u26BD",
  motorsport: "\uD83C\uDFCE\uFE0F",
  watersport: "\uD83C\uDF0A",
  outdoor: "\uD83C\uDFD5\uFE0F",
  gaming: "\uD83C\uDFAE",
  cinema: "\uD83C\uDFAC",
  food: "\uD83C\uDF7D\uFE0F",
  travel: "\u2708\uFE0F",
};

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

const TYPE_GRADIENTS: Record<string, string> = {
  party: "from-purple-400 to-pink-400",
  bar_rooftop: "from-amber-400 to-orange-400",
  dj_set: "from-violet-400 to-fuchsia-400",
  concert: "from-rose-400 to-red-400",
  show: "from-indigo-400 to-purple-400",
  conference: "from-sky-400 to-blue-400",
  sport_match: "from-emerald-400 to-green-400",
  motorsport: "from-red-400 to-orange-400",
  watersport: "from-cyan-400 to-teal-400",
  outdoor: "from-green-400 to-emerald-400",
  gaming: "from-violet-400 to-indigo-400",
  cinema: "from-slate-400 to-gray-500",
  food: "from-orange-400 to-amber-400",
  travel: "from-sky-400 to-cyan-400",
};

interface EventCardProps {
  event: Event;
  index?: number;
  compact?: boolean;
  variant?: "default" | "wide";
}

export default function EventCard({
  event,
  index = 0,
  compact = false,
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

  const firstType = event.tags_type[0] || "";
  const typeLabel = TYPE_LABELS[firstType] || "";
  const typeEmoji = TYPE_EMOJIS[firstType] || "\uD83D\uDCC5";
  const typeGradient = TYPE_GRADIENTS[firstType] || "from-champagne-400 to-riviera-400";

  // Collect tags for hover display
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
      if (allTags.length < 4) {
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
          className="group relative block aspect-[16/9] overflow-hidden rounded-2xl shadow-card transition-all duration-500 hover:shadow-elevated-lg"
        >
          {/* Image */}
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-[1.04]"
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <WideplaceholderImage typeEmoji={typeEmoji} typeGradient={typeGradient} />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Score on hover */}
          <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <span className="text-xs font-bold text-white">{event.interest_score}</span>
          </div>

          {/* Featured ring */}
          {event.is_featured && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-champagne-400/40" />
          )}

          {/* Content overlaid at bottom */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm text-white/70">
              {typeLabel && <span className="text-champagne-300">{typeLabel}</span>}
              {typeLabel && <span className="text-white/30">|</span>}
              <span className="capitalize">{formattedDate}</span>
              <span className="text-white/30">&middot;</span>
              <span>{formattedTime}</span>
            </div>
            <h3 className="mt-1.5 font-serif text-xl leading-snug text-white sm:text-2xl">
              {event.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-sm text-white/60">
              {(event.location_name || event.location_city) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location_name || event.location_city}
                </span>
              )}
              <span className="font-medium text-white/80">{priceDisplay}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/event/${event.id}`}
        className={`group block overflow-hidden rounded-2xl border bg-white/60 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elevated-lg ${
          event.is_featured
            ? "border-champagne-200/60 ring-2 ring-champagne-400/20"
            : "border-white/60"
        }`}
      >
        {/* Mobile: horizontal layout */}
        <div className="flex sm:hidden">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <PlaceholderImage typeEmoji={typeEmoji} typeGradient={typeGradient} />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 p-2.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-riviera-600">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="capitalize font-medium text-slate-700">{formattedDate}</span>
              <span>&middot;</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {(event.location_name || event.location_city) && (
                <span className="truncate">{event.location_name || event.location_city}</span>
              )}
              <span className="ml-auto shrink-0 font-semibold text-slate-700">{priceDisplay}</span>
            </div>
          </div>
        </div>

        {/* Desktop: vertical photo-first layout */}
        <div className="hidden sm:block">
          {/* Image — aspect 4/3 */}
          <div className={`relative w-full overflow-hidden ${compact ? "aspect-[3/2]" : "aspect-[4/3]"}`}>
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-[1.06]"
                style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <PlaceholderImage typeEmoji={typeEmoji} typeGradient={typeGradient} />
            )}

            {/* Score — appears on hover */}
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
              <span className="text-xs font-bold text-white">{event.interest_score}</span>
            </div>

            {/* Tags — appear on hover */}
            {allTags.length > 0 && (
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1 bg-gradient-to-t from-black/40 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

          {/* Content */}
          <div className="space-y-1.5 p-3.5 pt-3">
            {/* Category + Date */}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {typeLabel && (
                <>
                  <span className="font-medium text-champagne-600">{typeLabel}</span>
                  <span className="text-slate-300">|</span>
                </>
              )}
              <span className="capitalize">{formattedDate}</span>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 font-serif text-base leading-snug text-slate-900 transition-colors group-hover:text-riviera-600">
              {event.title}
            </h3>

            {/* Location + Price */}
            <div className="flex items-center gap-2 text-[13px] text-slate-500">
              {(event.location_name || event.location_city) && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {event.location_name || event.location_city}
                  </span>
                </span>
              )}
              <span className="ml-auto shrink-0 font-semibold text-slate-700">
                {priceDisplay}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function PlaceholderImage({
  typeEmoji,
  typeGradient,
}: {
  typeEmoji: string;
  typeGradient: string;
}) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${typeGradient}`}
    >
      <span className="text-7xl opacity-30 select-none">{typeEmoji}</span>
    </div>
  );
}

function WideplaceholderImage({
  typeEmoji,
  typeGradient,
}: {
  typeEmoji: string;
  typeGradient: string;
}) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${typeGradient}`}
    >
      <span className="text-8xl opacity-20 select-none">{typeEmoji}</span>
    </div>
  );
}
