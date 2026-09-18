from pydantic import BaseModel, Field
from typing import Optional, List

class GuestCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Имя гостя или семьи")
    table_number: Optional[str] = Field(default="", max_length=50)
    wishes: Optional[str] = Field(default="", max_length=500)

class GuestResponse(BaseModel):
    id: str
    name: str
    table_number: str
    wishes: str
    avatar_color: str
    photos_uploaded: int
    videos_uploaded: int
    max_photos: int
    max_videos: int

class MediaTagItem(BaseModel):
    tag: str
    confidence: float

class MediaItem(BaseModel):
    id: str
    guest_id: str
    guest_name: str
    media_type: str
    original_filename: str
    file_url: str
    thumbnail_url: str
    category: str
    wedding_phase: str
    wishes: str
    created_at: str
    tags: List[MediaTagItem] = []
