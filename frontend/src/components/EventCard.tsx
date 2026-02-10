"use client";

import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Music,
  Plane,
  Trophy,
  Utensils,
  Gamepad2,
  Theater,
  Mic2,
  Waves,
  Mountain,
  Clapperboard,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

// Map event types to icons and gradient colors for placeholders
const TYPE_VISUALS: Record<string, { icon: typeof Music; gradient: string; iconColor: string; blobColor: string }> = {
  party: { icon: Music, gradient: "from-purple-300 to-pink-300", iconColor: "text-purple-700", blobColor: "bg-pink-400/30" },
  bar_rooftop: { icon: Sparkles, gradient: "from-amber-300 to-orange-300", iconColor: "text-amber-700", blobColor: "bg-orange-400/30" },
  dj_set: { icon: Music, gradient: "from-violet-300 to-fuchsia-300", iconColor: "text-violet-700", blobColor: "bg-fuchsia-400/30" },
  concert: { icon: Mic2, gradient: "from-rose-300 to-red-300", iconColor: "text-rose-700", blobColor: "bg-red-400/30" },
  show: { icon: Theater, gradient: "from-indigo-300 to-purple-300", iconColor: "text-indigo-700", blobColor: "bg-purple-400/30" },
  conference: { icon: GraduationCap, gradient: "from-sky-300 to-blue-300", iconColor: "text-sky-700", blobColor: "bg-blue-400/30" },
  sport_match: { icon: Trophy, gradient: "from-emerald-300 to-green-300", iconColor: "text-emerald-700", blobColor: "bg-green-400/30" },
  motorsport: { icon: Trophy, gradient: "from-red-300 to-orange-300", iconColor: "text-red-700", blobColor: "bg-orange-400/30" },
  watersport: { icon: Waves, gradient: "from-cyan-300 to-teal-300", iconColor: "text-cyan-700", blobColor: "bg-teal-400/30" },
  outdoor: { icon: Mountain, gradient: "from-green-300 to-emerald-300", iconColor: "text-green-700", blobColor: "bg-emerald-400/30" },
  gaming: { icon: Gamepad2, gradient: "from-violet-300 to-indigo-300", iconColor: "text-violet-700", blobColor: "bg-indigo-400/30" },
  cinema: { icon: Clapperboard, gradient: "from-slate-300 to-gray-400", iconColor: "text-slate-700", blobColor: "bg-gray-400/30" },
  food: { icon: Utensils, gradient: "from-orange-300 to-amber-300", iconColor: "text-orange-700", blobColor: "bg-amber-400/30" },
  travel: { icon: Plane, gradient: "from-sky-300 to-cyan-300", iconColor: "text-sky-700", blobColor: "bg-cyan-400/30" },
};

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
    event.price_min < 0
      ? "N/C"
      : event.price_min === 0 && event.price_max === 0
        ? "Gratuit"
        : event.price_min === event.price_max
          ? `${event.price_min}\u00A0\u20AC`
          : `${event.price_min}-${event.price_max}\u00A0\u20AC`;

  // Collect tags to show (2 on mobile, 4 on desktop)
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

  // Interest score color
  const scoreColor =
    event.interest_score >= 80
      ? "text-emerald-700 bg-emerald-100/90 ring-emerald-300/50"
      : event.interest_score >= 60
        ? "text-champagne-700 bg-champagne-100/90 ring-champagne-300/50"
        : event.interest_score >= 40
          ? "text-yellow-700 bg-yellow-100/90 ring-yellow-300/50"
          : "text-slate-600 bg-slate-100/90 ring-slate-300/50";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        href={`/event/${event.id}`}
        className={`group block overflow-hidden rounded-2xl border bg-white/60 p-0 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elevated-lg ${
          event.is_featured
            ? "border-champagne-200/60 bg-gradient-to-br from-white/70 via-champagne-50/30 to-white/60 shadow-card-featured"
            : "border-white/60"
        }`}
      >
        {/* Mobile: horizontal layout */}
        <div className="flex sm:hidden">
          {/* Mobile image */}
          <div className="relative h-24 w-24 shrink-0 overflow-hidden">
            {event.image_url ? (
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <PlaceholderImage tags_type={event.tags_type} />
            )}
            {/* Score badge */}
            <div
              className={`absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-lg ring-1 backdrop-blur-md ${scoreColor}`}
            >
              <span className="text-[10px] font-bold">{event.interest_score}</span>
            </div>
          </div>

          {/* Mobile content */}
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-2.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-riviera-600 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3 text-champagne-500" />
                <span className="capitalize font-medium text-slate-700">{formattedDate}</span>
              </span>
              <span>{formattedTime}</span>
              <span className="ml-auto shrink-0 font-semibold text-slate-700">{priceDisplay}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {(event.location_name || event.location_city) && (
                <span className="inline-flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-olive-500" />
                  <span className="truncate">
                    {event.location_name || event.location_city}
                  </span>
                </span>
              )}
            </div>
            {allTags.length > 0 && (
              <div className="flex gap-1">
                {allTags.slice(0, 2).map((tag, i) => (
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

        {/* Desktop: vertical layout */}
        <div className="hidden sm:block">
          {/* Image */}
          <div
            className={`relative w-full overflow-hidden ${compact ? "h-28" : "h-40"}`}
          >
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
              <PlaceholderImage tags_type={event.tags_type} />
            )}

            {/* Dark gradient overlay — intensifies on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Score badge */}
            <div
              className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl ring-1 backdrop-blur-md transition-transform duration-300 group-hover:scale-110 ${scoreColor}`}
            >
              <span className="text-xs font-bold">{event.interest_score}</span>
            </div>

            {/* Featured overlay */}
            {event.is_featured && (
              <div className="absolute left-3 top-3 rounded-full bg-champagne-500/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm shadow-sm">
                Featured
              </div>
            )}

            {/* Info bar that slides up on hover */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0">
              <div className="flex items-center justify-between bg-black/50 px-3.5 py-2 text-xs text-white backdrop-blur-md">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </span>
                {(event.location_name || event.location_city) && (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {event.location_name || event.location_city}
                    </span>
                  </span>
                )}
                <span className="font-semibold">{priceDisplay}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2.5 p-3.5 pt-3">
            {/* Title */}
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-riviera-600">
              {event.title}
            </h3>

            {/* Summary */}
            {event.summary && !compact && (
              <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                {event.summary}
              </p>
            )}

            {/* Info row */}
            <div className="flex flex-col gap-2 text-[13px]">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-champagne-500" />
                  <span className="capitalize font-medium text-slate-700">{formattedDate}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-slate-500">{formattedTime}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {event.location_name ? (
                  <span className="inline-flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-olive-500" />
                    <span className="truncate text-slate-600">
                      {event.location_name}
                      {event.location_city &&
                        event.location_city !== event.location_name &&
                        `, ${event.location_city}`}
                    </span>
                  </span>
                ) : event.location_city ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-olive-500" />
                    <span className="text-slate-600">{event.location_city}</span>
                  </span>
                ) : null}
                <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-semibold text-slate-700">
                  <Wallet className="h-3.5 w-3.5 text-emerald-500" />
                  {priceDisplay}
                </span>
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
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

const DOT_PATTERN = "url(\"data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E\")";

function PlaceholderImage({ tags_type }: { tags_type: string[] }) {
  const firstType = tags_type[0];
  const visual = (firstType && TYPE_VISUALS[firstType]) || {
    icon: Calendar,
    gradient: "from-champagne-300 to-riviera-300",
    iconColor: "text-champagne-700",
    blobColor: "bg-riviera-400/30",
  };
  const Icon = visual.icon;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br ${visual.gradient}`}
    >
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: DOT_PATTERN, backgroundSize: "20px 20px" }}
      />
      {/* Decorative blob */}
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${visual.blobColor} blur-2xl`}
      />
      <div
        className={`absolute -bottom-4 -left-4 h-20 w-20 rounded-full ${visual.blobColor} blur-2xl`}
      />
      {/* Icon container */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white/40 backdrop-blur-sm ring-1 ring-white/60 shadow-lg">
        <Icon className={`h-12 w-12 ${visual.iconColor}`} />
      </div>
    </div>
  );
}
