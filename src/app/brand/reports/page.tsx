import { Card, Meta, PageIntro } from "@/components/workspace/primitives";

export default function BrandContactPage() {
  return (
    <>
      <PageIntro title="Contact us" subtitle="Your Ubunifu producer" />
      <Card>
        <Meta>
          <strong>Producer:</strong> Aline K.
          <br />
          <strong>WhatsApp:</strong> +250 788 000 111
          <br />
          <strong>Email:</strong> hello@ubunifu.dev
          <br />
          <br />
          Message us when a brief changes, a creator misses a post, or you need
          the invoice resent.
        </Meta>
      </Card>
    </>
  );
}
