from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.schemas import AuthCredentialsIn, DevTokenIn
from app.core.db import get_db
from app.modules.identity.service import issue_dev_token, login, signup

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


@router.post("/auth/login")
def auth_login(body: AuthCredentialsIn, db: Session = Depends(get_db)) -> dict:
    return login(
        db,
        email=body.email,
        password=body.password,
        role=body.role,
    )
