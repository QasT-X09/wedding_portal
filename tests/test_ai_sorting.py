import io
from pathlib import Path
from PIL import Image
from fastapi.testclient import TestClient
from app.ai_tagger import classify_wedding_scene, create_thumbnail_and_dimensions
from app import config

def create_image_file(color, path: Path):
    img = Image.new("RGB", (400, 300), color=color)
    img.save(path, format="JPEG")

def test_thumbnail_generator():
    test_img_path = config.UPLOAD_DIR / "test_thumb_source.jpg"
    create_image_file((200, 200, 200), test_img_path)

    thumb_rel, w, h = create_thumbnail_and_dimensions(test_img_path, "photo")
    assert thumb_rel != ""
    assert w == 400
    assert h == 300
    
    thumb_full = config.BASE_DIR / thumb_rel
    assert thumb_full.exists()
    assert thumb_full.suffix == ".webp"

def test_scene_classifier_heuristics():
    white_img_path = config.UPLOAD_DIR / "white_dress.jpg"
    create_image_file((245, 245, 245), white_img_path)
    cat_white, tags_white = classify_wedding_scene(white_img_path, "photo")
    assert cat_white in ("portrait", "decor")
    assert any(t["tag"] in ("portrait", "decor") for t in tags_white)

    dark_img_path = config.UPLOAD_DIR / "disco_party.jpg"
    create_image_file((20, 20, 30), dark_img_path)
    cat_dark, tags_dark = classify_wedding_scene(dark_img_path, "photo")
    assert cat_dark == "dances"

    warm_img_path = config.UPLOAD_DIR / "toast_glasses.jpg"
    create_image_file((220, 160, 50), warm_img_path)
    cat_warm, tags_warm = classify_wedding_scene(warm_img_path, "photo")
    assert cat_warm == "toasts"

def test_media_filtering_by_category(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Категории Тест"}).json()
    guest_id = reg["id"]

    # Upload warm toast image
    img = Image.new("RGB", (100, 100), color=(220, 160, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    files = [("files", ("toast.jpg", buf.getvalue(), "image/jpeg"))]
    client.post("/api/upload", data={"guest_id": guest_id}, files=files)

    # Query all
    all_resp = client.get("/api/media")
    assert all_resp.status_code == 200
    assert all_resp.json()["total"] > 0

    # Query specific category
    toast_resp = client.get("/api/media?category=toasts")
    assert toast_resp.status_code == 200
    for item in toast_resp.json()["items"]:
        assert item["category"] == "toasts"
