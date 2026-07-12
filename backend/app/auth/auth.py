@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = get_user_by_email(db, user.email)

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        user.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {
            "sub": db_user.email,
            "id": db_user.id,
            "role": db_user.role,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }