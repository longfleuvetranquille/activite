import json
import logging

import anthropic

from app.config import settings
from app.crawlers.base import CrawledEvent

logger = logging.getLogger(__name__)

SCORER_PROMPT = """Tu es un assistant qui évalue l'intérêt d'un événement pour un jeune actif de 25 ans vivant à Nice.

Profil de l'utilisateur :
- Centres d'intérêt : GP Monaco, Formule E, matchs de foot, poker privé, conférences tech, jet-ski, wakeboard, karting, rooftops, bars à cocktails, voyages pas chers, soirées électro
- Aime : les soirées, les sports mécaniques et nautiques, les événements exclusifs, les bons plans, les festivals, la street food
- Budget : préfère les bons rapports qualité/prix
- N'aime PAS : cinémathèque, rétrospectives de films anciens, expositions classiques, conférences patrimoine, activités seniors (bridge, loto, thé dansant, chorale), ateliers pour retraités

Règles de scoring :
- 80-100 : événement parfaitement adapté (soirée, sport, bon plan voyage, événement exclusif)
- 60-79 : intéressant (concert, festival, food, conférence tech)
- 40-59 : moyennement intéressant (expo contemporaine, marché, activité familiale)
- 20-39 : peu intéressant (cinéma art et essai, conférence académique, théâtre classique)
- 0-19 : pas du tout adapté (cinémathèque, activité seniors, rétrospective, bridge, loto)

Événement :
- Titre : {title}
- Description : {description}
- Date : {date}
- Lieu : {location_name}, {location_city}
- Prix : {price_min}€ - {price_max}€
- Tags : {tags}

Donne un score d'intérêt de 0 à 100 pour cet événement.
Retourne UNIQUEMENT un nombre entier entre 0 et 100, rien d'autre.
"""


async def score_event(
    event: CrawledEvent, tags: dict[str, list[str]]
) -> int:
    """Use Claude API to score event interest (0-100)."""
    if not settings.anthropic_api_key:
        return 50  # Default mid-score when no API key

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # Flatten tags for context
    all_tags = []
    for tag_list in tags.values():
        all_tags.extend(tag_list)

    prompt = SCORER_PROMPT.format(
        title=event.title,
        description=event.description or "Non disponible",
        date=event.date_start.strftime("%Y-%m-%d %H:%M"),
        location_name=event.location_name or "Non spécifié",
        location_city=event.location_city or "Nice",
        price_min=event.price_min,
        price_max=event.price_max,
        tags=", ".join(all_tags) or "aucun",
    )

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=10,
            messages=[{"role": "user", "content": prompt}],
        )

        text = response.content[0].text.strip()
        score = int("".join(c for c in text if c.isdigit())[:3])
        return max(0, min(100, score))

    except Exception:
        logger.exception("AI scoring failed for: %s", event.title)
        return 50
