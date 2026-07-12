from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.schemas.quiz import QuizCreate

from app.crud.quiz import (
    create_quiz,
    get_quiz_by_topic,
)

router = APIRouter(
    prefix="/quiz",
    tags=["Quiz"],
)


@router.post("/")
def add_quiz(
    quiz: QuizCreate,
    db: Session = Depends(get_db),
):
    return create_quiz(db, quiz)


@router.get("/{topic_id}")
def get_quiz(
    topic_id: int,
    db: Session = Depends(get_db),
):
    return get_quiz_by_topic(db, topic_id)