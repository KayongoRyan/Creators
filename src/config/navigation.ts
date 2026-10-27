import { routes } from "./routes";

export type NavItem = { href: string; label: string };

export const adminNav: NavItem[] = [
  { href: routes.admin.root, label: "Overview" },
  { href: routes.admin.campaigns, label: "Campaigns" },
  { href: routes.admin.creators, label: "Creators" },
  { href: routes.admin.brands, label: "Brands" },
  { href: routes.admin.submissions, label: "Submissions" },
  { href: routes.admin.payments, label: "Payments" },
];

export const brandNav: NavItem[] = [
  { href: routes.brand.root, label: "Overview" },
  { href: routes.brand.campaigns, label: "Campaigns" },
  { href: routes.brand.reports, label: "Reports" },
];

export const creatorNav: NavItem[] = [
  { href: routes.creator.root, label: "Overview" },
  { href: routes.creator.campaigns, label: "Campaigns" },
  { href: routes.creator.applications, label: "Applications" },
  { href: routes.creator.submissions, label: "Submissions" },
  { href: routes.creator.earnings, label: "Earnings" },
];
