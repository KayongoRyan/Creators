from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas import (
    AuthCredentialsIn,
    DevTokenIn,
    SignupResendIn,
    SignupStartIn,
    SignupVerifyIn,
)
from app.core.db import get_db
from app.modules.identity.service import (
    issue_dev_token,
    login,
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
