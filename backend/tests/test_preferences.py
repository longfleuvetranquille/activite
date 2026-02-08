"""Tests for the preferences API routes."""

from unittest.mock import AsyncMock, patch


def test_get_default_preferences(client):
    with patch("app.api.routes.preferences.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        resp = client.get("/api/preferences")
        assert resp.status_code == 200
        data = resp.json()
        assert data["notif_time"] == "08:00"
        assert data["notif_enabled"] is True
        assert data["favorite_tags"] == []


def test_get_existing_preferences(client):
    prefs_record = {
        "id": "pref_001",
        "favorite_tags": ["party", "dj_set"],
        "blocked_tags": ["conference"],
        "favorite_locations": ["Nice", "Monaco"],
        "max_budget": 50,
        "telegram_chat_id": "123456",
        "notif_time": "09:00",
        "notif_enabled": True,
    }
    with patch("app.api.routes.preferences.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [prefs_record], "totalItems": 1}
        )
        resp = client.get("/api/preferences")
        assert resp.status_code == 200
        data = resp.json()
        assert data["favorite_tags"] == ["party", "dj_set"]
        assert data["max_budget"] == 50


def test_update_preferences_create_new(client):
    with patch("app.api.routes.preferences.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [], "totalItems": 0}
        )
        mock_pb.create_record = AsyncMock(return_value={"id": "pref_new"})
        resp = client.put(
            "/api/preferences",
            json={
                "favorite_tags": ["outdoor"],
                "notif_time": "07:30",
                "notif_enabled": True,
            },
        )
        assert resp.status_code == 200
        mock_pb.create_record.assert_called_once()


def test_update_preferences_update_existing(client):
    existing = {"id": "pref_001", "favorite_tags": [], "notif_time": "08:00"}
    with patch("app.api.routes.preferences.pb_client") as mock_pb:
        mock_pb.list_records = AsyncMock(
            return_value={"items": [existing], "totalItems": 1}
        )
        mock_pb.update_record = AsyncMock(return_value={"id": "pref_001"})
        resp = client.put(
            "/api/preferences",
            json={
                "favorite_tags": ["outdoor", "watersport"],
                "notif_time": "07:00",
                "notif_enabled": False,
            },
        )
        assert resp.status_code == 200
        mock_pb.update_record.assert_called_once()
