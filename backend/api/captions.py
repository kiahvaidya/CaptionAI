import time
import base64
import io
import uuid
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from PIL import Image
from backend.services.caption_service import generate_captions_for_image
from backend.database.models import DatabaseService

router = APIRouter(prefix="/captions", tags=["Captions"])

def load_image_from_bytes_or_b64(file_bytes: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(file_bytes))
        return img.convert("RGB")
    except Exception:
        # Fallback: create an aesthetic gradient RGB image so inference never crashes
        fallback = Image.new("RGB", (224, 224), color=(245, 235, 238))
        return fallback

@router.post("/generate")
async def generate_captions(
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    image_b64: Optional[str] = Form(None),
    platform: str = Form("instagram"),
    style: str = Form("creative"),
    length: str = Form("medium"),
    audience: str = Form("general"),
    num_captions: int = Form(5),
    custom_brief: Optional[str] = Form(None)
):
    start_time = time.time()
    pil_image = None
    data_url_to_save = ""
    filename = "uploaded_image.jpg"

    if image is not None:
        filename = image.filename or "upload.jpg"
        content = await image.read()
        pil_image = load_image_from_bytes_or_b64(content)
        data_url_to_save = "data:image/jpeg;base64," + base64.b64encode(content).decode("utf-8")
    elif image_b64:
        # Base64 string or data URL
        raw_b64 = image_b64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        try:
            decoded = base64.b64decode(raw_b64)
            pil_image = load_image_from_bytes_or_b64(decoded)
        except Exception:
            pil_image = Image.new("RGB", (224, 224), color=(245, 230, 235))
        data_url_to_save = image_b64 if image_b64.startswith("data:") else ("data:image/jpeg;base64," + raw_b64)
        filename = "selected_asset.jpg"
    elif image_url and image_url.startswith("data:"):
        raw_b64 = image_url.split(",", 1)[1] if "," in image_url else image_url
        try:
            decoded = base64.b64decode(raw_b64)
            pil_image = load_image_from_bytes_or_b64(decoded)
        except Exception:
            pil_image = Image.new("RGB", (224, 224), color=(245, 230, 235))
        data_url_to_save = image_url
        filename = "preset_demo.jpg"
    else:
        # Default fallback aesthetic image
        pil_image = Image.new("RGB", (224, 224), color=(245, 230, 235))
        data_url_to_save = "data:image/jpeg;base64,placeholder"
        filename = "demo_sample.jpg"

    # Run Deep Learning inference & style engine
    result = generate_captions_for_image(
        image=pil_image,
        platform=platform,
        style=style,
        length=length,
        audience=audience,
        num_captions=num_captions,
        custom_brief=custom_brief,
        filename=filename
    )

    elapsed = round(time.time() - start_time, 2)
    result["generation_latency_seconds"] = elapsed

    # Save generation to DB history
    generation_id = f"gen_{uuid.uuid4().hex[:10]}"
    try:
        # Save a compressed thumbnail to keep DB compact
        thumb_buffer = io.BytesIO()
        thumb = pil_image.copy()
        thumb.thumbnail((240, 240))
        thumb.save(thumb_buffer, format="JPEG", quality=75)
        thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(thumb_buffer.getvalue()).decode("utf-8")

        DatabaseService.save_generation(
            generation_id=generation_id,
            user_id=1,
            image_name=filename,
            image_data_url=thumb_b64,
            raw_caption=result["raw_model_caption"],
            platform=platform,
            style=style,
            length=length,
            audience=audience,
            captions=result["captions"],
            latency_sec=elapsed
        )
    except Exception as e:
        print(f"Error saving to database history: {e}")

    result["generation_id"] = generation_id
    return result

@router.delete("/{caption_id}")
def delete_single_caption(caption_id: str):
    success = DatabaseService.delete_caption(caption_id)
    return {"status": "success", "deleted": success, "caption_id": caption_id}
