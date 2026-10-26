import io
from typing import Optional
from fastapi import APIRouter, Form, UploadFile, File
from PIL import Image
from backend.services.caption_service import generate_seo_alt_text

router = APIRouter(prefix="/seo", tags=["SEO & Alt Text Generator"])

@router.post("/generate")
async def generate_seo_tags(
    page_topic: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    if image is not None:
        content = await image.read()
        try:
            pil_img = Image.open(io.BytesIO(content)).convert("RGB")
        except Exception:
            pil_img = Image.new("RGB", (224, 224), color=(140, 180, 160))
    else:
        pil_img = Image.new("RGB", (224, 224), color=(140, 180, 160))

    result = generate_seo_alt_text(pil_img, page_topic=page_topic)
    return {"status": "success", "data": result}
