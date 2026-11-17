import type {
  BrandCampaignView,
  BrandInvoice,
  BrandInvoiceBucket,
  BrandState,
} from "@/types";

export type BrandInvoiceGroup = {
  bucket: BrandInvoiceBucket;
  title: string;
  description: string;
  items: BrandInvoice[];
};

export const brandInvoiceBucketMeta: Record<
  BrandInvoiceBucket,
  { title: string; description: string; order: number }
> = {
  unfinished: {
    title: "Unfinished campaigns",
    description: "Live briefs with delivery or payment still in progress.",
    order: 0,
  },
  new: {
    title: "New campaigns",
    description: "Draft or just opened — not fully underway yet.",
    order: 1,
  },
  closed: {
    title: "Paid & closed",
    description: "Invoices settled and campaigns wrapped.",
    order: 2,
  },
};

function campaignById(state: BrandState, campaignId?: string) {
  if (!campaignId) return undefined;
  return state.campaigns.find((c) => c.id === campaignId);
}

export function classifyInvoice(
  invoice: BrandInvoice,
  campaign?: BrandCampaignView,
): BrandInvoiceBucket {
  if (invoice.status === "paid" && (!campaign || campaign.status === "completed")) {
    return "closed";
  }
  if (!campaign) {
    return invoice.status === "paid" ? "closed" : "unfinished";
  }
  if (campaign.status === "draft") {
    return "new";
  }
  if (campaign.status === "completed") {
    return "closed";
  }
  const assigned = campaign.assignedCreators;
  const hasWorkStarted = campaign.submitted > 0 || campaign.approved > 0;
  if (campaign.status === "active" && assigned === 0 && !hasWorkStarted) {
    return "new";
  }
  if (
    campaign.status === "active" ||
    campaign.status === "paused" ||
    invoice.status === "pending"
  ) {
    return "unfinished";
  }
  return "closed";
}

function sortKey(invoice: BrandInvoice) {
  const t = invoice.issuedAt ? Date.parse(invoice.issuedAt) : 0;
  return Number.isFinite(t) ? t : 0;
}

export function groupBrandInvoices(state: BrandState): BrandInvoiceGroup[] {
  const buckets: Record<BrandInvoiceBucket, BrandInvoice[]> = {
    unfinished: [],
    new: [],
    closed: [],
  };

  for (const invoice of state.invoices) {
    const campaign = campaignById(state, invoice.campaignId);
    const bucket = classifyInvoice(invoice, campaign);
    buckets[bucket].push(invoice);
  }

  const sorter = (a: BrandInvoice, b: BrandInvoice) => sortKey(b) - sortKey(a);

  return (["unfinished", "new", "closed"] as const)
    .map((bucket) => ({
      bucket,
      title: brandInvoiceBucketMeta[bucket].title,
      description: brandInvoiceBucketMeta[bucket].description,
      items: [...buckets[bucket]].sort(sorter),
    }))
    .filter((group) => group.items.length > 0);
}

export function invoiceProgressHint(
  invoice: BrandInvoice,
  campaign?: BrandCampaignView,
): string | null {
  if (!campaign || campaign.status === "draft") {
    return "Not started";
  }
  if (campaign.status === "completed") {
    return "Campaign completed";
  }
  if (campaign.assignedCreators === 0) {
    return "Awaiting creator assignments";
  }
  const { approved, submitted, assignedCreators } = campaign;
  if (submitted === 0) {
    return `${assignedCreators} creators assigned · no posts yet`;
  }
  return `${approved}/${assignedCreators} approved · ${submitted} submitted`;
}