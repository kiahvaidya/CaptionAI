import os
import random
import uuid
import datetime
from backend.database.db import init_db, get_db_connection

def seed_database():
    init_db()
    conn = get_db_connection()
    c = conn.cursor()

    # Ensure user exists
    c.execute("SELECT COUNT(*) as cnt FROM users")
    if c.fetchone()["cnt"] == 0:
        c.execute("""
        INSERT INTO users (name, email, password_hash, tier, api_key, images_processed, captions_generated)
        VALUES ('Alex Morgan', 'demo@captionai.com', 'demo_hash_xyz', 'pro', 'cpt_live_9f81a8b24ef093c1', 1284, 5920)
        """)

    # Check if generations already exist
    c.execute("SELECT COUNT(*) as cnt FROM generations")
    if c.fetchone()["cnt"] == 0:
        print("[*] Seeding sample history generations...")

        sample_items = [
            {
                "image_name": "sunset_coast.jpg",
                "raw_caption": "a person standing on the beach during a beautiful golden sunset",
                "platform": "instagram",
                "style": "creative",
                "length": "medium",
                "audience": "Travel audience",
                "best_caption": "Chasing sunsets and collecting moments by the coast. The horizon reminds us that every ending is a fresh beginning.",
                "is_favorite": 1,
                "days_ago": 1,
                "captions": [
                    ("Chasing sunsets and collecting moments by the coast.", 96.4),
                    ("Where natural beauty whispers and quiet peace begins.", 94.1),
                    ("Golden hours, gentle tides, and unforgettable memories.", 92.8)
                ]
            },
            {
                "image_name": "golden_retriever_park.jpg",
                "raw_caption": "a happy dog running across green grass in a sunny park",
                "platform": "facebook",
                "style": "casual",
                "length": "short",
                "audience": "General",
                "best_caption": "Pure joy in motion. Nothing beats a sunny afternoon sprint in the park.",
                "is_favorite": 1,
                "days_ago": 2,
                "captions": [
                    ("Pure joy in motion. Afternoon mood in the park.", 95.0),
                    ("Good companion enjoying the fresh breeze.", 93.5),
                    ("Living life at top speed outdoors.", 91.2)
                ]
            },
            {
                "image_name": "executive_workspace.jpg",
                "raw_caption": "a woman sitting at a table with coffee and laptop in a modern room",
                "platform": "linkedin",
                "style": "professional",
                "length": "medium",
                "audience": "Professionals",
                "best_caption": "Strategic clarity begins with disciplined focus. When your environment aligns with your ambition, deep work follows naturally.",
                "is_favorite": 0,
                "days_ago": 3,
                "captions": [
                    ("Strategic clarity begins with disciplined focus.", 97.2),
                    ("Innovation is born in quiet hours of continuous execution.", 94.8),
                    ("Designing workflows that cultivate calm and deliver impact.", 93.0)
                ]
            },
            {
                "image_name": "minimalist_leather_tote.jpg",
                "raw_caption": "a stylish leather bag placed on a clean minimalist surface",
                "platform": "advertisement",
                "style": "promotional",
                "length": "medium",
                "audience": "Fashion audience",
                "best_caption": "Crafted with full-grain Italian leather and architectural precision. Designed to elevate every journey.",
                "is_favorite": 1,
                "days_ago": 4,
                "captions": [
                    ("Crafted with full-grain Italian leather.", 98.1),
                    ("Timeless silhouette meets modern utility.", 95.4),
                    ("Upgrade your everyday essentials with quiet luxury.", 94.0)
                ]
            },
            {
                "image_name": "mountain_vista_sunrise.jpg",
                "raw_caption": "a majestic mountain peak covered in morning clouds and bright sunlight",
                "platform": "twitter",
                "style": "inspirational",
                "length": "short",
                "audience": "Travel audience",
                "best_caption": "High altitudes, clear thoughts. The mountain teaches that resilience is a quiet habit.",
                "is_favorite": 0,
                "days_ago": 5,
                "captions": [
                    ("High altitudes, clear thoughts. Keep climbing.", 94.2),
                    ("The climb is steep, but the view is unmatched.", 92.5)
                ]
            }
        ]

        # Preset image thumbnail SVG placeholders for clean rendering
        def make_svg_placeholder(color, text):
            return f"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='{color}'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23ffffff' font-weight='bold' text-anchor='middle' dy='.3em'>{text}</text></svg>"

        colors = ["%23f97316", "%2310b981", "%233b82f6", "%238b5cf6", "%23ec4899"]

        now = datetime.datetime.now()
        for idx, item in enumerate(sample_items):
            gen_id = f"gen_{uuid.uuid4().hex[:10]}"
            created_time = (now - datetime.timedelta(days=item["days_ago"], hours=random.randint(1, 8))).strftime("%Y-%m-%d %H:%M:%S")
            svg_data = make_svg_placeholder(colors[idx % len(colors)], item["image_name"])

            c.execute("""
            INSERT INTO generations (id, user_id, image_name, image_data_url, raw_caption, platform, style, length, audience, best_caption, is_favorite, created_at)
            VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (gen_id, item["image_name"], svg_data, item["raw_caption"], item["platform"], item["style"], item["length"], item["audience"], item["best_caption"], item["is_favorite"], created_time))

            for cap_text, score in item["captions"]:
                cap_id = f"cap_{uuid.uuid4().hex[:8]}"
                c.execute("""
                INSERT INTO captions (id, generation_id, caption_text, platform, style, quality_score, is_favorite, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (cap_id, gen_id, cap_text, item["platform"], item["style"], score, item["is_favorite"], created_time))

        # Seed campaigns
        c.execute("""
        INSERT INTO campaigns (id, user_id, name, product_service, target_audience, objective, platform, tone, images_count, captions_count, status)
        VALUES 
        ('cmp_summer26', 1, 'Summer Collection 2026', 'Premium Sunglasses & Apparel', 'Young professionals & travelers', 'Product Launch', 'Instagram', 'Premium + Energetic', 12, 48, 'active'),
        ('cmp_b2b_q3', 1, 'Enterprise Workflow Automation', 'SaaS Productivity Suite', 'CTOs & Operations Leaders', 'Lead Generation', 'LinkedIn', 'Authoritative & Professional', 8, 32, 'active'),
        ('cmp_coffeerev', 1, 'Artisan Single-Origin Coffee', 'Specialty Coffee Lovers', 'Global Coffee Community', 'Brand Storytelling', 'Instagram', 'Warm & Artisanal', 15, 60, 'completed')
        """)

        # Seed usage analytics events
        platforms = ["instagram", "instagram", "instagram", "linkedin", "linkedin", "twitter", "facebook", "blog", "advertisement"]
        styles = ["creative", "creative", "professional", "professional", "casual", "promotional", "minimal", "inspirational"]

        for _ in range(80):
            p = random.choice(platforms)
            s = random.choice(styles)
            lat = round(random.uniform(1.8, 2.9), 2)
            days_back = random.randint(0, 14)
            evt_time = (now - datetime.timedelta(days=days_back, minutes=random.randint(5, 720))).strftime("%Y-%m-%d %H:%M:%S")
            c.execute("""
            INSERT INTO usage_events (user_id, event_type, platform, style, latency_sec, created_at)
            VALUES (1, 'caption_generation', ?, ?, ?, ?)
            """, (p, s, lat, evt_time))

        conn.commit()
        print("[+] Sample seed data populated successfully!")

    conn.close()

if __name__ == "__main__":
    seed_database()
