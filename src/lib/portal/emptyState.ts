import type { BrandState, CreatorProfile, CreatorState } from "@/types";

export function emptyBrandState(): BrandState {
  return {
    brandName: "",
    companyLine: "",
    campaigns: [],
    invoices: [],
  };
}

export function emptyCreatorProfile(): CreatorProfile {
  return {
    displayName: "",
    tiktokHandle: "",
    instagramHandle: "",
    tiktokFollowers: 0,
    instagramFollowers: 0,
    niche: "",
    momo: "",
    phone: "",
    label: "New",
    campaignsCompleted: 0,
  };
}

export function emptyCreatorState(): CreatorState {
  return {
    profile: emptyCreatorProfile(),
    discover: [],
    assignments: [],
    applications: [],
    earnings: [],
  };
}