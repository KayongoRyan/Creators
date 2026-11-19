import type {
  AuditAction,
  AuditEvent,
  AuditSeverity,
  PlatformAnalytics,
  PlatformDailyMetric,
} from "@/types";

const DAY_MS = 86_400_000;
const SERIES_DAYS = 90;

const creatorNames = [
  "Marie K.",
  "Jean-Baptiste N.",
  "Amina G.",
  "Ruth Nkusi",
  "David Olivier",
  "Claudine M.",
  "Kevin T.",
  "Sandrine U.",
];

const brandNames = [
  "Primus Beer (Bralirwa)",
  "Iwacu Music",
  "KCB Rwanda",
  "Bank of Kigali",
  "MTN Rwanda",
  "Radiant Cosmetics",
];

const adminNames = ["Aline U.", "Patrick M."];

const campaignTitles = [
  "Primus Beer — reaction videos",
  "Iwacu Music — song clip campaign",
  "KCB Rwanda — product review",
  "Fintech tips — wallet tutorial",
];

/** Deterministic pseudo-random value in [0, 1) for a numeric seed. */
function noise(seed: number) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function utcMidnight(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildDailyMetrics(days = SERIES_DAYS): PlatformDailyMetric[] {
  const today = utcMidnight();
  const rows: PlatformDailyMetric[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getTime() - offset * DAY_MS);
    const index = days - 1 - offset;
    const weekday = date.getUTCDay();
    const weekendFactor = weekday === 0 ? 0.62 : weekday === 6 ? 0.74 : 1;
    const growth = 1 + index * 0.009;
    const jitter = 0.86 + noise(index + 1) * 0.28;

    const visitors = Math.round(760 * growth * weekendFactor * jitter);
    const pageViews = Math.round(visitors * (2.2 + noise(index + 2) * 0.55));
    const signups = Math.max(
      1,
      Math.round(visitors * (0.028 + noise(index + 3) * 0.014)),
    );
    const activeUsers = Math.round(visitors * (0.5 + noise(index + 4) * 0.15));
    const campaignsCreated =
      noise(index + 5) > 0.58 ? 1 + Math.floor(noise(index + 6) * 3) : 0;
    const creatorApplications = 2 + Math.floor(noise(index + 7) * 8);
    const campaignApplications = 6 + Math.floor(noise(index + 8) * 20);
    const submissions = 4 + Math.floor(noise(index + 9) * 14);
    const approvals = Math.round(
      submissions * (0.5 + noise(index + 10) * 0.3),
    );
    const collectionsRwf =
      noise(index + 11) > 0.62
        ? 250_000 + Math.round(noise(index + 12) * 24) * 25_000
        : 0;
    const payoutsRwf =
      noise(index + 13) > 0.55
        ? 120_000 + Math.round(noise(index + 14) * 16) * 25_000
        : 0;

    rows.push({
      date: dateKey(date),
      visitors,
      pageViews,
      signups,
      activeUsers,
      campaignsCreated,
      creatorApplications,
      campaignApplications,
      submissions,
      approvals,
      collectionsRwf,
      payoutsRwf,
    });
  }

  return rows;
}

export function severityForAction(action: AuditAction): AuditSeverity {
  switch (action) {
    case "creator_approved":
    case "submission_approved":
    case "payout_paid":
    case "payout_batch_paid":
    case "collection_paid":
      return "success";
    case "creator_rejected":
    case "submission_rejected":
    case "submission_revision":
    case "creator_suspended":
      return "warning";
    case "creator_reactivated":
    case "campaign_created":
    case "submission_created":
    case "campaign_applied":
    case "creator_application":
    case "creator_applied":
    case "profile_updated":
    case "brand_status_updated":
      return "info";
    default:
      return "info";
  }
}

type SeedEvent = Omit<AuditEvent, "id" | "at" | "severity">;

