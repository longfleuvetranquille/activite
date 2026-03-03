import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import FeedbackCreate, FeedbackResponse
from app.services.event_service import _to_event_read
from app.services.pocketbase import pb_client

logger = logging.getLogger(__name__)

router = APIRouter()

VALID_RATINGS = {"excellent", "ok", "bad", "block_type"}


@router.post("/events/{event_id}/feedback", response_model=FeedbackResponse)
async def submit_feedback(event_id: str, body: FeedbackCreate):
    """Submit user feedback on an event, adjusting its score in real time."""
    if body.rating not in VALID_RATINGS:
        raise HTTPException(
            status_code=422,
            detail=f"rating must be one of {sorted(VALID_RATINGS)}",
        )

    # Fetch event
    try:
        record = await pb_client.get_record("events", event_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Event not found")

    score_before = int(record.get("interest_score", 0))

    # Compute new score
    if body.rating == "excellent":
        score_after = min(100, score_before + 15)
    elif body.rating == "bad":
        score_after = max(0, score_before - 20)
    elif body.rating == "block_type":
        score_after = 0
    else:  # ok
        score_after = score_before

    # Build event update payload
    event_update: dict = {
        "interest_score": score_after,
        "is_featured": score_after >= 80,
    }
    if body.rating == "block_type":
        event_update["status"] = "cancelled"

    # Update event in PocketBase
    updated_record = await pb_client.update_record("events", event_id, event_update)

    # If block_type: add event's tags_type to user blocked_tags
    if body.rating == "block_type":
        event_tags_type = record.get("tags_type", [])
        if event_tags_type:
            await _add_to_blocked_tags(event_tags_type)

    # Store feedback in event_feedback collection
    try:
        await pb_client.create_record(
            "event_feedback",
            {
                "event_id": event_id,
                "rating": body.rating,
                "comment": body.comment,
                "score_before": score_before,
                "score_after": score_after,
            },
        )
    except Exception:
        logger.warning("Failed to store feedback record, continuing anyway")

    return FeedbackResponse(
        rating=body.rating,
        comment=body.comment,
        score_before=score_before,
        score_after=score_after,
        event=_to_event_read(updated_record),
    )


async def _add_to_blocked_tags(tags_to_block: list[str]) -> None:
    """Append tags to blocked_tags in user_preferences."""
    try:
        result = await pb_client.list_records("user_preferences", per_page=1)
        items = result.get("items", [])
        if items:
            prefs = items[0]
            blocked = prefs.get("blocked_tags", []) or []
            merged = list(set(blocked) | set(tags_to_block))
            await pb_client.update_record(
                "user_preferences", prefs["id"], {"blocked_tags": merged}
            )
        else:
            await pb_client.create_record(
                "user_preferences", {"blocked_tags": tags_to_block}
            )
    except Exception:
        logger.warning("Failed to update blocked_tags in preferences")
