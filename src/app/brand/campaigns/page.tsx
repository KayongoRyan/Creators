import { PageHeader } from "@/components/shared/PageHeader";
import { CampaignList, getCampaigns } from "@/features/campaigns";

export default async function BrandCampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <>
      <PageHeader title="Your campaigns" />
      <CampaignList campaigns={campaigns} />
    </>
  );
}
