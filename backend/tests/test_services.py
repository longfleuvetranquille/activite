"""Tests for backend services (dedup, hashing, flight deals)."""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest

from app.services.pocketbase import compute_event_hash


# ── Hash computation ──────────────────────────────────────────────


def test_compute_hash_deterministic():
    h1 = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    h2 = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    assert h1 == h2


def test_compute_hash_case_insensitive():
    h1 = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    h2 = compute_event_hash("CONCERT", "2026-02-10T20:00:00", "HIGH CLUB")
    assert h1 == h2


def test_compute_hash_strips_whitespace():
    h1 = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    h2 = compute_event_hash("  Concert  ", "2026-02-10T20:00:00", "  High Club  ")
    assert h1 == h2


def test_compute_hash_different_events():
    h1 = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    h2 = compute_event_hash("DJ Set", "2026-02-10T20:00:00", "High Club")
    assert h1 != h2


def test_compute_hash_length():
    h = compute_event_hash("Concert", "2026-02-10T20:00:00", "High Club")
    assert len(h) == 16


# ── Dedup service ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_event_exists_false():
    with patch("app.services.dedup.pb_client") as mock_pb:
        mock_pb.get_first_record = AsyncMock(return_value=None)
        from app.services.dedup import event_exists

        result = await event_exists("New Event", "2026-02-10T20:00:00", "Venue")
        assert result is False


@pytest.mark.asyncio
async def test_event_exists_true():
    with patch("app.services.dedup.pb_client") as mock_pb:
        mock_pb.get_first_record = AsyncMock(return_value={"id": "existing"})
        from app.services.dedup import event_exists

        result = await event_exists("Old Event", "2026-02-10T20:00:00", "Venue")
        assert result is True


# ── Flight deals service ──────────────────────────────────────────


@pytest.mark.asyncio
async def test_store_flight_price():
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.create_record = AsyncMock(return_value={"id": "fp_001"})
        from app.services.flight_deals import FlightPrice, store_flight_price

        fp = FlightPrice(
            route="NCE-BCN",
            origin="NCE",
            destination="BCN",
            destination_city="Barcelone",
            departure_date=datetime(2026, 2, 20),
            return_date=datetime(2026, 2, 22),
            price=45.0,
        )
        result = await store_flight_price(fp)
        assert result["id"] == "fp_001"
        mock_pb.create_record.assert_called_once()


@pytest.mark.asyncio
async def test_compute_average_price_no_data():
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        from app.services.flight_deals import compute_average_price

        avg = await compute_average_price("NCE-BCN")
        assert avg is None


@pytest.mark.asyncio
async def test_compute_average_price_with_data():
    records = [{"price": 50}, {"price": 70}, {"price": 80}]
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": records, "totalItems": 3}
        )
        from app.services.flight_deals import compute_average_price

        avg = await compute_average_price("NCE-BCN")
        assert avg == pytest.approx(66.67, rel=0.01)


@pytest.mark.asyncio
async def test_detect_deal_not_enough_history():
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [{"price": 50}] * 3, "totalItems": 3}
        )
        from app.services.flight_deals import detect_deal

        is_deal, avg, discount = await detect_deal(20.0, "NCE-BCN", min_history_days=7)
        assert is_deal is False
        assert avg is None


@pytest.mark.asyncio
async def test_detect_deal_below_threshold():
    # Average is 100, price is 80 -> 20% discount, threshold is 30%
    records = [{"price": 100}] * 10
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": records, "totalItems": 10}
        )
        from app.services.flight_deals import detect_deal

        is_deal, avg, discount = await detect_deal(
            80.0, "NCE-BCN", threshold_percent=30.0, min_history_days=7
        )
        assert is_deal is False
        assert avg == 100.0
        assert discount == pytest.approx(20.0)


@pytest.mark.asyncio
async def test_detect_deal_above_threshold():
    # Average is 100, price is 40 -> 60% discount, threshold is 30%
    records = [{"price": 100}] * 10
    with patch("app.services.flight_deals.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": records, "totalItems": 10}
        )
        from app.services.flight_deals import detect_deal

        is_deal, avg, discount = await detect_deal(
            40.0, "NCE-BCN", threshold_percent=30.0, min_history_days=7
        )
        assert is_deal is True
        assert avg == 100.0
        assert discount == pytest.approx(60.0)
