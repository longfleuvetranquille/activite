"use client";

import { useState } from "react";
import {
  Mountain,
  Umbrella,
  Footprints,
  Waves,
  Sailboat,
  CircleDot,
  Zap,
  TreePine,
  Target,
  Grip,
  Calendar,
  ExternalLink,
  Sun,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HorizontalCarousel from "./HorizontalCarousel";

interface TimelessActivity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  icon: LucideIcon;
  seasonStart: number;
  seasonEnd: number;
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
    id: "location-bateau",
    title: "Location de bateau",
    subtitle: "Nice, Cannes, Antibes",
    description:
      "Louer un bateau a la journee pour explorer la cote, les criques et les iles. Avec ou sans permis.",
    location: "Cote d'Azur",
    icon: Sailboat,
    seasonStart: 5,
    seasonEnd: 9,
    seasonLabel: "Mai a septembre",
    gradient: "from-blue-50 to-sky-50",
  },
  {
    id: "lerins",
    title: "Ile Sainte-Marguerite",
    subtitle: "Iles de Lerins, Cannes",
    description:
      "Ile Sainte-Marguerite au large de Cannes : sentiers dans la foret, Fort Royal, eaux turquoise. Traversee en 15 min depuis Cannes.",
    location: "Cannes",
    icon: Sailboat,
    seasonStart: 4,
    seasonEnd: 10,
    seasonLabel: "Avril a octobre",
    gradient: "from-teal-50 to-emerald-50",
    url: "https://www.lerinsleroyal.com",
  },
  {
    id: "quad-buggy",
    title: "Location quad & buggy",
    subtitle: "Cote d'Azur",
    description:
      "Balades en quad ou buggy dans l'arriere-pays, sensations garanties.",
    location: "Cote d'Azur",
    icon: Zap,
    seasonStart: 4,
    seasonEnd: 10,
    seasonLabel: "Avril a octobre",
    gradient: "from-orange-50 to-amber-50",
  },
  {
    id: "karting",
    title: "Karting",
    subtitle: "Cote d'Azur",
    description:
      "Sessions de karting indoor et outdoor, pour tous les niveaux.",
    location: "Cote d'Azur",
    icon: CircleDot,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-red-50 to-orange-50",
  },
  {
    id: "accrobranche",
    title: "Accrobranche",
    subtitle: "Arriere-pays",
    description:
      "Parcours dans les arbres, tyroliennes et ponts de singe dans les forets de l'arriere-pays.",
    location: "Arriere-pays nicois",
    icon: TreePine,
    seasonStart: 4,
    seasonEnd: 10,
    seasonLabel: "Avril a octobre",
    gradient: "from-green-50 to-emerald-50",
  },
  {
    id: "bloc-arkose",
    title: "Bloc (Arkose)",
    subtitle: "Nice",
    description:
      "Salle d'escalade de bloc, ils changent les parcours tout le temps \u2014 toujours de nouveaux defis.",
    location: "Nice",
    icon: Grip,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-violet-50 to-purple-50",
  },
  {
    id: "paintball",
    title: "Paintball",
    subtitle: "Antibes",
    description:
      "Parties de paintball en exterieur a Antibes, ideal entre potes.",
    location: "Antibes",
    icon: Target,
    seasonStart: 0,
    seasonEnd: 0,
    seasonLabel: "Toute l'annee",
    gradient: "from-stone-100 to-slate-50",
  },
  {
    id: "padel-mer",
    title: "Padel sur la mer",
    subtitle: "Cote d'Azur",
    description:
      "Location d'un terrain de padel flottant pour 1h sur la mer. Experience unique.",
    location: "Cote d'Azur",
    icon: Waves,
    seasonStart: 4,
    seasonEnd: 10,
    seasonLabel: "Avril a octobre",
    gradient: "from-sky-50 to-cyan-50",
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
  if (activity.seasonStart > activity.seasonEnd) {
    return month >= activity.seasonStart || month <= activity.seasonEnd;
  }
  return month >= activity.seasonStart && month <= activity.seasonEnd;
}

export function getSeasonalActivities(): TimelessActivity[] {
  const currentMonth = new Date().getMonth() + 1;
  return TIMELESS_ACTIVITIES.filter((a) => isInSeason(a, currentMonth));
}

function getOffSeasonActivities(): TimelessActivity[] {
  const currentMonth = new Date().getMonth() + 1;
  return TIMELESS_ACTIVITIES.filter((a) => !isInSeason(a, currentMonth));
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
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${activity.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg h-full`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5.5 w-5.5 text-slate-700" />
      </div>
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {activity.title}
      </h3>
      <p className="mt-0.5 text-xs font-medium text-slate-500">
        {activity.subtitle}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {activity.description}
      </p>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-black/[0.04] backdrop-blur-sm">
        <Calendar className="h-3 w-3 text-slate-400" />
        {activity.seasonLabel}
      </div>
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
      className="w-[280px] sm:w-[320px] shrink-0"
    >
      {activity.url ? (
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
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
  const summerActivities = getOffSeasonActivities();
  const [showSummer, setShowSummer] = useState(false);

  if (activities.length === 0 && summerActivities.length === 0) return null;

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-serif text-section-title text-slate-900">
          Intemporelles
          <span className="ml-2 text-[0.6em] font-sans font-normal text-slate-400">
            {activities.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Activites permanentes et saisonnieres de la Cote d&apos;Azur
        </p>
      </div>

      {activities.length > 0 && (
        <HorizontalCarousel>
          {activities.map((activity, i) => (
            <TimelessCard key={activity.id} activity={activity} index={i} />
          ))}
        </HorizontalCarousel>
      )}

      {summerActivities.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowSummer(!showSummer)}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-champagne-600"
          >
            <Sun className="h-3.5 w-3.5" />
            Voir les activites de cet ete
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${showSummer ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showSummer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 opacity-75">
                  <HorizontalCarousel>
                    {summerActivities.map((activity, i) => (
                      <TimelessCard key={activity.id} activity={activity} index={i} />
                    ))}
                  </HorizontalCarousel>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
