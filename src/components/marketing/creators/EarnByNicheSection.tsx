import Link from "next/link";
import { AreasOfWorkGallery } from "@/components/marketing/creators/AreasOfWorkGallery";
import { earnByNicheSteps } from "@/content/earnByNiche";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

export function EarnByNicheSection() {
  return (
    <>
      <AreasOfWorkGallery />

      <section
        id="how-earnings-work"
        className={cn(
          "scroll-mt-24 border-t border-mkt-border bg-mkt-bg",
          mktSafeXWide,
          mktSectionY,
        )}
      >
        <div className={mktContainer}>
          <p className="text-sm font-medium text-mkt-accent">How you earn by niche</p>
          <h3 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-mkt-fg sm:text-3xl">
            From profile to payout in four steps
          </h3>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2">
            {earnByNicheSteps.map((item) => (
              <li
                key={item.step}
                className="rounded-2xl border border-mkt-border bg-mkt-card p-6"
              >
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-mkt-accent text-sm font-bold text-mkt-on-accent">
                  {item.step}
                </span>
                <h4 className="mt-4 text-lg font-semibold text-mkt-fg">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={routes.public.apply}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent shadow-mkt-cta transition hover:bg-mkt-accent-hi"
            >
              Apply with your niche
            </Link>
            <Link
              href={routes.creator.campaigns}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-mkt-border px-6 text-sm font-semibold text-mkt-fg transition hover:bg-mkt-muted"
            >
              Browse open campaigns
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
