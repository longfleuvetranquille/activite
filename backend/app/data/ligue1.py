"""Ligue 1 team tiers for interest score bonuses."""

# Tier 1 (+15): top clubs / big matches
# Tier 2 (+10): strong clubs
# Tier 3 (+5): mid-table
# Tier 4 (+0): lower table
LIGUE1_TIERS: dict[str, int] = {
    # Tier 1
    "psg": 1,
    "paris": 1,
    "paris saint-germain": 1,
    "paris sg": 1,
    "marseille": 1,
    "om": 1,
    "olympique de marseille": 1,
    "monaco": 1,
    "as monaco": 1,
    "lyon": 1,
    "ol": 1,
    "olympique lyonnais": 1,
    # Tier 2
    "lille": 2,
    "losc": 2,
    "lens": 2,
    "rc lens": 2,
    "rennes": 2,
    "stade rennais": 2,
    "nice": 2,
    "ogc nice": 2,
    # Tier 3
    "strasbourg": 3,
    "rc strasbourg": 3,
    "toulouse": 3,
    "tfc": 3,
    "nantes": 3,
    "fc nantes": 3,
    "reims": 3,
    "stade de reims": 3,
    "brest": 3,
    "stade brestois": 3,
    # Tier 4
    "montpellier": 4,
    "mhsc": 4,
    "le havre": 4,
    "hac": 4,
    "auxerre": 4,
    "aja": 4,
    "angers": 4,
    "sco": 4,
    "st-etienne": 4,
    "saint-etienne": 4,
    "asse": 4,
}

_TIER_BONUS = {1: 15, 2: 10, 3: 5, 4: 0}


def get_opponent_bonus(name: str) -> int:
    """Return an interest score bonus based on opponent Ligue 1 tier.

    Uses exact lookup first, then partial match fallback.
    Returns 0 if the opponent is not found.
    """
    key = name.strip().lower()

    # Exact match
    tier = LIGUE1_TIERS.get(key)
    if tier is not None:
        return _TIER_BONUS.get(tier, 0)

    # Partial match: check if any known name is contained in the input
    for known, t in LIGUE1_TIERS.items():
        if known in key or key in known:
            return _TIER_BONUS.get(t, 0)

    return 0
