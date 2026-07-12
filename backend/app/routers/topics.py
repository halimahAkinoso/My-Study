from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.topic import TopicCreate
from app.crud.topic import (
    create_topic,
    get_topics_by_subject,
)

router = APIRouter(
    prefix="/topics",
    tags=["Topics"],
)


@router.get("/{subject_id}")
def list_topics(
    subject_id: int,
    db: Session = Depends(get_db),
):
    return get_topics_by_subject(db, subject_id)


@router.post("/")
def add_topic(
    topic: TopicCreate,
    db: Session = Depends(get_db),
):
    return create_topic(db, topic)