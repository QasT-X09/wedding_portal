import pytest
import tempfile
import shutil
from pathlib import Path
from fastapi.testclient import TestClient

from app import config

# Prepare test directories before app import
temp_dir = Path(tempfile.mkdtemp(prefix="wedding_test_"))
orig_base_dir = config.BASE_DIR
orig_data_dir = config.DATA_DIR
orig_upload_dir = config.UPLOAD_DIR
orig_thumb_dir = config.THUMBNAIL_DIR
orig_export_dir = config.EXPORT_DIR
orig_db_path = config.DB_PATH

config.BASE_DIR = temp_dir
config.DATA_DIR = temp_dir / "data"
config.UPLOAD_DIR = temp_dir / "uploads"
config.THUMBNAIL_DIR = temp_dir / "thumbnails"
config.EXPORT_DIR = temp_dir / "exports"
config.DB_PATH = config.DATA_DIR / "test_wedding.db"

config.DATA_DIR.mkdir(parents=True, exist_ok=True)
config.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
config.THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)
config.EXPORT_DIR.mkdir(parents=True, exist_ok=True)

from app.database import init_db
init_db()

from app.main import app

@pytest.fixture(autouse=True)
def clean_db():
    # Clean tables before each test to ensure complete isolation
    from app.database import get_db_connection
    with get_db_connection() as conn:
        conn.execute("DELETE FROM live_queue")
        conn.execute("DELETE FROM media_tags")
        conn.execute("DELETE FROM media")
        conn.execute("DELETE FROM guests")
        conn.commit()
    yield

@pytest.fixture(scope="session", autouse=True)
def cleanup_temp_dir():
    yield
    shutil.rmtree(temp_dir, ignore_errors=True)
    config.BASE_DIR = orig_base_dir
    config.DATA_DIR = orig_data_dir
    config.UPLOAD_DIR = orig_upload_dir
    config.THUMBNAIL_DIR = orig_thumb_dir
    config.EXPORT_DIR = orig_export_dir
    config.DB_PATH = orig_db_path

@pytest.fixture
def client():
    return TestClient(app)
