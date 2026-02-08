"""Tests for the events API routes."""

from unittest.mock import AsyncMock, patch


def test_list_events_empty(client):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0, "page": 1, "perPage": 50}
        )
        resp = client.get("/api/events")
        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["total"] == 0


def test_list_events_with_results(client, sample_event_record):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={
                "items": [sample_event_record],
                "totalItems": 1,
                "page": 1,
                "perPage": 50,
            }
        )
        resp = client.get("/api/events")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["title"] == "Peggy Gou @ High Club"
        assert data["items"][0]["interest_score"] == 95


def test_list_events_with_city_filter(client, sample_event_record):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={
                "items": [sample_event_record],
                "totalItems": 1,
                "page": 1,
                "perPage": 50,
            }
        )
        resp = client.get("/api/events?city=Nice")
        assert resp.status_code == 200
        # Verify filter was constructed with city
        call_kwargs = mock_pb.list_records.call_args
        assert "Nice" in call_kwargs.kwargs.get("filter_str", "")


def test_list_events_with_min_score(client):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0, "page": 1, "perPage": 50}
        )
        resp = client.get("/api/events?min_score=80")
        assert resp.status_code == 200
        call_kwargs = mock_pb.list_records.call_args
        assert "interest_score >= 80" in call_kwargs.kwargs.get("filter_str", "")


def test_get_event_by_id(client, sample_event_record):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.get_record = AsyncMock(return_value=sample_event_record)
        resp = client.get("/api/events/evt_001")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "evt_001"
        assert data["title"] == "Peggy Gou @ High Club"


def test_get_event_not_found(client):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.get_record = AsyncMock(side_effect=Exception("Not found"))
        resp = client.get("/api/events/nonexistent")
        assert resp.status_code == 404


def test_today_events(client, sample_event_record):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [sample_event_record], "totalItems": 1}
        )
        resp = client.get("/api/events/today")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1


def test_week_events(client):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        resp = client.get("/api/events/week")
        assert resp.status_code == 200
        assert resp.json() == []


def test_featured_events(client, sample_event_record):
    with patch("app.services.event_service.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [sample_event_record], "totalItems": 1}
        )
        resp = client.get("/api/events/featured")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["is_featured"] is True
