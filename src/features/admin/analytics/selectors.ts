import type {
  AdminState,
  AuditActorRole,
  AuditEvent,
  AuditSeverity,
  PlatformDailyMetric,
} from "@/types";

export type AnalyticsRange = 7 | 30 | 90;

export type DailyTotals = {
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

export type OperationsSnapshot = {
  pendingApplications: number;
  pendingSubmissions: number;
  pendingPayouts: number;
  payoutsDueRwf: number;
  activeCampaigns: number;
  suspendedCreators: number;
  brandsPendingPayment: number;
  overdueCampaigns: number;
  stalledCampaigns: number;
  approvalRate: number;
  reviewAvgHours: number;
  reviewTargetHours: number;
  reviewWithinSlaPercent: number;
  oldestPendingHours: number;
};

export type CreatorLeader = {
  name: string;
  handle: string;
  submissionCount: number;
  approvedCount: number;
  earnedRwf: number;
  pendingRwf: number;
};

export type BrandLeader = {
  id: string;
  name: string;
  status: string;
  campaignsRun: number;
  totalSpentRwf: number;
  lastActiveAt: string;
};

export type CampaignPerformanceRow = {
  id: string;
  title: string;
  brandName: string;
  status: string;
  deadline?: string;
  assignedCreators: number;
  submissionsReceived: number;
  submissionsApproved: number;
  approvalRate: number;
  fillRate: number;
  budgetRwf: number;
  feeRwf: number;
  overdue: boolean;
};

export type AnalyticsSummary = {
  range: AnalyticsRange;
  current: DailyTotals;
  previous: DailyTotals;
  deltas: Record<keyof DailyTotals, number | null>;
  funnel: Array<{ stage: string; value: number; conversion: number | null }>;
  operations: OperationsSnapshot;
  topCreators: CreatorLeader[];
  topBrands: BrandLeader[];
  campaigns: CampaignPerformanceRow[];
  daily: PlatformDailyMetric[];
};

const EMPTY_TOTALS: DailyTotals = {
  visitors: 0,
  pageViews: 0,
  signups: 0,
  activeUsers: 0,
  campaignsCreated: 0,
  creatorApplications: 0,
  campaignApplications: 0,
  submissions: 0,
  approvals: 0,
  collectionsRwf: 0,
  payoutsRwf: 0,
};

function sumDaily(rows: PlatformDailyMetric[]): DailyTotals {
  return rows.reduce<DailyTotals>(
    (totals, row) => ({
      visitors: totals.visitors + row.visitors,
      pageViews: totals.pageViews + row.pageViews,
      signups: totals.signups + row.signups,
      activeUsers: totals.activeUsers + row.activeUsers,
      campaignsCreated: totals.campaignsCreated + row.campaignsCreated,
      creatorApplications:
        totals.creatorApplications + row.creatorApplications,
      campaignApplications:
        totals.campaignApplications + row.campaignApplications,
      submissions: totals.submissions + row.submissions,
      approvals: totals.approvals + row.approvals,
      collectionsRwf: totals.collectionsRwf + row.collectionsRwf,
      payoutsRwf: totals.payoutsRwf + row.payoutsRwf,
    }),
    { ...EMPTY_TOTALS },
  );
}

function deltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function todayUtcKey() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
    .toISOString()
    .slice(0, 10);
}

