from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.crud.subject import (
    get_subjects,
    get_subject_by_name,
    create_subject,
)
from app.schemas.subject import SubjectCreate

from app.crud.subject import (
    get_subjects,
    get_subject,
    get_subject_by_name,
    create_subject,
)

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)
@router.get("/{subject_id}")
def subject_details(
    subject_id: int,
    db: Session = Depends(get_db),
):
    return get_subject(db, subject_id)

@router.get("/")
def list_subjects(db: Session = Depends(get_db)):
    return get_subjects(db)


@router.post("/")
def add_subject(
    subject: SubjectCreate,
    db: Session = Depends(get_db),
):

    existing = get_subject_by_name(db, subject.name)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Subject already exists",
        )

    return create_subject(db, subject.name)