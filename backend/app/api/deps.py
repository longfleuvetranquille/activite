from app.services.pocketbase import pb_client


async def get_pb():
    """Dependency to get PocketBase client."""
    return pb_client
