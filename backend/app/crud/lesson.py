from sqlalchemy.orm import Session

from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate


def create_lesson(db: Session, lesson: LessonCreate):

    db_lesson = Lesson(**lesson.model_dump())

    db.add(db_lesson)

    db.commit()

    db.refresh(db_lesson)

    return db_lesson


def get_lesson(db: Session, topic_id: int):

    return (
        db.query(Lesson)
        .filter(Lesson.topic_id == topic_id)
        .first()
    )