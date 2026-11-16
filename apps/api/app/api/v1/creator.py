from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import require
from app.api.schemas import ApplyIn, ProfilePatch, SubmitAssignmentIn
from app.core.db import get_db
from app.core.security import Actor
from app.modules.creators.service import apply_to_campaign, update_profile
from app.modules.portal.read_models import creator_state
from app.modules.submissions.service import submit_assignment

router = APIRouter(prefix="/creator", tags=["creator"])


@router.get("/state")
def get_state(
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("creator")),
) -> dict:
    try:
        return creator_state(db, actor)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/applications")
def post_application(
    body: ApplyIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("creator")),
) -> dict:
    return apply_to_campaign(db, actor, body.campaign_id, body.pitch)


@router.post("/assignments/{assignment_id}/submit")
def post_submit(
    assignment_id: str,
    body: SubmitAssignmentIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("creator")),
) -> dict:
    return submit_assignment(db, actor, assignment_id, body.post_url)


@router.patch("/profile")
def patch_profile(
    body: ProfilePatch,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("creator")),
) -> dict:
    return update_profile(db, actor, body.model_dump(exclude_unset=True))
