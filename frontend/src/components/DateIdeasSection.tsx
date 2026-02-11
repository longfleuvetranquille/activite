"use client";

import {
  Flower2,
  Church,
  Landmark,
  Palette,
  Fish,
  Snowflake,
  IceCream,
  Plane,
  Footprints,
  UtensilsCrossed,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import HorizontalCarousel from "./HorizontalCarousel";

interface DateIdea {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  url?: string;
}

const DATE_IDEAS: DateIdea[] = [
  {
    id: "jardin-eze",
    title: "Jardin Botanique",
    subtitle: "Eze",
    description:
      "Jardin exotique perche au sommet du village medieval d'Eze, vue panoramique sur la Mediterranee.",
    icon: Flower2,
    gradient: "from-emerald-50 to-teal-50",
    url: "https://www.jardinexotique-eze.fr",
  },
  {
    id: "saint-paul",
    title: "Balade a Saint-Paul-de-Vence",
    subtitle: "Saint-Paul-de-Vence",
    description:
      "Ruelles pavees, galeries d'art et panoramas : le village medieval le plus romantique de la Riviera.",
    icon: Church,
    gradient: "from-stone-100 to-amber-50",
  },
  {
    id: "rothschild",
    title: "Villa Rothschild",
    subtitle: "Saint-Jean-Cap-Ferrat",
    description:
      "Villa Belle Epoque et ses 9 jardins thematiques face a la mer, entre Nice et Monaco.",
    icon: Landmark,
    gradient: "from-rose-50 to-pink-50",
    url: "https://www.villa-ephrussi.com",
  },
  {
    id: "kerylos",
    title: "Villa Kerylos",
    subtitle: "Beaulieu-sur-Mer",
    description:
      "Reconstitution unique d'une villa grecque antique, les pieds dans l'eau a Beaulieu.",
    icon: Landmark,
    gradient: "from-sky-50 to-blue-50",
    url: "https://www.villakerylos.fr",
  },
  {
    id: "palettes-tartelettes",
    title: "Palettes et Tartelettes",
    subtitle: "Cafe-ceramique, Nice",
    description:
      "Cafe-ceramique ou tu bois un cafe et tu repars avec un objet que t'as peint. Parfait en duo.",
    icon: Palette,
    gradient: "from-violet-50 to-purple-50",
  },
  {
    id: "oceanographique",
    title: "Musee Oceanographique",
    subtitle: "Monaco",
    description:
      "Aquariums spectaculaires et collections marines dans un palais au bord de la falaise.",
    icon: Fish,
    gradient: "from-cyan-50 to-sky-50",
    url: "https://www.oceano.mc",
  },
  {
    id: "patinoire",
    title: "Patinoire Jean Bouin",
    subtitle: "Nice",
    description:
      "Patinoire couverte en plein coeur de Nice, parfait pour un date original.",
    icon: Snowflake,
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    id: "fenocchio",
    title: "Glace chez Fenocchio",
    subtitle: "Vieux-Nice",
    description:
      "Le meilleur glacier de Nice depuis 1966. Plus de 90 parfums, du basilic a la lavande.",
    icon: IceCream,
    gradient: "from-amber-50 to-yellow-50",
  },
  {
    id: "helico-monaco",
    title: "Tour d'helico",
    subtitle: "Monaco",
    description:
      "Survol de la Principaute et de la Cote d'Azur en helicoptere. L'experience la plus memorable.",
    icon: Plane,
    gradient: "from-champagne-100 to-amber-50",
    url: "https://www.monacair.mc",
  },
  {
    id: "le-plongeoir",
    title: "Le Plongeoir",
    subtitle: "Nice",
    description:
      "Restaurant perche sur un rocher au-dessus de la mer, accessible par une passerelle. Cadre unique pour un diner les pieds dans le vide.",
    icon: UtensilsCrossed,
    gradient: "from-sky-50 to-cyan-50",
    url: "https://www.leplongeoir.com",
  },
  {
    id: "chateau-promenade",
    title: "Chateau & Promenade des Anglais",
    subtitle: "Nice",
    description:
      "Balade au parc du Chateau avec vue sur la baie, puis descente sur la Promenade des Anglais au coucher du soleil.",
    icon: Footprints,
    gradient: "from-orange-50 to-rose-50",
  },
];

function DateIdeaCard({
  idea,
  index,
}: {
  idea: DateIdea;
  index: number;
}) {
  const Icon = idea.icon;

  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${idea.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg h-full`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5.5 w-5.5 text-slate-700" />
      </div>
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {idea.title}
      </h3>
      <p className="mt-0.5 text-xs font-medium text-slate-500">
        {idea.subtitle}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {idea.description}
      </p>
      {idea.url && (
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
      {idea.url ? (
        <a
          href={idea.url}
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

export default function DateIdeasSection() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="font-serif text-section-title text-slate-900">
          Idee de date
          <span className="ml-2 text-[0.6em] font-sans font-normal text-slate-400">
            {DATE_IDEAS.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Les meilleurs spots pour un rendez-vous sur la Cote d&apos;Azur
        </p>
      </div>

      <HorizontalCarousel>
        {DATE_IDEAS.map((idea, i) => (
          <DateIdeaCard key={idea.id} idea={idea} index={i} />
        ))}
      </HorizontalCarousel>
    </div>
  );
}
