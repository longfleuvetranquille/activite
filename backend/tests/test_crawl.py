"""Tests for the crawl API routes."""

from unittest.mock import AsyncMock, patch


def test_crawl_status(client):
    resp = client.get("/api/crawl/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "is_running" in data
    assert data["is_running"] is False


def test_crawl_logs_empty(client):
    with patch("app.api.routes.crawl.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        resp = client.get("/api/crawl/logs")
        assert resp.status_code == 200
        assert resp.json() == []


def test_crawl_logs_with_entries(client):
    log_entry = {
        "id": "log_001",
        "source": "shotgun",
        "started_at": "2026-02-08T07:00:00",
        "finished_at": "2026-02-08T07:02:30",
        "status": "success",
        "events_found": 15,
        "events_new": 8,
        "error_message": "",
    }
    with patch("app.api.routes.crawl.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [log_entry], "totalItems": 1}
        )
        resp = client.get("/api/crawl/logs")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["source"] == "shotgun"
        assert data[0]["events_found"] == 15
