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

import type { Event } from "@/types";
import TagBadge from "./TagBadge";

// Map event types to icons and gradient colors for placeholders
const TYPE_VISUALS: Record<string, { icon: typeof Music; gradient: string }> = {
  party: { icon: Music, gradient: "from-purple-200 to-pink-200" },
  bar_rooftop: { icon: Sparkles, gradient: "from-amber-200 to-orange-200" },
  dj_set: { icon: Music, gradient: "from-violet-200 to-fuchsia-200" },
  concert: { icon: Mic2, gradient: "from-rose-200 to-red-200" },
  show: { icon: Theater, gradient: "from-indigo-200 to-purple-200" },
  conference: { icon: GraduationCap, gradient: "from-sky-200 to-blue-200" },
  sport_match: { icon: Trophy, gradient: "from-emerald-200 to-green-200" },
  motorsport: { icon: Trophy, gradient: "from-red-200 to-orange-200" },
  watersport: { icon: Waves, gradient: "from-cyan-200 to-teal-200" },
  outdoor: { icon: Mountain, gradient: "from-green-200 to-emerald-200" },
  gaming: { icon: Gamepad2, gradient: "from-violet-200 to-indigo-200" },
  cinema: { icon: Clapperboard, gradient: "from-slate-200 to-gray-200" },
  food: { icon: Utensils, gradient: "from-orange-200 to-amber-200" },
  travel: { icon: Plane, gradient: "from-sky-200 to-cyan-200" },
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
      ? "text-emerald-700 bg-emerald-100 ring-emerald-300"
      : event.interest_score >= 60
        ? "text-azur-700 bg-azur-100 ring-azur-300"
        : event.interest_score >= 40
          ? "text-yellow-700 bg-yellow-100 ring-yellow-300"
          : "text-slate-600 bg-slate-100 ring-slate-300";

  return (
    <div className="animate-fade-in">
      <Link
        href={`/event/${event.id}`}
        className="card card-hover group block overflow-hidden p-0"
      >
        {/* Image */}
        <div
          className={`relative w-full overflow-hidden ${compact ? "h-28" : "h-36"}`}
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
            <PlaceholderImage tags_type={event.tags_type} />
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
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Content */}
        <div className="space-y-2.5 p-3.5 pt-2.5">
          {/* Title */}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-azur-600">
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
                <Calendar className="h-3.5 w-3.5 text-azur-500" />
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
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-coral-500" />
                  <span className="truncate text-slate-600">
                    {event.location_name}
                    {event.location_city &&
                      event.location_city !== event.location_name &&
                      `, ${event.location_city}`}
                  </span>
                </span>
              ) : event.location_city ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-coral-500" />
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
    </div>
  );
}

function PlaceholderImage({ tags_type }: { tags_type: string[] }) {
  const firstType = tags_type[0];
  const visual = (firstType && TYPE_VISUALS[firstType]) || {
    icon: Calendar,
    gradient: "from-azur-200 to-navy-200",
  };
  const Icon = visual.icon;

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${visual.gradient}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/40">
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
    </div>
  );
}
