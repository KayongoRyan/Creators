import { BrandCampaignDetail } from "@/features/brand/BrandCampaignDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BrandCampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <BrandCampaignDetail campaignId={id} />;
}
