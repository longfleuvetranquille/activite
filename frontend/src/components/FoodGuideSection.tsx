"use client";

import {
  Coffee,
  UtensilsCrossed,
  Music,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface Spot {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  gradient: string;
  url?: string;
}

interface FoodCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  badgeColor: string;
  spots: Spot[];
}

const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: "cafes",
    title: "Cafes & brunchs",
    subtitle:
      "Boire son p\u2019tit cafe en journee et prendre son brunch de parisien",
    icon: Coffee,
    iconColor: "text-amber-500",
    badgeColor:
      "bg-amber-100/80 text-amber-700 ring-1 ring-amber-200/50",
    spots: [
      {
        id: "cafe-fino",
        name: "Cafe Fino",
        subtitle: "Nice",
        description:
          "Specialty coffee et brunch dans un cadre minimaliste et lumineux.",
        gradient: "from-amber-50 to-orange-50",
      },
      {
        id: "hotel-couvent",
        name: "Hotel du Couvent",
        subtitle: "Nice",
        description:
          "Ancien couvent reconverti en hotel boutique, cafe dans le cloitre.",
        gradient: "from-stone-100 to-amber-50",
      },
      {
        id: "popotte-ondine",
        name: "Popotte d\u2019Ondine",
        subtitle: "Nice",
        description:
          "Brunch healthy, bowls et patisseries maison dans une ambiance cosy.",
        gradient: "from-rose-50 to-pink-50",
      },
      {
        id: "marinette",
        name: "Marinette",
        subtitle: "Nice",
        description:
          "Coffee shop de quartier avec formules brunch le week-end.",
        gradient: "from-teal-50 to-emerald-50",
      },
    ],
  },
  {
    id: "restaurants-date",
    title: "Restaurants pour un date",
    subtitle: "Restaurant pour un date en bien",
    icon: UtensilsCrossed,
    iconColor: "text-rose-400",
    badgeColor:
      "bg-rose-100/80 text-rose-700 ring-1 ring-rose-200/50",
    spots: [
      {
        id: "lou-pantail",
        name: "Lou Pantail",
        subtitle: "Nice",
        description:
          "Cuisine nicoise revisitee, terrasse intimiste dans le Vieux-Nice.",
        gradient: "from-champagne-100 to-amber-50",
      },
      {
        id: "gruppomimo",
        name: "Gruppomimo",
        subtitle: "Nice",
        description:
          "Italien haut de gamme, pates fraiches et ambiance romantique.",
        gradient: "from-red-50 to-rose-50",
      },
      {
        id: "di-piu",
        name: "Di Piu",
        subtitle: "Nice",
        description:
          "Trattoria moderne, pizzas napolitaines et carte des vins soignee.",
        gradient: "from-orange-50 to-amber-50",
      },
      {
        id: "favola",
        name: "Favola",
        subtitle: "Nice",
        description:
          "Cuisine italienne raffinee, cadre elegant pour une soiree speciale.",
        gradient: "from-violet-50 to-purple-50",
      },
      {
        id: "luzine",
        name: "L\u2019Uzine",
        subtitle: "Nice",
        description:
          "Ancien garage transforme en restaurant-bar branche, cuisine creative.",
        gradient: "from-slate-100 to-stone-50",
      },
      {
        id: "chez-pipo",
        name: "Chez Pipo",
        subtitle: "Nice",
        description:
          "Institution nicoise depuis 1923. La meilleure socca de Nice, a manger local.",
        gradient: "from-yellow-50 to-amber-50",
      },
      {
        id: "don-vincenzo",
        name: "Don Vincenzo",
        subtitle: "Nice",
        description:
          "Pizzeria authentique, ambiance familiale et produits importes d\u2019Italie.",
        gradient: "from-emerald-50 to-teal-50",
      },
      {
        id: "la-bagnata",
        name: "La Bagnata",
        subtitle: "Nice",
        description:
          "Cuisine mediterraneenne les pieds dans l\u2019eau, vue sur la baie des Anges.",
        gradient: "from-sky-50 to-blue-50",
      },
    ],
  },
  {
    id: "resto-dansant",
    title: "Restos dansants",
    subtitle:
      "Restaurant dansant qui se transforme en boite",
    icon: Music,
    iconColor: "text-purple-500",
    badgeColor:
      "bg-purple-100/80 text-purple-700 ring-1 ring-purple-200/50",
    spots: [
      {
        id: "medusa",
        name: "Medusa",
        subtitle: "Cannes",
        description:
          "Restaurant-club sur le port de Cannes. Diner puis DJ set et dancefloor.",
        gradient: "from-fuchsia-50 to-purple-50",
      },
      {
        id: "baoli",
        name: "Le Baoli",
        subtitle: "Cannes",
        description:
          "Restaurant-club mythique de la Croisette. Cuisine asiatique puis clubbing jusqu\u2019au bout de la nuit.",
        gradient: "from-champagne-100 to-rose-50",
      },
    ],
  },
];

function SpotCard({ spot, index }: { spot: Spot; index: number }) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${spot.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg`}
    >
      {/* Name */}
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {spot.name}
      </h3>

      {/* Location */}
      <p className="mt-0.5 text-xs font-medium text-slate-500">
        {spot.subtitle}
      </p>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {spot.description}
      </p>

      {/* External link indicator */}
      {spot.url && (
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
      {spot.url ? (
        <a
          href={spot.url}
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

export default function FoodGuideSection() {
  return (
    <div className="space-y-10">
      {FOOD_CATEGORIES.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.id}>
            {/* Category header */}
            <div className="mb-5">
              <div className="mb-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-champagne-500 via-olive-400 to-transparent" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm">
                  <Icon className={`h-5 w-5 ${category.iconColor}`} />
                </div>
                <h2 className="font-serif text-xl text-slate-900 sm:text-2xl">
                  {category.title}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${category.badgeColor}`}
                >
                  {category.spots.length}
                </span>
              </div>
              <p className="mt-1.5 pl-[42px] text-sm text-slate-500">
                {category.subtitle}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {category.spots.map((spot, i) => (
                <SpotCard key={spot.id} spot={spot} index={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
