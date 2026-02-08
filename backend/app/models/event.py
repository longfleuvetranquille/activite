from enum import Enum


class EventStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class CrawlerType(str, Enum):
    SCRAPY = "scrapy"
    PLAYWRIGHT = "playwright"
    API = "api"


class CrawlStatus(str, Enum):
    SUCCESS = "success"
    PARTIAL = "partial"
    ERROR = "error"


# --- Tag reference ---

TAGS_TYPE = {
    "party": "🎶 Soirée / Clubbing",
    "bar_rooftop": "🍸 Bar & Rooftop",
    "dj_set": "🎧 DJ set",
    "concert": "🎤 Concert",
    "show": "🎭 Spectacle / Show",
    "conference": "🧠 Conférence / Talk",
    "poker_games": "🃏 Poker / Jeux",
    "sport_match": "⚽ Sport – Match",
    "motorsport": "🏎 Sport mécanique",
    "watersport": "🌊 Sport nautique",
    "outdoor": "🏕 Outdoor / Aventure",
    "gaming": "🎮 Gaming / Esport",
    "cinema": "🎬 Cinéma / Projection",
    "food": "🍽 Food / Expérience culinaire",
    "travel": "✈️ Voyage / Escapade",
}

TAGS_VIBE = {
    "festive": "🔥 Festif",
    "chill": "😎 Chill",
    "premium": "💎 Premium",
    "dancing": "🕺 Dansant",
    "afterwork": "🍷 Afterwork",
    "intellectual": "🧠 Intellectuel",
    "select": "🎩 Select / Privé",
    "sunset": "🌅 Sunset",
    "date": "❤️ Date-friendly",
    "friends": "👯 Entre amis",
    "late_night": "🌙 Late night",
}

TAGS_ENERGY = {
    "high": "⚡ High energy",
    "intense": "🔥 Très intense",
    "low": "😌 Low energy",
    "relax": "💤 Repos / détente",
}

TAGS_BUDGET = {
    "free": "💸 Gratuit",
    "budget": "💰 Petit budget",
    "premium": "💎 Expérience premium",
    "value": "🤑 Rapport qualité/prix",
    "worth_it": "🚀 Exceptionnel",
}

TAGS_TIME = {
    "today": "⏰ Aujourd'hui",
    "this_week": "📅 Cette semaine",
    "this_month": "🗓 Ce mois-ci",
    "last_minute": "🔔 Dernière minute",
    "plan_ahead": "🧭 À anticiper",
    "one_time": "⏳ Événement ponctuel",
    "recurring": "🔁 Récurrent",
}

TAGS_EXCLUSIVITY = {
    "selling_fast": "🚨 Complet bientôt",
    "limited": "🎟 Places limitées",
    "rare": "👑 Événement rare",
    "one_shot": "🧨 One-shot",
    "underground": "🤫 Secret / Underground",
}

TAGS_LOCATION = {
    "nice_centre": "📍 Nice centre",
    "seaside": "🌴 Bord de mer",
    "monaco": "🏙 Monaco",
    "cannes": "🎬 Cannes",
    "antibes": "🌊 Antibes",
    "nearby": "🗺 À moins de 30 min",
    "road_trip": "🚗 Road trip facile",
}

TAGS_AUDIENCE = {
    "young_pro": "👟 Jeune actif",
    "student": "🎓 Étudiant",
    "afterwork_crowd": "💼 Afterwork crowd",
    "electro": "🎧 Électro lovers",
    "cocktail": "🍸 Cocktail lovers",
    "adrenaline": "🏎 Adrénaline",
    "explorer": "🌍 Curieux / explorateur",
    "poker_player": "🃏 Stratèges / poker",
}

TAGS_DEALS = {
    "cheap_flight": "✈️ Billet anormalement bas",
    "below_average": "📉 Prix sous la moyenne",
    "short_window": "⏱ Fenêtre courte",
    "deal_detected": "💡 Bon plan détecté",
    "quick_escape": "🧳 Escapade express",
}

TAGS_META = {
    "high_interest": "🧠 Fort intérêt estimé",
    "recommended": "⭐ Très recommandé",
    "trending": "🔍 Tendance locale",
    "popular": "📈 Populaire cette semaine",
    "experimental": "🧪 Test / nouveau",
}

ALL_TAG_CATEGORIES = {
    "type": TAGS_TYPE,
    "vibe": TAGS_VIBE,
    "energy": TAGS_ENERGY,
    "budget": TAGS_BUDGET,
    "time": TAGS_TIME,
    "exclusivity": TAGS_EXCLUSIVITY,
    "location": TAGS_LOCATION,
    "audience": TAGS_AUDIENCE,
    "deals": TAGS_DEALS,
    "meta": TAGS_META,
}
