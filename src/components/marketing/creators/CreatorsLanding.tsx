import Link from "next/link";
import { BrandCampaignCardsSection } from "@/components/marketing/creators/BrandCampaignCardsSection";
import { CampaignHeroSlideshow } from "@/components/marketing/creators/CampaignHeroSlideshow";
import { CompetitiveMarketsSection } from "@/components/marketing/creators/CompetitiveMarketsSection";
import { DeployCampaignSection } from "@/components/marketing/creators/DeployCampaignSection";
import { EarnByNicheSection } from "@/components/marketing/creators/EarnByNicheSection";
import { creatorsLanding } from "@/content/creatorsLanding";
import { routes } from "@/config/routes";
import { mktContainer, mktSafeXWide, mktSectionTitle, mktSectionY } from "@/lib/marketing/layout";
import { cn } from "@/lib/utils/cn";

function Section({
  className,
  children,
  id,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(mktContainer, mktSafeXWide, mktSectionY, className)}
    >
      {children}
    </section>
  );
}

function AudiencePathsSection() {
  return (
    <section
      className={cn(
        "border-y border-mkt-border bg-mkt-bg-muted",
        mktSafeXWide,
        mktSectionY,
      )}
    >
      <div className={mktContainer}>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-mkt-accent">
          Choose your path
        </p>
        <h2 className={cn("mt-3 max-w-3xl text-mkt-fg", mktSectionTitle)}>
          One platform. Two ways to grow.
        </h2>

        <div className="mt-10 grid overflow-hidden rounded-lg border border-mkt-border sm:grid-cols-2">
          <article className="flex min-h-full flex-col bg-mkt-bg p-7 sm:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-mkt-accent">
              For creators
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-mkt-fg">
              Make your work your next opportunity.
            </h3>
            <p className="mt-4 flex-1 text-sm leading-6 text-mkt-fg-muted">
              Share your niches, find briefs that fit your style, and keep
              applications, deliverables, and payouts together.
            </p>
            <Link
              href={`${routes.auth.register}?role=creator`}
              className="mt-8 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-mkt-accent px-5 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent"
            >
              Join as a creator
            </Link>
          </article>

          <article className="flex min-h-full flex-col border-t border-mkt-border bg-mkt-surface p-7 sm:border-l sm:border-t-0 sm:p-9">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-mkt-accent-hi">
              For brands
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-mkt-fg">
              Brief the work. Meet the right creators.
            </h3>
            <p className="mt-4 flex-1 text-sm leading-6 text-mkt-fg-muted">
              Launch a campaign, review creator applications, and manage
              content from the first brief through final delivery.
            </p>
            <Link
              href={`${routes.auth.register}?role=brand`}
              className="mt-8 inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-mkt-border px-5 text-sm font-semibold text-mkt-fg transition hover:bg-mkt-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mkt-accent"
            >
              Create a brand account
            </Link>
          </article>
        </div>
      </div>
    </section>
  );
}

export function CreatorsLanding() {
  return (
    <div className="bg-mkt-bg text-mkt-fg">
      <CampaignHeroSlideshow />

      <AudiencePathsSection />

      <BrandCampaignCardsSection />

      <EarnByNicheSection />

      <CompetitiveMarketsSection />

      <DeployCampaignSection />

      <Section className="border-t border-mkt-border pb-24">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {creatorsLanding.mission.title}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-7 text-mkt-fg-muted">
          {creatorsLanding.mission.body}
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-mkt-fg-subtle">
          <p>
            Press Inquiries:{" "}
            <a className="text-mkt-accent hover:underline" href={`mailto:${creatorsLanding.mission.press}`}>
              {creatorsLanding.mission.press}
            </a>
          </p>
          <p>
            Support Inquiries:{" "}
            <a
              className="text-mkt-accent hover:underline"
              href={`mailto:${creatorsLanding.mission.support}`}
            >
              {creatorsLanding.mission.support}
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}
