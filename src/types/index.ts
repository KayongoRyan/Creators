export type UserRole = "admin" | "brand" | "creator";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
};

export type CampaignStatus = "draft" | "active" | "paused" | "completed";

export type Campaign = {
  id: string;
  brandId: string;
  title: string;
  status: CampaignStatus;
  budgetCents: number;
  createdAt: string;
  brandName?: string;
  campaignType?: string;
  deadline?: string;
  feePercent?: number;
  assignedCreators?: number;
  submissionsReceived?: number;
  submissionsApproved?: number;
  poolRemainingRwf?: number;
  creatorPoolRwf?: number;
  fundedAt?: string | null;
};

export type CampaignReportLine = {
  creatorName: string;
  postUrl?: string | null;
  views: number;
  payoutRwf: number;
  status: string;
};

export type CampaignReport = {
  campaignId: string;
  title: string;
  creators: CampaignReportLine[];
  totalReach: number;
  totalPayoutRwf: number;
  creatorPoolRwf: number;
  poolRemainingRwf: number;
};

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision";

export type Submission = {
  id: string;
  campaignId: string;
  creatorId: string;
  status: SubmissionStatus;
  submittedAt: string;
};

export type PaymentStatus = "pending" | "paid" | "failed";

export type Payment = {
  id: string;
  creatorId: string;
  amountCents: number;
  status: PaymentStatus;
  paidAt?: string;
  creatorName?: string;
  campaignTitle?: string;
};

export type CreatorApplicationStatus = "pending" | "verified" | "rejected";

export type CreatorApplication = {
  id: string;
  fullName: string;
  tiktokHandle: string;
  instagramHandle: string;
  tiktokFollowers: number;
  instagramFollowers: number;
  niche: string;
  status: CreatorApplicationStatus;
};

export type VerifiedCreator = {
  id: string;
  displayName: string;
  handle: string;
  campaignsCompleted: number;
  label: "Reliable" | "New";
  status?: "active" | "suspended";
};

export type BrandAccountStatus = "active" | "suspended" | "pending_payment";

export type BrandAccount = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  momoPhone?: string;
  status: BrandAccountStatus;
  campaignsRun: number;
  totalSpentRwf: number;
  lastActiveAt: string;
};

export type AdminActivityKind =
  | "creator_application"
  | "creator_verified"
  | "creator_rejected"
  | "creator_suspended"
  | "creator_reactivated"
  | "submission_pending"
  | "submission_approved"
  | "submission_rejected"
  | "submission_revision"
  | "campaign_created"
  | "payout_paid"
  | "brand_payment"
  | "brand_status";

export type AdminActivityEvent = {
  id: string;
  at: string;
  kind: AdminActivityKind;
  actorLabel: string;
  summary: string;
  href?: string;
};

export type AdminSubmission = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorName: string;
  handle: string;
  postUrl?: string;
  status: SubmissionStatus;
  revisionNote?: string;
  submittedAt: string;
};

export type PayoutRecord = {
  id: string;
  creatorName: string;
  handle: string;
  campaignTitle: string;
  amountRwf: number;
  status: PaymentStatus;
};

export type BrandCollection = {
  id: string;
  label: string;
  amountRwf: number;
  status: "paid" | "pending";
};

export type CreateCampaignInput = {
  title: string;
  brandName: string;
  campaignType: string;
  budgetRwf: number;
  deadline: string;
};

/** One day of platform traffic and business activity (analytics series). */
export type PlatformDailyMetric = {
  /** UTC date, `YYYY-MM-DD`. */
  date: string;
  visitors: number;
  pageViews: number;
  signups: number;
  activeUsers: number;
  campaignsCreated: number;
  creatorApplications: number;
  campaignApplications: number;
  submissions: number;
  approvals: number;
  collectionsRwf: number;
  payoutsRwf: number;
};

/** Acquisition channel share, 0–100. */
export type TrafficSource = {
  label: string;
  share: number;
};

/** Device share, 0–100. */
export type DeviceShare = {
  label: "Mobile" | "Desktop" | "Tablet";
  share: number;
};

/** Most visited routes with average time on page. */
export type TopPageMetric = {
  path: string;
  share: number;
  avgSeconds: number;
};

export type ReviewSla = {
  targetHours: number;
  avgHours: number;
  medianHours: number;
  withinSlaPercent: number;
};

export type PlatformAnalytics = {
  daily: PlatformDailyMetric[];
  trafficSources: TrafficSource[];
  devices: DeviceShare[];
  topPages: TopPageMetric[];
  reviewSla: ReviewSla;
};

