from app.database.database import Base, engine

from app.models.user import User
from app.models.subject import Subject
from app.models.topic import Topic
from app.models.lesson import Lesson
from app.models.quiz import Quiz
from app.database.database import SessionLocal
from app.database.seed import seed_subjects_and_topics

def init_db():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_subjects_and_topics(db)
    finally:
        db.close()
