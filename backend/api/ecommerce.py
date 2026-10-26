import io
from typing import Optional
from fastapi import APIRouter, Form, UploadFile, File
from PIL import Image
from backend.services.caption_service import generate_ecommerce_copy

router = APIRouter(prefix="/ecommerce", tags=["E-Commerce Product Mode"])

@router.post("/generate")
async def generate_product_marketing(
    product_name: str = Form(...),
    category: str = Form(...),
    target_customer: str = Form("Discerning Modern Shoppers"),
    image: Optional[UploadFile] = File(None)
):
    if image is not None:
        content = await image.read()
        try:
            pil_img = Image.open(io.BytesIO(content)).convert("RGB")
        except Exception:
            pil_img = Image.new("RGB", (224, 224), color=(180, 160, 140))
    else:
        pil_img = Image.new("RGB", (224, 224), color=(180, 160, 140))

    result = generate_ecommerce_copy(
        image=pil_img,
        product_name=product_name,
        category=category,
        target_customer=target_customer
    )
    return {"status": "success", "data": result}