export type AuditActorRole = UserRole | "guest" | "system";

export type AuditAction =
  | "page_view"
  | "login"
  | "logout"
  | "register"
  | "campaign_created"
  | "campaign_updated"
  | "campaign_paused"
  | "creator_application"
  | "creator_applied"
  | "campaign_applied"
  | "creator_approved"
  | "creator_rejected"
  | "creator_suspended"
  | "creator_reactivated"
  | "submission_created"
  | "submission_approved"
  | "submission_rejected"
  | "submission_revision"
  | "payout_paid"
  | "payout_batch_paid"
  | "collection_paid"
  | "brand_status_updated"
  | "profile_updated"
  | "settings_updated";

export type AuditSeverity = "info" | "success" | "warning" | "critical";

/** A single action performed anywhere on the platform. */
export type AuditEvent = {
  id: string;
  at: string;
  actorName: string;
  actorRole: AuditActorRole;
  action: AuditAction;
  summary: string;
  targetLabel?: string;
  href?: string;
  /** Route or page where the action happened. */
  source?: string;
  severity: AuditSeverity;
  device?: "mobile" | "desktop" | "tablet";
  ip?: string;
};

export type AdminState = {
  campaigns: Campaign[];
  creatorApplications: CreatorApplication[];
  verifiedCreators: VerifiedCreator[];
  submissions: AdminSubmission[];
  brandCollections: BrandCollection[];
  brandAccounts: BrandAccount[];
  payouts: PayoutRecord[];
  activityLog: AdminActivityEvent[];
  analytics: PlatformAnalytics;
  auditLog: AuditEvent[];
};

export type BrandPostLink = {
  id: string;
  creatorName: string;
  handle: string;
  platform: string;
  followersLabel: string;
  postUrl?: string;
  views?: number;
  status: SubmissionStatus | "not_submitted";
};

export type BrandCampaignView = {
  id: string;
  title: string;
  status: CampaignStatus;
  runPeriod: string;
  budgetRwf: number;
  feeRwf: number;
  campaignType: string;
  brief: string;
  assignedCreators: number;
  submitted: number;
  approved: number;
  posts: BrandPostLink[];
  performance: {
    totalViews: number;
    engagementRate: string;
    spendRwf: number;
  };
};

export type BrandInvoice = {
  id: string;
  /** Matches BrandCampaignView.id when tied to a live brief */
  campaignId?: string;
  label: string;
  creatorBudgetRwf: number;
  feeRwf: number;
  totalRwf: number;
  status: "paid" | "pending";
  /** Used for ordering within each finance bucket */
  issuedAt?: string;
};

export type BrandInvoiceBucket = "unfinished" | "new" | "closed";

export type BrandCreateCampaignInput = {
  title: string;
  campaignType: string;
  budgetRwf: number;
  deadline: string;
  brief: string;
};

export type BrandState = {
  brandName: string;
  companyLine: string;
  campaigns: BrandCampaignView[];
  invoices: BrandInvoice[];
};

export type CreatorProfile = {
  displayName: string;
  tiktokHandle: string;
  instagramHandle: string;
  tiktokFollowers: number;
  instagramFollowers: number;
  niche: string;
  momo: string;
  label: string;
  campaignsCompleted: number;
};

export type DiscoverCampaign = {
  id: string;
  brandName: string;
  title: string;
  campaignType: string;
  brief: string;
  rpmRwf?: number;
  flatPayoutRwf?: number;
  deadline: string;
  spotsLeft: number;
  open: boolean;
  poolRemainingRwf?: number;
};

export type CreatorAssignment = {
  id: string;
  campaignId: string;
  title: string;
  brief: string;
  sourceUrl?: string;
  payoutRwf: number;
  deadline: string;
  postUrl?: string;
  status: SubmissionStatus | "not_submitted";
  revisionNote?: string;
};

export type CampaignApplicationStatus = "pending" | "accepted" | "rejected";

export type CampaignApplication = {
  campaignId: string;
  status: CampaignApplicationStatus;
  appliedAt: string;
  pitch?: string;
};

export type CreatorEarningLine = {
  id: string;
  campaignTitle: string;
  amountRwf: number;
  status: "approved" | "pending" | "paid";
  payoutDate?: string;
};

export type CreatorState = {
  profile: CreatorProfile;
  discover: DiscoverCampaign[];
  assignments: CreatorAssignment[];
  applications: CampaignApplication[];
  earnings: CreatorEarningLine[];
};
