import logging

import anthropic

from app.config import settings
from app.crawlers.base import CrawledEvent

logger = logging.getLogger(__name__)

SUMMARIZER_PROMPT = """Résume cet événement en 2-3 phrases courtes et accrocheuses, comme si tu parlais à un pote de 25 ans. Sois concis et donne envie d'y aller.

Événement :
- Titre : {title}
- Description : {description}
- Date : {date}
- Lieu : {location_name}, {location_city}
- Prix : {price_min}€ - {price_max}€

Retourne UNIQUEMENT le résumé, sans guillemets ni préambule.
"""


async def summarize_event(event: CrawledEvent) -> str:
    """Use Claude API to generate a short, catchy summary."""
    if not settings.anthropic_api_key:
        return event.description[:200] if event.description else ""

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    prompt = SUMMARIZER_PROMPT.format(
        title=event.title,
        description=event.description or "Pas de description disponible",
        date=event.date_start.strftime("%A %d %B %Y à %H:%M"),
        location_name=event.location_name or "Non spécifié",
        location_city=event.location_city or "Nice",
        price_min=event.price_min,
        price_max=event.price_max,
    )

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=150,
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text.strip()

    except Exception:
        logger.exception("AI summarization failed for: %s", event.title)
        return event.description[:200] if event.description else ""
