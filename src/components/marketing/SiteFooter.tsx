import Link from "next/link";
import { whopLanding } from "@/content/whopLanding";
import { routes } from "@/config/routes";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-mkt-border bg-mkt-bg-muted text-mkt-fg">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-mkt-fg-muted">
            {whopLanding.hero.subtitle}
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-mkt-fg-subtle">Product</h2>
          <ul className="mt-4 space-y-2 text-sm text-mkt-fg-muted">
            <li>
              <Link href={routes.auth.register} className="hover:text-mkt-accent">
                Get started
              </Link>
            </li>
            <li>
              <Link href={routes.public.apply} className="hover:text-mkt-accent">
                Apply as creator
              </Link>
            </li>
            <li>
              <Link href={routes.auth.login} className="hover:text-mkt-accent">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-medium text-mkt-fg-subtle">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-mkt-fg-muted">
            <li>
              <a href={`mailto:${whopLanding.mission.press}`} className="hover:text-mkt-accent">
                {whopLanding.mission.press}
              </a>
            </li>
            <li>
              <a href={`mailto:${whopLanding.mission.support}`} className="hover:text-mkt-accent">
                {whopLanding.mission.support}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-mkt-border py-6 text-center text-xs text-mkt-fg-subtle">
        Creators · palette navy & gold · © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
