import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = BASE_DIR / "uploads"
THUMBNAIL_DIR = BASE_DIR / "thumbnails"
EXPORT_DIR = BASE_DIR / "exports"
STATIC_DIR = BASE_DIR / "static"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "wedding.db"

# Limits according to user requirements
MAX_PHOTOS_PER_GUEST = 25
MAX_VIDEOS_PER_GUEST = 10
MAX_PHOTO_SIZE_BYTES = 30 * 1024 * 1024       # 30 MB
MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024      # 500 MB

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".m4v"}

# Categories
AI_CATEGORIES = {
    "toasts": "🥂 Тосты и застолье",
    "dances": "💃 Танцы и веселье",
    "group": "👥 Гости и друзья",
    "decor": "💍 Детали и кольца",
    "cake": "🎂 Свадебный торт",
    "portrait": "👰 Молодожёны и портреты",
    "general": "✨ Моменты свадьбы"
}
