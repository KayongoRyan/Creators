from sqlalchemy.orm import Session

from app.core.security import Actor
from app.db.models import (
    Assignment,
    Brand,
    BrandCollection,
    BrandInvoice,
    BrandPost,
    Campaign,
    CampaignApplication,
    Creator,
    CreatorApplication,
    CreatorEarning,
    Payout,
    Submission,
)


def _followers_label(count: int) -> str:
    if count >= 1000:
        return f"{round(count / 1000)}K"
    return str(count)


def verified_handle(creator: Creator) -> str:
    return f"{creator.tiktok_handle} · TikTok {_followers_label(creator.tiktok_followers)}"


def admin_state(db: Session) -> dict:
    brands = {brand.id: brand for brand in db.query(Brand).all()}
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.listed_in_admin.is_(True))
        .order_by(Campaign.created_at.desc())
        .all()
    )
    applications = (
        db.query(CreatorApplication)
        .filter(CreatorApplication.status == "pending")
        .order_by(CreatorApplication.created_at.asc())
        .all()
    )
    creators = db.query(Creator).order_by(Creator.campaigns_completed.desc()).all()
    submissions = db.query(Submission).order_by(Submission.submitted_at.desc()).all()
    campaign_titles = {campaign.id: campaign.title for campaign in db.query(Campaign).all()}
    creator_by_id = {creator.id: creator for creator in creators}
    collections = db.query(BrandCollection).all()
    payouts = db.query(Payout).all()

    return {
        "campaigns": [
            {
                "id": campaign.id,
                "brandId": campaign.brand_id,
                "title": campaign.title,
                "status": campaign.status,
                "budgetCents": campaign.budget_rwf * 100,
                "createdAt": campaign.created_at,
                "brandName": brands[campaign.brand_id].legal_name,
                "campaignType": campaign.campaign_type,
                "deadline": campaign.deadline,
                "feePercent": campaign.fee_percent,
                "assignedCreators": campaign.assigned_creators,
                "submissionsReceived": campaign.submissions_received,
                "submissionsApproved": campaign.submissions_approved,
                "poolRemainingRwf": campaign.pool_remaining_rwf,
                "creatorPoolRwf": campaign.creator_pool_rwf,
                "rpmRwf": campaign.rpm_rwf,
                "minViews": campaign.min_views,
                "minPayoutRwf": campaign.min_payout_rwf,
                "maxPayoutRwf": campaign.max_payout_rwf,
                "setupFeeRwf": campaign.setup_fee_rwf,
                "fundedAt": campaign.funded_at,
            }
            for campaign in campaigns
        ],
        "creatorApplications": [
            {
                "id": application.id,
                "fullName": application.full_name,
                "tiktokHandle": application.tiktok_handle,
                "instagramHandle": application.instagram_handle,
                "tiktokFollowers": application.tiktok_followers,
                "instagramFollowers": application.instagram_followers,
                "niche": application.niche,
                "status": application.status,
            }
            for application in applications
        ],
        "verifiedCreators": [
            {
                "id": creator.id,
                "displayName": creator.display_name,
                "handle": verified_handle(creator),
                "campaignsCompleted": creator.campaigns_completed,
                "label": creator.label,
            }
            for creator in creators
        ],
        "submissions": [
            {
                "id": submission.id,
                "campaignId": submission.campaign_id,
                "campaignTitle": campaign_titles.get(submission.campaign_id, ""),
                "creatorName": creator_by_id[submission.creator_id].display_name,
                "handle": creator_by_id[submission.creator_id].tiktok_handle,
                **(
                    {"postUrl": submission.post_url}
                    if submission.post_url
                    else {}
                ),
                "status": submission.status,
                **(
                    {"revisionNote": submission.revision_note}
                    if submission.revision_note
                    else {}
                ),
                "submittedAt": submission.submitted_at,
            }
            for submission in submissions
        ],
        "brandCollections": [
            {
                "id": collection.id,
                "label": collection.label,
                "amountRwf": collection.amount_rwf,
                "status": collection.status,
            }
            for collection in collections
        ],
        "payouts": [
            {
                "id": payout.id,
                "creatorName": payout.creator_name,
                "handle": payout.handle,
                "campaignTitle": payout.campaign_title,
                "amountRwf": payout.amount_rwf,
                "status": payout.status,
            }
            for payout in payouts
        ],
    }


def brand_state(db: Session, actor: Actor) -> dict:
    if not actor.brand_id:
        return {"brandName": "", "companyLine": "", "campaigns": [], "invoices": []}
    brand = db.get(Brand, actor.brand_id)
    if brand is None:
        return {"brandName": "", "companyLine": "", "campaigns": [], "invoices": []}
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.brand_id == brand.id, Campaign.listed_in_brand.is_(True))
        .all()
    )
    invoices = (
        db.query(BrandInvoice).filter(BrandInvoice.brand_id == brand.id).all()
    )
    return {
        "brandName": brand.name,
        "companyLine": brand.company_line,
        "campaigns": [_brand_campaign(db, campaign) for campaign in campaigns],
        "invoices": [
            {
                "id": invoice.id,
                "label": invoice.label,
                "creatorBudgetRwf": invoice.creator_budget_rwf,
                "feeRwf": invoice.fee_rwf,
                "totalRwf": invoice.total_rwf,
                "status": invoice.status,
            }
            for invoice in invoices
        ],
    }


def _brand_campaign(db: Session, campaign: Campaign) -> dict:
    posts = db.query(BrandPost).filter(BrandPost.campaign_id == campaign.id).all()
    return {
        "id": campaign.id,
        "title": campaign.brand_portal_title or campaign.title,
        "status": campaign.status,
        "runPeriod": campaign.run_period,
        "budgetRwf": campaign.budget_rwf,
        "feeRwf": campaign.fee_rwf,
        "campaignType": campaign.campaign_type,
        "brief": campaign.brief,
        "assignedCreators": campaign.assigned_creators,
        "submitted": campaign.submissions_received,
        "approved": campaign.submissions_approved,
        "posts": [
            {
                "id": post.id,
                "creatorName": post.creator_name,
                "handle": post.handle,
                "platform": post.platform,
                "followersLabel": post.followers_label,
                **({"postUrl": post.post_url} if post.post_url else {}),
                **({"views": post.views} if post.views is not None else {}),
                "status": post.status,
            }
            for post in posts
        ],
        "performance": {
            "totalViews": campaign.total_views,
            "engagementRate": campaign.engagement_rate,
            "spendRwf": campaign.spend_rwf,
        },
    }


def creator_state(db: Session, actor: Actor) -> dict:
    creator = db.get(Creator, actor.creator_id) if actor.creator_id else None
    if creator is None:
        raise LookupError("creator profile is not linked")
    discover = (
        db.query(Campaign)
        .filter(Campaign.listed_in_discover.is_(True))
        .all()
    )
    brands = {brand.id: brand for brand in db.query(Brand).all()}
    assignments = (
        db.query(Assignment).filter(Assignment.creator_id == creator.id).all()
    )
    applications = (
        db.query(CampaignApplication)
        .filter(CampaignApplication.creator_id == creator.id)
        .all()
    )
    earnings = (
        db.query(CreatorEarning).filter(CreatorEarning.creator_id == creator.id).all()
    )
    return {
        "profile": {
            "displayName": creator.display_name,
            "tiktokHandle": creator.tiktok_handle,
            "instagramHandle": creator.instagram_handle,
            "tiktokFollowers": creator.tiktok_followers,
            "instagramFollowers": creator.instagram_followers,
            "niche": creator.niche,
            "momo": creator.momo,
            "label": creator.label,
            "campaignsCompleted": creator.campaigns_completed,
        },
        "discover": [
            {
                "id": campaign.id,
                "brandName": brands[campaign.brand_id].name,
                "title": campaign.title,
                "campaignType": campaign.campaign_type,
                "brief": campaign.brief,
                **(
                    {"rpmRwf": campaign.rpm_rwf}
                    if campaign.flat_payout_rwf is None
                    else {}
                ),
                **(
                    {"flatPayoutRwf": campaign.flat_payout_rwf}
                    if campaign.flat_payout_rwf is not None
                    else {}
                ),
                "deadline": campaign.deadline,
                "spotsLeft": campaign.spots_left,
                "open": campaign.is_open and campaign.pool_remaining_rwf > 0,
                "poolRemainingRwf": campaign.pool_remaining_rwf,
            }
            for campaign in discover
        ],
        "assignments": [
            {
                "id": assignment.id,
                "campaignId": assignment.campaign_id,
                "title": assignment.title,
                "brief": assignment.brief,
                **({"sourceUrl": assignment.source_url} if assignment.source_url else {}),
                "payoutRwf": assignment.payout_rwf,
                "deadline": assignment.deadline,
                **({"postUrl": assignment.post_url} if assignment.post_url else {}),
                "status": assignment.status,
            }
            for assignment in assignments
        ],
        "applications": [
            {
                "campaignId": application.campaign_id,
                "status": application.status,
                "appliedAt": application.applied_at,
                **({"pitch": application.pitch} if application.pitch else {}),
            }
            for application in applications
        ],
        "earnings": [
            {
                "id": earning.id,
                "campaignTitle": earning.campaign_title,
                "amountRwf": earning.amount_rwf,
                "status": earning.status,
                **({"payoutDate": earning.payout_date} if earning.payout_date else {}),
            }
            for earning in earnings
        ],
    }


def legacy_campaigns(db: Session) -> list[dict]:
    state = admin_state(db)
    return state["campaigns"]


def legacy_submissions(db: Session) -> list[dict]:
    rows = db.query(Submission).order_by(Submission.submitted_at.desc()).all()
    return [
        {
            "id": row.id,
            "campaignId": row.campaign_id,
            "creatorId": row.creator_id,
            "status": row.status,
            "submittedAt": row.submitted_at,
        }
        for row in rows
    ]


def legacy_payments(db: Session) -> list[dict]:
    rows = db.query(Payout).all()
    return [
        {
            "id": row.id,
            "creatorId": row.creator_id or "",
            "amountCents": row.amount_rwf * 100,
            "status": row.status,
            "creatorName": row.creator_name,
            "campaignTitle": row.campaign_title,
            **({"paidAt": row.paid_at} if row.paid_at else {}),
        }
        for row in rows
    ]


def legacy_earnings(db: Session, actor: Actor) -> dict:
    if not actor.creator_id:
        pending = (
            db.query(Payout).filter(Payout.status == "pending").all()
        )
        return {
            "availableCents": 0,
            "pendingCents": sum(row.amount_rwf * 100 for row in pending),
        }
    earnings = (
        db.query(CreatorEarning)
        .filter(CreatorEarning.creator_id == actor.creator_id)
        .all()
    )
    available = sum(
        row.amount_rwf for row in earnings if row.status in {"approved", "paid"}
    )
    pending = sum(row.amount_rwf for row in earnings if row.status == "pending")
    return {"availableCents": available * 100, "pendingCents": pending * 100}


def legacy_brands(db: Session) -> list[dict]:
    brands = db.query(Brand).all()
    result = []
    for brand in brands:
        active = (
            db.query(Campaign)
            .filter(Campaign.brand_id == brand.id, Campaign.status == "active")
            .count()
        )
        result.append(
            {"id": brand.id, "name": brand.legal_name, "activeCampaigns": active}
        )
    return result


def legacy_creators(db: Session) -> list[dict]:
    creators = db.query(Creator).all()
    return [
        {"id": creator.id, "displayName": creator.display_name, "niche": creator.niche}
        for creator in creators
    ]
