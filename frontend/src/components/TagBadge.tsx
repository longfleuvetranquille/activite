"use client";

// Complete tag reference matching the backend TAGS definitions
const TAG_LABELS: Record<string, Record<string, string>> = {
  type: {
    party: "Soiree / Clubbing",
    bar_rooftop: "Bar & Rooftop",
    dj_set: "DJ set",
    concert: "Concert",
    show: "Spectacle / Show",
    conference: "Conference / Talk",
    poker_games: "Poker / Jeux",
    sport_match: "Sport -- Match",
    motorsport: "Sport mecanique",
    watersport: "Sport nautique",
    outdoor: "Outdoor / Aventure",
    gaming: "Gaming / Esport",
    cinema: "Cinema / Projection",
    food: "Food / Experience culinaire",
    travel: "Voyage / Escapade",
  },
  vibe: {
    festive: "Festif",
    chill: "Chill",
    premium: "Premium",
    dancing: "Dansant",
    afterwork: "Afterwork",
    intellectual: "Intellectuel",
    select: "Select / Prive",
    sunset: "Sunset",
    date: "Date-friendly",
    friends: "Entre amis",
    late_night: "Late night",
  },
  energy: {
    high: "High energy",
    intense: "Tres intense",
    low: "Low energy",
    relax: "Repos / detente",
  },
  budget: {
    free: "Gratuit",
    budget: "Petit budget",
    premium: "Experience premium",
    value: "Rapport qualite/prix",
    worth_it: "Exceptionnel",
  },
  time: {
    today: "Aujourd'hui",
    this_week: "Cette semaine",
    this_month: "Ce mois-ci",
    last_minute: "Derniere minute",
    plan_ahead: "A anticiper",
    one_time: "Evenement ponctuel",
    recurring: "Recurrent",
  },
  exclusivity: {
    selling_fast: "Complet bientot",
    limited: "Places limitees",
    rare: "Evenement rare",
    one_shot: "One-shot",
    underground: "Secret / Underground",
  },
  location: {
    nice_centre: "Nice centre",
    seaside: "Bord de mer",
    monaco: "Monaco",
    cannes: "Cannes",
    antibes: "Antibes",
    nearby: "A moins de 30 min",
    road_trip: "Road trip facile",
  },
  audience: {
    young_pro: "Jeune actif",
    student: "Etudiant",
    afterwork_crowd: "Afterwork crowd",
    electro: "Electro lovers",
    cocktail: "Cocktail lovers",
    adrenaline: "Adrenaline",
    explorer: "Curieux / explorateur",
    poker_player: "Strateges / poker",
  },
  deals: {
    cheap_flight: "Billet anormalement bas",
    below_average: "Prix sous la moyenne",
    short_window: "Fenetre courte",
    deal_detected: "Bon plan detecte",
    quick_escape: "Escapade express",
  },
  meta: {
    high_interest: "Fort interet estime",
    recommended: "Tres recommande",
    trending: "Tendance locale",
    popular: "Populaire cette semaine",
    experimental: "Test / nouveau",
  },
};

