import { PageHeader } from "@/components/shared/PageHeader";
import { CampaignList, getCampaigns } from "@/features/campaigns";

export default async function CreatorCampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <>
      <PageHeader title="Browse campaigns" />
      <CampaignList campaigns={campaigns} />
    </>
  );
}
