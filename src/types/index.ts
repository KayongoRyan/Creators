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

export type AdminState = {
  campaigns: Campaign[];
  creatorApplications: CreatorApplication[];
  verifiedCreators: VerifiedCreator[];
  submissions: AdminSubmission[];
  brandCollections: BrandCollection[];
  payouts: PayoutRecord[];
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
  label: string;
  creatorBudgetRwf: number;
  feeRwf: number;
  totalRwf: number;
  status: "paid" | "pending";
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
