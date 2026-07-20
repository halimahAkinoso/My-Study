from sqlalchemy.orm import Session

from app.models.lesson import Lesson
from app.models.topic import Topic
from app.schemas.lesson import LessonCreate


def create_lesson(db: Session, lesson: LessonCreate):
    db_lesson = Lesson(**lesson.model_dump())

    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)

    return db_lesson


def build_default_lesson(topic: Topic):
    subject_name = topic.subject.name if topic.subject else "this subject"
    topic_description = (
        topic.description
        or f"This lesson introduces the core ideas in {topic.title}."
    )

    notes = f"""# {topic.title}

## Overview
{topic_description}

## Learning Goals
- Understand what {topic.title} means in {subject_name}.
- Identify the main rules, ideas, or patterns connected to this topic.
- Apply the concept to simple practice questions.

## Explanation
{topic.title} is an important part of {subject_name}. Start by defining the concept clearly, then break it into smaller ideas. Focus on what the concept is, when to use it, and how to recognize it in classwork or exam questions.

## Key Ideas
1. Know the meaning of the topic and the words linked to it.
2. Look for the rules, formulas, or steps that help solve problems in this area.
3. Practice with short examples before moving to more difficult questions.

## Worked Example
Choose one simple example related to {topic.title}, identify the relevant rule, and solve it step by step. After solving it, explain why that method works.

## Study Tips
- Rewrite the main idea in your own words.
- Practice at least three short questions on {topic.title}.
- Review your corrections and note the steps you missed.

## Summary
{topic.title} helps you build confidence in {subject_name}. Once you understand the basic idea and practice a few examples, the topic becomes much easier to remember and apply.
"""

    return Lesson(
        topic_id=topic.id,
        title=f"{topic.title} Lesson",
        notes=notes,
        image_url=None,
        video_url=None,
        pdf_url=None,
    )


def get_lesson(db: Session, topic_id: int):
    lesson = (
        db.query(Lesson)
        .filter(Lesson.topic_id == topic_id)
        .first()
    )

    if lesson:
        return lesson

    topic = (
        db.query(Topic)
        .filter(Topic.id == topic_id)
        .first()
    )

    if not topic:
        return None

    fallback_lesson = build_default_lesson(topic)

    db.add(fallback_lesson)
    db.commit()
    db.refresh(fallback_lesson)

    return fallback_lesson
