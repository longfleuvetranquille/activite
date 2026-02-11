"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  RefreshCw,
  Tag,
  TreePalm,
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Event } from "@/types";
import { getEvent, parseEventDate } from "@/lib/api";
import TagBadge from "@/components/TagBadge";
import MapView from "@/components/MapView";
import { TYPE_STYLES } from "@/components/EventCard";

const DEFAULT_STYLE = { gradient: "from-champagne-400 to-champagne-600", emoji: "\uD83C\uDF34" };

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

  const firstType = event.tags_type[0] || "";
  const typeStyle = TYPE_STYLES[firstType] || DEFAULT_STYLE;
  const isSportWithLogo = firstType === "sport_match" && !!event.image_url;

  const dateStart = parseEventDate(event.date_start);
  const formattedDate = format(dateStart, "EEEE d MMMM yyyy", { locale: fr });
  const formattedTime = format(dateStart, "HH:mm");
  const formattedDateEnd = event.date_end
    ? format(parseEventDate(event.date_end), "HH:mm")
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
    >
      {/* Compact gradient header */}
      <div className="relative">
        <div className={`relative flex h-[180px] w-full items-center justify-center overflow-hidden bg-gradient-to-br ${typeStyle.gradient}`}>
          {/* Centered large emoji in gradient circle */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
          >
            {isSportWithLogo ? (
              <img src={event.image_url} alt="" className="h-14 w-14 object-contain" />
            ) : (
              <span className="text-[56px] leading-none">{typeStyle.emoji}</span>
            )}
          </motion.div>

          {/* Gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/60 to-transparent" />

          {/* Back button overlay */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 sm:left-6 lg:left-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* "Recommande par Palmier" badge if score >= 80 */}
          {event.interest_score >= 80 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
              className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-elevated backdrop-blur-md sm:right-6"
            >
              <TreePalm className="h-4 w-4 text-champagne-500" />
              <span className="text-xs font-semibold text-slate-900">
                Recommande par Palmier
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Editorial content — centered */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Category inline + title */}
        <div className="space-y-3 -mt-8 relative">
          {/* Info pills inline */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="capitalize">{formattedDate}</span>
            <span className="text-slate-300">&middot;</span>
            <span>{formattedTime}{formattedDateEnd ? ` - ${formattedDateEnd}` : ""}</span>
            {(event.location_name || event.location_city) && (
              <>
                <span className="text-slate-300">&middot;</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-olive-500" />
                  {event.location_name}
                  {event.location_name && event.location_city && ", "}
                  {event.location_city}
                </span>
              </>
            )}
            <span className="text-slate-300">&middot;</span>
            <span className="font-medium text-slate-700">{priceDisplay}</span>
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl text-slate-900 sm:text-4xl lg:text-hero">
            {event.title}
          </h1>
        </div>

        {/* CTA prominent */}
        {event.source_url && (
          <a
            href={event.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-champagne-600 to-champagne-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-champagne-500/25 transition-all hover:shadow-xl hover:shadow-champagne-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <ExternalLink className="h-4.5 w-4.5" />
            Voir sur {event.source_name || "la source"}
          </a>
        )}

        {/* Summary */}
        {event.summary && (
          <div className="mt-8">
            <p className="text-lg leading-relaxed text-slate-600">
              {event.summary}
            </p>
          </div>
        )}

        {/* Full Description */}
        {event.description && (
          <div className="mt-6">
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

        {/* Map */}
        {event.latitude && event.longitude && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-2xl border border-white/60 shadow-card">
              <div className="h-56 w-full">
                <MapView events={[event]} />
              </div>
              <div className="bg-white/60 p-4 backdrop-blur-md">
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
          </div>
        )}

        {/* Quick Info */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/60 bg-white/60 shadow-card backdrop-blur-md">
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

        {/* Tags — subtle at bottom */}
        {allTags.length > 0 && (
          <div className="mt-8 pb-12">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
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
    <div>
      {/* Compact gradient header skeleton */}
      <div className="h-[180px] w-full bg-slate-200/50 shimmer" />
      {/* Content */}
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        <div className="h-5 w-60 rounded-lg bg-slate-200/60 shimmer" />
        <div className="h-12 w-3/4 rounded-2xl bg-slate-200/60 shimmer" />
        <div className="h-14 w-full rounded-2xl bg-slate-200/60 shimmer" />
        <div className="h-32 w-full rounded-2xl bg-slate-200/40 shimmer" />
        <div className="h-56 w-full rounded-2xl bg-slate-200/40 shimmer" />
      </div>
    </div>
  );
}
