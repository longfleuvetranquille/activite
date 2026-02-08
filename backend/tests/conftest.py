"""Shared fixtures for backend tests."""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def sample_event_record():
    """A raw PocketBase event record."""
    return {
        "id": "evt_001",
        "title": "Peggy Gou @ High Club",
        "description": "DJ set electro au High Club Nice",
        "summary": "Soirée electro avec Peggy Gou au High Club.",
        "date_start": datetime.now().isoformat(),
        "date_end": (datetime.now() + timedelta(hours=5)).isoformat(),
        "location_name": "High Club",
        "location_city": "Nice",
        "location_address": "45 Promenade des Anglais",
        "latitude": 43.695,
        "longitude": 7.265,
        "price_min": 25,
        "price_max": 40,
        "currency": "EUR",
        "source_url": "https://shotgun.live/events/peggy-gou-nice",
        "source_name": "shotgun",
        "image_url": "https://example.com/peggy.jpg",
        "tags_type": ["party", "dj_set"],
        "tags_vibe": ["festive", "dancing"],
        "tags_energy": ["high"],
        "tags_budget": ["budget"],
        "tags_time": ["today"],
        "tags_exclusivity": ["selling_fast"],
        "tags_location": ["nice_centre"],
        "tags_audience": ["young_pro", "electro"],
        "tags_deals": [],
        "tags_meta": ["high_interest", "recommended"],
        "interest_score": 95,
        "is_featured": True,
        "status": "published",
        "crawled_at": datetime.now().isoformat(),
        "hash": "abc123def456",
    }


@pytest.fixture()
def sample_deal_record():
    """A raw PocketBase event record with deal tags."""
    return {
        "id": "evt_deal_001",
        "title": "Vol Nice\u2192Barcelone 29\u20ac A/R (\u221258%)",
        "description": "Vol direct Nice (NCE) \u2192 Barcelone (BCN). Prix: 29\u20ac A/R.",
        "summary": "Bon plan vol Nice-Barcelone \u00e0 29\u20ac.",
        "date_start": (datetime.now() + timedelta(days=10)).isoformat(),
        "date_end": (datetime.now() + timedelta(days=12)).isoformat(),
        "location_name": "A\u00e9roport Nice C\u00f4te d'Azur (NCE)",
        "location_city": "Nice",
        "location_address": "",
        "latitude": 43.658,
        "longitude": 7.215,
        "price_min": 29,
        "price_max": 29,
        "currency": "EUR",
        "source_url": "https://google.com/travel/flights",
        "source_name": "google_flights",
        "image_url": "",
        "tags_type": ["travel"],
        "tags_vibe": [],
        "tags_energy": [],
        "tags_budget": ["value", "worth_it"],
        "tags_time": ["this_week"],
        "tags_exclusivity": [],
        "tags_location": [],
        "tags_audience": ["explorer"],
        "tags_deals": ["cheap_flight", "below_average", "deal_detected"],
        "tags_meta": ["high_interest"],
        "interest_score": 88,
        "is_featured": True,
        "status": "published",
        "crawled_at": datetime.now().isoformat(),
        "hash": "flight_deal_001",
    }


@pytest.fixture()
def mock_pb_client():
    """Mocked PocketBase client."""
    with patch("app.services.pocketbase.pb_client") as mock:
        mock.list_records = AsyncMock(return_value={"items": [], "totalItems": 0})
        mock.get_record = AsyncMock(return_value={})
        mock.create_record = AsyncMock(return_value={"id": "new_001"})
        mock.update_record = AsyncMock(return_value={"id": "upd_001"})
        mock.delete_record = AsyncMock(return_value=True)
        mock.get_first_record = AsyncMock(return_value=None)
        mock.connect = AsyncMock()
        yield mock


@pytest.fixture()
def client():
    """FastAPI test client with mocked dependencies."""
    with (
        patch("app.main.pb_client") as mock_pb,
        patch("app.main.start_scheduler"),
        patch("app.main.stop_scheduler"),
    ):
        mock_pb.connect = AsyncMock()

        from app.main import app

        with TestClient(app) as c:
            yield c
