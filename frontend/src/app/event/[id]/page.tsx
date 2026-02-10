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
    return <DetailSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="card max-w-md text-center">
          <p className="mb-2 text-lg font-semibold text-red-600">
            Evenement introuvable
          </p>
          <p className="mb-4 text-sm text-slate-500">{error}</p>
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
    event.price_min < 0
      ? "Non communique"
      : event.price_min === 0 && event.price_max === 0
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
      {/* Hero Image — full-bleed */}
      <div className="relative -mx-4 -mt-5 sm:-mx-6 lg:-mx-6 lg:-mt-6">
        <div className="relative h-56 w-full overflow-hidden sm:h-72 lg:h-96">
          {event.image_url ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-azur-100 via-coral-50 to-navy-100">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-white/80">
                <Star className="h-10 w-10 text-slate-400" />
              </div>
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F8F6F1] via-[#FAFAF8]/60 to-transparent" />

          {/* Back button overlay */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/30 text-white backdrop-blur-md transition-all hover:bg-black/50 sm:left-6 lg:left-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Score badge — animated */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            className="absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-elevated backdrop-blur-md sm:right-6 lg:right-6"
          >
            <div className="text-center">
              <p className="text-xl font-bold text-slate-900">
                {event.interest_score}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-500">
                score
              </p>
            </div>
          </motion.div>

          {/* Featured badge */}
          {event.is_featured && (
            <div className="absolute left-4 top-4 ml-12 inline-flex items-center gap-1.5 rounded-full bg-coral-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm sm:left-6 sm:ml-12">
              <Star className="h-3 w-3" />
              A la une
            </div>
          )}
        </div>
      </div>

      {/* Title & Info Pills */}
      <div className="space-y-4">
        <h1 className="font-serif text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">
          {event.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-azur-100/80 px-3 py-1.5 text-sm font-medium text-azur-700 ring-1 ring-azur-200/50">
            <Calendar className="h-3.5 w-3.5" />
            <span className="capitalize">{formattedDate}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-azur-100/80 px-3 py-1.5 text-sm font-medium text-azur-700 ring-1 ring-azur-200/50">
            <Clock className="h-3.5 w-3.5" />
            {formattedTime}
            {formattedDateEnd && ` - ${formattedDateEnd}`}
          </span>
          {(event.location_name || event.location_city) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-100/80 px-3 py-1.5 text-sm font-medium text-coral-700 ring-1 ring-coral-200/50">
              <MapPin className="h-3.5 w-3.5" />
              {event.location_name}
              {event.location_name && event.location_city && ", "}
              {event.location_city}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1.5 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200/50">
            <Wallet className="h-3.5 w-3.5" />
            {priceDisplay}
          </span>
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
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
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-azur-600">
                Resume
              </h2>
              <p className="leading-relaxed text-slate-600">{event.summary}</p>
            </div>
          )}

          {/* Full Description */}
          {event.description && (
            <div className="card">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                Description
              </h2>
              <div className="prose max-w-none text-sm leading-relaxed text-slate-700">
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
                <p className="text-sm font-medium text-slate-900">
                  {event.location_name}
                </p>
                {event.location_address && (
                  <p className="mt-0.5 text-xs text-slate-500">
                    {event.location_address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="card space-y-0 p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-transparent px-4 py-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Informations
              </h3>
            </div>
            <div className="divide-y divide-black/[0.04] px-4">
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
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 last:pb-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero image skeleton */}
      <div className="relative -mx-4 -mt-5 sm:-mx-6 lg:-mx-6 lg:-mt-6">
        <div className="h-56 w-full rounded-b-2xl bg-slate-200/50 shimmer sm:h-72 lg:h-96" />
      </div>
      {/* Title */}
      <div className="space-y-3">
        <div className="h-10 w-3/4 rounded-2xl bg-slate-200/60 shimmer" />
        <div className="flex gap-2">
          <div className="h-8 w-40 rounded-full bg-slate-200/60 shimmer" />
          <div className="h-8 w-24 rounded-full bg-slate-200/60 shimmer" />
          <div className="h-8 w-32 rounded-full bg-slate-200/60 shimmer" />
        </div>
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="h-40 w-full rounded-2xl bg-slate-200/40 shimmer" />
          <div className="h-60 w-full rounded-2xl bg-slate-200/40 shimmer" />
        </div>
        <div className="space-y-4">
          <div className="h-72 w-full rounded-2xl bg-slate-200/40 shimmer" />
          <div className="h-48 w-full rounded-2xl bg-slate-200/40 shimmer" />
        </div>
      </div>
    </div>
  );
}
