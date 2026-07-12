from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserLogin
from app.crud.user import get_user_by_email, create_user
from app.auth.hashing import verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.dependencies import get_current_user
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = create_user(db, user)

    return {
        "message": "Registration successful",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
        },
    }


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = get_user_by_email(db, user.email)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "id": db_user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user
    