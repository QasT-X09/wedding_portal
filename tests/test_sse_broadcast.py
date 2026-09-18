import io
from PIL import Image
from fastapi.testclient import TestClient
from app.sse_manager import sse_manager

def test_qr_code_endpoint(client: TestClient):
    resp = client.get("/api/qr")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "image/png"
    assert len(resp.content) > 100

def test_live_queue_and_zip_export(client: TestClient):
    reg = client.post("/api/guests", json={"name": "Сергей Васильев", "wishes": "Любви и радости!"}).json()
    guest_id = reg["id"]

    # Upload test image
    img = Image.new("RGB", (150, 150), color=(100, 200, 100))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    files = [("files", ("celebration.jpg", buf.getvalue(), "image/jpeg"))]
    up_resp = client.post("/api/upload", data={"guest_id": guest_id}, files=files)
    assert up_resp.status_code == 200

    # Verify live queue
    q_resp = client.get("/api/live/queue")
    assert q_resp.status_code == 200
    queue_items = q_resp.json()
    assert len(queue_items) > 0
    assert any(item["guest_name"] == "Сергей Васильев" for item in queue_items)

    # Test ZIP export
    zip_resp = client.get("/api/export/zip")
    assert zip_resp.status_code == 200
    assert zip_resp.headers["content-type"] == "application/zip"
    assert len(zip_resp.content) > 0

def test_sse_manager_subscription():
    q = sse_manager.subscribe()
    assert q in sse_manager._queues
    sse_manager.unsubscribe(q)
    assert q not in sse_manager._queues
