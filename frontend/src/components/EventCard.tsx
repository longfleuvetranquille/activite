"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Wallet, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

interface EventCardProps {
  event: Event;
  index?: number;
  compact?: boolean;
}

export default function EventCard({
  event,
  index = 0,
  compact = false,
}: EventCardProps) {
  const dateStart = new Date(event.date_start);
  const formattedDate = format(dateStart, "EEE d MMM", { locale: fr });
  const formattedTime = format(dateStart, "HH:mm");

  const priceDisplay =
    event.price_min === 0 && event.price_max === 0
      ? "Gratuit"
      : event.price_min === event.price_max
        ? `${event.price_min}\u00A0\u20AC`
        : `${event.price_min}-${event.price_max}\u00A0\u20AC`;

  // Collect up to 4 tags to show
  const visibleTags: { code: string; category: string }[] = [];
  const tagSources: [string[], string][] = [
    [event.tags_type, "type"],
    [event.tags_vibe, "vibe"],
    [event.tags_budget, "budget"],
    [event.tags_exclusivity, "exclusivity"],
    [event.tags_deals, "deals"],
  ];
  for (const [tags, category] of tagSources) {
    for (const code of tags) {
      if (visibleTags.length < 4) {
        visibleTags.push({ code, category });
      }
    }
  }

  // Interest score color
  const scoreColor =
    event.interest_score >= 80
      ? "text-emerald-400 bg-emerald-500/15 ring-emerald-500/30"
      : event.interest_score >= 60
        ? "text-azur-400 bg-azur-500/15 ring-azur-500/30"
        : event.interest_score >= 40
          ? "text-yellow-400 bg-yellow-500/15 ring-yellow-500/30"
          : "text-gray-400 bg-white/5 ring-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/event/${event.id}`}
        className="card card-hover group block overflow-hidden p-0"
      >
        {/* Image */}
        <div
          className={`relative w-full overflow-hidden ${compact ? "h-32" : "h-44"}`}
        >
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-azur-600/20 via-coral-500/15 to-navy-600/20">
              <Calendar className="h-10 w-10 text-white/15" />
            </div>
          )}

          {/* Score badge */}
          <div
            className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl ring-1 backdrop-blur-sm ${scoreColor}`}
          >
            <span className="text-xs font-bold">{event.interest_score}</span>
          </div>

          {/* Featured overlay */}
          {event.is_featured && (
            <div className="absolute left-3 top-3 rounded-full bg-coral-500/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Featured
            </div>
          )}

          {/* Gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--card)] to-transparent" />
        </div>

        {/* Content */}
        <div className="space-y-3 p-4 pt-3">
          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white group-hover:text-azur-300">
            {event.title}
          </h3>

          {/* Summary */}
          {event.summary && !compact && (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-gray-400">
              {event.summary}
            </p>
          )}

          {/* Info row */}
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-azur-400" />
                <span className="capitalize font-medium text-gray-200">{formattedDate}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-gray-400">{formattedTime}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {event.location_name ? (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-coral-400" />
                  <span className="truncate text-gray-300">
                    {event.location_name}
                    {event.location_city &&
                      event.location_city !== event.location_name &&
                      `, ${event.location_city}`}
                  </span>
                </span>
              ) : event.location_city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-coral-400" />
                  <span className="text-gray-300">{event.location_city}</span>
                </span>
              ) : null}
              <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-semibold text-gray-200">
                <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                {priceDisplay}
              </span>
            </div>
          </div>

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {visibleTags.map((tag, i) => (
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
      </Link>
    </motion.div>
  );
}
