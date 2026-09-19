import os
import uuid
import json
import asyncio
import zipfile
from io import BytesIO
from pathlib import Path
from typing import List, Optional
import random

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import qrcode
from PIL import Image

from app import config
from app.config import (
    MAX_PHOTOS_PER_GUEST, MAX_VIDEOS_PER_GUEST,
    MAX_PHOTO_SIZE_BYTES, MAX_VIDEO_SIZE_BYTES,
    ALLOWED_IMAGE_EXTENSIONS, ALLOWED_VIDEO_EXTENSIONS,
    AI_CATEGORIES
)
from app.database import init_db, get_db_connection
from app.schemas import GuestCreate, GuestResponse, MediaItem
from app.ai_tagger import calculate_file_hash, create_thumbnail_and_dimensions, classify_wedding_scene
from app.sse_manager import sse_manager

app = FastAPI(title="Wedding Guest Media Portal", version="1.0.0")

# Enable CORS for local testing & multi-device access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PASTEL_COLORS = [
    "#D4AF37", "#E0A96D", "#C5A059", "#C89666",
    "#D98880", "#C39BD3", "#7FB3D5", "#76D7C4",
    "#F7DC6F", "#F8C471", "#E59866", "#D7BDE2"
]

@app.on_event("startup")
def on_startup():
    init_db()

# Mount Static Directories
app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")
app.mount("/thumbnails", StaticFiles(directory=str(config.THUMBNAIL_DIR)), name="thumbnails")
app.mount("/static", StaticFiles(directory=str(config.STATIC_DIR)), name="static")

carousel_dir = config.STATIC_DIR / "dist" / "carousel"
if carousel_dir.exists():
    app.mount("/carousel", StaticFiles(directory=str(carousel_dir)), name="carousel")

dist_assets = config.STATIC_DIR / "dist" / "assets"
if dist_assets.exists():
    app.mount("/assets", StaticFiles(directory=str(dist_assets)), name="assets")

@app.get("/")
def read_root():
    dist_index = config.STATIC_DIR / "dist" / "index.html"
    if dist_index.exists():
        return FileResponse(dist_index)
    return FileResponse(config.STATIC_DIR / "index.html")

@app.post("/api/guests", response_model=GuestResponse)
def create_or_get_guest(guest_in: GuestCreate):
    cleaned_name = guest_in.name.strip()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM guests WHERE LOWER(name) = LOWER(?)", (cleaned_name,))
        row = cursor.fetchone()
        
        if row:
            guest_id = row["id"]
            # Update wishes if provided
            if guest_in.wishes and not row["wishes"]:
                cursor.execute("UPDATE guests SET wishes = ?, table_number = ? WHERE id = ?",
                               (guest_in.wishes, guest_in.table_number or row["table_number"], guest_id))
                conn.commit()
            avatar_color = row["avatar_color"]
            table_number = row["table_number"]
            wishes = row["wishes"]
        else:
            guest_id = str(uuid.uuid4())
            avatar_color = random.choice(PASTEL_COLORS)
            table_number = guest_in.table_number or ""
            wishes = guest_in.wishes or ""
            cursor.execute(
                "INSERT INTO guests (id, name, table_number, wishes, avatar_color) VALUES (?, ?, ?, ?, ?)",
                (guest_id, cleaned_name, table_number, wishes, avatar_color)
            )
            conn.commit()

        # Count current uploads
        cursor.execute(
            "SELECT media_type, COUNT(*) as cnt FROM media WHERE guest_id = ? GROUP BY media_type",
            (guest_id,)
        )
        counts = {r["media_type"]: r["cnt"] for r in cursor.fetchall()}
        photos_uploaded = counts.get("photo", 0)
        videos_uploaded = counts.get("video", 0)

        return GuestResponse(
            id=guest_id,
            name=cleaned_name,
            table_number=table_number,
            wishes=wishes,
            avatar_color=avatar_color,
            photos_uploaded=photos_uploaded,
            videos_uploaded=videos_uploaded,
            max_photos=MAX_PHOTOS_PER_GUEST,
            max_videos=MAX_VIDEOS_PER_GUEST
        )

