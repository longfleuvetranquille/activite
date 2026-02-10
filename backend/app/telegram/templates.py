from datetime import datetime

from app.models.event import (
    ALL_TAG_CATEGORIES,
    TAGS_BUDGET,
    TAGS_ENERGY,
    TAGS_EXCLUSIVITY,
    TAGS_LOCATION,
    TAGS_TYPE,
    TAGS_VIBE,
)


def _tag_emoji(code: str) -> str:
    """Get emoji for a tag code from any category."""
    for tags in ALL_TAG_CATEGORIES.values():
        if code in tags:
            label = tags[code]
            # Extract emoji (first char or first chars before space)
            return label.split(" ")[0]
    return ""


def format_event_line(event: dict, index: int) -> str:
    """Format a single event for Telegram message."""
    type_tags = event.get("tags_type", [])
    type_emoji = _tag_emoji(type_tags[0]) if type_tags else "📌"

    title = event.get("title", "Sans titre")
    date_start = event.get("date_start", "")
    if isinstance(date_start, str) and "T" in date_start:
        try:
            dt = datetime.fromisoformat(date_start)
            time_str = dt.strftime("%Hh%M")
        except ValueError:
            time_str = ""
    else:
        time_str = ""

    location_city = event.get("location_city", "")
    location_name = event.get("location_name", "")

    # Vibe tags
    vibe_tags = event.get("tags_vibe", [])
    vibe_str = " | ".join(_tag_emoji(t) + " " + TAGS_VIBE.get(t, t).split(" ", 1)[-1] for t in vibe_tags[:3])

    # Price
    price_min = event.get("price_min", 0)
    if price_min == 0:
        price_str = "💸 Gratuit"
    else:
        price_str = f"💰 {price_min}€"

    # Exclusivity
    excl_tags = event.get("tags_exclusivity", [])
    excl_str = ""
    if excl_tags:
        excl_str = "\n   " + " | ".join(
            _tag_emoji(t) + " " + TAGS_EXCLUSIVITY.get(t, t).split(" ", 1)[-1]
            for t in excl_tags[:2]
        )

    score = event.get("interest_score", 0)

    lines = [
        f"{index}. {type_emoji} *{title}*" + (f" — {time_str}" if time_str else ""),
        f"   📍 {location_name or location_city} | {price_str}",
    ]
    if vibe_str:
        lines.append(f"   {vibe_str}")
    if excl_str:
        lines.append(f"   {excl_str}")
    lines.append(f"   Score: {score}/100")

    return "\n".join(lines)


def format_daily_digest(
    today_events: list[dict],
    deals: list[dict],
    dashboard_url: str = "https://palmier.local",
) -> str:
    """Format the full daily digest Telegram message."""
    now = datetime.now()
    date_str = now.strftime("%A %d %B %Y").capitalize()

    lines = [
        f"\uD83C\uDF34 *Palmier* — {date_str}",
        "",
    ]

    if today_events:
        lines.append("🔥 *TOP DU JOUR*")
        lines.append("")
        for i, event in enumerate(today_events[:5], 1):
            lines.append(format_event_line(event, i))
            lines.append("")
    else:
        lines.append("😴 Pas d'événements majeurs aujourd'hui.")
        lines.append("")

    if deals:
        lines.append("📅 *BONS PLANS*")
        for deal in deals[:3]:
            title = deal.get("title", "")
            deal_tags = deal.get("tags_deals", [])
            deal_emoji = _tag_emoji(deal_tags[0]) if deal_tags else "💡"
            lines.append(f"- {deal_emoji} {title}")
        lines.append("")

    lines.append(f"👉 Dashboard : {dashboard_url}")

    return "\n".join(lines)
