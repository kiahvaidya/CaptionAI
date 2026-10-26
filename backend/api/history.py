from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from backend.database.models import DatabaseService

router = APIRouter(prefix="/history", tags=["History & Saved Captions"])

@router.get("")
def get_history(
    search: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    style: Optional[str] = Query(None),
    favorite_only: bool = Query(False)
):
    items = DatabaseService.get_history(
        search=search,
        platform=platform,
        style=style,
        favorite_only=favorite_only
    )
    return {
        "status": "success",
        "count": len(items),
        "history": items
    }

@router.post("/{generation_id}/favorite")
def toggle_favorite(generation_id: str):
    new_status = DatabaseService.toggle_favorite(generation_id)
    return {
        "status": "success",
        "generation_id": generation_id,
        "is_favorite": new_status
    }

@router.delete("/{generation_id}")
def delete_generation(generation_id: str):
    success = DatabaseService.delete_generation(generation_id)
    return {"status": "success", "deleted": success}
