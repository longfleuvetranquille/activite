from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import EventListResponse, EventRead
from app.services import event_service

router = APIRouter()


@router.get("", response_model=EventListResponse)
async def list_events(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    sort: str = Query("-interest_score"),
    city: str | None = None,
    tag_type: str | None = None,
    tag_vibe: str | None = None,
    min_score: int | None = None,
    search: str | None = None,
):
    filters: list[str] = ['status = "published"']
    if city:
        filters.append(f'location_city ~ "{city}"')
    if tag_type:
        filters.append(f'tags_type ~ "{tag_type}"')
    if tag_vibe:
        filters.append(f'tags_vibe ~ "{tag_vibe}"')
    if min_score is not None:
        filters.append(f"interest_score >= {min_score}")
    if search:
        filters.append(f'(title ~ "{search}" || description ~ "{search}")')

    filter_str = " && ".join(filters)
    return await event_service.get_events(
        page=page, per_page=per_page, sort=sort, filter_str=filter_str
    )


@router.get("/today", response_model=list[EventRead])
async def today_events():
    return await event_service.get_today_events()


@router.get("/week", response_model=list[EventRead])
async def week_events():
    return await event_service.get_week_events()


@router.get("/weekend", response_model=list[EventRead])
async def weekend_events():
    return await event_service.get_weekend_events()


@router.get("/month", response_model=list[EventRead])
async def month_events():
    return await event_service.get_month_events()


@router.get("/featured", response_model=list[EventRead])
async def featured_events():
    return await event_service.get_featured_events()


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: str):
    event = await event_service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
