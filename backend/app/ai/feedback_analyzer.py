"""Analyse IA des feedbacks utilisateur pour apprentissage des preferences."""

import logging

import anthropic

from app.config import settings
from app.services.pocketbase import pb_client

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = """Voici les retours d'un utilisateur sur des événements passés à Nice et sur la Côte d'Azur.
Son profil de base : jeune actif de 25 ans, fan de soirées électro, rooftops, motorsport, foot, poker, sports nautiques, voyages pas chers.

Feedbacks :
{feedbacks}

Analyse ces retours et déduis les préférences de l'utilisateur.
Retourne un texte structuré en 2 sections :

AIME ENCORE PLUS QUE PRÉVU :
(choses que le profil de base sous-estime — 2 à 5 bullet points max)

AIME MOINS QUE PRÉVU :
(choses que le profil de base surestime — 2 à 5 bullet points max)

Sois concis et factuel. Base-toi uniquement sur les feedbacks fournis."""


async def analyze_feedbacks() -> str | None:
    """Analyse all user feedbacks with Claude and store learned preferences.

    Returns the generated preferences text, or None if skipped/failed.
    """
    if not settings.anthropic_api_key:
        logger.warning("No Anthropic API key, skipping feedback analysis")
        return None

    # 1. Fetch all feedbacks (paginated)
    feedbacks: list[dict] = []
    page = 1
    while True:
        result = await pb_client.list_records(
            "event_feedback",
            page=page,
            per_page=200,
            sort="-created",
        )
        items = result.get("items", [])
        if not items:
            break
        feedbacks.extend(items)
        if page >= result.get("totalPages", 1):
            break
        page += 1

    if not feedbacks:
        logger.info("No feedbacks found, skipping analysis")
        return None

    # 2. Fetch event context for each feedback
    lines: list[str] = []
    for i, fb in enumerate(feedbacks, 1):
        event_id = fb.get("event_id", "")
        rating = fb.get("rating", "?")
        comment = fb.get("comment", "")

        # Fetch event details
        event_ctx = ""
        if event_id:
            try:
                event = await pb_client.get_record("events", event_id)
                title = event.get("title", "?")
                tags_type = ", ".join(event.get("tags_type", []))
                tags_vibe = ", ".join(event.get("tags_vibe", []))
                city = event.get("location_city", "")
                price_min = event.get("price_min", 0)
                price_max = event.get("price_max", 0)

                parts = [f'"{title}"']
                if tags_type:
                    parts.append(f"({tags_type})")
                if tags_vibe:
                    parts.append(f"vibe: {tags_vibe}")
                if city:
                    parts.append(f"à {city}")
                if price_max > 0:
                    parts.append(f"{price_min}-{price_max}€")
                event_ctx = " ".join(parts)
            except Exception:
                event_ctx = f"(event {event_id} introuvable)"

        comment_str = f' — "{comment}"' if comment else ""
        lines.append(f"{i}. [{rating}] {event_ctx}{comment_str}")

    feedbacks_text = "\n".join(lines)

    # 3. Call Claude to analyze
    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    prompt = ANALYSIS_PROMPT.format(feedbacks=feedbacks_text)

    try:
        response = await client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        learned = response.content[0].text.strip()
    except Exception:
        logger.exception("Feedback analysis AI call failed")
        return None

    # 4. Store in user_preferences.ai_learned_preferences
    try:
        result = await pb_client.list_records("user_preferences", per_page=1)
        items = result.get("items", [])
        if items:
            await pb_client.update_record(
                "user_preferences",
                items[0]["id"],
                {"ai_learned_preferences": learned},
            )
        else:
            await pb_client.create_record(
                "user_preferences",
                {"ai_learned_preferences": learned},
            )
        logger.info(
            "Feedback analysis complete (%d feedbacks → preferences updated)",
            len(feedbacks),
        )
    except Exception:
        logger.exception("Failed to store learned preferences")
        return None

    return learned
