import Link from "next/link";
import { routes } from "@/config/routes";
import { marketingType } from "@/lib/marketing";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Product",
    links: [
      { href: routes.public.apply, label: "Apply" },
      { href: routes.auth.login, label: "Log in" },
      { href: routes.brand.root, label: "Brand workspace" },
      { href: routes.creator.root, label: "Creator workspace" },
    ],
  },
  {
    title: "Work",
    links: [
      { href: routes.brand.campaigns, label: "Campaigns" },
      { href: routes.creator.applications, label: "Applications" },
      { href: routes.creator.submissions, label: "Submissions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="[&_span]:text-white">
            <Logo />
          </div>
          <p className={marketingType.footerBlurb}>
            Brands post campaigns. Creators apply. Submissions come back for
            review.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h2 className={marketingType.footerColumn}>{column.title}</h2>
            <ul className="mt-4 space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={marketingType.footerLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
