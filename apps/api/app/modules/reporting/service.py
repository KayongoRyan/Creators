from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.models import Campaign, Creator, Payout, Submission


def campaign_report(db: Session, campaign_id: str) -> dict:
    campaign = db.get(Campaign, campaign_id)
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    submissions = (
        db.query(Submission).filter(Submission.campaign_id == campaign.id).all()
    )
    lines = []
    total_reach = 0
    total_payout = 0
    for submission in submissions:
        creator = db.get(Creator, submission.creator_id)
        payout = (
            db.query(Payout).filter(Payout.submission_id == submission.id).one_or_none()
        )
        views = submission.views or 0
        amount = payout.amount_rwf if payout is not None else 0
        total_reach += views
        total_payout += amount
        lines.append(
            {
                "creatorName": creator.display_name if creator else "",
                "postUrl": submission.post_url,
                "views": views,
                "payoutRwf": amount,
                "status": submission.status,
            }
        )
    return {
        "campaignId": campaign.id,
        "title": campaign.title,
        "creators": lines,
        "totalReach": total_reach,
        "totalPayoutRwf": total_payout,
        "creatorPoolRwf": campaign.creator_pool_rwf,
        "poolRemainingRwf": campaign.pool_remaining_rwf,
    }