@app.get("/api/guests/{guest_id}", response_model=GuestResponse)
def get_guest(guest_id: str):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM guests WHERE id = ?", (guest_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Гость не найден")
        
        cursor.execute(
            "SELECT media_type, COUNT(*) as cnt FROM media WHERE guest_id = ? GROUP BY media_type",
            (guest_id,)
        )
        counts = {r["media_type"]: r["cnt"] for r in cursor.fetchall()}
        return GuestResponse(
            id=row["id"],
            name=row["name"],
            table_number=row["table_number"],
            wishes=row["wishes"],
            avatar_color=row["avatar_color"],
            photos_uploaded=counts.get("photo", 0),
            videos_uploaded=counts.get("video", 0),
            max_photos=MAX_PHOTOS_PER_GUEST,
            max_videos=MAX_VIDEOS_PER_GUEST
        )

@app.post("/api/upload")
async def upload_media(
    guest_id: str = Form(...),
    wedding_phase: Optional[str] = Form("banquet"),
    files: List[UploadFile] = File(...)
):
    if not files:
        raise HTTPException(status_code=400, detail="Файлы для загрузки не предоставлены")

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM guests WHERE id = ?", (guest_id,))
        guest = cursor.fetchone()
        if not guest:
            raise HTTPException(status_code=404, detail="Гость не найден. Сначала введите имя.")

        cursor.execute(
            "SELECT media_type, COUNT(*) as cnt FROM media WHERE guest_id = ? GROUP BY media_type",
            (guest_id,)
        )
        counts = {r["media_type"]: r["cnt"] for r in cursor.fetchall()}
        current_photos = counts.get("photo", 0)
        current_videos = counts.get("video", 0)

        # Pre-validate file types and quotas
        incoming_photos = 0
        incoming_videos = 0

        for f in files:
            ext = Path(f.filename).suffix.lower()
            if ext in ALLOWED_IMAGE_EXTENSIONS:
                incoming_photos += 1
            elif ext in ALLOWED_VIDEO_EXTENSIONS:
                incoming_videos += 1
            else:
                raise HTTPException(status_code=400, detail=f"Формат файла {f.filename} не поддерживается")

        if current_photos + incoming_photos > MAX_PHOTOS_PER_GUEST:
            raise HTTPException(
                status_code=400,
                detail=f"Превышен лимит фото! Разрешено максимум {MAX_PHOTOS_PER_GUEST} фото (у вас уже {current_photos})"
            )

        if current_videos + incoming_videos > MAX_VIDEOS_PER_GUEST:
            raise HTTPException(
                status_code=400,
                detail=f"Превышен лимит видео! Разрешено максимум {MAX_VIDEOS_PER_GUEST} видео (у вас уже {current_videos})"
            )

        # Create guest folder on disk
        safe_guest_name = "".join(c for c in guest["name"] if c.isalnum() or c in (' ', '_', '-')).strip()
        guest_dir = config.UPLOAD_DIR / f"{safe_guest_name}_{guest_id[:8]}"
        photos_dir = guest_dir / "photos"
        videos_dir = guest_dir / "videos"
        photos_dir.mkdir(parents=True, exist_ok=True)
        videos_dir.mkdir(parents=True, exist_ok=True)

        uploaded_records = []

        for f in files:
            ext = Path(f.filename).suffix.lower()
            is_video = ext in ALLOWED_VIDEO_EXTENSIONS
            media_type = "video" if is_video else "photo"
            target_subfolder = videos_dir if is_video else photos_dir

            media_id = str(uuid.uuid4())
            stored_filename = f"{media_id[:8]}_{Path(f.filename).name}"
            stored_file_path = target_subfolder / stored_filename

            # Stream instead of buffering a whole 500 MB video in server memory.
            # The temporary file is removed immediately if the limit is exceeded.
            max_size = MAX_VIDEO_SIZE_BYTES if is_video else MAX_PHOTO_SIZE_BYTES
            size = 0
            try:
                with open(stored_file_path, "wb") as out:
                    while chunk := await f.read(1024 * 1024):
                        size += len(chunk)
                        if size > max_size:
                            raise HTTPException(
                                status_code=400,
                                detail=(
                                    f"{'Видео' if is_video else 'Фото'} {f.filename} "
                                    f"превышает {max_size // (1024 * 1024)} МБ"
                                ),
                            )
                        out.write(chunk)
            except Exception:
                stored_file_path.unlink(missing_ok=True)
                raise

            # Check duplicate hash
            file_hash = calculate_file_hash(stored_file_path)
            cursor.execute("SELECT id FROM media WHERE file_hash = ? AND guest_id = ?", (file_hash, guest_id))
            if cursor.fetchone():
                stored_file_path.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail=f"Файл {f.filename} уже был загружен ранее")

            # Thumbnail and AI classification
            thumb_rel, width, height = create_thumbnail_and_dimensions(stored_file_path, media_type)
            category, tags = classify_wedding_scene(stored_file_path, media_type)

            rel_file_path = f"uploads/{guest_dir.name}/{'videos' if is_video else 'photos'}/{stored_filename}"

            cursor.execute("""
                INSERT INTO media (
                    id, guest_id, media_type, original_filename, file_path,
                    thumbnail_path, file_size, mime_type, width, height,
                    file_hash, category, wedding_phase, is_approved
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (
                media_id, guest_id, media_type, f.filename, rel_file_path,
                thumb_rel, size, f.content_type or "application/octet-stream",
                width, height, file_hash, category, wedding_phase
            ))

            for t in tags:
                cursor.execute(
                    "INSERT INTO media_tags (id, media_id, tag, confidence) VALUES (?, ?, ?, ?)",
                    (str(uuid.uuid4()), media_id, t["tag"], t["confidence"])
                )

            # Add to live queue for projector
            cursor.execute(
                "INSERT INTO live_queue (id, media_id, display_count) VALUES (?, ?, 0)",
                (str(uuid.uuid4()), media_id)
            )

            conn.commit()

            media_payload = {
                "id": media_id,
                "guest_id": guest_id,
                "guest_name": guest["name"],
                "table_number": guest["table_number"],
                "wishes": guest["wishes"],
                "media_type": media_type,
                "original_filename": f.filename,
                "file_url": f"/{rel_file_path}",
                "thumbnail_url": f"/{thumb_rel}" if thumb_rel else f"/{rel_file_path}",
                "category": category,
                "category_label": AI_CATEGORIES.get(category, category),
                "tags": tags,
                "wedding_phase": wedding_phase
            }
            uploaded_records.append(media_payload)

            # Broadcast SSE event for real-time projector live wall
            await sse_manager.broadcast("new_media", media_payload)

        # Refresh counts
        cursor.execute(
            "SELECT media_type, COUNT(*) as cnt FROM media WHERE guest_id = ? GROUP BY media_type",
            (guest_id,)
        )
        new_counts = {r["media_type"]: r["cnt"] for r in cursor.fetchall()}

        return {
            "success": True,
            "uploaded": uploaded_records,
            "quota": {
                "photos_uploaded": new_counts.get("photo", 0),
                "videos_uploaded": new_counts.get("video", 0),
                "max_photos": MAX_PHOTOS_PER_GUEST,
                "max_videos": MAX_VIDEOS_PER_GUEST,
                "photos_remaining": MAX_PHOTOS_PER_GUEST - new_counts.get("photo", 0),
                "videos_remaining": MAX_VIDEOS_PER_GUEST - new_counts.get("video", 0)
            }
        }

@app.get("/api/media")
def list_media(
    category: Optional[str] = None,
    guest_id: Optional[str] = None,
    media_type: Optional[str] = None,
    wedding_phase: Optional[str] = None
):
    query = """
        SELECT m.*, g.name as guest_name, g.table_number, g.wishes, g.avatar_color
        FROM media m
        JOIN guests g ON m.guest_id = g.id
        WHERE 1=1
    """
    params = []
    if category and category != "all":
        query += " AND m.category = ?"
        params.append(category)
    if guest_id:
        query += " AND m.guest_id = ?"
        params.append(guest_id)
    if media_type:
        query += " AND m.media_type = ?"
        params.append(media_type)
    if wedding_phase:
        query += " AND m.wedding_phase = ?"
        params.append(wedding_phase)

    query += " ORDER BY m.created_at DESC"

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            # Fetch tags
            cursor.execute("SELECT tag, confidence FROM media_tags WHERE media_id = ?", (r["id"],))
            tags = [{"tag": tr["tag"], "confidence": tr["confidence"]} for tr in cursor.fetchall()]
            results.append({
                "id": r["id"],
                "guest_id": r["guest_id"],
                "guest_name": r["guest_name"],
                "table_number": r["table_number"],
                "wishes": r["wishes"],
                "avatar_color": r["avatar_color"],
                "media_type": r["media_type"],
                "original_filename": r["original_filename"],
                "file_url": f"/{r['file_path']}",
                "thumbnail_url": f"/{r['thumbnail_path']}" if r["thumbnail_path"] else f"/{r['file_path']}",
                "category": r["category"],
                "category_label": AI_CATEGORIES.get(r["category"], r["category"]),
                "wedding_phase": r["wedding_phase"],
                "created_at": r["created_at"],
                "tags": tags
            })
        return {
            "total": len(results),
            "categories": AI_CATEGORIES,
            "items": results
        }

@app.get("/api/live/stream")
async def live_stream(request: Request):
    """Server-Sent Events endpoint for Live Slideshow on Projector"""
    queue = sse_manager.subscribe()

    async def event_generator():
        try:
            # Send initial greeting & ping
            yield "event: connected\ndata: {\"status\": \"ready\", \"mode\": \"projector_live\"}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    # Wait for next event or send ping every 15s
                    msg = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield msg
                except asyncio.TimeoutError:
                    yield "event: ping\ndata: {}\n\n"
        finally:
            sse_manager.unsubscribe(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/live/queue")
def get_live_queue(limit: int = 50):
    """Returns approved media items for the projector rotation"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, g.name as guest_name, g.table_number, g.wishes, g.avatar_color
            FROM media m
            JOIN guests g ON m.guest_id = g.id
            WHERE m.is_approved = 1
            ORDER BY m.created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [
            {
                "id": r["id"],
                "guest_name": r["guest_name"],
                "table_number": r["table_number"],
                "wishes": r["wishes"],
                "avatar_color": r["avatar_color"],
                "media_type": r["media_type"],
                "file_url": f"/{r['file_path']}",
                "thumbnail_url": f"/{r['thumbnail_path']}" if r["thumbnail_path"] else f"/{r['file_path']}",
                "category": r["category"],
                "category_label": AI_CATEGORIES.get(r["category"], r["category"])
            }
            for r in rows
        ]

@app.get("/api/export/zip")
def export_zip(category: Optional[str] = None):
    """Generates a downloadable ZIP archive of wedding photos"""
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            sql = "SELECT m.*, g.name as guest_name FROM media m JOIN guests g ON m.guest_id = g.id"
            params = []
            if category and category != "all":
                sql += " WHERE m.category = ?"
                params.append(category)
            cursor.execute(sql, params)
            rows = cursor.fetchall()

            for r in rows:
               file_disk_path = config.PERSISTENT_ROOT / r["file_path"]
        if file_disk_path.exists():
                    guest_folder = f"{r['guest_name']}_{r['guest_id'][:6]}"
                    cat_folder = r['category']
                    archive_name = f"{cat_folder}/{guest_folder}/{r['original_filename']}"
                    zf.write(file_disk_path, arcname=archive_name)

    buffer.seek(0)
    filename = f"wedding_media_{category or 'all'}.zip"
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/qr")
def generate_qr(request: Request, url: Optional[str] = None):
    """Generates an aesthetic wedding styled QR code image"""
    target_url = url or str(request.base_url)
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#2C3E50", back_color="#FAF7F2").convert("RGB")
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
