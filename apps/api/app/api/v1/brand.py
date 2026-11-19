from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require
from app.api.schemas import BrandCreateCampaignIn
from app.core.db import get_db
from app.core.security import Actor
from app.modules.campaigns.service import create_brand_campaign
from app.modules.portal.read_models import brand_state

router = APIRouter(prefix="/brand", tags=["brand"])


@router.get("/state")
def get_state(
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("brand")),
) -> dict:
    return brand_state(db, actor)


@router.post("/campaigns")
def post_campaign(
    body: BrandCreateCampaignIn,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require("brand")),
) -> dict:
    return create_brand_campaign(db, actor, body.model_dump(exclude_none=True))
