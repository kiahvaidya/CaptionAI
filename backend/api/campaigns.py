import uuid
from typing import List, Optional
from fastapi import APIRouter, Form, UploadFile, File
from pydantic import BaseModel
from PIL import Image
import io
from backend.database.models import DatabaseService
from backend.services.caption_service import generate_captions_for_image

router = APIRouter(prefix="/campaigns", tags=["Marketing Campaigns"])

class CampaignCreate(BaseModel):
    name: str
    product_service: str
    target_audience: str
    objective: str
    platform: str
    tone: str

@router.get("")
def list_campaigns():
    return {"status": "success", "campaigns": DatabaseService.get_campaigns()}

@router.post("")
def create_campaign(payload: CampaignCreate):
    res = DatabaseService.create_campaign(payload.model_dump())
    return {"status": "success", "campaign": res}

@router.post("/generate-batch")
async def generate_campaign_batch(
    campaign_name: str = Form(...),
    product_service: str = Form(...),
    target_audience: str = Form(...),
    objective: str = Form("Brand Awareness"),
    platform: str = Form("Instagram"),
    tone: str = Form("Creative"),
    images: List[UploadFile] = File(...)
):
    results = []
    custom_brief = f"Campaign: {campaign_name} | Product: {product_service} | Tone: {tone}"

    for idx, img_file in enumerate(images):
        content = await img_file.read()
        try:
            pil_img = Image.open(io.BytesIO(content)).convert("RGB")
        except Exception:
            pil_img = Image.new("RGB", (224, 224), color=(150, 150, 200))

        gen_result = generate_captions_for_image(
            image=pil_img,
            platform=platform.lower(),
            style=tone.lower() if tone.lower() in ["creative", "professional", "promotional", "casual"] else "promotional",
            length="medium",
            audience=target_audience,
            num_captions=3,
            custom_brief=custom_brief
        )

        results.append({
            "image_index": idx + 1,
            "filename": img_file.filename,
            "raw_vision": gen_result["raw_model_caption"],
            "captions": gen_result["captions"],
            "hashtags": gen_result["suggested_hashtags"][:8]
        })

    # Record campaign
    DatabaseService.create_campaign({
        "name": campaign_name,
        "product_service": product_service,
        "target_audience": target_audience,
        "objective": objective,
        "platform": platform,
        "tone": tone,
        "images_count": len(images),
        "captions_count": len(results) * 3
    })

    return {
        "status": "success",
        "campaign_name": campaign_name,
        "product_service": product_service,
        "processed_images_count": len(images),
        "results": results
    }
