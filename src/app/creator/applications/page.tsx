import { Card, Meta, PageIntro } from "@/components/workspace/primitives";

export default function CreatorProfilePage() {
  return (
    <>
      <PageIntro title="My profile" subtitle="What brands see when you are assigned" />
      <Card>
        <Meta>
          <strong>Name:</strong> Marie K.
          <br />
          <strong>Handle:</strong> @mariekigali
          <br />
          <strong>TikTok:</strong> 28K followers
          <br />
          <strong>Niche:</strong> Lifestyle
          <br />
          <strong>MoMo:</strong> +250 788 222 333
          <br />
          <strong>Status:</strong> Reliable · 4 campaigns
        </Meta>
      </Card>
    </>
  );
}