export function selectAnalyticsSummary(
  state: AdminState,
  range: AnalyticsRange = 30,
): AnalyticsSummary {
  const daily = state.analytics.daily;
  const currentRows = daily.slice(-range);
  const previousRows = daily.slice(-range * 2, -range);
  const current = sumDaily(currentRows);
  const previous = sumDaily(previousRows);

  const totalsKeys = Object.keys(EMPTY_TOTALS) as Array<keyof DailyTotals>;
  const deltas = totalsKeys.reduce(
    (acc, key) => {
      acc[key] = deltaPercent(current[key], previous[key]);
      return acc;
    },
    {} as Record<keyof DailyTotals, number | null>,
  );

  const funnelStages: Array<{ stage: string; value: number }> = [
    { stage: "Visitors", value: current.visitors },
    { stage: "Sign-ups", value: current.signups },
    { stage: "Creator applications", value: current.creatorApplications },
    { stage: "Campaign applications", value: current.campaignApplications },
    { stage: "Submissions", value: current.submissions },
    { stage: "Approved", value: current.approvals },
  ];
  const funnel = funnelStages.map((stage, index) => ({
    ...stage,
    conversion:
      index === 0 ? null : pct(stage.value, funnelStages[index - 1].value),
  }));

  const today = todayUtcKey();
  const pendingApplications = state.creatorApplications.filter(
    (a) => a.status === "pending",
  ).length;
  const pendingSubmissions = state.submissions.filter(
    (s) => s.status === "pending",
  ).length;
  const pendingPayouts = state.payouts.filter((p) => p.status === "pending");
  const payoutsDueRwf = pendingPayouts.reduce(
    (sum, payout) => sum + payout.amountRwf,
    0,
  );
  const activeCampaigns = state.campaigns.filter(
    (c) => c.status === "active",
  ).length;

  const overdueCampaigns = state.campaigns.filter(
    (c) =>
      Boolean(c.deadline) &&
      (c.status === "active" || c.status === "draft") &&
      String(c.deadline) < today,
  ).length;

  const stalledCampaigns = state.campaigns.filter(
    (c) =>
      c.status === "active" &&
      (c.submissionsReceived ?? 0) === 0 &&
      (c.assignedCreators ?? 0) > 0,
  ).length;

  const oldestPending = state.submissions
    .filter((s) => s.status === "pending")
    .map((s) => Date.now() - new Date(s.submittedAt).getTime())
    .filter((ms) => Number.isFinite(ms) && ms > 0);
  const oldestPendingHours =
    oldestPending.length > 0
      ? Math.round(Math.max(...oldestPending) / 3_600_000)
      : 0;

  const operations: OperationsSnapshot = {
    pendingApplications,
    pendingSubmissions,
    pendingPayouts: pendingPayouts.length,
    payoutsDueRwf,
    activeCampaigns,
    suspendedCreators: state.verifiedCreators.filter(
      (c) => c.status === "suspended",
    ).length,
    brandsPendingPayment: state.brandAccounts.filter(
      (b) => b.status === "pending_payment",
    ).length,
    overdueCampaigns,
    stalledCampaigns,
    approvalRate: pct(current.approvals, current.submissions),
    reviewAvgHours: state.analytics.reviewSla.avgHours,
    reviewTargetHours: state.analytics.reviewSla.targetHours,
    reviewWithinSlaPercent: state.analytics.reviewSla.withinSlaPercent,
    oldestPendingHours,
  };

  const creatorMap = new Map<string, CreatorLeader>();
  for (const submission of state.submissions) {
    const existing = creatorMap.get(submission.creatorName) ?? {
      name: submission.creatorName,
      handle: submission.handle,
      submissionCount: 0,
      approvedCount: 0,
      earnedRwf: 0,
      pendingRwf: 0,
    };
    existing.submissionCount += 1;
    if (submission.status === "approved") existing.approvedCount += 1;
    creatorMap.set(submission.creatorName, existing);
  }
  for (const payout of state.payouts) {
    const existing = creatorMap.get(payout.creatorName) ?? {
      name: payout.creatorName,
      handle: payout.handle,
      submissionCount: 0,
      approvedCount: 0,
      earnedRwf: 0,
      pendingRwf: 0,
    };
    if (payout.status === "paid") existing.earnedRwf += payout.amountRwf;
    else if (payout.status === "pending")
      existing.pendingRwf += payout.amountRwf;
    creatorMap.set(payout.creatorName, existing);
  }
  const topCreators = Array.from(creatorMap.values())
    .sort(
      (a, b) =>
        b.earnedRwf + b.pendingRwf - (a.earnedRwf + a.pendingRwf) ||
        b.submissionCount - a.submissionCount,
    )
    .slice(0, 6);

  const topBrands = [...state.brandAccounts]
    .sort((a, b) => b.totalSpentRwf - a.totalSpentRwf)
    .slice(0, 6)
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      status: brand.status,
      campaignsRun: brand.campaignsRun,
      totalSpentRwf: brand.totalSpentRwf,
      lastActiveAt: brand.lastActiveAt,
    }));

  const campaigns = state.campaigns
    .map<CampaignPerformanceRow>((campaign) => {
      const assigned = campaign.assignedCreators ?? 0;
      const received = campaign.submissionsReceived ?? 0;
      const approved = campaign.submissionsApproved ?? 0;
      const budgetRwf = Math.round(campaign.budgetCents / 100);
      return {
        id: campaign.id,
        title: campaign.title,
        brandName: campaign.brandName ?? "—",
        status: campaign.status,
        deadline: campaign.deadline,
        assignedCreators: assigned,
        submissionsReceived: received,
        submissionsApproved: approved,
        approvalRate: pct(approved, received),
        fillRate: pct(received, assigned),
        budgetRwf,
        feeRwf: Math.round((budgetRwf * (campaign.feePercent ?? 20)) / 100),
        overdue:
          Boolean(campaign.deadline) &&
          (campaign.status === "active" || campaign.status === "draft") &&
          String(campaign.deadline) < today,
      };
    })
    .sort((a, b) => b.budgetRwf - a.budgetRwf);

  return {
    range,
    current,
    previous,
    deltas,
    funnel,
    operations,
    topCreators,
    topBrands,
    campaigns,
    daily: currentRows,
  };
}

