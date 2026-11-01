export const hubCreatorProfiles = [
  { name: "Amara N.", handle: "@amara.films", followers: "128K", platform: "TikTok" },
  { name: "Leo M.", handle: "@leomakes", followers: "84K", platform: "Instagram" },
  { name: "Sarah K.", handle: "@sarahskincare", followers: "210K", platform: "YouTube" },
  { name: "Jay T.", handle: "@jaytech", followers: "56K", platform: "TikTok" },
  { name: "Nina O.", handle: "@ninaoutdoors", followers: "92K", platform: "Instagram" },
] as const;

export const hubBrandLogos = [
  "Primus",
  "Kigali Co.",
  "Nova Bank",
  "Rwanda Air",
  "Studio 9",
  "Urban Eats",
] as const;

export const hubNicheTiles = [
  {
    tag: "#beauty",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
  },
  {
    tag: "#travel",
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
  },
  {
    tag: "#tech",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80",
  },
  {
    tag: "#food",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
  },
] as const;

export const creatorSolutions = [
  {
    tags: ["TikTok", "UGC"],
    title: "Discover campaigns that fit your niche",
    body: "Browse briefs, apply with your portfolio, and keep every deliverable in one place.",
    href: "/creator/campaigns",
  },
  {
    tags: ["Instagram", "Reels"],
    title: "Submit work and track revisions",
    body: "Upload drafts, respond to brand notes, and see approval status without chasing email threads.",
    href: "/creator/submissions",
  },
  {
    tags: ["YouTube", "Long-form"],
    title: "Get paid when content goes live",
    body: "Approved posts move straight into payout tracking so you always know what is coming.",
    href: "/creator/earnings",
  },
] as const;

export const brandSolutions = [
  {
    tags: ["Campaign", "Brief"],
    title: "Launch campaigns in minutes",
    body: "Set budget, timeline, and creative direction — then invite creators who match your category.",
    href: "/brand/campaigns",
  },
  {
    tags: ["Review", "QC"],
    title: "Review submissions in one queue",
    body: "Approve, request revisions, or reject with notes. Every creator sees the same source of truth.",
    href: "/brand/campaigns",
  },
  {
    tags: ["Payout", "Report"],
    title: "Track spend and delivery",
    body: "See assigned creators, submission progress, and invoices without switching tools.",
    href: "/brand/invoices",
  },
] as const;

export const hubSteps = {
  creator: [
    { n: "01", title: "Build your profile", body: "Add niches, links, and samples so brands know your style." },
    { n: "02", title: "Apply to briefs", body: "Pick campaigns that match your audience and rates." },
    { n: "03", title: "Create & submit", body: "Deliver content inside the workspace with clear deadlines." },
    { n: "04", title: "Get paid", body: "Approved work moves to earnings — payouts stay visible end to end." },
  ],
  brand: [
    { n: "01", title: "Define the brief", body: "Budget, format, and brand rules in a structured campaign." },
    { n: "02", title: "Meet creators", body: "Review applications and assign the right voices for the job." },
    { n: "03", title: "Approve content", body: "Central review for every submission and revision round." },
    { n: "04", title: "Close the loop", body: "Invoices and reports reflect what went live — no spreadsheet drift." },
  ],
} as const;

export const hubPlans = {
  creator: [
    { name: "Starter", price: "Free", perks: ["Browse open campaigns", "Apply with your profile", "Guest preview"] },
    { name: "Active", price: "Demo", perks: ["Task inbox", "Submissions & revisions", "Earnings tracker"] },
    { name: "Pro", price: "Soon", perks: ["Priority briefs", "Portfolio highlights", "Payout exports"] },
  ],
  brand: [
    { name: "Launch", price: "Demo", perks: ["Create campaigns", "Creator applications", "Submission review"] },
    { name: "Growth", price: "Custom", perks: ["Multi-campaign roster", "Invoices", "Usage reports"] },
    { name: "Enterprise", price: "Talk", perks: ["Dedicated support", "Custom workflows", "API (future)"] },
  ],
} as const;

export const hubTestimonials = {
  creator: [
    { quote: "I stopped juggling DMs and spreadsheets — every brief and payout lives here.", name: "Amara N.", role: "Creator · Beauty" },
    { quote: "Revision notes are finally attached to the task, not lost in WhatsApp.", name: "Leo M.", role: "Creator · Tech" },
  ],
  brand: [
    { quote: "We see who applied, who delivered, and what we approved without a shared doc.", name: "Marketing lead", role: "Primus Beer" },
    { quote: "The review queue alone saved our team hours every launch week.", name: "Brand manager", role: "Kigali Co." },
  ],
} as const;
