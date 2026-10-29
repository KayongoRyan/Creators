import {
  Card,
  PageIntro,
  ReportLine,
  SectionLabel,
  StatGrid,
} from "@/components/workspace/primitives";

export default function CreatorEarningsPage() {
  return (
    <>
      <PageIntro title="Earnings" subtitle="Marie K. · @mariekigali" />
      <StatGrid
        items={[
          { value: "RWF 45K", label: "Approved" },
          { value: "RWF 28K", label: "Pending" },
          { value: "2", label: "Campaigns done" },
        ]}
      />
      <SectionLabel>This month</SectionLabel>
      <Card>
        <ReportLine
          label="Primus Beer — Reaction videos"
          value="RWF 45,000"
          tone="success"
        />
        <ReportLine
          label="Iwacu Music — Clip this interview"
          value="RWF 28,000"
          tone="warning"
        />
        <div className="my-3 border-t border-[rgba(31,30,29,0.15)]" />
        <ReportLine label="MoMo payout Friday" value="RWF 45,000" strong />
      </Card>
    </>
  );
}
