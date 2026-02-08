import hashlib
from datetime import datetime, timedelta

import httpx

from app.config import settings


class PocketBaseClient:
    def __init__(self):
        self.base_url = settings.pocketbase_url
        self.token: str | None = None
        self._client: httpx.AsyncClient | None = None

    async def connect(self):
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=30)
        try:
            resp = await self._client.post(
                "/api/admins/auth-with-password",
                json={
                    "identity": settings.pocketbase_admin_email,
                    "password": settings.pocketbase_admin_password,
                },
            )
            if resp.status_code == 200:
                self.token = resp.json()["token"]
        except httpx.ConnectError:
            # PocketBase not ready yet, will retry on first request
            pass

    @property
    def headers(self) -> dict:
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    async def list_records(
        self,
        collection: str,
        page: int = 1,
        per_page: int = 50,
        sort: str = "-date_start",
        filter_str: str = "",
    ) -> dict:
        params = {"page": page, "perPage": per_page, "sort": sort}
        if filter_str:
            params["filter"] = filter_str
        resp = await self._client.get(
            f"/api/collections/{collection}/records",
            params=params,
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def get_record(self, collection: str, record_id: str) -> dict:
        resp = await self._client.get(
            f"/api/collections/{collection}/records/{record_id}",
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def create_record(self, collection: str, data: dict) -> dict:
        resp = await self._client.post(
            f"/api/collections/{collection}/records",
            json=data,
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def update_record(
        self, collection: str, record_id: str, data: dict
    ) -> dict:
        resp = await self._client.patch(
            f"/api/collections/{collection}/records/{record_id}",
            json=data,
            headers=self.headers,
        )
        resp.raise_for_status()
        return resp.json()

    async def delete_record(self, collection: str, record_id: str) -> bool:
        resp = await self._client.delete(
            f"/api/collections/{collection}/records/{record_id}",
            headers=self.headers,
        )
        return resp.status_code == 204

    async def get_first_record(
        self, collection: str, filter_str: str
    ) -> dict | None:
        result = await self.list_records(
            collection, page=1, per_page=1, filter_str=filter_str
        )
        items = result.get("items", [])
        return items[0] if items else None


pb_client = PocketBaseClient()


def compute_event_hash(title: str, date_start: str, location_name: str) -> str:
    raw = f"{title.lower().strip()}|{date_start}|{location_name.lower().strip()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]
