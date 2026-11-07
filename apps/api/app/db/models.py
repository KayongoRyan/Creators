from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    legal_name: Mapped[str] = mapped_column(String(255))
    company_line: Mapped[str] = mapped_column(String(255), default="")


class Creator(Base):
    __tablename__ = "creators"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    display_name: Mapped[str] = mapped_column(String(255))
    tiktok_handle: Mapped[str] = mapped_column(String(255), default="")
    instagram_handle: Mapped[str] = mapped_column(String(255), default="")
    tiktok_followers: Mapped[int] = mapped_column(Integer, default=0)
    instagram_followers: Mapped[int] = mapped_column(Integer, default=0)
    niche: Mapped[str] = mapped_column(String(128), default="")
    momo: Mapped[str] = mapped_column(String(64), default="")
    label: Mapped[str] = mapped_column(String(32), default="New")
    campaigns_completed: Mapped[int] = mapped_column(Integer, default=0)


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(16), index=True)
    display_name: Mapped[str] = mapped_column(String(255))
    brand_id: Mapped[str | None] = mapped_column(ForeignKey("brands.id"), nullable=True)
    creator_id: Mapped[str | None] = mapped_column(ForeignKey("creators.id"), nullable=True)


class CreatorApplication(Base):
    __tablename__ = "creator_applications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tiktok_handle: Mapped[str] = mapped_column(String(255), default="")
    instagram_handle: Mapped[str] = mapped_column(String(255), default="")
    tiktok_followers: Mapped[int] = mapped_column(Integer, default=0)
    instagram_followers: Mapped[int] = mapped_column(Integer, default=0)
    niche: Mapped[str] = mapped_column(String(128), default="")
    momo_phone: Mapped[str] = mapped_column(String(64), default="")
    screenshot_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    why_join: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True)
    created_at: Mapped[str] = mapped_column(String(40))


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    brand_portal_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    budget_rwf: Mapped[int] = mapped_column(BigInteger)
    created_at: Mapped[str] = mapped_column(String(40))
    campaign_type: Mapped[str] = mapped_column(String(128))
    deadline: Mapped[str] = mapped_column(String(64), default="")
    fee_percent: Mapped[int] = mapped_column(Integer, default=20)
    assigned_creators: Mapped[int] = mapped_column(Integer, default=0)
    submissions_received: Mapped[int] = mapped_column(Integer, default=0)
    submissions_approved: Mapped[int] = mapped_column(Integer, default=0)
    content_kind: Mapped[str] = mapped_column(String(32), default="ugc")
    setup_fee_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    platform_fee_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    creator_pool_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    pool_remaining_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    rpm_rwf: Mapped[int] = mapped_column(BigInteger, default=1500)
    min_views: Mapped[int] = mapped_column(Integer, default=0)
    min_payout_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    max_payout_rwf: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    view_snapshot_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    payout_due_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    brief: Mapped[str] = mapped_column(Text, default="")
    assignment_mode: Mapped[str] = mapped_column(String(32), default="open")
    funded_at: Mapped[str | None] = mapped_column(String(40), nullable=True)
    run_period: Mapped[str] = mapped_column(String(128), default="")
    fee_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    engagement_rate: Mapped[str] = mapped_column(String(32), default="0%")
    spend_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    total_views: Mapped[int] = mapped_column(Integer, default=0)
    spots_left: Mapped[int] = mapped_column(Integer, default=0)
    is_open: Mapped[bool] = mapped_column(Boolean, default=False)
    flat_payout_rwf: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    listed_in_admin: Mapped[bool] = mapped_column(Boolean, default=True)
    listed_in_discover: Mapped[bool] = mapped_column(Boolean, default=False)
    listed_in_brand: Mapped[bool] = mapped_column(Boolean, default=False)