export function mergeAuditTrail(
  state: AdminState,
  liveEvents: AuditEvent[],
): AuditEvent[] {
  const seen = new Set<string>();
  return [...liveEvents, ...state.auditLog]
    .filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}

export type AuditFilter = {
  query: string;
  role: AuditActorRole | "all";
  severity: AuditSeverity | "all";
  hidePageViews: boolean;
};

const roleLabels: Record<AuditActorRole, string> = {
  admin: "Admin",
  brand: "Brand",
  creator: "Creator",
  guest: "Guest",
  system: "System",
};

export function auditRoleLabel(role: AuditActorRole) {
  return roleLabels[role];
}

export function filterAuditEvents(
  events: AuditEvent[],
  filter: AuditFilter,
): AuditEvent[] {
  const query = filter.query.trim().toLowerCase();
  return events.filter((event) => {
    if (filter.hidePageViews && event.action === "page_view") return false;
    if (filter.role !== "all" && event.actorRole !== filter.role) return false;
    if (filter.severity !== "all" && event.severity !== filter.severity)
      return false;
    if (!query) return true;
    return (
      event.actorName.toLowerCase().includes(query) ||
      event.summary.toLowerCase().includes(query) ||
      event.action.toLowerCase().includes(query) ||
      (event.targetLabel ?? "").toLowerCase().includes(query)
    );
  });
}

export function auditToCsv(events: AuditEvent[]): string {
  const header = [
    "timestamp",
    "actor",
    "role",
    "action",
    "severity",
    "summary",
    "target",
    "page",
    "device",
    "ip",
  ];
  const escape = (value: string | undefined) =>
    `"${(value ?? "").replace(/"/g, '""')}"`;
  const rows = events.map((event) =>
    [
      event.at,
      event.actorName,
      event.actorRole,
      event.action,
      event.severity,
      event.summary,
      event.targetLabel,
      event.source,
      event.device,
      event.ip,
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}

export function analyticsToCsv(summary: AnalyticsSummary): string {
  const header = [
    "date",
    "visitors",
    "page_views",
    "signups",
    "active_users",
    "campaigns_created",
    "creator_applications",
    "campaign_applications",
    "submissions",
    "approvals",
    "collections_rwf",
    "payouts_rwf",
  ];
  const rows = summary.daily.map((row) =>
    [
      row.date,
      row.visitors,
      row.pageViews,
      row.signups,
      row.activeUsers,
      row.campaignsCreated,
      row.creatorApplications,
      row.campaignApplications,
      row.submissions,
      row.approvals,
      row.collectionsRwf,
      row.payoutsRwf,
    ].join(","),
  );
  return [header.join(","), ...rows].join("\r\n");
}
