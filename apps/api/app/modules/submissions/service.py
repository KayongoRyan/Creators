from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.ids import new_id, now_iso
from app.core.security import Actor
from app.db.models import (
    Assignment,
    BrandPost,
    Campaign,
    Creator,
    CreatorEarning,
    Payout,
    Submission,
)


def _reserve(campaign: Campaign, assignment: Assignment | None) -> int:
    if campaign.max_payout_rwf:
        return int(campaign.max_payout_rwf)
    if assignment is not None and assignment.payout_rwf:
        return int(assignment.payout_rwf)
    if campaign.flat_payout_rwf:
        return int(campaign.flat_payout_rwf)
    return 0


def _sync_brand_post(db: Session, submission: Submission) -> None:
    post = (
        db.query(BrandPost)
        .filter(BrandPost.submission_id == submission.id)
        .one_or_none()
    )
    if post is None:
        return
    post.status = submission.status
    if submission.post_url:
        post.post_url = submission.post_url
    if submission.views is not None:
        post.views = submission.views


def _close_if_pool_empty(campaign: Campaign) -> None:
    if campaign.pool_remaining_rwf <= 0:
        campaign.pool_remaining_rwf = 0
        campaign.is_open = False
        campaign.status = "completed"


def approve_submission(db: Session, actor: Actor, submission_id: str) -> dict:
    submission = db.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    if submission.status == "approved":
        return {}
    campaign = db.get(Campaign, submission.campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.funded_at is None:
        raise HTTPException(status_code=409, detail="Campaign is not funded")
    assignment = (
        db.get(Assignment, submission.assignment_id) if submission.assignment_id else None
    )
    reserve = _reserve(campaign, assignment)
    if reserve > campaign.pool_remaining_rwf:
        raise HTTPException(status_code=409, detail="Creator pool is exhausted")
    was_approved = submission.status == "approved"
    submission.status = "approved"
    if not was_approved:
        campaign.pool_remaining_rwf -= reserve
        campaign.submissions_approved += 1
        _close_if_pool_empty(campaign)
    if assignment is not None:
        assignment.status = "approved"
    _sync_brand_post(db, submission)
    payout = (
        db.query(Payout).filter(Payout.submission_id == submission.id).one_or_none()
    )
    creator = db.get(Creator, submission.creator_id)
    if payout is None and creator is not None:
        payout = Payout(
            id=new_id("pay"),
            creator_id=creator.id,
            campaign_id=campaign.id,
            submission_id=submission.id,
            creator_name=creator.display_name,
            handle=creator.tiktok_handle,
            campaign_title=campaign.title,
            amount_rwf=reserve,
            status="pending",
        )
        db.add(payout)
        db.flush()
        db.add(
            CreatorEarning(
                id=new_id("earn"),
                creator_id=creator.id,
                campaign_title=campaign.title,
                amount_rwf=reserve,
                status="approved",
                payout_id=payout.id,
            )
        )
    audit(db, actor, "submission.approve", "submission", submission.id)
    return {}


def _release_approval(db: Session, submission: Submission) -> None:
    if submission.status != "approved":
        return
    campaign = db.get(Campaign, submission.campaign_id)
    if campaign is None:
        return
    assignment = (
        db.get(Assignment, submission.assignment_id) if submission.assignment_id else None
    )
    campaign.pool_remaining_rwf += _reserve(campaign, assignment)
    campaign.submissions_approved = max(0, campaign.submissions_approved - 1)
    if campaign.status == "completed" and campaign.pool_remaining_rwf > 0:
        campaign.status = "active"
        if campaign.assignment_mode == "open" and campaign.funded_at:
            campaign.is_open = True


def reject_submission(db: Session, actor: Actor, submission_id: str) -> dict:
    submission = db.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    _release_approval(db, submission)
    submission.status = "rejected"
    if submission.assignment_id:
        assignment = db.get(Assignment, submission.assignment_id)
        if assignment is not None:
            assignment.status = "rejected"
    _sync_brand_post(db, submission)
    audit(db, actor, "submission.reject", "submission", submission.id)
    return {}


def request_revision(db: Session, actor: Actor, submission_id: str, note: str) -> dict:
    submission = db.get(Submission, submission_id)
    if submission is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    cleaned = note.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Revision note is required")
    _release_approval(db, submission)
    submission.status = "revision"
    submission.revision_note = cleaned
    if submission.assignment_id:
        assignment = db.get(Assignment, submission.assignment_id)
        if assignment is not None:
            assignment.status = "revision"
    _sync_brand_post(db, submission)
    audit(db, actor, "submission.revision", "submission", submission.id, cleaned)
    return {}


def submit_assignment(db: Session, actor: Actor, assignment_id: str, post_url: str) -> dict:
    if not actor.creator_id:
        raise HTTPException(status_code=403, detail="Creator profile required")
    assignment = db.get(Assignment, assignment_id)
    if assignment is None or assignment.creator_id != actor.creator_id:
        raise HTTPException(status_code=404, detail="Assignment not found")
    url = post_url.strip()
    if not url:
        raise HTTPException(status_code=422, detail="Post URL is required")
    campaign = db.get(Campaign, assignment.campaign_id)
    if campaign is not None and campaign.pool_remaining_rwf <= 0:
        raise HTTPException(status_code=409, detail="Campaign is closed")
    assignment.post_url = url
    assignment.status = "pending"
    submission = (
        db.query(Submission)
        .filter(Submission.assignment_id == assignment.id)
        .one_or_none()
    )
    if submission is None:
        submission = Submission(
            id=new_id("sub"),
            campaign_id=assignment.campaign_id,
            creator_id=assignment.creator_id,
            assignment_id=assignment.id,
            status="pending",
            post_url=url,
            submitted_at=now_iso(),
        )
        db.add(submission)
        if campaign is not None:
            campaign.submissions_received += 1
    else:
        submission.post_url = url
        submission.status = "pending"
        submission.submitted_at = now_iso()
    existing_earning = (
        db.query(CreatorEarning)
        .filter(
            CreatorEarning.creator_id == assignment.creator_id,
            CreatorEarning.campaign_title == assignment.title,
            CreatorEarning.status == "pending",
        )
        .one_or_none()
    )
    if existing_earning is None:
        db.add(
            CreatorEarning(
                id=new_id("earn"),
                creator_id=assignment.creator_id,
                campaign_title=assignment.title,
                amount_rwf=assignment.payout_rwf,
                status="pending",
            )
        )
    return {}
