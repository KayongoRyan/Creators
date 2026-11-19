from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.audit import audit
from app.core.ids import new_id, now_iso
from app.core.security import Actor
from app.db.models import Brand, BrandCollection, BrandInvoice, Campaign
from app.modules.campaigns.economics import (
    content_kind_for,
    creator_pool_rwf,
    platform_fee_rwf,
    setup_fee_rwf,
)
from app.modules.storage.assets import save_campaign_source_asset


def create_campaign(db: Session, actor: Actor, payload: dict) -> dict:
    title = str(payload["title"]).strip()
    brand_name = str(payload["brand_name"]).strip()
    campaign_type = str(payload["campaign_type"]).strip()
    budget = int(payload["budget_rwf"])
    deadline = str(payload["deadline"]).strip()
    if budget <= 0 or not title or not brand_name or not campaign_type or not deadline:
        raise HTTPException(status_code=422, detail="Campaign fields are incomplete")

    fee_percent = int(payload.get("platform_fee_percent") or 20)
    setup = payload.get("setup_fee_rwf")
    setup_fee = int(setup) if setup is not None else setup_fee_rwf(budget)
    fee = platform_fee_rwf(budget, fee_percent)
    pool = creator_pool_rwf(budget, fee_percent, setup_fee)
    brand = (
        db.query(Brand)
        .filter((Brand.legal_name == brand_name) | (Brand.name == brand_name))
        .one_or_none()
    )
    if brand is None:
        brand = Brand(
            id=new_id("br"),
            name=brand_name,
            legal_name=brand_name,
            company_line=brand_name,
        )
        db.add(brand)
        db.flush()

    campaign_id = new_id("cmp")
    rpm = int(payload.get("rpm_rwf") or 1500)
    campaign = Campaign(
        id=campaign_id,
        brand_id=brand.id,
        title=title,
        status="draft",
        budget_rwf=budget,
        created_at=now_iso(),
        campaign_type=campaign_type,
        deadline=deadline,
        fee_percent=fee_percent,
        content_kind=content_kind_for(campaign_type),
        setup_fee_rwf=setup_fee,
        platform_fee_rwf=fee,
        creator_pool_rwf=pool,
        pool_remaining_rwf=pool,
        rpm_rwf=rpm,
        min_views=int(payload.get("min_views") or 0),
        min_payout_rwf=int(payload.get("min_payout_rwf") or 0),
        max_payout_rwf=payload.get("max_payout_rwf"),
        brief=str(payload.get("brief") or ""),
        assignment_mode=str(payload.get("assignment_mode") or "open"),
        fee_rwf=fee,
        spots_left=int(payload.get("spots_left") or 0),
        is_open=False,
        flat_payout_rwf=payload.get("flat_payout_rwf"),
        listed_in_admin=True,
        listed_in_discover=True,
        listed_in_brand=True,
    )
    db.add(campaign)
    db.flush()
    db.add(
        BrandInvoice(
            id=new_id("inv"),
            brand_id=brand.id,
            campaign_id=campaign_id,
            label=title,
            creator_budget_rwf=pool,
            fee_rwf=fee + setup_fee,
            setup_fee_rwf=setup_fee,
            total_rwf=budget,
            status="pending",
        )
    )
    db.add(
        BrandCollection(
            id=new_id("col"),
            brand_id=brand.id,
            campaign_id=campaign_id,
            label=title,
            amount_rwf=budget,
            status="pending",
        )
    )
    audit(db, actor, "campaign.create", "campaign", campaign_id, title)
    return {"id": campaign_id}


def upload_campaign_source_asset(
    db: Session,
    actor: Actor,
    campaign_id: str,
    *,
    filename: str,
    data: bytes,
    content_type: str,
) -> dict:
    campaign = db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if not data:
        raise HTTPException(status_code=422, detail="Empty file")
    path = save_campaign_source_asset(campaign_id, filename, data, content_type)
    campaign.source_asset_path = path
    # Surface on open assignments that lack a source URL.
    from app.db.models import Assignment

    for assignment in db.query(Assignment).filter(Assignment.campaign_id == campaign_id).all():
        if not assignment.source_url:
            assignment.source_url = path
    audit(db, actor, "campaign.source_upload", "campaign", campaign_id, filename)
    return {"sourceAssetPath": path}


def create_brand_campaign(db: Session, actor: Actor, payload: dict) -> dict:
    """Brand-scoped draft campaign + pending invoice for the actor's brand."""
    from app.modules.portal.brand_access import load_brand_for_actor

    brand = load_brand_for_actor(db, actor)
    title = str(payload["title"]).strip()
    campaign_type = str(payload["campaign_type"]).strip()
    budget = int(payload["budget_rwf"])
    deadline = str(payload["deadline"]).strip()
    brief = str(payload.get("brief") or "").strip()
    if budget <= 0 or not title or not campaign_type or not deadline:
        raise HTTPException(status_code=422, detail="Campaign fields are incomplete")

    fee_percent = 20
    setup_fee = setup_fee_rwf(budget)
    fee = platform_fee_rwf(budget, fee_percent)
    pool = creator_pool_rwf(budget, fee_percent, setup_fee)
    campaign_id = new_id("cmp")
    campaign = Campaign(
        id=campaign_id,
        brand_id=brand.id,
        title=title,
        brand_portal_title=title,
        status="draft",
        budget_rwf=budget,
        created_at=now_iso(),
        campaign_type=campaign_type,
        deadline=deadline,
        fee_percent=fee_percent,
        content_kind=content_kind_for(campaign_type),
        setup_fee_rwf=setup_fee,
        platform_fee_rwf=fee,
        creator_pool_rwf=pool,
        pool_remaining_rwf=pool,
        rpm_rwf=1500,
        brief=brief or "Brief to be finalized with your team.",
        assignment_mode="open",
        fee_rwf=fee,
        run_period=f"Opens {deadline}",
        is_open=False,
        listed_in_admin=True,
        listed_in_discover=True,
        listed_in_brand=True,
    )
    db.add(campaign)
    db.flush()
    db.add(
        BrandInvoice(
            id=new_id("inv"),
            brand_id=brand.id,
            campaign_id=campaign_id,
            label=title,
            creator_budget_rwf=pool,
            fee_rwf=fee + setup_fee,
            setup_fee_rwf=setup_fee,
            total_rwf=budget,
            status="pending",
        )
    )
    db.add(
        BrandCollection(
            id=new_id("col"),
            brand_id=brand.id,
            campaign_id=campaign_id,
            label=title,
            amount_rwf=budget,
            status="pending",
        )
    )
    audit(db, actor, "campaign.create", "campaign", campaign_id, title)
    return {"id": campaign_id}


def fund_campaign(db: Session, actor: Actor, campaign_id: str) -> dict:
    campaign = db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    if campaign.funded_at:
        return {}
    campaign.funded_at = now_iso()
    campaign.status = "active"
    if campaign.assignment_mode == "open" and campaign.pool_remaining_rwf > 0:
        campaign.is_open = True
    invoice = (
        db.query(BrandInvoice)
        .filter(BrandInvoice.campaign_id == campaign.id)
        .one_or_none()
    )
    if invoice is not None:
        invoice.status = "paid"
    collection = (
        db.query(BrandCollection)
        .filter(BrandCollection.campaign_id == campaign.id)
        .one_or_none()
    )
    if collection is not None:
        collection.status = "paid"
    audit(db, actor, "campaign.fund", "campaign", campaign.id)
    return {}
