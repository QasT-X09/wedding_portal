import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient

def create_sample_image(color=(255, 255, 255), size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_guest_registration_and_get(client: TestClient):
    resp = client.post("/api/guests", json={
        "name": "Алексей и Анна",
        "table_number": "Стол 3",
        "wishes": "Счастья молодым!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Алексей и Анна"
    assert data["table_number"] == "Стол 3"
    assert data["photos_uploaded"] == 0
    assert data["max_photos"] == 25
    assert data["max_videos"] == 10
    guest_id = data["id"]

    # Verify GET guest
    get_resp = client.get(f"/api/guests/{guest_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == guest_id

def test_upload_success_and_quota_update(client: TestClient):
    # Register guest
    reg = client.post("/api/guests", json={"name": "Дмитрий Смирнов"}).json()
    guest_id = reg["id"]

    img_data1 = create_sample_image(color=(200, 100, 50))
    img_data2 = create_sample_image(color=(50, 150, 200))

    files = [
        ("files", ("photo1.jpg", img_data1, "image/jpeg")),
        ("files", ("photo2.jpg", img_data2, "image/jpeg"))
    ]
    resp = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert len(res["uploaded"]) == 2
    assert res["quota"]["photos_uploaded"] == 2
    assert res["quota"]["photos_remaining"] == 23

def test_duplicate_file_prevention(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Елена Морозова"}).json()
    guest_id = reg["id"]

    img_data = create_sample_image(color=(123, 45, 67))
    files = [("files", ("unique.jpg", img_data, "image/jpeg"))]

    # First upload works
    r1 = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert r1.status_code == 200

    # Second upload of same file content should be rejected as duplicate
    r2 = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert r2.status_code == 400
    assert "уже был загружен ранее" in r2.json()["detail"]

def test_photo_limit_exceeded(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Максим Тестовый"}).json()
    guest_id = reg["id"]

    # Generate 26 small images
    files = []
    for i in range(26):
        img_bytes = create_sample_image(color=(i * 8, 100, 100), size=(10, 10))
        files.append(("files", (f"img_{i}.jpg", img_bytes, "image/jpeg")))

    resp = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert resp.status_code == 400
    assert "Превышен лимит фото" in resp.json()["detail"]

def test_video_limit_exceeded(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Ольга Видео"}).json()
    guest_id = reg["id"]

    files = []
    for i in range(11):
        files.append(("files", (f"clip_{i}.mp4", b"fake_mp4_video_content_" + bytes([i]), "video/mp4")))

    resp = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert resp.status_code == 400
    assert "Превышен лимит видео" in resp.json()["detail"]

def test_unsupported_file_extension(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Хакер"}).json()
    guest_id = reg["id"]

    files = [("files", ("script.exe", b"executable_binary", "application/octet-stream"))]
    resp = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert resp.status_code == 400
    assert "не поддерживается" in resp.json()["detail"]
