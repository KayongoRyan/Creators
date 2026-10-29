import {
  Card,
  PageIntro,
  ReportLine,
  SectionLabel,
} from "@/components/workspace/primitives";

export default function BrandInvoicesPage() {
  return (
    <>
      <PageIntro
        title="Invoices"
        subtitle="Primus Beer · Bralirwa Ltd."
      />
      <SectionLabel>Campaign #2</SectionLabel>
      <Card>
        <ReportLine label="Creator budget" value="RWF 600,000" />
        <ReportLine label="Platform fee (20%)" value="RWF 120,000" />
        <ReportLine label="Invoice total" value="RWF 720,000" strong />
        <ReportLine label="Status" value="Paid ✓" tone="success" />
      </Card>
    </>
  );
}
