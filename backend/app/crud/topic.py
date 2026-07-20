from sqlalchemy.orm import Session
from app.models.topic import Topic


def get_topics_by_subject(db: Session, subject_id: int):
    return (
        db.query(Topic)
        .filter(Topic.subject_id == subject_id)
        .all()
    )


def get_topic_by_id(db: Session, topic_id: int):
    return db.query(Topic).filter(Topic.id == topic_id).first()


def create_topic(db: Session, topic):
    new_topic = Topic(**topic.model_dump())

    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)

    return new_topic
