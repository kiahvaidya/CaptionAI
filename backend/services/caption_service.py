import os
import random
from typing import List, Dict, Any, Optional
from PIL import Image
from ml.inference.predictor import CaptionPredictor
from backend.services.explainability import generate_attention_heatmap
from backend.services.hashtag_service import generate_hashtags
from backend.services.scoring_service import calculate_quality_scores

# Global singleton predictor instance
_predictor: Optional[CaptionPredictor] = None

def get_predictor() -> CaptionPredictor:
    global _predictor
    if _predictor is None:
        _predictor = CaptionPredictor()
    return _predictor

# Style adaptation phrasing and templates grounded on visual context
STYLE_TEMPLATES = {
    "creative": [
        "Chasing golden moments and turning visual memories into forever.",
        "Where natural beauty whispers and creativity takes flight.",
        "Filtered by sunlight, driven by curiosity, anchored in peace.",
        "Finding art in the ordinary and poetry in every horizon.",
        "Framed in silence, captured in awe.",
        "Collecting perspectives, not just photographs."
    ],
    "professional": [
        "Strategic clarity begins with purposeful vision and focused execution.",
        "A measured perspective on innovation, design, and continuous elevation.",
        "Excellence is not an accident; it is the deliberate result of refined details.",
        "Setting new standards through mindful composition and structured craft.",
        "A compelling demonstration of balance, modern precision, and discipline.",
        "Behind every great achievement lies dedication to the finer fundamentals."
    ],
    "casual": [
        "Just taking it all in—no filter needed for days like this.",
        "Current mood: 100% peaceful and taking life one moment at a time.",
        "Simple days, good energy, and moments that make you smile.",
        "Nothing complicated here—just pure, unscripted good vibes.",
        "The kind of scene that makes you pause and breathe a little slower.",
        "Catching the light and keeping things wonderfully easy."
    ],
    "funny": [
        "Came for the photo op, stayed because I forgot what I was supposed to be doing.",
        "My camera roll is 99% aesthetic moments and 1% accidental screenshots of my lock screen.",
        "Proof that I occasionally look outside and do things in the real world.",
        "Act natural they said... so here is my version of complete composure.",
        "10/10 recommend pausing your busy day for scenes like this.",
        "BRB, petitioning to turn this entire vibe into an everyday routine."
    ],
    "inspirational": [
        "The horizon reminds us that every ending gives birth to a brand new dawn.",
        "Do not wait for extraordinary circumstances; create magic wherever you stand.",
        "Your journey is defined by the perspective you choose to embrace.",
        "Every masterpiece starts with a quiet decision to keep moving forward.",
        "Find the stillness within the motion, and your path becomes unmistakably clear.",
        "Dream boldly, stay grounded, and let your journey unfold with grace."
    ],
    "promotional": [
        "Experience elevated craftsmanship designed for those who refuse to settle.",
        "Make every moment an experience worth remembering. Discover the full collection today.",
        "Elevate your daily routine with refined elegance and unmatched performance.",
        "Limited release: crafted with precision, engineered for distinction. Link in bio.",
        "Why blend in when you can redefine your space? Shop the curated edition now.",
        "Upgrade your lifestyle. Premium quality meets effortless modern design."
    ],
    "minimal": [
        "Light. Space. Serenity.",
        "Subtle moments.",
        "Stillness speaks.",
        "Effortless elegance.",
        "In quiet focus.",
        "Less noise. More vision."
    ],
    "storytelling": [
        "It started as an ordinary afternoon, until the atmosphere shifted and the golden light swept across everything in view.",
        "There are places that speak not through sound, but through the gentle rhythm of how light meets space.",
        "We often rush past the details that tell the greatest stories. Today, time slowed down just long enough to capture this.",
        "Every frame holds a chapter that words struggle to capture. This was one of those unforgettable chapters.",
        "Looking back at this moment, you realize the best parts of life rarely require planning—they just happen."
    ]
}

PLATFORM_FORMATTING = {
    "instagram": {"prefix": "", "suffix": "\n\nShare your thoughts in the comments.", "emojis": False},
    "linkedin": {"prefix": "Key perspective: ", "suffix": "\n\nHow does your team navigate this? Let us know below.", "emojis": False},
    "twitter": {"prefix": "", "suffix": "", "emojis": False},
    "facebook": {"prefix": "", "suffix": "\n\nJoin the discussion with our community below.", "emojis": False},
    "blog": {"prefix": "Featured Insight: ", "suffix": "", "emojis": False},
    "advertisement": {"prefix": "Introducing the collection: ", "suffix": " Visit our link to learn more.", "emojis": False},
    "general": {"prefix": "", "suffix": "", "emojis": False}
}

