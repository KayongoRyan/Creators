from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas import (
    AuthCredentialsIn,
    DevTokenIn,
    PasswordForgotIn,
    PasswordResendIn,
    PasswordResetIn,
    SignupResendIn,
    SignupStartIn,
    SignupVerifyIn,
)
from app.core.db import get_db
from app.modules.identity.service import (
    issue_dev_token,
    login,
    password_forgot,
    password_resend,
    password_reset,
    signup,
    signup_resend,
    signup_start,
    signup_verify,
)

router = APIRouter(tags=["auth"])


@router.post("/auth/dev-token")
def dev_token(body: DevTokenIn, db: Session = Depends(get_db)) -> dict:
    return issue_dev_token(
        db,
        role=body.role,
        email=body.email,
        display_name=body.display_name,
    )


@router.post("/auth/signup")
def auth_signup(body: AuthCredentialsIn, db: Session = Depends(get_db)) -> dict:
    return signup(
        db,
        email=body.email,
        password=body.password,
        role=body.role,
        display_name=body.display_name,
    )


@router.post("/auth/signup/start")
def auth_signup_start(body: SignupStartIn, db: Session = Depends(get_db)) -> dict:
    onboarding = body.onboarding.model_dump(exclude_none=True) if body.onboarding else None
    return signup_start(
        db,
        email=body.email,
        password=body.password,
        role=body.role,
        display_name=body.display_name,
        onboarding=onboarding,
    )


@router.post("/auth/signup/verify")
def auth_signup_verify(body: SignupVerifyIn, db: Session = Depends(get_db)) -> dict:
    return signup_verify(
        db,
        email=body.email,
        token=body.token,
        role=body.role,
    )


@router.post("/auth/signup/resend")
def auth_signup_resend(body: SignupResendIn, db: Session = Depends(get_db)) -> dict:
    return signup_resend(
        db,
        email=body.email,
        role=body.role,
    )


@router.post("/auth/login")
def auth_login(body: AuthCredentialsIn, db: Session = Depends(get_db)) -> dict:
    return login(
        db,
        email=body.email,
        password=body.password,
        role=body.role,
    )


@router.post("/auth/password/forgot")
def auth_password_forgot(body: PasswordForgotIn, db: Session = Depends(get_db)) -> dict:
    return password_forgot(db, email=body.email)


@router.post("/auth/password/reset")
def auth_password_reset(body: PasswordResetIn, db: Session = Depends(get_db)) -> dict:
    return password_reset(
        db,
        email=body.email,
        token=body.token,
        password=body.password,
    )


@router.post("/auth/password/resend")
def auth_password_resend(body: PasswordResendIn, db: Session = Depends(get_db)) -> dict:
    return password_resend(db, email=body.email)
