from sqlalchemy.orm import Session

from app.models.quiz import Quiz


def create_quiz(db: Session, quiz):

    item = Quiz(**quiz.model_dump())

    db.add(item)

    db.commit()

    db.refresh(item)

    return item


def get_quiz_by_topic(db: Session, topic_id: int):

    return (
        db.query(Quiz)
        .filter(Quiz.topic_id == topic_id)
        .all()
    )