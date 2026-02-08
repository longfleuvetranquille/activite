"""Tests for the tags API routes."""


def test_list_all_tags(client):
    resp = client.get("/api/tags")
    assert resp.status_code == 200
    data = resp.json()
    assert "type" in data
    assert "vibe" in data
    assert "budget" in data
    assert "deals" in data


def test_get_tags_by_category(client):
    resp = client.get("/api/tags/type")
    assert resp.status_code == 200
    data = resp.json()
    assert "party" in data
    assert "concert" in data


def test_get_tags_unknown_category(client):
    resp = client.get("/api/tags/nonexistent")
    assert resp.status_code == 404
