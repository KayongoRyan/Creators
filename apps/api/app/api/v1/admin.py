from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.api.deps import require
from app.api.idempotency import run_idempotent
from app.api.schemas import CreateCampaignIn, RevisionIn, SnapshotIn
from app.core.db import get_db
from app.core.security import Actor
from app.modules.campaigns.service import create_campaign, fund_campaign
from app.modules.creators.service import reject_creator, verify_creator
from app.modules.payouts.service import mark_all_payouts_paid, mark_payout_paid, snapshot_campaign
from app.modules.portal.read_models import admin_state
from app.modules.reporting.service import campaign_report
from app.modules.submissions.service import (
    approve_submission,
    reject_submission,
    request_revision,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/state")
def get_state(
    db: Session = Depends(get_db),
    _: Actor = Depends(require("admin")),
) -> dict:
    return admin_state(db)


@router.post("/campaigns")
def post_campaign(
    body: CreateCampaignIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return create_campaign(db, actor, body.model_dump(exclude_none=True))


@router.post("/campaigns/{campaign_id}/fund")
def post_fund(
    campaign_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return fund_campaign(db, actor, campaign_id)


@router.post("/campaigns/{campaign_id}/snapshot")
def post_snapshot(
    campaign_id: str,
    body: SnapshotIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    views = {entry.submission_id: entry.views for entry in body.views}
    return run_idempotent(
        db,
        idempotency_key,
        f"snapshot:{campaign_id}",
        lambda: snapshot_campaign(db, actor, campaign_id, views),
    )


@router.get("/campaigns/{campaign_id}/report")
def get_report(
    campaign_id: str,
    db: Session = Depends(get_db),
    _: Actor = Depends(require("admin")),
) -> dict:
    return campaign_report(db, campaign_id)


@router.post("/creators/{application_id}/verify")
def post_verify(
    application_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return verify_creator(db, actor, application_id)


@router.post("/creators/{application_id}/reject")
def post_reject_creator(
    application_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return reject_creator(db, actor, application_id)


@router.post("/submissions/{submission_id}/approve")
def post_approve(
    submission_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    return run_idempotent(
        db,
        idempotency_key,
        f"approve:{submission_id}",
        lambda: approve_submission(db, actor, submission_id),
    )


@router.post("/submissions/{submission_id}/reject")
def post_reject_submission(
    submission_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return reject_submission(db, actor, submission_id)


@router.post("/submissions/{submission_id}/revision")
def post_revision(
    submission_id: str,
    body: RevisionIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return request_revision(db, actor, submission_id, body.note)


@router.post("/payouts/{payout_id}/mark-paid")
def post_mark_paid(
    payout_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> dict:
    return run_idempotent(
        db,
        idempotency_key,
        f"payout:{payout_id}",
        lambda: mark_payout_paid(db, actor, payout_id),
    )


@router.post("/payouts/mark-all-paid")
def post_mark_all(
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("admin")),
) -> dict:
    return mark_all_payouts_paid(db, actor)
