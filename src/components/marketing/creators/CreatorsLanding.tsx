import Link from "next/link";
import { AudiencePathsSection } from "@/components/marketing/creators/AudiencePathsSection";
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
