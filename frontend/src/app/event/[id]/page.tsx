"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Star,
  Tag,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Event } from "@/types";
import { getEvent } from "@/lib/api";
import TagBadge from "@/components/TagBadge";
import MapView from "@/components/MapView";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getEvent(eventId);
        setEvent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Evenement introuvable");
      } finally {
        setLoading(false);
      }
    }
    if (eventId) load();
  }, [eventId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-24 animate-pulse rounded-lg bg-white/5" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-white/5" />
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-white/5" />
        <div className="h-6 w-1/2 animate-pulse rounded-lg bg-white/5" />
        <div className="h-40 w-full animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="card max-w-md text-center">
          <p className="mb-2 text-lg font-semibold text-red-400">
            Evenement introuvable
          </p>
          <p className="mb-4 text-sm text-gray-400">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.back()} className="btn-secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4" />
              Reessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dateStart = new Date(event.date_start);
  const formattedDate = format(dateStart, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(dateStart, "HH:mm");
  const formattedDateEnd = event.date_end
    ? format(new Date(event.date_end), "HH:mm")
    : null;

  const priceDisplay =
    event.price_min === 0 && event.price_max === 0
      ? "Gratuit"
      : event.price_min === event.price_max
        ? `${event.price_min} ${event.currency}`
        : `${event.price_min} - ${event.price_max} ${event.currency}`;

  const allTags = [
    ...event.tags_type.map((t) => ({ code: t, category: "type" })),
    ...event.tags_vibe.map((t) => ({ code: t, category: "vibe" })),
    ...event.tags_energy.map((t) => ({ code: t, category: "energy" })),
    ...event.tags_budget.map((t) => ({ code: t, category: "budget" })),
    ...event.tags_time.map((t) => ({ code: t, category: "time" })),
    ...event.tags_exclusivity.map((t) => ({ code: t, category: "exclusivity" })),
    ...event.tags_location.map((t) => ({ code: t, category: "location" })),
    ...event.tags_audience.map((t) => ({ code: t, category: "audience" })),
    ...event.tags_deals.map((t) => ({ code: t, category: "deals" })),
    ...event.tags_meta.map((t) => ({ code: t, category: "meta" })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Retour
      </button>

      {/* Hero Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-2xl sm:h-64 lg:h-80">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-azur-600/30 via-coral-500/20 to-navy-600/30">
            <Star className="h-16 w-16 text-white/20" />
          </div>
        )}
        {/* Interest Score Badge */}
        <div className="absolute right-4 top-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/60 backdrop-blur-md">
          <div className="text-center">
            <p className="text-lg font-bold text-white">
              {event.interest_score}
            </p>
            <p className="text-[9px] font-medium uppercase tracking-wide text-gray-400">
              score
            </p>
          </div>
        </div>
        {/* Featured badge */}
        {event.is_featured && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-coral-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <Star className="h-3 w-3" />
            A la une
          </div>
        )}
      </div>

      {/* Title & Main Info */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-300">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-azur-400" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-azur-400" />
            <span>
              {formattedTime}
              {formattedDateEnd && ` - ${formattedDateEnd}`}
            </span>
          </div>
          {(event.location_name || event.location_city) && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-coral-400" />
              <span>
                {event.location_name}
                {event.location_name && event.location_city && ", "}
                {event.location_city}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-emerald-400" />
            <span>{priceDisplay}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag, i) => (
              <TagBadge key={`${tag.category}-${tag.code}-${i}`} code={tag.code} category={tag.category} />
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Description & Summary */}
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          {event.summary && (
            <div className="card">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-azur-400">
                Resume
              </h2>
              <p className="leading-relaxed text-gray-300">{event.summary}</p>
            </div>
          )}

          {/* Full Description */}
          {event.description && (
            <div className="card">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Description
              </h2>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300">
                {event.description.split("\n").map((paragraph, i) => (
                  <p key={i} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Source link */}
          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex"
            >
              <ExternalLink className="h-4 w-4" />
              Voir sur {event.source_name || "la source"}
            </a>
          )}
        </div>

        {/* Right: Map & Info */}
        <div className="space-y-4">
          {/* Map */}
          {event.latitude && event.longitude && (
            <div className="card overflow-hidden p-0">
              <div className="h-56 w-full">
                <MapView events={[event]} />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-white">
                  {event.location_name}
                </p>
                {event.location_address && (
                  <p className="mt-0.5 text-xs text-gray-400">
                    {event.location_address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Informations
            </h3>
            <InfoRow label="Prix" value={priceDisplay} />
            <InfoRow label="Ville" value={event.location_city || "N/A"} />
            <InfoRow label="Source" value={event.source_name || "N/A"} />
            <InfoRow
              label="Score"
              value={`${event.interest_score}/100`}
            />
            <InfoRow label="Statut" value={event.status} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 last:border-0 last:pb-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  );
}
