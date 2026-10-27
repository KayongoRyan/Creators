import { PageHeader } from "@/components/shared/PageHeader";
import { CampaignList, getCampaigns } from "@/features/campaigns";

export default async function AdminCampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <>
      <PageHeader title="Campaigns" />
      <CampaignList campaigns={campaigns} />
    </>
  );
}
