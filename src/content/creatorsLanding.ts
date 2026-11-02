import { unsplashPhoto, unsplashWidths } from "@/lib/images/unsplash";

const marketImage = (photoId: string) =>
  unsplashPhoto(photoId, unsplashWidths.section, 70);

/** Public landing copy for Creators. */

export const creatorsLanding = {
  metaLine: "Creators. Brands meet creators who deliver.",
  hero: {
    title: "The new economy.",
    subtitle: "Find brand campaigns, create, and get paid.",
  },
  economicIntelligence: {
    title: "The fastest path to your next payout",
    lead: "See open briefs, track submissions, and know when payout hits your MoMo wallet.",
    suggestions: [
      "Apply with your niche and handles once",
      "Browse campaigns that match your audience",
      "Submit posts and paste links for review",
      "Get paid on schedule after approval",
    ],
  },
  markets: {
    title: "Thrive in competitive markets.",
    intro:
      "Campaign workflow and payouts in one place—built for brands, creators, and ops who need clarity at every step.",
    tabs: {
      workflow: "WORKFLOW",
      platform: "PLATFORM",
    },
    items: [
      {
        title: "Campaigns",
        body: "Brands publish briefs with budget, niche, and deliverables in one place.",
        tag: "Briefs",
        pillColor: "#c7cfd1",
        panel: "ink",
        tab: "workflow",
        image: marketImage("photo-1552664730-d307ca884978"),
        imageAlt: "Team reviewing a campaign brief together",
      },
      {
        title: "Matching",
        body: "Creators apply by niche; brands invite the fit for each campaign.",
        tag: "Match",
        pillColor: "#eeefba",
        panel: "paper",
        tab: "workflow",
        image: marketImage("photo-1529156069898-49953e39b3ac"),
        imageAlt: "Creators collaborating on content ideas",
      },
      {
        title: "Submissions",
        body: "Upload links, track review status, and respond to revision requests.",
        tag: "Review",
        pillColor: "#beee98",
        panel: "chartreuse",
        tab: "workflow",
        image: marketImage("photo-1516321497487-e288fb19713f"),
        imageAlt: "Creator filming short-form content on a phone",
      },
      {
        title: "Payouts",
        body: "Flat fees and RPM models with MoMo payout when work is approved.",
        tag: "MoMo",
        pillColor: "#9c98ef",
        panel: "lilac",
        tab: "platform",
        image: marketImage("photo-1563013544-824ae1b704d3"),
        imageAlt: "Mobile payment and wallet on a smartphone",
      },
      {
        title: "Workspaces",
        body: "Separate portals for brands, creators, and ops—each sees what they need.",
        tag: "Portals",
        pillColor: "#eeefba",
        panel: "sand",
        tab: "platform",
        image: marketImage("photo-1497215847824-d856c707eb7a"),
        imageAlt: "Clean workspace with laptop and notes",
      },
      {
        title: "Trust",
        body: "Verification, approvals, and audit-friendly status on every step.",
        tag: "Verify",
        pillColor: "#c7cfd1",
        panel: "slate",
        tab: "platform",
        image: marketImage("photo-1454165804606-c3d57bc86b40"),
        imageAlt: "Planning and verification at a desk",
      },
    ],
  },
  deploy: {
    title: "Start your next campaign today.",
    body: "Campaigns stall when briefs, applications, and payouts live in different threads. Creators keeps brands and creators on one path—from the first brief through MoMo payout.",
    cta: "Start on Creators",
  },
  mission: {
    title: "Our mission is to deliver everyone a sustainable income.",
    body: "Creators is built for brands and creators who work in the open—short-form video, clear briefs, and payouts that land on time. We focus on Rwanda and the region, with room to grow wherever creators and brands meet.",
    press: "press@creators.rw",
    support: "support@creators.rw",
  },
  testimonialsSection: {
    title: "What our customers say",
    lead: "Real feedback from creators and brand teams running campaigns, reviews, and MoMo payouts on Creators.",
    cta: "View more",
  },
  testimonials: [
    {
      quote:
        "I stopped juggling DMs and spreadsheets — every brief and payout lives here.",
      name: "Amara N.",
      role: "Creator · Beauty",
    },
    {
      quote: "Revision notes are finally attached to the task, not lost in WhatsApp.",
      name: "Leo M.",
      role: "Creator · Tech",
    },
    {
      quote: "We see who applied, who delivered, and what we approved without a shared doc.",
      name: "Marketing lead",
      role: "Primus Beer",
    },
    {
      quote: "The review queue alone saved our team hours every launch week.",
      name: "Brand manager",
      role: "Kigali Co.",
    },
  ],
} as const;