class CampaignApplication(Base):
    __tablename__ = "campaign_applications"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    campaign_id: Mapped[str] = mapped_column(ForeignKey("campaigns.id"), index=True)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), index=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    pitch: Mapped[str | None] = mapped_column(Text, nullable=True)
    applied_at: Mapped[str] = mapped_column(String(40))


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    campaign_id: Mapped[str] = mapped_column(ForeignKey("campaigns.id"), index=True)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    brief: Mapped[str] = mapped_column(Text, default="")
    source_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    payout_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    deadline: Mapped[str] = mapped_column(String(64), default="")
    post_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="not_submitted")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    campaign_id: Mapped[str] = mapped_column(ForeignKey("campaigns.id"), index=True)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), index=True)
    assignment_id: Mapped[str | None] = mapped_column(ForeignKey("assignments.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    post_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    revision_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[str] = mapped_column(String(40))
    views: Mapped[int | None] = mapped_column(Integer, nullable=True)


class BrandPost(Base):
    __tablename__ = "brand_posts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    campaign_id: Mapped[str] = mapped_column(ForeignKey("campaigns.id"), index=True)
    submission_id: Mapped[str | None] = mapped_column(ForeignKey("submissions.id"), nullable=True)
    creator_name: Mapped[str] = mapped_column(String(255))
    handle: Mapped[str] = mapped_column(String(255))
    platform: Mapped[str] = mapped_column(String(64))
    followers_label: Mapped[str] = mapped_column(String(64))
    post_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    views: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(32))


class Payout(Base):
    __tablename__ = "payouts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    creator_id: Mapped[str | None] = mapped_column(ForeignKey("creators.id"), nullable=True)
    campaign_id: Mapped[str | None] = mapped_column(ForeignKey("campaigns.id"), nullable=True)
    submission_id: Mapped[str | None] = mapped_column(ForeignKey("submissions.id"), nullable=True)
    creator_name: Mapped[str] = mapped_column(String(255))
    handle: Mapped[str] = mapped_column(String(255))
    campaign_title: Mapped[str] = mapped_column(String(255))
    amount_rwf: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(32), index=True)
    views_at_snapshot: Mapped[int | None] = mapped_column(Integer, nullable=True)
    paid_at: Mapped[str | None] = mapped_column(String(40), nullable=True)


class CreatorEarning(Base):
    __tablename__ = "creator_earnings"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    creator_id: Mapped[str] = mapped_column(ForeignKey("creators.id"), index=True)
    campaign_title: Mapped[str] = mapped_column(String(255))
    amount_rwf: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(32))
    payout_date: Mapped[str | None] = mapped_column(String(40), nullable=True)
    payout_id: Mapped[str | None] = mapped_column(ForeignKey("payouts.id"), nullable=True)


class BrandInvoice(Base):
    __tablename__ = "brand_invoices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    brand_id: Mapped[str] = mapped_column(ForeignKey("brands.id"), index=True)
    campaign_id: Mapped[str | None] = mapped_column(ForeignKey("campaigns.id"), nullable=True)
    label: Mapped[str] = mapped_column(String(255))
    creator_budget_rwf: Mapped[int] = mapped_column(BigInteger)
    fee_rwf: Mapped[int] = mapped_column(BigInteger)
    setup_fee_rwf: Mapped[int] = mapped_column(BigInteger, default=0)
    total_rwf: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(32))


class BrandCollection(Base):
    __tablename__ = "brand_collections"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    brand_id: Mapped[str | None] = mapped_column(ForeignKey("brands.id"), nullable=True)
    campaign_id: Mapped[str | None] = mapped_column(ForeignKey("campaigns.id"), nullable=True)
    label: Mapped[str] = mapped_column(String(255))
    amount_rwf: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String(32))


class AdminEvent(Base):
    __tablename__ = "admin_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    actor_email: Mapped[str] = mapped_column(String(255))
    action: Mapped[str] = mapped_column(String(64))
    entity_type: Mapped[str] = mapped_column(String(64))
    entity_id: Mapped[str] = mapped_column(String(64))
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String(40))


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    response_json: Mapped[str] = mapped_column(Text)
