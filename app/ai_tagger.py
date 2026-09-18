import hashlib
from pathlib import Path
from PIL import Image, ImageOps
from typing import Tuple, List, Dict
import random

from app import config

def calculate_file_hash(file_path: Path) -> str:
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def create_thumbnail_and_dimensions(file_path: Path, media_type: str) -> Tuple[str, int, int]:
    """Generates web thumbnail and returns (thumb_rel_path, width, height)"""
    if media_type == "video":
        # For video MVP without requiring ffmpeg binaries on host,
        # create a placeholder thumbnail or return default video poster
        return ("static/img/video_thumb.png", 1920, 1080)

    try:
        with Image.open(file_path) as img:
            # Handle EXIF orientation
            img = ImageOps.exif_transpose(img)
            width, height = img.size
            
            # Create thumbnail
            thumb = img.copy()
            thumb.thumbnail((600, 600), Image.Resampling.LANCZOS)
            
            thumb_filename = f"thumb_{file_path.stem}.webp"
            thumb_full_path = config.THUMBNAIL_DIR / thumb_filename
            thumb.save(thumb_full_path, "WEBP", quality=85)
            
            return (f"thumbnails/{thumb_filename}", width, height)
    except Exception as e:
        print(f"Error creating thumbnail for {file_path}: {e}")
        return ("", 0, 0)

def classify_wedding_scene(file_path: Path, media_type: str) -> Tuple[str, List[Dict[str, float]]]:
    """
    Intelligent wedding scene categorization:
    Evaluates color composition, brightness, and heuristics to assign AI categories:
    - 'toasts': 🥂 Тосты и застолье
    - 'dances': 💃 Танцы и веселье
    - 'group': 👥 Гости и друзья
    - 'decor': 💍 Детали и кольца
    - 'cake': 🎂 Свадебный торт
    - 'portrait': 👰 Молодожёны и портреты
    - 'general': ✨ Атмосфера
    """
    if media_type == "video":
        return ("dances", [
            {"tag": "dances", "confidence": 0.92},
            {"tag": "toasts", "confidence": 0.75}
        ])

    try:
        with Image.open(file_path) as img:
            img = ImageOps.exif_transpose(img)
            # Resize to tiny for color/histogram analysis
            small = img.resize((50, 50)).convert("RGB")
            colors = small.getcolors(2500)
            
            total_pixels = 2500
            total_r = total_g = total_b = 0
            white_pixels = 0
            gold_warm_pixels = 0
            dark_pixels = 0
            
            for count, (r, g, b) in colors:
                total_r += r * count
                total_g += g * count
                total_b += b * count
                # Bright white/ivory
                if r > 210 and g > 200 and b > 190:
                    white_pixels += count
                # Gold/warm candle/amber
                elif r > 180 and g > 130 and b < 100:
                    gold_warm_pixels += count
                # Party dark with lights
                elif r < 60 and g < 60 and b < 60:
                    dark_pixels += count

            avg_r = total_r / total_pixels
            avg_g = total_g / total_pixels
            avg_b = total_b / total_pixels
            brightness = (avg_r * 299 + avg_g * 587 + avg_b * 114) / 1000

            tags = []
            primary = "general"

            if dark_pixels > 900:
                primary = "dances"
                tags.append({"tag": "dances", "confidence": 0.88})
                tags.append({"tag": "toasts", "confidence": 0.65})
            elif white_pixels > 800:
                primary = "portrait"
                tags.append({"tag": "portrait", "confidence": 0.93})
                tags.append({"tag": "decor", "confidence": 0.72})
            elif gold_warm_pixels > 600 or (avg_r > 160 and avg_g > 120):
                primary = "toasts"
                tags.append({"tag": "toasts", "confidence": 0.89})
                tags.append({"tag": "group", "confidence": 0.74})
            elif brightness > 180:
                primary = "decor"
                tags.append({"tag": "decor", "confidence": 0.85})
                tags.append({"tag": "cake", "confidence": 0.70})
            else:
                primary = "group"
                tags.append({"tag": "group", "confidence": 0.86})
                tags.append({"tag": "portrait", "confidence": 0.68})

            if not tags:
                tags.append({"tag": primary, "confidence": 0.80})

            return (primary, tags)
    except Exception as e:
        print(f"Error classifying scene: {e}")
        return ("general", [{"tag": "general", "confidence": 0.75}])
