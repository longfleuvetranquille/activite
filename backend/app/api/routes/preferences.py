from fastapi import APIRouter, HTTPException

from app.models.schemas import UserPreferences
from app.services.pocketbase import pb_client

router = APIRouter()

COLLECTION = "user_preferences"


async def _get_prefs_record() -> dict | None:
    result = await pb_client.list_records(COLLECTION, per_page=1)
    items = result.get("items", [])
    return items[0] if items else None


@router.get("", response_model=UserPreferences)
async def get_preferences():
    record = await _get_prefs_record()
    if not record:
        return UserPreferences()
    return UserPreferences(
        favorite_tags=record.get("favorite_tags", []),
        blocked_tags=record.get("blocked_tags", []),
        favorite_locations=record.get("favorite_locations", []),
        max_budget=record.get("max_budget", 0),
        telegram_chat_id=record.get("telegram_chat_id", ""),
        notif_time=record.get("notif_time", "08:00"),
        notif_enabled=record.get("notif_enabled", True),
    )


@router.put("", response_model=UserPreferences)
async def update_preferences(prefs: UserPreferences):
    data = prefs.model_dump()
    record = await _get_prefs_record()

    if record:
        await pb_client.update_record(COLLECTION, record["id"], data)
    else:
        await pb_client.create_record(COLLECTION, data)

    return prefs
