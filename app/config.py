import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Persistent storage:
# Local: ./data
# Render: /var/data
PERSISTENT_ROOT = Path(
    os.getenv("PERSISTENT_ROOT", str(BASE_DIR / "data"))
)

DATA_DIR = PERSISTENT_ROOT
UPLOAD_DIR = PERSISTENT_ROOT / "uploads"
THUMBNAIL_DIR = PERSISTENT_ROOT / "thumbnails"
EXPORT_DIR = PERSISTENT_ROOT / "exports"

STATIC_DIR = BASE_DIR / "static"

DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "wedding.db"

# Limits
MAX_PHOTOS_PER_GUEST = 25
MAX_VIDEOS_PER_GUEST = 2
MAX_PHOTO_SIZE_BYTES = 30 * 1024 * 1024
MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".m4v"}

AI_CATEGORIES = {
    "toasts": "🥂 Тосты и застолье",
    "dances": "💃 Танцы и веселье",
    "group": "👥 Гости и друзья",
    "decor": "💍 Детали и кольца",
    "cake": "🎂 Свадебный торт",
    "portrait": "👰 Молодожёны и портреты",
    "general": "✨ Моменты свадьбы"
}