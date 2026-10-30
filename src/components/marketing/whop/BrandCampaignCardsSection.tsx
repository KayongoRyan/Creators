import Link from "next/link";
import { BrandCampaignCardsCarousel } from "@/components/marketing/whop/BrandCampaignCardsCarousel";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide, mktSectionTitle, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

export function BrandCampaignCardsSection() {
  return (
    <section
      id="open-campaigns"
      className={cn(
        "scroll-mt-24 border-t border-mkt-border bg-mkt-bg",
        mktSafeXWide,
        mktSectionY,
      )}
    >
      <div className={mktContainer}>
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-mkt-fg-subtle">
            Brands hiring now
          </p>
          <h2 className={cn("mt-3 text-mkt-fg", mktSectionTitle)}>
            Campaigns looking for creators
          </h2>
          <p className="mt-4 text-base leading-7 text-mkt-fg-muted">
            Browse briefs from brands in Rwanda and beyond. Each card shows the
            budget, niche, and what they need you to make.
          </p>
        </div>

        <BrandCampaignCardsCarousel />

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          <Link
            href={routes.creator.campaigns}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi",
            )}
          >
            View all campaigns
          </Link>
          <Link
            href={routes.auth.register}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-mkt-border px-6 text-sm font-semibold text-mkt-fg transition hover:bg-mkt-card"
          >
            Apply as a creator
          </Link>
        </div>
      </div>
    </section>
  );
}
