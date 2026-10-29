export type FeaturedBrandCampaign = {
  id: "primus" | "iwacu" | "kcb" | "mtn" | "sulfo" | "inzozi";
  brand: string;
  title: string;
  description: string;
  budget: string;
  niche: string;
};

export const featuredBrandCampaigns: FeaturedBrandCampaign[] = [
  {
    id: "primus",
    brand: "Primus Beer",
    title: "Celebrate Rwanda — reaction videos",
    description:
      "20–60 sec reaction to the new Primus can. Post on TikTok or Reels with #PrimusRwanda.",
    budget: "RWF 45,000 flat",
    niche: "Food & drink",
  },
  {
    id: "iwacu",
    brand: "Iwacu Music",
    title: "Clip this interview — best hook wins",
    description:
      "45–90 sec clip from artist interviews. Strong hook in the first 2 seconds. Paid per thousand views.",
    budget: "RWF 120 RPM",
    niche: "Music",
  },
  {
    id: "kcb",
    brand: "KCB Rwanda",
    title: "Mobile banking app review",
    description:
      "60–90 sec KCB app review showing one feature you use weekly. Tag @KCBRwanda.",
    budget: "RWF 55,000 flat",
    niche: "Finance & tech",
  },
  {
    id: "mtn",
    brand: "MTN Rwanda",
    title: "MoMo tips — everyday payments",
    description:
      "Short tips for bills and MoMo transfers. Reels, TikTok, or Stories.",
    budget: "RWF 38,000 flat",
    niche: "Tech & lifestyle",
  },
  {
    id: "sulfo",
    brand: "Sulfo Industries",
    title: "Factory tour — behind the scenes",
    description:
      "Day-in-the-life tour highlighting quality checks and local jobs. Vertical video.",
    budget: "RWF 62,000 flat",
    niche: "Business & industry",
  },
  {
    id: "inzozi",
    brand: "Inzozi Fashion",
    title: "Kigali street style lookbook",
    description:
      "Three-outfit lookbook in Kigali. Day and night styling with product tags.",
    budget: "RWF 48,000 flat",
    niche: "Fashion",
  },
];
