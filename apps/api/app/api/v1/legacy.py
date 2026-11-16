from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_actor
from app.core.db import get_db
from app.core.security import Actor
from app.modules.portal.read_models import (
    legacy_brands,
    legacy_campaigns,
    legacy_creators,
    legacy_earnings,
    legacy_payments,
    legacy_submissions,
)

router = APIRouter(tags=["legacy"])


@router.get("/campaigns")
def get_campaigns(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_actor),
) -> list[dict]:
    return legacy_campaigns(db)


@router.get("/submissions")
def get_submissions(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_actor),
) -> list[dict]:
    return legacy_submissions(db)


@router.get("/payments")
def get_payments(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_actor),
) -> list[dict]:
    return legacy_payments(db)


@router.get("/earnings")
def get_earnings(
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_actor),
) -> dict:
    return legacy_earnings(db, actor)


@router.get("/brands")
def get_brands(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_actor),
) -> list[dict]:
    return legacy_brands(db)


@router.get("/creators")
def get_creators(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_actor),
) -> list[dict]:
    return legacy_creators(db)
