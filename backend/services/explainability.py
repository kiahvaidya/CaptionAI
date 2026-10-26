import base64
import io
from typing import Dict, Any
import torch
import torch.nn.functional as F
import numpy as np
from PIL import Image

def generate_attention_heatmap(image: Image.Image, spatial_features: torch.Tensor) -> Dict[str, Any]:
    """
    Generates a visual attention heatmap by projecting the ResNet50 spatial feature activations (7x7)
    onto the image space and alpha-blending with a colormap.
    Returns:
        heatmap_base64: data URL of the blended image
        raw_heatmap_base64: data URL of the standalone heatmap
        hotspots: top focus coordinates
    """
    # 1. Calculate spatial energy: mean over 2048 channels
    # spatial_features: (1, 2048, 7, 7)
    energy = spatial_features.squeeze(0).mean(dim=0).detach().cpu().numpy() # (7, 7)
    
    # Normalize between 0 and 1
    min_val, max_val = energy.min(), energy.max()
    if max_val > min_val:
        norm_energy = (energy - min_val) / (max_val - min_val)
    else:
        norm_energy = np.zeros_like(energy)

    # Convert to PIL Image and resize to original image size with bicubic interpolation
    w, h = image.size
    heatmap_pil = Image.fromarray((norm_energy * 255).astype(np.uint8))
    heatmap_resized = heatmap_pil.resize((w, h), resample=Image.BICUBIC)
    heatmap_arr = np.array(heatmap_resized) / 255.0

    # Apply pseudo-JET colormap (Blue -> Cyan -> Yellow -> Red)
    colored_heatmap = np.zeros((h, w, 3), dtype=np.uint8)
    # Red channel
    colored_heatmap[..., 0] = np.clip((1.5 - np.abs(heatmap_arr * 4 - 3)) * 255, 0, 255).astype(np.uint8)
    # Green channel
    colored_heatmap[..., 1] = np.clip((1.5 - np.abs(heatmap_arr * 4 - 2)) * 255, 0, 255).astype(np.uint8)
    # Blue channel
    colored_heatmap[..., 2] = np.clip((1.5 - np.abs(heatmap_arr * 4 - 1)) * 255, 0, 255).astype(np.uint8)

    heat_img = Image.fromarray(colored_heatmap).convert("RGBA")
    orig_rgba = image.convert("RGBA")

    # Blend 45% heatmap + 55% original image
    blended = Image.blend(orig_rgba, heat_img, alpha=0.45).convert("RGB")

    # Encode to base64
    buffered = io.BytesIO()
    blended.save(buffered, format="JPEG", quality=90)
    blended_b64 = "data:image/jpeg;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")

    buffered_heat = io.BytesIO()
    heat_img.convert("RGB").save(buffered_heat, format="JPEG", quality=85)
    heat_b64 = "data:image/jpeg;base64," + base64.b64encode(buffered_heat.getvalue()).decode("utf-8")

    # Find peak hotspot location (x%, y%)
    peak_y, peak_x = np.unravel_index(np.argmax(norm_energy), norm_energy.shape)
    hotspot_x_pct = round((peak_x / 6.0) * 100, 1)
    hotspot_y_pct = round((peak_y / 6.0) * 100, 1)

    return {
        "blended_heatmap_url": blended_b64,
        "raw_heatmap_url": heat_b64,
        "peak_region": {"x_percent": hotspot_x_pct, "y_percent": hotspot_y_pct},
        "description": f"Maximum visual attention focused at coordinates ({hotspot_x_pct}%, {hotspot_y_pct}%)"
    }
