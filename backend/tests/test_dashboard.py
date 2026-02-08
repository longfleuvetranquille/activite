"""Tests for the dashboard API routes."""

from unittest.mock import AsyncMock, patch


def test_digest_empty(client):
    with (
        patch("app.services.event_service.pb_client") as mock_pb,
        patch("app.api.routes.dashboard.pb_client") as mock_pb2,
    ):
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        resp = client.get("/api/dashboard/digest")
        assert resp.status_code == 200
        data = resp.json()
        assert data["today_count"] == 0
        assert data["week_count"] == 0
        assert data["featured"] == []
        assert data["deals"] == []


def test_digest_with_deal(client, sample_deal_record, sample_event_record):
    with (
        patch("app.services.event_service.pb_client") as mock_pb,
        patch("app.api.routes.dashboard.pb_client") as mock_pb2,
    ):
        # Return deal in week events, event in today
        mock_pb.list_records = AsyncMock(
            return_value={
                "items": [sample_event_record, sample_deal_record],
                "totalItems": 2,
            }
        )
        resp = client.get("/api/dashboard/digest")
        assert resp.status_code == 200
        data = resp.json()
        # Deals should be filtered from week events
        assert len(data["deals"]) >= 1


def test_stats(client):
    with (
        patch("app.services.event_service.pb_client") as mock_pb,
        patch("app.api.routes.dashboard.pb_client") as mock_pb2,
    ):
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        mock_pb2.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 5}
        )
        resp = client.get("/api/dashboard/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "total_events" in data
        assert "total_sources" in data
        assert "events_today" in data
