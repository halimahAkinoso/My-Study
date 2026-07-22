from sqlalchemy.orm import Session, joinedload

from app.models.lesson import Lesson
from app.models.topic import Topic
from app.schemas.lesson import LessonCreate
from app.services.ai_service import (
    CURATED_LESSON_MARKER,
    build_lesson_markdown,
    find_youtube_video_url,
    generate_lesson_data,
)
from app.services.pdf_service import ensure_lesson_pdf


def create_lesson(db: Session, lesson: LessonCreate):
    db_lesson = Lesson(**lesson.model_dump())

    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)

    return db_lesson


def lesson_needs_enrichment(lesson: Lesson | None) -> bool:
    if not lesson:
        return True

    notes = (lesson.notes or "").strip()

    return (
        CURATED_LESSON_MARKER not in notes
        or
        len(notes) < 1600
        or not lesson.video_url
        or not lesson.pdf_url
    )


def enrich_lesson(db: Session, topic: Topic, lesson: Lesson | None = None):
    subject_name = topic.subject.name if topic.subject else "General Studies"
    lesson_data = generate_lesson_data(
        subject_name,
        topic.title,
        topic.description,
        use_ai=True,
    )
    notes = build_lesson_markdown(lesson_data)

    if not lesson:
        lesson = Lesson(topic_id=topic.id)
        db.add(lesson)

    lesson.title = lesson_data["title"]
    lesson.notes = notes
    lesson.video_url = find_youtube_video_url(subject_name, topic.title)
    lesson.pdf_url = ensure_lesson_pdf(topic.id, lesson.title, lesson.notes)

    if lesson.image_url is None:
        lesson.image_url = None

    db.commit()
    db.refresh(lesson)

    return lesson


def get_lesson(db: Session, topic_id: int):
    lesson = (
        db.query(Lesson)
        .filter(Lesson.topic_id == topic_id)
        .first()
    )

    topic = (
        db.query(Topic)
        .options(joinedload(Topic.subject))
        .filter(Topic.id == topic_id)
        .first()
    )

    if not topic:
        return None

    if lesson_needs_enrichment(lesson):
        return enrich_lesson(db, topic, lesson)

    lesson.pdf_url = ensure_lesson_pdf(topic.id, lesson.title, lesson.notes)
    db.commit()
    db.refresh(lesson)

    return lesson
