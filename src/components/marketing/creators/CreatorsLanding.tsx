import { AudiencePathsSection } from "@/components/marketing/creators/AudiencePathsSection";
import { BrandCampaignCardsSection } from "@/components/marketing/creators/BrandCampaignCardsSection";
import { CampaignHeroSlideshow } from "@/components/marketing/creators/CampaignHeroSlideshow";
import { CompetitiveMarketsSection } from "@/components/marketing/creators/CompetitiveMarketsSection";
import { DeployCampaignSection } from "@/components/marketing/creators/DeployCampaignSection";
import { EarnByNicheSection } from "@/components/marketing/creators/EarnByNicheSection";
import { LandingTestimonialsSection } from "@/components/marketing/creators/LandingTestimonialsSection";

export function CreatorsLanding() {
  return (
    <div className="bg-mkt-bg text-mkt-fg">
      <CampaignHeroSlideshow />

      <AudiencePathsSection />

      <BrandCampaignCardsSection />

      <EarnByNicheSection />

      <CompetitiveMarketsSection />

      <LandingTestimonialsSection />

      <DeployCampaignSection />
    </div>
  );
}
