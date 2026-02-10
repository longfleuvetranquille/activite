"use client";

import {
  Mountain,
  Umbrella,
  Footprints,
  Waves,
  Sailboat,
  Car,
  ShoppingBasket,
  CircleDot,
  Calendar,
  ExternalLink,
  Compass,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface TimelessActivity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  icon: LucideIcon;
  seasonStart: number; // 1-12, 0 = all year
  seasonEnd: number;   // 1-12, 0 = all year
  seasonLabel: string;
  gradient: string;
  url?: string;
}

const TIMELESS_ACTIVITIES: TimelessActivity[] = [
  {
    id: "ski",
    title: "Ski alpin",
    subtitle: "Auron & Isola 2000",
    description:
      "Les stations de ski de l'arriere-pays nicois, a 1h30 de la mer.",
    location: "Arriere-pays nicois",
    icon: Mountain,
    seasonStart: 12,
    seasonEnd: 3,
    seasonLabel: "Mi-dec a fin mars",
    gradient: "from-sky-100 to-blue-50",
    url: "https://www.isola2000.com",
  },
  {
    id: "plages",
    title: "Plages & baignade",
    subtitle: "Cannes, Antibes, Nice",
    description:
      "Les plus belles plages de la Cote d'Azur, de la Croisette a la Promenade des Anglais.",
    location: "Cote d'Azur",
    icon: Umbrella,
    seasonStart: 6,
    seasonEnd: 9,
    seasonLabel: "Juin a septembre",
    gradient: "from-amber-50 to-yellow-50",
  },
  {
    id: "mercantour",
    title: "Randonnee Mercantour",
    subtitle: "Parc national du Mercantour",
    description:
      "Sentiers alpins, lacs d'altitude et la Vallee des Merveilles a 2h de Nice.",
    location: "Parc du Mercantour",
    icon: Footprints,
    seasonStart: 5,
    seasonEnd: 10,
    seasonLabel: "Mai a octobre",
    gradient: "from-emerald-50 to-green-50",
    url: "https://www.mercantour-parcnational.fr",
  },
  {
    id: "nautique",
    title: "Sports nautiques",
    subtitle: "Jet-ski, paddle, voile",
    description:
      "Jet-ski, paddle, plongee et voile le long de la Cote d'Azur.",
    location: "Cote d'Azur",
    icon: Waves,
    seasonStart: 5,
    seasonEnd: 9,
    seasonLabel: "Mai a septembre",
    gradient: "from-cyan-50 to-sky-50",
  },
  {
    id: "lerins",
    title: "Iles de Lerins",
    subtitle: "Sainte-Marguerite & Saint-Honorat",
    description:
      "Escapade sur les iles au large de Cannes : nature, patrimoine et eaux turquoise.",
    location: "Cannes",
    icon: Sailboat,
    seasonStart: 4,
    seasonEnd: 10,
    seasonLabel: "Avril a octobre",
    gradient: "from-teal-50 to-emerald-50",
    url: "https://www.lerinsleroyal.com",
  },
  {
    id: "napoleon",
    title: "Route Napoleon",
    subtitle: "Grasse → Grenoble",
    description:
      "325 km de route historique a travers les Alpes, depart depuis Grasse.",
    location: "Grasse → Grenoble",
    icon: Car,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-stone-100 to-slate-50",
  },
  {
    id: "forville",
    title: "Marche Forville",
    subtitle: "Cannes",
    description:
      "Marche provencal couvert : fruits, legumes, poissons frais et fleurs tous les matins.",
    location: "Cannes",
    icon: ShoppingBasket,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-orange-50 to-amber-50",
  },
  {
    id: "golf",
    title: "Golf",
    subtitle: "Mougins, Mandelieu",
    description:
      "Parcours de golf prestigieux entre mer et montagne, jouables toute l'annee.",
    location: "Mougins, Mandelieu",
    icon: CircleDot,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-lime-50 to-green-50",
  },
];

function isInSeason(activity: TimelessActivity, month: number): boolean {
  if (activity.seasonStart === 0 && activity.seasonEnd === 0) return true;

  // Handle wrap-around seasons (e.g. Dec-Mar: start=12, end=3)
  if (activity.seasonStart > activity.seasonEnd) {
    return month >= activity.seasonStart || month <= activity.seasonEnd;
  }
  return month >= activity.seasonStart && month <= activity.seasonEnd;
}

function getSeasonalActivities(): TimelessActivity[] {
  const currentMonth = new Date().getMonth() + 1;
  return TIMELESS_ACTIVITIES.filter((a) => isInSeason(a, currentMonth));
}

function TimelessCard({
  activity,
  index,
}: {
  activity: TimelessActivity;
  index: number;
}) {
  const Icon = activity.icon;

  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${activity.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg`}
    >
      {/* Icon circle */}
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5.5 w-5.5 text-slate-700" />
      </div>

      {/* Title */}
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {activity.title}
      </h3>

      {/* Subtitle / location */}
      <p className="mt-0.5 text-xs font-medium text-slate-500">
        {activity.subtitle}
      </p>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {activity.description}
      </p>

      {/* Season badge */}
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-black/[0.04] backdrop-blur-sm">
        <Calendar className="h-3 w-3 text-slate-400" />
        {activity.seasonLabel}
      </div>

      {/* External link indicator */}
      {activity.url && (
        <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/50 opacity-0 ring-1 ring-black/[0.04] backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      {activity.url ? (
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </motion.div>
  );
}

export default function TimelessSection() {
  const activities = getSeasonalActivities();

  if (activities.length === 0) return null;

  return (
    <div>
      {/* Section header — matches SectionHeader style in page.tsx */}
      <div className="mb-5">
        <div className="mb-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-champagne-500 via-olive-400 to-transparent" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm">
            <Compass className="h-5 w-5 text-olive-500" />
          </div>
          <h2 className="font-serif text-xl text-slate-900 sm:text-2xl">
            Intemporelles
          </h2>
          <span className="inline-flex items-center rounded-full bg-olive-100/80 px-2.5 py-0.5 text-xs font-semibold text-olive-700 ring-1 ring-olive-200/50">
            {activities.length}
          </span>
        </div>
        <p className="mt-1.5 pl-[42px] text-sm text-slate-500">
          Activites permanentes et saisonnieres de la Cote d&apos;Azur
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activities.map((activity, i) => (
          <TimelessCard key={activity.id} activity={activity} index={i} />
        ))}
      </div>
    </div>
  );
}
