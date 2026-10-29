import Link from "next/link";
import { routes } from "@/config/routes";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const nav = [
  { href: "#", label: "Product" },
  { href: "#", label: "Developers" },
  { href: "#", label: "Pricing" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-mkt-border bg-mkt-header backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-6 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-mkt-fg-muted transition hover:bg-mkt-muted hover:text-mkt-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link
            href={routes.auth.login}
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-mkt-fg-muted hover:text-mkt-fg sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href={routes.auth.register}
            className="inline-flex min-h-9 items-center justify-center rounded-full bg-mkt-accent px-4 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi"
          >
            Get started
          </Link>
        </div>
      </div>
      <div className="border-t border-mkt-border px-6 py-2 sm:hidden">
        <ThemeToggle className="w-full justify-center" />
      </div>
    </header>
  );
}
