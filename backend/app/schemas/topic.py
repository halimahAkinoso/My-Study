from pydantic import BaseModel


class TopicBase(BaseModel):
    title: str
    description: str | None = None
    subject_id: int


class TopicCreate(TopicBase):
    pass


class TopicResponse(TopicBase):
    id: int

    class Config:
        from_attributes = True