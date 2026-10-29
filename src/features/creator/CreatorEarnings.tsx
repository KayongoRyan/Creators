"use client";

import {
  Card,
  PageIntro,
  ReportLine,
  SectionLabel,
  StatGrid,
} from "@/components/workspace/primitives";
import { useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

function statusLabel(status: string) {
  if (status === "paid") return "Paid ✓";
  if (status === "approved") return "Approved · MoMo Friday";
  return "Pending review";
}

export function CreatorEarnings() {
  const { state } = useCreatorStore();
  const approved = state.earnings
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.amountRwf, 0);
  const pending = state.earnings
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amountRwf, 0);
  const paid = state.earnings
    .filter((e) => e.status === "paid")
    .reduce((s, e) => s + e.amountRwf, 0);

  return (
    <>
      <PageIntro
        title="Earnings"
        subtitle={`${state.profile.displayName} · ${state.profile.tiktokHandle}`}
      />
      <StatGrid
        items={[
          { value: formatRwf(approved), label: "Approved" },
          { value: formatRwf(pending), label: "Pending" },
          { value: formatRwf(paid), label: "Paid out" },
        ]}
      />
      <SectionLabel>Payout history</SectionLabel>
      <Card>
        {state.earnings.length === 0 ? (
          <ReportLine label="No earnings yet" value="—" />
        ) : (
          state.earnings.map((line) => (
            <ReportLine
              key={line.id}
              label={line.campaignTitle}
              value={`${formatRwf(line.amountRwf)} · ${statusLabel(line.status)}${
                line.payoutDate ? ` · ${line.payoutDate}` : ""
              }`}
              tone={
                line.status === "paid"
                  ? "success"
                  : line.status === "approved"
                    ? "success"
                    : "warning"
              }
            />
          ))
        )}
      </Card>
    </>
  );
}
