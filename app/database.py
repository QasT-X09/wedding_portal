import sqlite3
import contextlib
from typing import Generator
from app import config

def init_db(db_path=None):
    target_path = db_path or config.DB_PATH
    conn = sqlite3.connect(target_path)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    with conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS guests (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            table_number TEXT DEFAULT '',
            wishes TEXT DEFAULT '',
            avatar_color TEXT DEFAULT '#E0A96D',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS media (
            id TEXT PRIMARY KEY,
            guest_id TEXT NOT NULL,
            media_type TEXT NOT NULL,
            original_filename TEXT NOT NULL,
            file_path TEXT NOT NULL,
            thumbnail_path TEXT,
            file_size INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            width INTEGER DEFAULT 0,
            height INTEGER DEFAULT 0,
            file_hash TEXT,
            category TEXT DEFAULT 'general',
            wedding_phase TEXT DEFAULT 'banquet',
            is_approved INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(guest_id) REFERENCES guests(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS media_tags (
            id TEXT PRIMARY KEY,
            media_id TEXT NOT NULL,
            tag TEXT NOT NULL,
            confidence REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS live_queue (
            id TEXT PRIMARY KEY,
            media_id TEXT NOT NULL UNIQUE,
            display_count INTEGER DEFAULT 0,
            last_displayed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_media_guest ON media(guest_id);
        CREATE INDEX IF NOT EXISTS idx_media_type ON media(media_type);
        CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
        CREATE INDEX IF NOT EXISTS idx_media_hash ON media(file_hash);
        """)
    conn.close()

@contextlib.contextmanager
def get_db_connection(db_path=None) -> Generator[sqlite3.Connection, None, None]:
    target_path = db_path or config.DB_PATH
    conn = sqlite3.connect(target_path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON;")
    try:
        yield conn
    finally:
        conn.close()
