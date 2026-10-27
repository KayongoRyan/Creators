import type { Campaign, Payment, Submission, User } from "@/types";

export type BrandRecord = {
  id: string;
  name: string;
  activeCampaigns: number;
};

export type CreatorRecord = {
  id: string;
  displayName: string;
  niche: string;
};

export type EarningsSnapshot = {
  availableCents: number;
  pendingCents: number;
};

export const fixtures = {
  campaigns: [
    {
      id: "cmp_1",
      brandId: "br_1",
      title: "Summer launch UGC",
      status: "active",
      budgetCents: 250_000,
      createdAt: "2026-03-01T10:00:00.000Z",
    },
    {
      id: "cmp_2",
      brandId: "br_2",
      title: "App install creatives",
      status: "draft",
      budgetCents: 120_000,
      createdAt: "2026-03-10T14:00:00.000Z",
    },
  ] satisfies Campaign[],
  brands: [
    { id: "br_1", name: "Northwind", activeCampaigns: 2 },
    { id: "br_2", name: "Contoso", activeCampaigns: 1 },
  ] satisfies BrandRecord[],
  creators: [
    { id: "cr_1", displayName: "Alex Rivera", niche: "Tech reviews" },
    { id: "cr_2", displayName: "Jordan Lee", niche: "Fitness" },
  ] satisfies CreatorRecord[],
  submissions: [
    {
      id: "sub_1",
      campaignId: "cmp_1",
      creatorId: "cr_1",
      status: "pending",
      submittedAt: "2026-03-12T09:00:00.000Z",
    },
    {
      id: "sub_2",
      campaignId: "cmp_1",
      creatorId: "cr_2",
      status: "approved",
      submittedAt: "2026-03-11T16:30:00.000Z",
    },
  ] satisfies Submission[],
  payments: [
    {
      id: "pay_1",
      creatorId: "cr_2",
      amountCents: 45_000,
      status: "paid",
      paidAt: "2026-03-08T12:00:00.000Z",
    },
    {
      id: "pay_2",
      creatorId: "cr_1",
      amountCents: 30_000,
      status: "pending",
    },
  ] satisfies Payment[],
  earnings: {
    availableCents: 45_000,
    pendingCents: 30_000,
  } satisfies EarningsSnapshot,
  users: [] satisfies User[],
} as const;
