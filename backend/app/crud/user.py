from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.auth.hashing import hash_password


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)

    db_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="student",
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user(db: Session, db_user: User, user_update: UserUpdate):
    db_user.name = user_update.name
    db_user.email = user_update.email

    db.commit()
    db.refresh(db_user)

    return db_user