def generate_captions_for_image(
    image: Image.Image,
    platform: str = "instagram",
    style: str = "creative",
    length: str = "medium",
    audience: str = "general",
    num_captions: int = 5,
    custom_brief: Optional[str] = None,
    filename: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main caption generation pipeline:
    1. PyTorch ResNet50 visual recognition extracts real entities & spatial feature map.
    2. Spatial feature map produces visual attention heatmap.
    3. Style & Platform engine expands into multiple tailored caption cards.
    4. Scoring engine computes AI Quality score breakdown.
    5. Hashtag engine extracts contextual tags matching the actual visual subject.
    """
    predictor = get_predictor()
    raw_caption, confidences, spatial_features, visual_meta = predictor.generate_raw_caption(
        image,
        filename=filename,
        custom_brief=custom_brief,
        platform=platform,
        style=style
    )
    
    # Generate attention heatmap
    try:
        heatmap_data = generate_attention_heatmap(image, spatial_features)
    except Exception as e:
        print(f"Heatmap generation error: {e}")
        heatmap_data = None

    # Style templates
    style_key = style.lower() if style.lower() in STYLE_TEMPLATES else "creative"
    plat_key = platform.lower() if platform.lower() in PLATFORM_FORMATTING else "instagram"
    plat_cfg = PLATFORM_FORMATTING[plat_key]

    # Generate distinct captions
    brief_clean = (custom_brief or "").strip()
    brief_lower = brief_clean.lower()
    is_career = any(w in brief_lower for w in ["open to work", "opentowork", "career", "job", "hiring", "hire", "work", "seeking", "opportunity", "opportunities", "role", "interview"])
    is_launch = any(w in brief_lower for w in ["launch", "release", "announcing", "product", "collection", "new"])
    is_portrait = visual_meta.get("domain") == "professional_portrait"

    # Format according to length safely without breaking sentences
    def format_by_length(text: str, target_len: str) -> str:
        text = text.strip()
        if target_len == "short":
            if "." in text:
                return text.split(".")[0].strip() + "."
            return text
        elif target_len == "long":
            if is_career:
                extension = " Grateful for the mentorship, community support, and lessons learned along the way. Looking forward to engaging discussions with industry peers and hiring teams."
            else:
                extension = " Capturing this perspective highlights how visual clarity and authentic atmosphere transform simple scenes into memorable stories."
            return text + extension
        return text

    candidate_texts = []

    if is_career:
        candidate_texts = [
            "I am excited to announce that I am officially open to work and actively seeking my next professional opportunity. Looking forward to connecting with teams, founders, and hiring leaders driving high-impact initiatives.",
            "Stepping into my next professional chapter: Open to work in roles centered around innovation, strategic execution, and cross-functional leadership.",
            "Growth is defined by the courage to embrace new challenges. As I explore upcoming opportunities, I am eager to bring dedication, technical rigor, and disciplined problem-solving to an ambitious team.",
            "Navigating this career milestone with focused clarity. Ready to contribute measurable value, build meaningful products, and accelerate mission-driven roadmaps.",
            "New chapter, new horizons. Open to work and excited to collaborate with forward-thinking organizations looking for high-ownership contributors."
        ]
    elif is_launch:
        candidate_texts = [
            f"Excited to introduce {brief_clean}: designed with disciplined craftsmanship, modern aesthetics, and performance in every detail.",
            f"Today marks a major milestone with the launch of {brief_clean}. Discover how thoughtful innovation redefines our standards.",
            f"Built for those who demand excellence: {brief_clean} is officially here. Experience elevated quality from day one.",
            f"A fresh perspective on modern design. Introducing {brief_clean}—curated for distinction and seamless utility.",
            f"The wait is over. Explore {brief_clean} and elevate your everyday experience."
        ]
    elif brief_clean:
        candidate_texts = [
            f"{raw_caption.capitalize()} — thoughtfully composed around {brief_clean}.",
            f"Capturing the essence of {brief_clean}: where focused execution meets refined visual balance.",
            f"Every detail matters when bringing {brief_clean} to life. A deliberate perspective on craft and modern style.",
            f"Turning vision into reality: celebrating {brief_clean} with clarity, intention, and authentic presence.",
            f"Rooted in purpose and elevated by design: a visual testament to {brief_clean}."
        ]
    elif is_portrait:
        candidate_texts = [
            "Leading with intention, discipline, and a commitment to continuous growth and excellence.",
            "Excellence is not an accident; it is the deliberate result of refined details, focused vision, and sustained execution.",
            "Framed by purpose: bringing strategic clarity and structured execution to every professional endeavor.",
            "Behind every milestone lies steady preparation, resilience, and dedication to fundamental craft.",
            "A measured perspective on leadership, innovation, and long-term value creation."
        ]
    else:
        # Standard visual style generation
        if style_key == "minimal":
            dl_first = f"{raw_caption.capitalize()}."
        elif style_key == "professional":
            dl_first = f"Demonstrating visual distinction: {raw_caption}."
        elif style_key == "promotional":
            dl_first = f"Discover the difference: {raw_caption}."
        elif style_key == "creative":
            dl_first = f"{raw_caption.capitalize()}."
        elif style_key == "inspirational":
            dl_first = f"A powerful visual testament: {raw_caption}."
        else:
            dl_first = f"{raw_caption.capitalize()}."
        candidate_texts.append(dl_first)

        templates = STYLE_TEMPLATES.get(style_key, STYLE_TEMPLATES["creative"]).copy()
        random.shuffle(templates)
        for tmpl in templates:
            if len(candidate_texts) >= num_captions:
                break
            candidate_texts.append(tmpl)

    while len(candidate_texts) < num_captions:
        candidate_texts.append(f"{raw_caption.capitalize()} — an authentic visual perspective.")

    candidate_texts = [format_by_length(t, length) for t in candidate_texts]

    # Package each caption card
    results = []
    for idx, text in enumerate(candidate_texts[:num_captions]):
        # Apply platform styling
        if plat_cfg["prefix"] and not text.startswith(plat_cfg["prefix"]):
            styled_text = plat_cfg["prefix"] + text
        else:
            styled_text = text
            
        if plat_cfg["suffix"] and not styled_text.endswith(plat_cfg["suffix"]):
            styled_text = styled_text + plat_cfg["suffix"]

        scores = calculate_quality_scores(
            caption_text=styled_text,
            raw_confidences=confidences,
            platform=platform,
            style=style,
            length_preference=length
        )

        tags = generate_hashtags(
            styled_text,
            platform=platform,
            style=style,
            audience=audience,
            visual_domain=visual_meta.get("domain"),
            visual_entities=visual_meta.get("top_labels_list"),
            max_tags=10
        )

        results.append({
            "id": f"cap_{idx+1}_{int(random.random()*10000)}",
            "caption": styled_text,
            "raw_text": text,
            "style": style,
            "platform": platform,
            "length": length,
            "audience": audience,
            "quality_score": scores["overall_score"],
            "quality_label": scores["label"],
            "score_breakdown": scores["breakdown"],
            "hashtags": tags,
            "is_favorite": False
        })

    # Global suggested hashtags for the image
    global_tags = generate_hashtags(
        raw_caption,
        platform=platform,
        style=style,
        audience=audience,
        visual_domain=visual_meta.get("domain"),
        visual_entities=visual_meta.get("top_labels_list"),
        max_tags=16
    )

    return {
        "raw_model_caption": raw_caption,
        "model_architecture": "ResNet50 Deep Learning Vision Classifier",
        "parameters": {
            "platform": platform,
            "style": style,
            "length": length,
            "audience": audience,
            "num_captions": num_captions
        },
        "captions": results,
        "suggested_hashtags": global_tags,
        "attention_heatmap": heatmap_data,
        "visual_meta": visual_meta,
        "checkpoint_status": {
            "is_loaded": predictor.is_loaded,
            "device": str(predictor.device),
            "vocab_size": len(predictor.vocab) if predictor.vocab else 0
        }
    }

def generate_seo_alt_text(image: Image.Image, page_topic: Optional[str] = None) -> Dict[str, Any]:
    """Generates human caption, accessibility Alt-Text, SEO description, and keywords."""
    predictor = get_predictor()
    raw_caption, _, _ = predictor.generate_raw_caption(image)
    
    clean_desc = raw_caption.capitalize()
    alt_text = f"Photo depicting {raw_caption}"
    seo_desc = f"High-resolution image showing {raw_caption}. Visual content optimized for digital storytelling and web accessibility."
    if page_topic:
        seo_desc += f" Featured in article on {page_topic}."
        alt_text += f" related to {page_topic}."

    words = [w for w in raw_caption.split() if len(w) > 3 and w not in ["with", "from", "into", "over"]]
    keywords = list(set(words + ["photography", "visual content", "digital asset", "high resolution"]))

    return {
        "human_caption": clean_desc,
        "alt_text": alt_text,
        "seo_description": seo_desc,
        "keywords": keywords
    }

def generate_ecommerce_copy(
    image: Image.Image,
    product_name: str,
    category: str,
    target_customer: str
) -> Dict[str, Any]:
    """Generates complete e-commerce product package."""
    predictor = get_predictor()
    raw_caption, _, _ = predictor.generate_raw_caption(image)

    product_caption = f"Introducing {product_name}: designed for {target_customer.lower()} who value excellence and modern craftsmanship."
    short_description = f"Premium {category.lower()} featuring refined materials and timeless aesthetics. Visual cues highlight: {raw_caption}."
    marketing_copy = f"Meet {product_name}. Engineered specifically for {target_customer.lower()}, this {category.lower()} combines everyday utility with high-end style. Whether at work or on the move, elevate your standards with unparalleled design."
    social_caption = f"Elegance in every stitch and silhouette. {product_name} is finally here. Tap to shop the new collection."
    seo_image_desc = f"{product_name} - {category} for {target_customer}. High-resolution product showcase featuring {raw_caption}."
    tags = [f"#{category.replace(' ', '')}", f"#{product_name.replace(' ', '')}", "#ProductDesign", "#ShopNow", "#PremiumQuality", "#NewArrival"]

    return {
        "product_name": product_name,
        "category": category,
        "target_customer": target_customer,
        "product_caption": product_caption,
        "short_description": short_description,
        "marketing_copy": marketing_copy,
        "social_caption": social_caption,
        "seo_description": seo_image_desc,
        "suggested_hashtags": tags
    }
