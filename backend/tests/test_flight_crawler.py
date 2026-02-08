"""Tests for flight deals crawler utility functions."""

from app.crawlers.flight_deals import _parse_duration, _parse_price_from_label, _parse_price_text


# ── Price text parsing ────────────────────────────────────────────


def test_parse_price_simple():
    assert _parse_price_text("29 \u20ac") == 29.0


def test_parse_price_with_decimals():
    assert _parse_price_text("29,50\u20ac") == 29.50


def test_parse_price_euro_prefix():
    assert _parse_price_text("\u20ac45") == 45.0


def test_parse_price_with_spaces():
    assert _parse_price_text("  120 \u20ac  ") == 120.0


def test_parse_price_european_thousands():
    # 1.234,56 -> 1234.56
    assert _parse_price_text("1.234,56\u20ac") == 1234.56


def test_parse_price_empty():
    assert _parse_price_text("") is None


def test_parse_price_no_number():
    assert _parse_price_text("gratuit") is None


# ── Aria-label price extraction ───────────────────────────────────


def test_parse_label_euros():
    assert _parse_price_from_label("Vol \u00e0 partir de 29 euros") == 29.0


def test_parse_label_eur():
    assert _parse_price_from_label("Prix: 45 EUR") == 45.0


def test_parse_label_euro_sign():
    assert _parse_price_from_label("120\u20ac aller-retour") == 120.0


def test_parse_label_no_price():
    assert _parse_price_from_label("Pas de prix ici") is None


# ── Duration parsing ──────────────────────────────────────────────


def test_parse_duration_hours_minutes():
    assert _parse_duration("2 h 30 min") == 150


def test_parse_duration_compact():
    assert _parse_duration("2h30") == 150


def test_parse_duration_hours_only():
    assert _parse_duration("3 h") == 180


def test_parse_duration_minutes_only():
    assert _parse_duration("45 min") == 45


def test_parse_duration_no_match():
    assert _parse_duration("unknown") == 0
