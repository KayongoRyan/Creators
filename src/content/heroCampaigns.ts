export type HeroCampaignSlide = {
  id: string;
  brand: string;
  title: string;
  type: string;
  payout: string;
  deadline: string;
  imageSrc: string;
  imageAlt: string;
};

export const heroCampaignSlides: HeroCampaignSlide[] = [
  {
    id: "primus",
    brand: "Primus Beer (Bralirwa)",
    title: "Reaction videos — Celebrate Rwanda can",
    type: "UGC reaction",
    payout: "RWF 45,000 flat",
    deadline: "June 3, 2026",
    imageSrc: "/marketing/campaigns/primus.jpg",
    imageAlt: "Creator filming a Primus beer reaction video",
  },
  {
    id: "iwacu",
    brand: "Iwacu Music",
    title: "Clip this interview — best 45–90 sec hook",
    type: "Clipping (CPM)",
    payout: "RWF 120 RPM",
    deadline: "June 8, 2026",
    imageSrc: "/marketing/campaigns/iwacu.jpg",
    imageAlt: "Music interview clip campaign",
  },
  {
    id: "kcb",
    brand: "KCB Rwanda",
    title: "Mobile banking app product review",
    type: "Product review",
    payout: "RWF 55,000 flat",
    deadline: "June 20, 2026",
    imageSrc: "/marketing/campaigns/kcb.jpg",
    imageAlt: "KCB mobile banking review campaign",
  },
];
