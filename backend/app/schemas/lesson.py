from pydantic import BaseModel


class LessonCreate(BaseModel):
    topic_id: int
    title: str
    notes: str
    image_url: str
    video_url: str
    pdf_url: str


class LessonResponse(BaseModel):
    id: int
    topic_id: int
    title: str
    notes: str
    image_url: str
    video_url: str
    pdf_url: str

    class Config:
        from_attributes = True