import type { BrandCampaignView, CampaignStatus } from "@/types";

export type BrandCampaignBucket = "unfinished" | "new" | "closed";

export const brandCampaignBucketMeta: Record<
  BrandCampaignBucket,
  { title: string; description: string }
> = {
  unfinished: {
    title: "Unfinished campaigns",
    description: "Live briefs with creators still delivering or under review.",
  },
  new: {
    title: "New campaigns",
    description: "Draft or just opened — not fully underway yet.",
  },
  closed: {
    title: "Completed",
    description: "Wrapped campaigns and closed briefs.",
  },
};

export function classifyCampaign(campaign: BrandCampaignView): BrandCampaignBucket {
  const status = campaign.status as CampaignStatus;
  if (status === "completed") return "closed";
  if (status === "draft") return "new";
  if (status === "active" || status === "paused") {
    if (campaign.assignedCreators === 0 && campaign.submitted === 0) return "new";
    return "unfinished";
  }
  return "unfinished";
}

export function filterCampaignsByBucket(
  campaigns: BrandCampaignView[],
  bucket: BrandCampaignBucket | "all",
) {
  if (bucket === "all") return campaigns;
  return campaigns.filter((c) => classifyCampaign(c) === bucket);
}

export function countCampaignBuckets(campaigns: BrandCampaignView[]) {
  const counts: Record<BrandCampaignBucket, number> = {
    unfinished: 0,
    new: 0,
    closed: 0,
  };
  for (const c of campaigns) {
    counts[classifyCampaign(c)] += 1;
  }
  return counts;
}