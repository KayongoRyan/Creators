from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.ids import new_id, now_iso
from app.core.security import Actor
from app.db.models import (
    Campaign,
    CampaignApplication,
    Creator,
    CreatorApplication,
    Profile,
)
from app.modules.portal.read_models import verified_handle
from app.modules.storage.screenshots import save_screenshot


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
        momo=application.momo_phone,
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
    if existing is not None:
        return {}
    db.add(
        CampaignApplication(
            id=new_id("cap"),
            campaign_id=campaign_id,
            creator_id=actor.creator_id,
            status="pending",
            pitch=(pitch or "").strip() or None,
            applied_at=now_iso(),
        )
    )
    campaign.spots_left = max(0, campaign.spots_left - 1)
    return {}


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
        "label": "label",
        "campaigns_completed": "campaigns_completed",
    }
    for key, attr in mapping.items():
        if key in patch and patch[key] is not None:
            setattr(creator, attr, patch[key])
    return {}


def submit_public_application(
    db: Session,
    *,
    full_name: str,
    momo_phone: str,
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
    if not momo_phone.strip() and not (email or "").strip():
        raise HTTPException(status_code=422, detail="A MoMo number or email is required")
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
            momo_phone=momo_phone.strip(),
            screenshot_path=screenshot_path,
            why_join=(why_join or "").strip() or None,
            status="pending",
            created_at=now_iso(),
        )
    )
    return {"id": application_id, "status": "pending"}