const TAG_EMOJIS: Record<string, Record<string, string>> = {
  type: {
    party: "\uD83C\uDFB6",
    bar_rooftop: "\uD83C\uDF78",
    dj_set: "\uD83C\uDFA7",
    concert: "\uD83C\uDFA4",
    show: "\uD83C\uDFAD",
    conference: "\uD83E\uDDE0",
    poker_games: "\uD83C\uDCCF",
    sport_match: "\u26BD",
    motorsport: "\uD83C\uDFCE",
    watersport: "\uD83C\uDF0A",
    outdoor: "\uD83C\uDFD5",
    gaming: "\uD83C\uDFAE",
    cinema: "\uD83C\uDFAC",
    food: "\uD83C\uDF7D",
    travel: "\u2708\uFE0F",
  },
  vibe: {
    festive: "\uD83D\uDD25",
    chill: "\uD83D\uDE0E",
    premium: "\uD83D\uDC8E",
    dancing: "\uD83D\uDD7A",
    afterwork: "\uD83C\uDF77",
    intellectual: "\uD83E\uDDE0",
    select: "\uD83C\uDFA9",
    sunset: "\uD83C\uDF05",
    date: "\u2764\uFE0F",
    friends: "\uD83D\uDC6F",
    late_night: "\uD83C\uDF19",
  },
  energy: {
    high: "\u26A1",
    intense: "\uD83D\uDD25",
    low: "\uD83D\uDE0C",
    relax: "\uD83D\uDCA4",
  },
  budget: {
    free: "\uD83D\uDCB8",
    budget: "\uD83D\uDCB0",
    premium: "\uD83D\uDC8E",
    value: "\uD83E\uDD11",
    worth_it: "\uD83D\uDE80",
  },
  time: {
    today: "\u23F0",
    this_week: "\uD83D\uDCC5",
    this_month: "\uD83D\uDDD3",
    last_minute: "\uD83D\uDD14",
    plan_ahead: "\uD83E\uDDED",
    one_time: "\u23F3",
    recurring: "\uD83D\uDD01",
  },
  exclusivity: {
    selling_fast: "\uD83D\uDEA8",
    limited: "\uD83C\uDF9F",
    rare: "\uD83D\uDC51",
    one_shot: "\uD83E\uDDE8",
    underground: "\uD83E\uDD2B",
  },
  location: {
    nice_centre: "\uD83D\uDCCD",
    seaside: "\uD83C\uDF34",
    monaco: "\uD83C\uDFD9",
    cannes: "\uD83C\uDFAC",
    antibes: "\uD83C\uDF0A",
    nearby: "\uD83D\uDDFA",
    road_trip: "\uD83D\uDE97",
  },
  audience: {
    young_pro: "\uD83D\uDC5F",
    student: "\uD83C\uDF93",
    afterwork_crowd: "\uD83D\uDCBC",
    electro: "\uD83C\uDFA7",
    cocktail: "\uD83C\uDF78",
    adrenaline: "\uD83C\uDFCE",
    explorer: "\uD83C\uDF0D",
    poker_player: "\uD83C\uDCCF",
  },
  deals: {
    cheap_flight: "\u2708\uFE0F",
    below_average: "\uD83D\uDCC9",
    short_window: "\u23F1",
    deal_detected: "\uD83D\uDCA1",
    quick_escape: "\uD83E\uDDF3",
  },
  meta: {
    high_interest: "\uD83E\uDDE0",
    recommended: "\u2B50",
    trending: "\uD83D\uDD0D",
    popular: "\uD83D\uDCC8",
    experimental: "\uD83E\uDDEA",
  },
};

// Category-specific background colors for badges
const CATEGORY_COLORS: Record<string, string> = {
  type: "bg-azur-500/15 text-azur-300",
  vibe: "bg-purple-500/15 text-purple-300",
  energy: "bg-orange-500/15 text-orange-300",
  budget: "bg-emerald-500/15 text-emerald-300",
  time: "bg-sky-500/15 text-sky-300",
  exclusivity: "bg-red-500/15 text-red-300",
  location: "bg-teal-500/15 text-teal-300",
  audience: "bg-indigo-500/15 text-indigo-300",
  deals: "bg-yellow-500/15 text-yellow-300",
  meta: "bg-pink-500/15 text-pink-300",
};

interface TagBadgeProps {
  code: string;
  category: string;
  small?: boolean;
}

export default function TagBadge({
  code,
  category,
  small = false,
}: TagBadgeProps) {
  const label =
    TAG_LABELS[category]?.[code] || code.replace(/_/g, " ");
  const emoji = TAG_EMOJIS[category]?.[code] || "";
  const colorClass = CATEGORY_COLORS[category] || "bg-white/5 text-gray-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${
        small ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      }`}
      title={`${category}: ${label}`}
    >
      {emoji && <span className={small ? "text-[11px]" : "text-xs"}>{emoji}</span>}
      {label}
    </span>
  );
}
