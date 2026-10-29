import { CreatorCampaignDetail } from "@/features/creator/CreatorCampaignDetail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CreatorCampaignDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CreatorCampaignDetail campaignId={id} />;
}
