from typing import Literal

from pydantic import BaseModel, Field


class TutorHistoryItem(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class TutorRequest(BaseModel):
    topic_id: int
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[TutorHistoryItem] = Field(default_factory=list)
