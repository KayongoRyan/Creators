from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.ids import new_id, now_iso
from app.core.security import Actor
from app.db.models import (
    Assignment,
    Campaign,
    CampaignApplication,
    Creator,
    CreatorApplication,
    Profile,
)
from app.modules.portal.read_models import verified_handle
from app.modules.storage.screenshots import save_screenshot


def _payout_for_campaign(campaign: Campaign) -> int:
    if campaign.flat_payout_rwf is not None and campaign.flat_payout_rwf > 0:
        return int(campaign.flat_payout_rwf)
    if campaign.min_payout_rwf > 0:
        return int(campaign.min_payout_rwf)
    if campaign.spots_left > 0 and campaign.pool_remaining_rwf > 0:
        return int(campaign.pool_remaining_rwf // max(campaign.spots_left, 1))
    return max(0, int(campaign.rpm_rwf or 0))


def ensure_assignment_for_creator(
    db: Session,
    campaign: Campaign,
    creator_id: str,
) -> Assignment:
    """Idempotent: return existing assignment or create one so the creator can submit."""
    existing = (
        db.query(Assignment)
        .filter(
            Assignment.campaign_id == campaign.id,
            Assignment.creator_id == creator_id,
        )
        .one_or_none()
    )
    if existing is not None:
        return existing

    assignment = Assignment(
        id=new_id("asgn"),
        campaign_id=campaign.id,
        creator_id=creator_id,
        title=campaign.brand_portal_title or campaign.title,
        brief=campaign.brief or "",
        source_url=campaign.source_asset_path,
        payout_rwf=_payout_for_campaign(campaign),
        deadline=campaign.deadline or "",
        status="not_submitted",
    )
    db.add(assignment)
    campaign.assigned_creators = int(campaign.assigned_creators or 0) + 1
    db.flush()
    return assignment


def verify_creator(db: Session, actor: Actor, application_id: str) -> dict:
    application = db.get(CreatorApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    if application.status != "pending":
        raise HTTPException(status_code=409, detail="Application is not pending")
    creator = Creator(
        id=new_id("cr"),
        display_name=application.full_name,
        tiktok_handle=application.tiktok_handle,
        instagram_handle=application.instagram_handle,
        tiktok_followers=application.tiktok_followers,
        instagram_followers=application.instagram_followers,
        niche=application.niche,
        momo=application.phone or application.momo_phone,
        phone=application.phone or application.momo_phone,
        label="New",
        campaigns_completed=0,
    )
    application.status = "verified"
    db.add(creator)
    if application.email:
        profile = db.query(Profile).filter(Profile.email == application.email).one_or_none()
        if profile is None:
            db.add(
                Profile(
                    id=new_id("profile"),
                    email=application.email,
                    role="creator",
                    display_name=application.full_name,
                    creator_id=creator.id,
                )
            )
        elif profile.creator_id is None:
            profile.creator_id = creator.id
            profile.role = "creator"
    audit(db, actor, "creator.verify", "creator_application", application.id, verified_handle(creator))
    return {}


def reject_creator(db: Session, actor: Actor, application_id: str) -> dict:
    application = db.get(CreatorApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    application.status = "rejected"
    audit(db, actor, "creator.reject", "creator_application", application.id)
    return {}


def apply_to_campaign(db: Session, actor: Actor, campaign_id: str, pitch: str | None) -> dict:
    if not actor.creator_id:
        raise HTTPException(status_code=403, detail="Creator profile required")
    campaign = db.get(Campaign, campaign_id)
    if campaign is None or not campaign.is_open or campaign.pool_remaining_rwf <= 0:
        raise HTTPException(status_code=409, detail="Campaign is not open")
    existing = (
        db.query(CampaignApplication)
        .filter(
            CampaignApplication.campaign_id == campaign_id,
            CampaignApplication.creator_id == actor.creator_id,
        )
        .one_or_none()
    )
    # Open campaigns grant work immediately so creators can submit and admin sees submissions.
    auto_accept = (campaign.assignment_mode or "open") == "open"
    if existing is not None:
        if auto_accept or existing.status == "accepted":
            assignment = ensure_assignment_for_creator(db, campaign, actor.creator_id)
            if existing.status != "accepted":
                existing.status = "accepted"
            return {"assignmentId": assignment.id, "status": existing.status}
        return {"status": existing.status}

    status = "accepted" if auto_accept else "pending"
    db.add(
        CampaignApplication(
            id=new_id("cap"),
            campaign_id=campaign_id,
            creator_id=actor.creator_id,
            status=status,
            pitch=(pitch or "").strip() or None,
            applied_at=now_iso(),
        )
    )
    campaign.spots_left = max(0, campaign.spots_left - 1)
    if not auto_accept:
        return {"status": status}

    assignment = ensure_assignment_for_creator(db, campaign, actor.creator_id)
    audit(
        db,
        actor,
        "campaign.apply",
        "campaign",
        campaign_id,
        assignment.id,
    )
    return {"assignmentId": assignment.id, "status": status}


def accept_campaign_application(
    db: Session,
    actor: Actor,
    application_id: str,
) -> dict:
    application = db.get(CampaignApplication, application_id)
    if application is None:
        raise HTTPException(status_code=404, detail="Campaign application not found")
    if application.status == "rejected":
        raise HTTPException(status_code=409, detail="Application was rejected")
    campaign = db.get(Campaign, application.campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    application.status = "accepted"
    assignment = ensure_assignment_for_creator(db, campaign, application.creator_id)
    audit(
        db,
        actor,
        "campaign.application_accept",
        "campaign_application",
        application.id,
        assignment.id,
    )
    return {"assignmentId": assignment.id, "status": "accepted"}


def update_profile(db: Session, actor: Actor, patch: dict) -> dict:
    if not actor.creator_id:
        raise HTTPException(status_code=403, detail="Creator profile required")
    creator = db.get(Creator, actor.creator_id)
    if creator is None:
        raise HTTPException(status_code=404, detail="Creator not found")
    mapping = {
        "display_name": "display_name",
        "tiktok_handle": "tiktok_handle",
        "instagram_handle": "instagram_handle",
        "tiktok_followers": "tiktok_followers",
        "instagram_followers": "instagram_followers",
        "niche": "niche",
        "momo": "momo",
        "phone": "phone",
        "label": "label",
        "campaigns_completed": "campaigns_completed",
    }
    for key, attr in mapping.items():
        if key in patch and patch[key] is not None:
            setattr(creator, attr, patch[key])
    if "phone" in patch and patch["phone"] is not None:
        creator.momo = str(patch["phone"])
    elif "momo" in patch and patch["momo"] is not None:
        creator.phone = str(patch["momo"])
    return {}


def submit_public_application(
    db: Session,
    *,
    full_name: str,
    phone: str,
    tiktok_handle: str,
    instagram_handle: str,
    niche: str,
    why_join: str | None,
    screenshot_bytes: bytes | None,
    screenshot_name: str | None,
    screenshot_type: str | None,
    email: str | None,
    tiktok_followers: int,
    instagram_followers: int,
) -> dict:
    if not full_name.strip():
        raise HTTPException(status_code=422, detail="Name is required")
    if not phone.strip() and not (email or "").strip():
        raise HTTPException(status_code=422, detail="A phone number or email is required")
    if not tiktok_handle.strip() and not instagram_handle.strip() and not niche.strip():
        raise HTTPException(status_code=422, detail="A social handle or niche is required")
    application_id = new_id("app")
    screenshot_path = None
    if screenshot_bytes:
        screenshot_path = save_screenshot(
            application_id,
            screenshot_name or "screenshot.bin",
            screenshot_bytes,
            screenshot_type or "application/octet-stream",
        )
    cleaned_phone = phone.strip()
    db.add(
        CreatorApplication(
            id=application_id,
            full_name=full_name.strip(),
            email=email,
            tiktok_handle=tiktok_handle.strip(),
            instagram_handle=instagram_handle.strip(),
            tiktok_followers=tiktok_followers,
            instagram_followers=instagram_followers,
            niche=niche.strip() or "Lifestyle",
            momo_phone=cleaned_phone,
            phone=cleaned_phone,
            screenshot_path=screenshot_path,
            why_join=(why_join or "").strip() or None,
            status="pending",
            created_at=now_iso(),
        )
    )
    return {"id": application_id, "status": "pending"}
