import json
import logging

import anthropic

from app.config import settings
from app.crawlers.base import CrawledEvent

logger = logging.getLogger(__name__)

SCORER_PROMPT = """Tu es un assistant qui évalue l'intérêt d'un événement pour un jeune actif de 25 ans vivant à Nice.

Profil de l'utilisateur :

ADORE (score 80-100) :
- Soirées électro, DJ sets, festivals de musique
- Rooftops & bars à cocktails
- GP Monaco, Formule E, motorsport
- Matchs de foot (Ligue 1, Champions League)
- Poker entre potes
- Jet-ski, wakeboard, sports nautiques
- Karting
- Vols pas chers depuis Nice
- Restos dansants (type Baoli, Medusa)
- Événements exclusifs, places limitées
- Spectacles d'humour, stand-up, one-man show
- Street food, food markets

AIME BIEN (score 60-79) :
- Restos pour un date (italien, asiatique fusion)
- Escalade, bloc (Arkose)
- Paintball, accrobranche, quad, activités outdoor fun
- Padel
- Marchés de Noël (en saison nov-déc-jan)

MOYEN (score 40-59) :
- Afterworks
- Marchés locaux, brocantes
- Concerts de jazz (plutôt 50-55)
- Ateliers créatifs (céramique, peinture)
- Expos classiques (peinture ancienne, sculptures)
- Opéra, musique classique
- Conférences médicales, scientifiques grand public

PEU INTÉRESSANT (score 25-39) :
- Randonnées, trails
- Cinémathèque, rétro films

N'AIME PAS DU TOUT (score 0-20) :
- Expos d'art contemporain
- Théâtre contemporain
- Yoga, bien-être, méditation, développement personnel
- Conférences féminisme, diversité, inclusion, sociétales
- Conférences patrimoine, histoire locale
- Activités seniors (bridge, loto, thé dansant, chorale)
- Salons du mariage, salons bébé, puériculture
- Braderies, vide-greniers
- Hard techno, hardstyle, rave, gabber
- Ateliers parentalité, éducation
- Journées portes ouvertes écoles, universités
- Manifestations, grèves, rassemblements politiques
- Tout ce qui est associatif / caritatif / solidaire sans dimension fun

BONUS :
- Événement exclusif, rare, places limitées : +10
- Bon rapport qualité/prix ou gratuit : +5
- Aujourd'hui ou dernière minute : +5

Événement :
- Titre : {title}
- Description : {description}
- Date : {date}
- Lieu : {location_name}, {location_city}
- Prix : {price_info}
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

    # Build price info string: distinguish unknown from free
    if event.price_min < 0 or (event.price_min == 0 and event.price_max == 0):
        price_info = "Inconnu"
    elif event.price_min == 0 and event.price_max > 0:
        price_info = f"0€ - {event.price_max}€"
    else:
        price_info = f"{event.price_min}€ - {event.price_max}€"

    prompt = SCORER_PROMPT.format(
        title=event.title,
        description=event.description or "Non disponible",
        date=event.date_start.strftime("%Y-%m-%d %H:%M"),
        location_name=event.location_name or "Non spécifié",
        location_city=event.location_city or "Nice",
        price_info=price_info,
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
