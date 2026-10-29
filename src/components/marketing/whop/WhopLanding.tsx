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

export function WhopLanding() {
  return (
    <div className="bg-mkt-bg text-mkt-fg">
      <CampaignHeroSlideshow />

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
