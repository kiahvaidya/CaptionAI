from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from backend.database.models import DatabaseService

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignUpRequest(BaseModel):
    name: str
    email: str
    password: str
    tier: Optional[str] = "pro"

class UpgradeTierRequest(BaseModel):
    tier: str

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    brand_name: Optional[str] = None
    default_platform: Optional[str] = None
    default_style: Optional[str] = None
    notify_on_generation: Optional[int] = None
    instagram_handle: Optional[str] = None
    instagram_category: Optional[str] = None
    instagram_page_id: Optional[str] = None

class SocialToggleRequest(BaseModel):
    platform: str
    connected: bool
    handle: Optional[str] = None
    category: Optional[str] = None
    business_page: Optional[str] = None

@router.get("/me")
def get_current_user():
    user = DatabaseService.get_or_create_default_user()
    return {
        "status": "success",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "tier": user["tier"],
            "brand_name": user.get("brand_name", "Studio One"),
            "default_platform": user.get("default_platform", "instagram"),
            "default_style": user.get("default_style", "creative"),
            "instagram_connected": bool(user.get("instagram_connected", 1)),
            "linkedin_connected": bool(user.get("linkedin_connected", 0)),
            "twitter_connected": bool(user.get("twitter_connected", 0)),
            "instagram_handle": user.get("instagram_handle", "@studioone"),
            "instagram_category": user.get("instagram_category", "Brand / Business"),
            "instagram_page_id": user.get("instagram_page_id", "FB-PAGE-98421"),
            "notify_on_generation": bool(user.get("notify_on_generation", 1)),
            "images_processed": user["images_processed"],
            "captions_generated": user["captions_generated"],
            "subscription": {
                "plan": user["tier"].capitalize(),
                "monthly_limit": 999999 if user["tier"].lower() == "business" else (500 if user["tier"].lower() == "pro" else 10),
                "used": user["images_processed"] % 500
            }
        }
    }

@router.put("/profile")
def update_profile(payload: ProfileUpdateRequest):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated_user = DatabaseService.update_profile(1, update_data)
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "user": updated_user
    }

@router.post("/social/toggle")
def toggle_social_account(payload: SocialToggleRequest):
    col_name = f"{payload.platform.lower()}_connected"
    val = 1 if payload.connected else 0
    update_data = {col_name: val}
    if payload.handle:
        update_data[f"{payload.platform.lower()}_handle"] = payload.handle
    if payload.category and payload.platform.lower() == "instagram":
        update_data["instagram_category"] = payload.category
    if payload.business_page and payload.platform.lower() == "instagram":
        update_data["instagram_page_id"] = payload.business_page

    updated_user = DatabaseService.update_profile(1, update_data)
    return {
        "status": "success",
        "platform": payload.platform,
        "connected": payload.connected,
        "user": updated_user,
        "message": f"{payload.platform.capitalize()} {'connected' if payload.connected else 'disconnected'} successfully."
    }

@router.post("/login")
def login(payload: LoginRequest):
    user = DatabaseService.get_or_create_default_user()
    # Update name/email if logging in with new credentials
    if payload.email and payload.email != user["email"]:
        new_name = payload.email.split("@")[0].replace(".", " ").title()
        DatabaseService.update_profile(user["id"], {"email": payload.email, "name": new_name})
        user = DatabaseService.get_or_create_default_user()

    return {
        "status": "success",
        "token": "auth_session_token_active",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "tier": user["tier"],
            "brand_name": user.get("brand_name", "Acme Studio")
        }
    }

@router.post("/signup")
def signup(payload: SignUpRequest):
    user = DatabaseService.get_or_create_default_user()
    DatabaseService.update_profile(user["id"], {
        "name": payload.name,
        "email": payload.email
    })
    return {
        "status": "success",
        "token": "auth_session_token_active",
        "user": {
            "id": user["id"],
            "name": payload.name,
            "email": payload.email,
            "tier": payload.tier or "pro",
            "brand_name": "Personal Brand"
        }
    }

@router.post("/logout")
def logout():
    return {
        "status": "success",
        "message": "Signed out successfully."
    }

@router.post("/upgrade")
def upgrade_tier(payload: UpgradeTierRequest):
    DatabaseService.update_profile(1, {"tier": payload.tier})
    return {
        "status": "success",
        "new_tier": payload.tier,
        "message": f"Plan successfully changed to {payload.tier.upper()}."
    }
