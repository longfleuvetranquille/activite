import json
import logging

import anthropic

from app.config import settings
from app.crawlers.base import CrawledEvent
from app.models.event import ALL_TAG_CATEGORIES

logger = logging.getLogger(__name__)

TAGGER_PROMPT = """Tu es un assistant qui catégorise des événements à Nice et sur la Côte d'Azur.

Voici un événement :
- Titre : {title}
- Description : {description}
- Date : {date}
- Lieu : {location_name}, {location_city}
- Prix : {price_min}€ - {price_max}€

Voici les catégories de tags disponibles avec leurs codes :
{tag_reference}

Retourne UNIQUEMENT un objet JSON avec les tags pertinents pour cet événement.
Chaque clé est une catégorie, chaque valeur est une liste de codes de tags.
Ne mets que les tags réellement pertinents (2-5 tags par catégorie max).

Exemple de format :
{{
  "type": ["party", "dj_set"],
  "vibe": ["festive", "dancing"],
  "energy": ["high"],
  "budget": ["budget"],
  "time": ["today"],
  "exclusivity": [],
  "location": ["nice_centre"],
  "audience": ["young_pro", "electro"],
  "deals": [],
  "meta": ["trending"]
}}
"""


def _build_tag_reference() -> str:
    lines = []
    for category, tags in ALL_TAG_CATEGORIES.items():
        codes = ", ".join(tags.keys())
        lines.append(f"- {category}: {codes}")
    return "\n".join(lines)


async def tag_event(event: CrawledEvent) -> dict[str, list[str]]:
    """Use Claude API to automatically tag an event."""
    if not settings.anthropic_api_key:
        logger.warning("No Anthropic API key configured, returning empty tags")
        return {cat: [] for cat in ALL_TAG_CATEGORIES}

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    prompt = TAGGER_PROMPT.format(
        title=event.title,
        description=event.description or "Non disponible",
        date=event.date_start.strftime("%Y-%m-%d %H:%M"),
        location_name=event.location_name or "Non spécifié",
        location_city=event.location_city or "Nice",
        price_min=event.price_min,
        price_max=event.price_max,
        tag_reference=_build_tag_reference(),
    )

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )

        text = response.content[0].text.strip()
        # Extract JSON from response
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        tags = json.loads(text)

        # Validate tag codes against reference
        validated: dict[str, list[str]] = {}
        for category, valid_codes in ALL_TAG_CATEGORIES.items():
            raw = tags.get(category, [])
            validated[category] = [c for c in raw if c in valid_codes]

        return validated

    except Exception:
        logger.exception("AI tagging failed for: %s", event.title)
        return {cat: [] for cat in ALL_TAG_CATEGORIES}
