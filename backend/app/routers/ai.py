from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.auth.dependencies import get_current_user
from app.crud.lesson import get_lesson
from app.crud.quiz import get_quiz_by_topic
from app.crud.user import get_user_by_id
from app.database.database import get_db
from app.models.topic import Topic
from app.schemas.tutor import TutorRequest
from app.services.ai_service import (
    generate_lesson,
    generate_quiz,
    generate_tutor_response,
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.get("/lesson")
def ai_lesson(subject: str, topic: str):

    return {
        "lesson":
        generate_lesson(
            subject,
            topic,
        )
    }


@router.get("/quiz")
def ai_quiz(subject: str, topic: str):

    return {
        "quiz":
        generate_quiz(
            subject,
            topic,
        )
    }


@router.post("/tutor")
def ai_tutor(
    payload: TutorRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    topic = (
        db.query(Topic)
        .options(joinedload(Topic.subject))
        .filter(Topic.id == payload.topic_id)
        .first()
    )

    if not topic:
        raise HTTPException(
            status_code=404,
            detail="Topic not found",
        )

    lesson = get_lesson(db, payload.topic_id)

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found for this topic",
        )

    quiz_items = get_quiz_by_topic(db, payload.topic_id)
    subject_name = topic.subject.name if topic.subject else "General Studies"
    db_user = get_user_by_id(db, current_user["id"])
    student_name = db_user.name if db_user else "Student"

    response = generate_tutor_response(
        student_name=student_name,
        subject=subject_name,
        topic=topic.title,
        message=payload.message,
        lesson_notes=lesson.notes,
        quiz_items=quiz_items,
        history=[item.model_dump() for item in payload.history],
    )

    return {
        **response,
        "context": {
            "topic_id": topic.id,
            "subject": subject_name,
            "topic": topic.title,
            "lesson_title": lesson.title,
        },
    }
