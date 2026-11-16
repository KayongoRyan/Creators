from sqlalchemy.orm import Session

from app.core.ids import new_id, now_iso
from app.core.security import Actor
from app.db.models import AdminEvent


def audit(
    db: Session,
    actor: Actor,
    action: str,
    entity_type: str,
    entity_id: str,
    detail: str = "",
) -> None:
    db.add(
        AdminEvent(
            id=new_id("evt"),
            actor_email=actor.email,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            detail=detail,
            created_at=now_iso(),
        )
    )
