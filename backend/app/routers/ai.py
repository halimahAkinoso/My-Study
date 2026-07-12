from fastapi import APIRouter

from app.services.ai_service import (
    generate_lesson,
    generate_quiz,
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