import { routes } from "./routes";

export type NavItem = { href: string; label: string };

/** Public marketing header */
export const marketingJoinCta = {
  href: routes.auth.login,
  label: "Join",
} as const;

export const adminNav: NavItem[] = [
  { href: routes.admin.root, label: "Dashboard" },
  { href: routes.admin.campaigns, label: "Campaigns" },
  { href: routes.admin.creators, label: "Creators" },
  { href: routes.admin.submissions, label: "Submissions" },
  { href: routes.admin.brands, label: "Brands" },
  { href: routes.admin.payments, label: "Payments" },
];

export const brandNav: NavItem[] = [
  { href: routes.brand.root, label: "Dashboard" },
  { href: routes.brand.campaigns, label: "Campaigns" },
  { href: routes.brand.invoices, label: "Invoices" },
  { href: routes.brand.reports, label: "Contact us" },
];

export const creatorNav: NavItem[] = [
  { href: routes.creator.root, label: "Dashboard" },
  { href: routes.creator.campaigns, label: "Discover" },
  { href: routes.creator.tasks, label: "My tasks" },
  { href: routes.creator.submissions, label: "Submissions" },
  { href: routes.creator.earnings, label: "Earnings" },
  { href: routes.creator.applications, label: "My profile" },
];
