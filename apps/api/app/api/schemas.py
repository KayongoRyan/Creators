from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True)


class DevTokenIn(ApiModel):
    role: str
    email: str
    display_name: str | None = Field(default=None, alias="displayName")


class AuthCredentialsIn(ApiModel):
    email: str
    password: str
    role: str
    display_name: str | None = Field(default=None, alias="displayName")


class CreateCampaignIn(ApiModel):
    title: str
    brand_name: str = Field(alias="brandName")
    campaign_type: str = Field(alias="campaignType")
    budget_rwf: int = Field(alias="budgetRwf")
    deadline: str
    platform_fee_percent: int | None = Field(default=None, alias="platformFeePercent")
    rpm_rwf: int | None = Field(default=None, alias="rpmRwf")
    min_views: int | None = Field(default=None, alias="minViews")
    min_payout_rwf: int | None = Field(default=None, alias="minPayoutRwf")
    max_payout_rwf: int | None = Field(default=None, alias="maxPayoutRwf")
    assignment_mode: str | None = Field(default=None, alias="assignmentMode")
    brief: str | None = None
    setup_fee_rwf: int | None = Field(default=None, alias="setupFeeRwf")
    spots_left: int | None = Field(default=None, alias="spotsLeft")
    flat_payout_rwf: int | None = Field(default=None, alias="flatPayoutRwf")


class RevisionIn(ApiModel):
    note: str


class ApplyIn(ApiModel):
    campaign_id: str = Field(alias="campaignId")
    pitch: str | None = None


class SubmitAssignmentIn(ApiModel):
    post_url: str = Field(alias="postUrl")


class ProfilePatch(ApiModel):
    display_name: str | None = Field(default=None, alias="displayName")
    tiktok_handle: str | None = Field(default=None, alias="tiktokHandle")
    instagram_handle: str | None = Field(default=None, alias="instagramHandle")
    tiktok_followers: int | None = Field(default=None, alias="tiktokFollowers")
    instagram_followers: int | None = Field(default=None, alias="instagramFollowers")
    niche: str | None = None
    momo: str | None = None
    label: str | None = None
    campaigns_completed: int | None = Field(default=None, alias="campaignsCompleted")


class SnapshotViewIn(ApiModel):
    submission_id: str = Field(alias="submissionId")
    views: int


class SnapshotIn(ApiModel):
    views: list[SnapshotViewIn]
