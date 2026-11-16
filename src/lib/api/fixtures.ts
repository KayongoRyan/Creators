import { buildPlatformAnalytics, buildSeedAuditLog } from "@/lib/analytics/seed";
import type {
  AdminState,
  Campaign,
  Payment,
  Submission,
  User,
} from "@/types";

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

const SEED_REFERENCE_AT = Date.UTC(2026, 4, 24, 16, 0, 0);

export const adminSeed: AdminState = buildAdminSeed();

function buildAdminSeed(): AdminState {
  const seed: AdminState = {

  campaigns: [
    {
      id: "cmp_primus",
      brandId: "br_primus",
      title: "Primus Beer — reaction videos",
      status: "active",
      budgetCents: 60_000_000,
      createdAt: "2026-05-01T10:00:00.000Z",
      brandName: "Primus Beer (Bralirwa)",
      campaignType: "UGC reaction",
      deadline: "2026-06-03",
      feePercent: 20,
      assignedCreators: 8,
      submissionsReceived: 5,
      submissionsApproved: 3,
    },
    {
      id: "cmp_iwacu",
      brandId: "br_iwacu",
      title: "Iwacu Music — song clip campaign",
      status: "active",
      budgetCents: 40_000_000,
      createdAt: "2026-05-10T14:00:00.000Z",
      brandName: "Iwacu Music",
      campaignType: "Clipping (CPM)",
      deadline: "2026-06-08",
      feePercent: 20,
      assignedCreators: 5,
      submissionsReceived: 2,
      submissionsApproved: 2,
    },
    {
      id: "cmp_kcb",
      brandId: "br_kcb",
      title: "KCB Rwanda — product review",
      status: "draft",
      budgetCents: 80_000_000,
      createdAt: "2026-05-15T09:00:00.000Z",
      brandName: "KCB Rwanda",
      campaignType: "Product review",
      deadline: "2026-06-20",
      feePercent: 20,
      assignedCreators: 0,
      submissionsReceived: 0,
      submissionsApproved: 0,
    },
  ],
  creatorApplications: [
    {
      id: "app_ruth",
      fullName: "Ruth Nkusi",
      tiktokHandle: "@ruthnkusi_rw",
      instagramHandle: "@ruthnkusi_rw",
      tiktokFollowers: 41_000,
      instagramFollowers: 8_000,
      niche: "Lifestyle",
      status: "pending",
    },
    {
      id: "app_david",
      fullName: "David Olivier",
      tiktokHandle: "@davidolivier",
      instagramHandle: "@davidolivier",
      tiktokFollowers: 6_000,
      instagramFollowers: 3_000,
      niche: "Comedy",
      status: "pending",
    },
  ],
  verifiedCreators: [
    {
      id: "cr_marie",
      displayName: "Marie K.",
      handle: "@mariekigali · TikTok 28K",
      campaignsCompleted: 4,
      label: "Reliable",
    },
    {
      id: "cr_jb",
      displayName: "Jean-Baptiste N.",
      handle: "@jbntwali · TikTok 12K",
      campaignsCompleted: 2,
      label: "New",
    },
    {
      id: "cr_amina",
      displayName: "Amina G.",
      handle: "@aminacreates · IG 9K",
      campaignsCompleted: 1,
      label: "New",
    },
  ],
  submissions: [
    {
      id: "sub_marie",
      campaignId: "cmp_primus",
      campaignTitle: "Primus Beer — reaction videos",
      creatorName: "Marie K.",
      handle: "@mariekigali",
      postUrl: "https://tiktok.com/@mariekigali/video/123",
      status: "approved",
      submittedAt: "2026-05-20T10:00:00.000Z",
    },
    {
      id: "sub_jb",
      campaignId: "cmp_primus",
      campaignTitle: "Primus Beer — reaction videos",
      creatorName: "Jean-Baptiste N.",
      handle: "@jbntwali",
      status: "pending",
      submittedAt: "2026-05-22T14:00:00.000Z",
    },
    {
      id: "sub_amina",
      campaignId: "cmp_primus",
      campaignTitle: "Primus Beer — reaction videos",
      creatorName: "Amina G.",
      handle: "@aminacreates",
      status: "revision",
      revisionNote: "Add clearer product shot in the first 3 seconds.",
      submittedAt: "2026-05-21T09:00:00.000Z",
    },
  ],
  brandCollections: [
    {
      id: "col_primus",
      label: "Primus Beer — Campaign #2",
      amountRwf: 720_000,
      status: "paid",
    },
    {
      id: "col_iwacu",
      label: "Iwacu Music — Song clip",
      amountRwf: 400_000,
      status: "paid",
    },
    {
      id: "col_kcb",
      label: "KCB Rwanda — Product review",
      amountRwf: 960_000,
      status: "pending",
    },
  ],
  payouts: [
    {
      id: "pay_marie",
      creatorName: "Marie K.",
      handle: "@mariekigali",
      campaignTitle: "Primus Beer — reaction videos",
      amountRwf: 45_000,
      status: "pending",
    },
    {
      id: "pay_jb",
      creatorName: "Jean-Baptiste N.",
      handle: "@jbntwali",
      campaignTitle: "Primus Beer — reaction videos",
      amountRwf: 32_000,
      status: "pending",
    },
    {
      id: "pay_amina",
      creatorName: "Amina G.",
      handle: "@aminacreates",
      campaignTitle: "Primus Beer — reaction videos",
      amountRwf: 28_000,
      status: "pending",
    },
    {
      id: "pay_others",
      creatorName: "5 other creators",
      handle: "—",
      campaignTitle: "Multiple campaigns",
      amountRwf: 79_000,
      status: "pending",
    },
  ],
  brandAccounts: [
    {
      id: "br_primus",
      name: "Primus Beer (Bralirwa)",
      contactName: "Eric M.",
      contactEmail: "eric@bralirwa.rw",
      momoPhone: "+250 788 123 456",
      status: "active",
      campaignsRun: 2,
      totalSpentRwf: 1_200_000,
      lastActiveAt: "2026-05-24T16:00:00.000Z",
    },
    {
      id: "br_iwacu",
      name: "Iwacu Music",
      contactName: "Sandra N.",
      contactEmail: "sandra@iwacumusic.rw",
      status: "active",
      campaignsRun: 1,
      totalSpentRwf: 400_000,
      lastActiveAt: "2026-05-23T11:30:00.000Z",
    },
    {
      id: "br_kcb",
      name: "KCB Rwanda",
      contactName: "Patrick U.",
      contactEmail: "patrick@kcb.rw",
      status: "pending_payment",
      campaignsRun: 0,
      totalSpentRwf: 0,
      lastActiveAt: "2026-05-18T09:00:00.000Z",
    },
  ],
  activityLog: [
    {
      id: "act_1",
      at: "2026-05-24T16:00:00.000Z",
      kind: "brand_payment",
      actorLabel: "Primus Beer (Bralirwa)",
      summary: "Campaign #2 collection marked paid · RWF 720,000",
      href: "/admin/payments",
    },
    {
      id: "act_2",
      at: "2026-05-22T14:00:00.000Z",
      kind: "submission_pending",
      actorLabel: "Jean-Baptiste N.",
      summary: "Submitted post for Primus Beer — reaction videos",
      href: "/admin/submissions",
    },
    {
      id: "act_3",
      at: "2026-05-21T09:00:00.000Z",
      kind: "submission_revision",
      actorLabel: "Amina G.",
      summary: "Revision requested on Primus submission",
      href: "/admin/submissions",
    },
    {
      id: "act_4",
      at: "2026-05-20T10:00:00.000Z",
      kind: "submission_approved",
      actorLabel: "Marie K.",
      summary: "Approved Primus Beer — reaction videos",
      href: "/admin/submissions",
    },
    {
      id: "act_5",
      at: "2026-05-19T08:00:00.000Z",
      kind: "creator_application",
      actorLabel: "Ruth Nkusi",
      summary: "New creator application · Lifestyle",
      href: "/admin/creators",
    },
    {
      id: "act_6",
      at: "2026-05-19T07:45:00.000Z",
      kind: "creator_application",
      actorLabel: "David Olivier",
      summary: "New creator application · Comedy",
      href: "/admin/creators",
    },
    {
      id: "act_7",
      at: "2026-05-15T09:00:00.000Z",
      kind: "campaign_created",
      actorLabel: "KCB Rwanda",
      summary: "Draft campaign: Product review",
      href: "/admin/campaigns",
    },
    {
      id: "act_8",
      at: "2026-05-10T14:00:00.000Z",
      kind: "campaign_created",
      actorLabel: "Iwacu Music",
      summary: "Active campaign: Song clip campaign",
      href: "/admin/campaigns",
    },
  ],
    analytics: buildPlatformAnalytics(),
    auditLog: buildSeedAuditLog(),
  };

  return rebaseAdminSeedDates(seed);
}

/**
 * Demo seed dates are authored around late May 2026. Shift them so the newest
 * activity lands today and deadlines stay in the future, keeping the demo
 * dashboard and operations metrics coherent over time.
 */
function rebaseAdminSeedDates(seed: AdminState): AdminState {
  const now = new Date();
  const todayMorning = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    9,
    0,
    0,
  );
  const offsetMs = todayMorning - SEED_REFERENCE_AT;

  const shiftIso = (iso: string) =>
    new Date(new Date(iso).getTime() + offsetMs).toISOString();
  const shiftDay = (day: string) =>
    new Date(new Date(`${day}T00:00:00.000Z`).getTime() + offsetMs)
      .toISOString()
      .slice(0, 10);

  return {
    ...seed,
    campaigns: seed.campaigns.map((campaign) => ({
      ...campaign,
      createdAt: shiftIso(campaign.createdAt),
      ...(campaign.deadline ? { deadline: shiftDay(campaign.deadline) } : {}),
    })),
    submissions: seed.submissions.map((submission) => ({
      ...submission,
      submittedAt: shiftIso(submission.submittedAt),
    })),
    brandAccounts: seed.brandAccounts.map((brand) => ({
      ...brand,
      lastActiveAt: shiftIso(brand.lastActiveAt),
    })),
    activityLog: seed.activityLog.map((event) => ({
      ...event,
      at: shiftIso(event.at),
    })),
  };
}

