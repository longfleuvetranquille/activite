"use client";

import {
  Waves,
  MapPin,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

interface Beach {
  id: string;
  name: string;
  location: string;
  description: string;
  gradient: string;
  url?: string;
}

const BEACHES: Beach[] = [
  {
    id: "crique-aiguille",
    name: "Crique de l\u2019Aiguille",
    location: "Theoule-sur-Mer",
    description:
      "Petite crique sauvage aux eaux cristallines, nichee entre les rochers rouges de l\u2019Esterel.",
    gradient: "from-cyan-50 to-sky-50",
  },
  {
    id: "pointe-notre-dame",
    name: "Plage de la Pointe de Notre Dame",
    location: "Mandelieu-la-Napoule",
    description:
      "Plage discrete avec vue sur le massif de l\u2019Esterel, loin de la foule.",
    gradient: "from-sky-50 to-blue-50",
  },
  {
    id: "calanque-maubois",
    name: "Calanque de Maubois",
    location: "Theoule-sur-Mer",
    description:
      "Calanque secrete entouree de pins, accessible par un petit sentier cotier.",
    gradient: "from-teal-50 to-emerald-50",
  },
  {
    id: "petit-caneiret",
    name: "Calanque du Petit Caneiret",
    location: "La Ciotat",
    description:
      "Eau turquoise dans un ecrin de falaises, ambiance bout du monde.",
    gradient: "from-emerald-50 to-teal-50",
  },
  {
    id: "plage-mala",
    name: "Plage de la Mala",
    location: "Cap-d\u2019Ail",
    description:
      "La plus belle plage de la Riviera, cachee au pied des falaises du Cap-d\u2019Ail.",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    id: "plage-passable",
    name: "Plage de Passable",
    location: "Saint-Jean-Cap-Ferrat",
    description:
      "Plage familiale face a Villefranche, coucher de soleil exceptionnel.",
    gradient: "from-amber-50 to-orange-50",
  },
  {
    id: "arma-di-taggia",
    name: "Arma Di Taggia",
    location: "Italie (Ligurie)",
    description:
      "20\u00A0\u20AC deux transats avec parasol, t\u2019as de l\u2019espace, t\u2019es pas colle aux gens. Juste de l\u2019autre cote de la frontiere.",
    gradient: "from-champagne-100 to-amber-50",
  },
];

function BeachCard({ beach, index }: { beach: Beach; index: number }) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${beach.gradient} border border-white/60 p-4 shadow-card backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated-lg`}
    >
      {/* Icon circle */}
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
        <Waves className="h-5.5 w-5.5 text-sky-500" />
      </div>

      {/* Name */}
      <h3 className="font-serif text-lg leading-snug text-slate-900">
        {beach.name}
      </h3>

      {/* Location */}
      <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
        <MapPin className="h-3 w-3 text-slate-400" />
        {beach.location}
      </p>

      {/* Description */}
      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
        {beach.description}
      </p>

      {/* External link indicator */}
      {beach.url && (
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
      {beach.url ? (
        <a
          href={beach.url}
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

export default function BeachSection() {
  return (
    <div>
      {/* Section header */}
      <div className="mb-5">
        <div className="mb-3 h-0.5 w-12 rounded-full bg-gradient-to-r from-champagne-500 via-olive-400 to-transparent" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 ring-1 ring-black/[0.04] backdrop-blur-sm">
            <Waves className="h-5 w-5 text-sky-500" />
          </div>
          <h2 className="font-serif text-xl text-slate-900 sm:text-2xl">
            Plages & criques
          </h2>
          <span className="inline-flex items-center rounded-full bg-sky-100/80 px-2.5 py-0.5 text-xs font-semibold text-sky-700 ring-1 ring-sky-200/50">
            {BEACHES.length}
          </span>
        </div>
        <p className="mt-1.5 pl-[42px] text-sm text-slate-500">
          Les meilleurs spots pour poser sa serviette sur la Riviera
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {BEACHES.map((beach, i) => (
          <BeachCard key={beach.id} beach={beach} index={i} />
        ))}
      </div>
    </div>
  );
}
