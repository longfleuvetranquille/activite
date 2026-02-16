"use client";

import {
  Coffee,
  UtensilsCrossed,
  Music,
  Wine,
  Sparkles,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import HorizontalCarousel from "./HorizontalCarousel";

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
      {
        id: "mayabay",
        name: "Mayabay",
        subtitle: "Monaco",
        description:
          "Restaurant thailandais premium sur le port de Monaco. Ambiance tropicale, cuisine raffinee et vue sur les yachts.",
        gradient: "from-emerald-50 to-cyan-50",
        url: "https://www.mayabay.mc",
      },
      {
        id: "buddha-bar-date",
        name: "Buddha Bar",
        subtitle: "Monaco",
        description:
          "Restaurant-bar iconique au Port de Monaco. Cuisine asiatique fusion, cocktails et DJ sets dans un decor spectaculaire.",
        gradient: "from-amber-50 to-red-50",
        url: "https://www.buddhabar.com/en/monaco/",
      },
    ],
  },
  {
    id: "resto-dansant",
    title: "Restos & Bars dansants",
    subtitle:
      "Restaurant ou bar dansant qui se transforme en boite",
    icon: Music,
    iconColor: "text-purple-500",
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
      {
        id: "le-pablo",
        name: "Le Pablo",
        subtitle: "Nice",
        description:
          "Bar dansant festif qui se transforme en dancefloor en fin de soiree. Ambiance latine et cocktails.",
        gradient: "from-orange-50 to-rose-50",
      },
      {
        id: "la-movida-dansant",
        name: "La Movida",
        subtitle: "Nice",
        description:
          "Bar festif au coeur du Vieux-Nice. Cocktails, tapas et ambiance latine qui se transforme en dancefloor.",
        gradient: "from-red-50 to-orange-50",
      },
      {
        id: "wakabar",
        name: "Wakabar",
        subtitle: "Nice",
        description:
          "Bar dansant anime au coeur de Nice. Cocktails et ambiance festive tous les soirs.",
        gradient: "from-yellow-50 to-amber-50",
      },
    ],
  },
  {
    id: "clubs",
    title: "Clubs branches",
    subtitle:
      "Les clubs ou sortir danser le soir sur la Riviera",
    icon: Sparkles,
    iconColor: "text-fuchsia-500",
    spots: [
      {
        id: "bisous-bisous",
        name: "Bisous Bisous",
        subtitle: "Cannes",
        description:
          "Club select sur le port de Cannes, ambiance festive et DJ sets tous les week-ends.",
        gradient: "from-fuchsia-50 to-pink-50",
      },
      {
        id: "nuits-blanches",
        name: "Les Nuits Blanches",
        subtitle: "Cannes",
        description:
          "Incontournable de la nuit cannoise. Musique variee, soirees thematiques et ambiance electrique.",
        gradient: "from-indigo-50 to-violet-50",
      },
      {
        id: "bibliotech",
        name: "Bibliotech",
        subtitle: "Nice",
        description:
          "Club au concept unique entre bibliotheque et dancefloor. Soirees electro et house.",
        gradient: "from-slate-100 to-purple-50",
      },
    ],
  },
  {
    id: "bars",
    title: "Bars branches",
    subtitle:
      "Les bars ou sortir boire un verre et profiter de l\u2019ambiance",
    icon: Wine,
    iconColor: "text-indigo-500",
    spots: [
      {
        id: "la-movida",
        name: "La Movida",
        subtitle: "Nice",
        description:
          "Bar festif au coeur du Vieux-Nice. Cocktails, tapas et ambiance latine jusqu\u2019au bout de la nuit.",
        gradient: "from-orange-50 to-red-50",
      },
      {
        id: "buddha-bar-bar",
        name: "Buddha Bar",
        subtitle: "Monaco",
        description:
          "Bar iconique au Port de Monaco. Cocktails signatures et DJ sets dans un decor spectaculaire.",
        gradient: "from-amber-50 to-red-50",
        url: "https://www.buddhabar.com/en/monaco/",
      },
    ],
  },
];

function SpotCard({ spot, index }: { spot: Spot; index: number }) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${spot.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg h-full`}
    >
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {spot.name}
      </h3>
      <p className="mt-0.5 text-xs font-medium text-slate-500">
        {spot.subtitle}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {spot.description}
      </p>
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
      className="w-[280px] sm:w-[320px] shrink-0"
    >
      {spot.url ? (
        <a
          href={spot.url}
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

export default function FoodGuideSection() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {FOOD_CATEGORIES.map((category) => {
        return (
          <div key={category.id} id={category.id}>
            <div className="mb-5">
              <h2 className="font-serif text-section-title text-slate-900">
                {category.title}
                <span className="ml-2 text-[0.6em] font-sans font-normal text-slate-400">
                  {category.spots.length}
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {category.subtitle}
              </p>
            </div>

            <HorizontalCarousel>
              {category.spots.map((spot, i) => (
                <SpotCard key={spot.id} spot={spot} index={i} />
              ))}
            </HorizontalCarousel>
          </div>
        );
      })}
    </div>
  );
}
