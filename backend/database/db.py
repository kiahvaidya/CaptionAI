import sqlite3
import os
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "captionai.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        tier TEXT DEFAULT 'pro',
        api_key TEXT,
        brand_name TEXT DEFAULT 'Acme Studio',
        default_platform TEXT DEFAULT 'instagram',
        default_style TEXT DEFAULT 'creative',
        instagram_connected INTEGER DEFAULT 1,
        linkedin_connected INTEGER DEFAULT 0,
        twitter_connected INTEGER DEFAULT 0,
        notify_on_generation INTEGER DEFAULT 1,
        images_processed INTEGER DEFAULT 0,
        captions_generated INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Migrations for existing database
    existing_cols = [row[1] for row in cursor.execute("PRAGMA table_info(users)").fetchall()]
    for col, col_type in [
        ("brand_name", "TEXT DEFAULT 'Acme Studio'"),
        ("default_platform", "TEXT DEFAULT 'instagram'"),
        ("default_style", "TEXT DEFAULT 'creative'"),
        ("instagram_connected", "INTEGER DEFAULT 1"),
        ("linkedin_connected", "INTEGER DEFAULT 0"),
        ("twitter_connected", "INTEGER DEFAULT 0"),
        ("notify_on_generation", "INTEGER DEFAULT 1")
    ]:
        if col not in existing_cols:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {col_type};")

    # Generations (Image upload session)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS generations (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        image_name TEXT,
        image_data_url TEXT,
        raw_caption TEXT,
        platform TEXT,
        style TEXT,
        length TEXT,
        audience TEXT,
        best_caption TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Captions individual records
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS captions (
        id TEXT PRIMARY KEY,
        generation_id TEXT,
        caption_text TEXT NOT NULL,
        platform TEXT,
        style TEXT,
        quality_score REAL,
        is_favorite INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (generation_id) REFERENCES generations(id) ON DELETE CASCADE
    );
    """)

    # Marketing Campaigns
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        name TEXT NOT NULL,
        product_service TEXT,
        target_audience TEXT,
        objective TEXT,
        platform TEXT,
        tone TEXT,
        images_count INTEGER DEFAULT 0,
        captions_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Usage stats / Analytics events
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usage_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT,
        platform TEXT,
        style TEXT,
        latency_sec REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    conn.commit()
    conn.close()
    print("[+] SQLite Database initialized at:", DB_PATH)

if __name__ == "__main__":
    init_db()
