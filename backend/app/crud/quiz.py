from sqlalchemy.orm import Session, joinedload

from app.models.quiz import Quiz
from app.models.topic import Topic
from app.services.ai_service import generate_quiz_questions


def create_quiz(db: Session, quiz):
    item = Quiz(**quiz.model_dump())

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def persist_generated_quiz(
    db: Session,
    topic_id: int,
    generated_questions: list[dict[str, str]],
):
    stored_items = []

    for question in generated_questions:
        item = Quiz(
            topic_id=topic_id,
            question=question["question"],
            option_a=question["option_a"],
            option_b=question["option_b"],
            option_c=question["option_c"],
            option_d=question["option_d"],
            correct_answer=question["correct_answer"],
        )
        db.add(item)
        stored_items.append(item)

    db.commit()

    for item in stored_items:
        db.refresh(item)

    return stored_items


def get_quiz_by_topic(db: Session, topic_id: int):
    quiz_items = (
        db.query(Quiz)
        .filter(Quiz.topic_id == topic_id)
        .all()
    )

    if len(quiz_items) == 20:
        return quiz_items

    if quiz_items:
        for item in quiz_items:
            db.delete(item)
        db.commit()

    topic = (
        db.query(Topic)
        .options(joinedload(Topic.subject))
        .filter(Topic.id == topic_id)
        .first()
    )

    if not topic:
        return []

    subject_name = topic.subject.name if topic.subject else "General Studies"
    generated_questions = generate_quiz_questions(
        subject_name,
        topic.title,
    )

    return persist_generated_quiz(db, topic.id, generated_questions)
