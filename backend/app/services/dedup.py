from app.services.pocketbase import compute_event_hash, pb_client


async def event_exists(title: str, date_start: str, location_name: str) -> bool:
    h = compute_event_hash(title, date_start, location_name)
    existing = await pb_client.get_first_record("events", f'hash = "{h}"')
    return existing is not None
