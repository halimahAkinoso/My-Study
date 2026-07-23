from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserUpdate
from app.crud.user import create_user, get_user_by_email, get_user_by_id, update_user
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
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
        },
    }


@router.get("/me")
def get_me(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = get_user_by_id(db, current_user["id"])

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
    }


@router.put("/me")
def update_me(
    payload: UserUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = get_user_by_id(db, current_user["id"])

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    existing_user = get_user_by_email(db, payload.email)
    if existing_user and existing_user.id != db_user.id:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    updated_user = update_user(db, db_user, payload)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": updated_user.id,
            "name": updated_user.name,
            "email": updated_user.email,
            "role": updated_user.role,
        },
    }
