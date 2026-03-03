import hashlib
import logging
from datetime import datetime, timedelta

import httpx

logger = logging.getLogger(__name__)

from app.config import settings


class PocketBaseClient:
    def __init__(self):
        self.base_url = settings.pocketbase_url
        self.token: str | None = None
        self._client: httpx.AsyncClient | None = None

    async def connect(self):
        self._client = httpx.AsyncClient(base_url=self.base_url, timeout=30)
        await self._authenticate()

    async def _authenticate(self):
        """Obtain a fresh superuser token from PocketBase."""
        try:
            resp = await self._client.post(
                "/api/collections/_superusers/auth-with-password",
                json={
                    "identity": settings.pocketbase_admin_email,
                    "password": settings.pocketbase_admin_password,
                },
            )
            if resp.status_code == 200:
                self.token = resp.json()["token"]
                logger.info("PocketBase auth token obtained")
            else:
                logger.error("PocketBase auth failed: %s", resp.text)
        except httpx.ConnectError:
            logger.warning("PocketBase not reachable, will retry later")

    async def _ensure_auth(self):
        """Re-authenticate if token is missing."""
        if not self.token:
            await self._authenticate()

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
        sort: str = "",
        filter_str: str = "",
    ) -> dict:
        params: dict = {"page": page, "perPage": per_page}
        if sort:
            params["sort"] = sort
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

    async def _retry_on_403(self, method: str, url: str, **kwargs):
        """Execute request, re-auth once on 403, then retry."""
        request_fn = getattr(self._client, method)
        kwargs["headers"] = self.headers
        resp = await request_fn(url, **kwargs)
        if resp.status_code == 403:
            logger.info("Got 403, refreshing PocketBase token...")
            self.token = None
            await self._authenticate()
            kwargs["headers"] = self.headers
            resp = await request_fn(url, **kwargs)
        return resp

    async def create_record(self, collection: str, data: dict) -> dict:
        resp = await self._retry_on_403(
            "post",
            f"/api/collections/{collection}/records",
            json=data,
        )
        if resp.status_code >= 400:
            logger.error("PB create %s failed %s: %s", collection, resp.status_code, resp.text)
        resp.raise_for_status()
        return resp.json()

    async def update_record(
        self, collection: str, record_id: str, data: dict
    ) -> dict:
        resp = await self._retry_on_403(
            "patch",
            f"/api/collections/{collection}/records/{record_id}",
            json=data,
        )
        resp.raise_for_status()
        return resp.json()

    async def delete_record(self, collection: str, record_id: str) -> bool:
        resp = await self._retry_on_403(
            "delete",
            f"/api/collections/{collection}/records/{record_id}",
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