export function buildSeedAuditLog(): AuditEvent[] {
  const today = utcMidnight();
  const events: AuditEvent[] = [];
  const total = 56;

  for (let index = 0; index < total; index += 1) {
    const daysAgo = Math.floor(index / 4) + 1;
    const date = new Date(today.getTime() - daysAgo * DAY_MS);
    date.setUTCHours(7 + ((index * 7) % 13), (index * 13) % 60, 0, 0);

    const variant = index % 14;
    const creator = creatorNames[index % creatorNames.length];
    const brand = brandNames[index % brandNames.length];
    const admin = adminNames[index % adminNames.length];
    const campaign = campaignTitles[index % campaignTitles.length];
    const amount = 25_000 + (index % 9) * 7_000;

    const templates: SeedEvent[] = [
      {
        actorName: creator,
        actorRole: "creator",
        action: "login",
        summary: `${creator} signed in to the creator portal`,
        source: "/login",
        device: index % 3 === 0 ? "desktop" : "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: creator,
        actorRole: "creator",
        action: "campaign_applied",
        summary: `${creator} applied to ${campaign}`,
        targetLabel: campaign,
        href: "/admin/creators",
        source: "/creator/campaigns",
        device: "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: creator,
        actorRole: "creator",
        action: "submission_created",
        summary: `${creator} submitted a post for ${campaign}`,
        targetLabel: campaign,
        href: "/admin/submissions",
        source: "/creator/tasks",
        device: "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: admin,
        actorRole: "admin",
        action: "submission_approved",
        summary: `Approved submission from ${creator} · ${campaign}`,
        targetLabel: campaign,
        href: "/admin/submissions",
        source: "/admin/submissions",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: admin,
        actorRole: "admin",
        action: "payout_paid",
        summary: `Paid RWF ${amount.toLocaleString("en-US")} to ${creator}`,
        targetLabel: creator,
        href: "/admin/payments",
        source: "/admin/payments",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: brand,
        actorRole: "brand",
        action: "login",
        summary: `${brand} signed in to the brand portal`,
        source: "/login",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: brand,
        actorRole: "brand",
        action: "campaign_created",
        summary: `${brand} created a campaign · ${campaign}`,
        targetLabel: campaign,
        href: "/admin/campaigns",
        source: "/brand/campaigns",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: creator,
        actorRole: "creator",
        action: "creator_application",
        summary: `${creator} applied to join the platform`,
        href: "/admin/creators",
        source: "/register",
        device: "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: admin,
        actorRole: "admin",
        action: "creator_approved",
        summary: `Verified ${creator} and added them to the roster`,
        targetLabel: creator,
        href: "/admin/creators",
        source: "/admin/creators",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: creator,
        actorRole: "creator",
        action: "logout",
        summary: `${creator} signed out`,
        source: "/creator",
        device: "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: creator,
        actorRole: "creator",
        action: "profile_updated",
        summary: `${creator} updated their creator profile`,
        targetLabel: creator,
        href: "/admin/creators",
        source: "/creator/applications",
        device: "mobile",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: admin,
        actorRole: "admin",
        action: "submission_revision",
        summary: `Requested a revision from ${creator} · ${campaign}`,
        targetLabel: campaign,
        href: "/admin/submissions",
        source: "/admin/submissions",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: admin,
        actorRole: "admin",
        action: "brand_status_updated",
        summary: `Flagged ${brand} for payment follow-up`,
        targetLabel: brand,
        href: "/admin/brands",
        source: "/admin/brands",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
      {
        actorName: brand,
        actorRole: "brand",
        action: "collection_paid",
        summary: `${brand} settled an invoice · RWF ${(amount * 4).toLocaleString("en-US")}`,
        targetLabel: brand,
        href: "/admin/payments",
        source: "/brand/invoices",
        device: "desktop",
        ip: `197.243.${(index % 40) + 10}.${(index % 200) + 20}`,
      },
    ];

    const template = templates[variant];
    events.push({
      ...template,
      id: `aud_seed_${index}`,
      at: date.toISOString(),
      severity: severityForAction(template.action),
    });
  }

  return events;
}

export function buildPlatformAnalytics(): PlatformAnalytics {
  return {
    daily: buildDailyMetrics(),
    trafficSources: [
      { label: "TikTok", share: 37 },
      { label: "Instagram", share: 23 },
      { label: "Direct", share: 16 },
      { label: "Referral", share: 13 },
      { label: "Search", share: 11 },
    ],
    devices: [
      { label: "Mobile", share: 74 },
      { label: "Desktop", share: 20 },
      { label: "Tablet", share: 6 },
    ],
    topPages: [
      { path: "/", share: 18, avgSeconds: 54 },
      { path: "/apply", share: 14, avgSeconds: 96 },
      { path: "/login", share: 11, avgSeconds: 38 },
      { path: "/creator/campaigns", share: 10, avgSeconds: 132 },
      { path: "/creator", share: 8, avgSeconds: 87 },
      { path: "/brand", share: 7, avgSeconds: 104 },
      { path: "/join", share: 6, avgSeconds: 71 },
      { path: "/register", share: 5, avgSeconds: 146 },
      { path: "/admin", share: 4, avgSeconds: 118 },
      { path: "/creator/earnings", share: 3, avgSeconds: 64 },
    ],
    reviewSla: {
      targetHours: 24,
      avgHours: 7.8,
      medianHours: 4.6,
      withinSlaPercent: 93,
    },
  };
}
