from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.ids import now_iso
from app.core.security import Actor
from app.db.models import BrandPost, Campaign, CreatorEarning, Payout, Submission
from app.modules.campaigns.economics import payout_from_views


def _mark_one(db: Session, payout: Payout, when: str) -> None:
    payout.status = "paid"
    payout.paid_at = when
    if payout.id:
        earning = (
            db.query(CreatorEarning)
            .filter(CreatorEarning.payout_id == payout.id)
            .one_or_none()
        )
        if earning is not None:
            earning.status = "paid"
            earning.payout_date = when[:10]


def mark_payout_paid(db: Session, actor: Actor, payout_id: str) -> dict:
    payout = db.get(Payout, payout_id)
    if payout is None:
        raise HTTPException(status_code=404, detail="Payout not found")
    if payout.status != "paid":
        _mark_one(db, payout, now_iso())
        audit(db, actor, "payout.paid", "payout", payout.id)
    return {}


def mark_all_payouts_paid(db: Session, actor: Actor) -> dict:
    when = now_iso()
    pending = db.query(Payout).filter(Payout.status == "pending").all()
    for payout in pending:
        _mark_one(db, payout, when)
    audit(db, actor, "payout.paid_all", "payout", "*", str(len(pending)))
    return {}


def snapshot_campaign(db: Session, actor: Actor, campaign_id: str, views_by_submission: dict[str, int]) -> dict:
    campaign = db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.funded_at is None:
        raise HTTPException(status_code=409, detail="Campaign is not funded")
    submissions = (
        db.query(Submission).filter(Submission.campaign_id == campaign.id).all()
    )
    by_id = {row.id: row for row in submissions}
    total_views = 0
    for submission_id, views in views_by_submission.items():
        submission = by_id.get(submission_id)
        if submission is None:
            raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")
        if views < 0:
            raise HTTPException(status_code=422, detail="Views cannot be negative")
        submission.views = views
        amount = payout_from_views(
            views=views,
            rpm_rwf=campaign.rpm_rwf,
            min_views=campaign.min_views,
            min_payout_rwf=campaign.min_payout_rwf,
            max_payout_rwf=campaign.max_payout_rwf,
        )
        payout = (
            db.query(Payout).filter(Payout.submission_id == submission.id).one_or_none()
        )
        if payout is None:
            raise HTTPException(
                status_code=409,
                detail="Snapshot requires a payout row created on approval",
            )
        payout.views_at_snapshot = views
        payout.amount_rwf = amount
        earning = (
            db.query(CreatorEarning)
            .filter(CreatorEarning.payout_id == payout.id)
            .one_or_none()
        )
        if earning is not None:
            earning.amount_rwf = amount
        post = (
            db.query(BrandPost)
            .filter(BrandPost.submission_id == submission.id)
            .one_or_none()
        )
        if post is not None:
            post.views = views
    for submission in submissions:
        total_views += submission.views or 0
    campaign.total_views = total_views
    campaign.view_snapshot_at = now_iso()
    audit(db, actor, "campaign.snapshot", "campaign", campaign.id)
    return {"campaignId": campaign.id, "totalViews": total_views, "viewSnapshotAt": campaign.view_snapshot_at}
