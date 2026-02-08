from fastapi import APIRouter, HTTPException

from app.models.event import ALL_TAG_CATEGORIES

router = APIRouter()


@router.get("")
async def list_all_tags():
    return ALL_TAG_CATEGORIES


@router.get("/{category}")
async def get_tags_by_category(category: str):
    tags = ALL_TAG_CATEGORIES.get(category)
    if tags is None:
        raise HTTPException(
            status_code=404,
            detail=f"Category '{category}' not found. Available: {list(ALL_TAG_CATEGORIES.keys())}",
        )
    return tags
