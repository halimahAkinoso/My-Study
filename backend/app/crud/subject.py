from sqlalchemy.orm import Session
from app.models.subject import Subject


def get_subjects(db: Session):
    return db.query(Subject).all()


def get_subject_by_name(db: Session, name: str):
    return db.query(Subject).filter(Subject.name == name).first()


def create_subject(db: Session, name: str):
    subject = Subject(name=name)

    db.add(subject)
    db.commit()
    db.refresh(subject)
def get_subject(db: Session, subject_id: int):
    return (
        db.query(Subject)
        .filter(Subject.id == subject_id)
        .first()
    )
    return subject