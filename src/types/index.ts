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
};

export type SubmissionStatus = "pending" | "approved" | "rejected";

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
};