export const fixtures = {
  campaigns: adminSeed.campaigns satisfies Campaign[],
  brands: [
    { id: "br_primus", name: "Primus Beer (Bralirwa)", activeCampaigns: 2 },
    { id: "br_iwacu", name: "Iwacu Music", activeCampaigns: 1 },
    { id: "br_kcb", name: "KCB Rwanda", activeCampaigns: 0 },
  ] satisfies BrandRecord[],
  creators: [
    { id: "cr_marie", displayName: "Marie K.", niche: "Fashion stills" },
    { id: "cr_jb", displayName: "Jean-Baptiste N.", niche: "Short-form" },
  ] satisfies CreatorRecord[],
  submissions: [
    {
      id: "sub_jb",
      campaignId: "cmp_primus",
      creatorId: "cr_jb",
      status: "pending",
      submittedAt: "2026-05-22T14:00:00.000Z",
    },
    {
      id: "sub_marie",
      campaignId: "cmp_primus",
      creatorId: "cr_marie",
      status: "approved",
      submittedAt: "2026-05-20T10:00:00.000Z",
    },
  ] satisfies Submission[],
  payments: [
    {
      id: "pay_marie",
      creatorId: "cr_marie",
      amountCents: 4_500_000,
      status: "pending",
      creatorName: "Marie K.",
      campaignTitle: "Primus Beer — reaction videos",
    },
  ] satisfies Payment[],
  earnings: {
    availableCents: 45_000_00,
    pendingCents: 28_000_00,
  } satisfies EarningsSnapshot,
  users: [] satisfies User[],
  admin: adminSeed,
} as const;
