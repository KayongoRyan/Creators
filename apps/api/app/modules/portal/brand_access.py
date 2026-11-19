from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import Actor
from app.db.models import Brand, Profile
from app.modules.identity.service import _attach_role_links


def resolve_brand_id(db: Session, actor: Actor) -> str:
    """Return the actor's brand id, creating a Brand row when the profile lost its link."""
    if actor.brand_id:
        return actor.brand_id
    profile: Profile | None = None
    if actor.profile_id:
        profile = db.get(Profile, actor.profile_id)
    if profile is None:
        profile = db.query(Profile).filter(Profile.email == actor.email).one_or_none()
    if profile is None or profile.role != "brand":
        raise HTTPException(status_code=403, detail="Brand profile is not linked")
    if not profile.brand_id:
        _attach_role_links(db, profile, "brand")
        db.flush()
    if not profile.brand_id:
        raise HTTPException(status_code=403, detail="Brand profile is not linked")
    return profile.brand_id


def load_brand_for_actor(db: Session, actor: Actor) -> Brand:
    brand_id = resolve_brand_id(db, actor)
    brand = db.get(Brand, brand_id)
    if brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand