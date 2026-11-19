from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.core.security import Actor
from app.db.models import (
    AdminEvent,
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
    Profile,
    Submission,
)

_ACTION_TO_ACTIVITY: dict[str, tuple[str, str]] = {
    "campaign.create": ("campaign_created", "/admin/campaigns"),
    "campaign.fund": ("brand_payment", "/admin/campaigns"),
    "campaign.snapshot": ("campaign_created", "/admin/campaigns"),
    "campaign.source_upload": ("campaign_created", "/admin/campaigns"),
    "creator.verify": ("creator_verified", "/admin/creators"),
    "creator.reject": ("creator_rejected", "/admin/creators"),
    "submission.create": ("submission_pending", "/admin/submissions"),
    "submission.approve": ("submission_approved", "/admin/submissions"),
    "submission.reject": ("submission_rejected", "/admin/submissions"),
    "submission.revision": ("submission_revision", "/admin/submissions"),
    "campaign.apply": ("campaign_created", "/admin/campaigns"),
    "campaign.application_accept": ("campaign_created", "/admin/campaigns"),
    "payout.paid": ("payout_paid", "/admin/payments"),
    "payout.paid_all": ("payout_paid", "/admin/payments"),
}

_ACTION_TO_AUDIT: dict[str, tuple[str, str]] = {
    "campaign.create": ("campaign_created", "success"),
    "campaign.fund": ("collection_paid", "success"),
    "campaign.snapshot": ("campaign_updated", "info"),
    "campaign.source_upload": ("campaign_updated", "info"),
    "campaign.apply": ("campaign_updated", "info"),
    "campaign.application_accept": ("campaign_updated", "success"),
    "creator.verify": ("creator_approved", "success"),
    "creator.reject": ("creator_rejected", "warning"),
    "submission.create": ("submission_pending", "info"),
    "submission.approve": ("submission_approved", "success"),
    "submission.reject": ("submission_rejected", "warning"),
    "submission.revision": ("submission_revision", "info"),
    "payout.paid": ("payout_paid", "success"),
    "payout.paid_all": ("payout_batch_paid", "success"),
}


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
    events = (
        db.query(AdminEvent).order_by(AdminEvent.created_at.desc()).limit(80).all()
    )
    profiles = {
        profile.brand_id: profile
        for profile in db.query(Profile).filter(Profile.brand_id.isnot(None)).all()
        if profile.brand_id
    }

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
                **(
                    {"sourceAssetPath": campaign.source_asset_path}
                    if campaign.source_asset_path
                    else {}
                ),
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
                "appliedAt": application.created_at,
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
                "creatorName": creator_by_id[submission.creator_id].display_name
                if submission.creator_id in creator_by_id
                else "",
                "handle": creator_by_id[submission.creator_id].tiktok_handle
                if submission.creator_id in creator_by_id
                else "",
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
        "brandAccounts": _brand_accounts(db, brands, profiles),
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
        "activityLog": [
            row
            for event in events
            if (row := _activity_from_event(event)) is not None
        ],
        "auditLog": [_audit_from_event(event) for event in events],
        "analytics": _derived_analytics(db),
    }


def _brand_accounts(
    db: Session,
    brands: dict[str, Brand],
    profiles: dict[str, Profile],
) -> list[dict]:
    accounts: list[dict] = []
    for brand_id, brand in brands.items():
        profile = profiles.get(brand_id)
        campaigns = db.query(Campaign).filter(Campaign.brand_id == brand_id).all()
        spent = sum(
            campaign.spend_rwf or 0
            for campaign in campaigns
            if campaign.status in {"active", "completed"}
        )
        if campaigns:
            last_active = max(campaign.created_at for campaign in campaigns)
        else:
            last_active = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%S.000Z")
        pending_invoice = (
            db.query(BrandInvoice)
            .filter(BrandInvoice.brand_id == brand_id, BrandInvoice.status == "pending")
            .first()
        )
        status = "pending_payment" if pending_invoice is not None else "active"
        accounts.append(
            {
                "id": brand.id,
                "name": brand.name,
                "contactName": profile.display_name if profile else brand.legal_name,
                "contactEmail": profile.email if profile else "",
                "status": status,
                "campaignsRun": len(campaigns),
                "totalSpentRwf": spent,
                "lastActiveAt": last_active,
                "joinedAt": last_active,
            }
        )
    return accounts


def _activity_from_event(event: AdminEvent) -> dict | None:
    mapped = _ACTION_TO_ACTIVITY.get(event.action)
    if mapped is None:
        return None
    kind, href = mapped
    summary = event.detail or event.action
    return {
        "id": event.id,
        "at": event.created_at,
        "kind": kind,
        "actorLabel": event.actor_email.split("@")[0] if event.actor_email else "Admin",
        "summary": summary,
        "href": href,
    }


def _audit_from_event(event: AdminEvent) -> dict:
    mapped = _ACTION_TO_AUDIT.get(event.action, ("settings_updated", "info"))
    action, severity = mapped
    return {
        "id": event.id,
        "at": event.created_at,
        "actorName": event.actor_email.split("@")[0] if event.actor_email else "Admin",
        "actorRole": "admin",
        "actorEmail": event.actor_email,
        "action": action,
        "summary": event.detail or f"{event.action} · {event.entity_type}",
        "targetLabel": event.entity_id,
        "source": f"/admin/{event.entity_type}",
        "severity": severity,
    }


def _day_key(value: str | None) -> str | None:
    if not value:
        return None
    return value[:10]


def _derived_analytics(db: Session) -> dict:
    today = datetime.now(UTC).date()
    days = [today - timedelta(days=offset) for offset in range(13, -1, -1)]
    day_keys = [day.isoformat() for day in days]

    campaigns_by_day: dict[str, int] = defaultdict(int)
    for campaign in db.query(Campaign).all():
        key = _day_key(campaign.created_at)
        if key in day_keys:
            campaigns_by_day[key] += 1

    apps_by_day: dict[str, int] = defaultdict(int)
    for application in db.query(CreatorApplication).all():
        key = _day_key(application.created_at)
        if key in day_keys:
            apps_by_day[key] += 1

    submissions_by_day: dict[str, int] = defaultdict(int)
    approvals_by_day: dict[str, int] = defaultdict(int)
    for submission in db.query(Submission).all():
        key = _day_key(submission.submitted_at)
        if key in day_keys:
            submissions_by_day[key] += 1
            if submission.status == "approved":
                approvals_by_day[key] += 1

    collections_by_day: dict[str, int] = defaultdict(int)
    for collection in db.query(BrandCollection).filter(BrandCollection.status == "paid").all():
        # No paid_at column — attribute to "today" bucket if paid, else skip series noise.
        collections_by_day[day_keys[-1]] += collection.amount_rwf

    payouts_by_day: dict[str, int] = defaultdict(int)
    for payout in db.query(Payout).filter(Payout.status == "paid").all():
        payouts_by_day[day_keys[-1]] += payout.amount_rwf

    campaign_apps_by_day: dict[str, int] = defaultdict(int)
    for application in db.query(CampaignApplication).all():
        key = _day_key(application.applied_at)
        if key in day_keys:
            campaign_apps_by_day[key] += 1

    daily = [
        {
            "date": key,
            "visitors": 0,
            "pageViews": 0,
            "signups": apps_by_day[key],
            "activeUsers": 0,
            "campaignsCreated": campaigns_by_day[key],
            "creatorApplications": apps_by_day[key],
            "campaignApplications": campaign_apps_by_day[key],
            "submissions": submissions_by_day[key],
            "approvals": approvals_by_day[key],
            "collectionsRwf": collections_by_day[key],
            "payoutsRwf": payouts_by_day[key],
        }
        for key in day_keys
    ]

    return {
        "daily": daily,
        "trafficSources": [],
        "devices": [],
        "topPages": [],
        "reviewSla": {
            "targetHours": 48,
            "avgHours": 0,
            "medianHours": 0,
            "withinSlaPercent": 0,
        },
    }


def brand_state(db: Session, actor: Actor) -> dict:
    from app.modules.portal.brand_access import load_brand_for_actor

    try:
        brand = load_brand_for_actor(db, actor)
    except HTTPException:
        return {"brandName": "", "companyLine": "", "campaigns": [], "invoices": []}
    campaigns = (
        db.query(Campaign)
        .filter(Campaign.brand_id == brand.id)
        .order_by(Campaign.created_at.desc())
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
                "campaignId": invoice.campaign_id,
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
            "momo": creator.phone or creator.momo,
            "phone": creator.phone or creator.momo,
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
