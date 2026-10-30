import Link from "next/link";
import { BrandCampaignCardsSection } from "@/components/marketing/whop/BrandCampaignCardsSection";
import { CampaignHeroSlideshow } from "@/components/marketing/whop/CampaignHeroSlideshow";
import { EarnByNicheSection } from "@/components/marketing/whop/EarnByNicheSection";
import { whopLanding } from "@/content/whopLanding";
import { routes } from "@/config/routes";
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
      className={cn("mx-auto w-full max-w-6xl px-6 py-20 sm:px-8", className)}
    >
      {children}
    </section>
  );
}

const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-mkt-accent px-6 text-sm font-semibold text-mkt-on-accent transition hover:bg-mkt-accent-hi";

function AudiencePathsSection() {
  return (
    <section className="border-y border-mkt-border bg-mkt-bg-muted px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-mkt-accent">
          Choose your path
        </p>
        <h2 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-tight text-mkt-fg sm:text-4xl">
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

export function WhopLanding() {
  return (
    <div className="bg-mkt-bg text-mkt-fg">
      <CampaignHeroSlideshow />

      <AudiencePathsSection />

      <BrandCampaignCardsSection />

      <EarnByNicheSection />

      <Section className="border-t border-mkt-border">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {whopLanding.markets.title}
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whopLanding.markets.items.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-mkt-border bg-mkt-card p-6"
            >
              <h3 className="text-lg font-semibold text-mkt-accent">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-mkt-fg-muted">{item.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-mkt-border text-center">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {whopLanding.deploy.title}
        </h2>
        <Link href={routes.auth.register} className={cn(btnPrimary, "mt-8 px-8")}>
          Start now
        </Link>
      </Section>

      <Section className="border-t border-mkt-border pb-24">
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          {whopLanding.mission.title}
        </h2>
        <p className="mt-6 max-w-3xl text-base leading-7 text-mkt-fg-muted">
          {whopLanding.mission.body}
        </p>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-mkt-fg-subtle">
          <p>
            Press Inquiries:{" "}
            <a className="text-mkt-accent hover:underline" href={`mailto:${whopLanding.mission.press}`}>
              {whopLanding.mission.press}
            </a>
          </p>
          <p>
            Support Inquiries:{" "}
            <a
              className="text-mkt-accent hover:underline"
              href={`mailto:${whopLanding.mission.support}`}
            >
              {whopLanding.mission.support}
            </a>
          </p>
        </div>
      </Section>
    </div>
  );
}
