from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.lesson import LessonCreate
from app.crud.lesson import create_lesson, get_lesson

router = APIRouter(
    prefix="/lessons",
    tags=["Lessons"],
)


@router.post("/")
def add_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
):
    return create_lesson(db, lesson)


@router.get("/{topic_id}")
def lesson(
    topic_id: int,
    db: Session = Depends(get_db),
):
    return get_lesson(db, topic_id)
