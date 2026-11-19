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