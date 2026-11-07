from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import Actor, actor_from_token
from app.db.models import Profile


def get_actor(request: Request, db: Session = Depends(get_db)) -> Actor:
    header = request.headers.get("authorization")
    if header and header.lower().startswith("bearer "):
        return actor_from_token(db, header.split(" ", 1)[1].strip())
    if get_settings().auth_dev:
        role = request.headers.get("x-demo-role")
        email = request.headers.get("x-demo-email")
        if role and email:
            profile = db.query(Profile).filter(Profile.email == email).one_or_none()
            if profile is None or profile.role != role:
                raise HTTPException(status_code=401, detail="Unknown demo session")
            return Actor(
                role=profile.role,
                email=profile.email,
                profile_id=profile.id,
                brand_id=profile.brand_id,
                creator_id=profile.creator_id,
            )
    raise HTTPException(status_code=401, detail="Missing bearer token")


def require(*roles: str):
    def dependency(actor: Actor = Depends(get_actor)) -> Actor:
        if actor.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return actor

    return dependency
