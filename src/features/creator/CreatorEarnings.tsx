"use client";

import { CreatorWorkspacePageShell } from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  CreatorEmptyBlock,
  CreatorStatusPill,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";
import type { CreatorEarningLine } from "@/types";

function earningStatusPill(status: CreatorEarningLine["status"]) {
  if (status === "paid") return { label: "Paid", variant: "solid" as const };
  if (status === "approved") return { label: "Approved · MoMo", variant: "default" as const };
  return { label: "Pending review", variant: "outline" as const };
}

function formatPayoutDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function CreatorEarnings() {
  const { state } = useCreatorStore();
  const { profile, earnings } = state;

  const approved = earnings
    .filter((e) => e.status === "approved")
    .reduce((s, e) => s + e.amountRwf, 0);
  const pending = earnings
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amountRwf, 0);
  const paid = earnings.filter((e) => e.status === "paid").reduce((s, e) => s + e.amountRwf, 0);

  const stats = [
    { value: formatRwf(approved), label: "Approved", hint: "Queued for MoMo payout" },
    { value: formatRwf(pending), label: "Pending", hint: "Awaiting brand approval" },
    { value: formatRwf(paid), label: "Paid out", hint: "Sent to your wallet" },
  ];

  return (
    <CreatorWorkspacePageShell
      eyebrow="Earnings"
      title="Payout tracker"
      subtitle={`${profile.displayName} · ${profile.tiktokHandle}`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-5 sm:px-5"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.65rem]">
              {item.value}
            </p>
            <p className="mt-1.5 text-xs text-neutral-500">{item.hint}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Payout history
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              Every campaign line tied to approval and MoMo dates.
            </p>
          </div>
          {approved > 0 ? (
            <p className="text-sm font-medium text-neutral-900">
              {formatRwf(approved)} approved · next batch Friday
            </p>
          ) : null}
        </div>

        {earnings.length === 0 ? (
          <CreatorEmptyBlock message="No earnings yet. Complete a campaign submission to see payouts here." />
        ) : (
          <ul className="space-y-2">
            {earnings.map((line) => {
              const pill = earningStatusPill(line.status);
              const paidOn = formatPayoutDate(line.payoutDate);

              return (
                <li key={line.id}>
                  <div className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">{line.campaignTitle}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {paidOn ? `Paid ${paidOn}` : "Payout date after approval"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-base font-semibold tabular-nums text-neutral-900">
                        {formatRwf(line.amountRwf)}
                      </span>
                      <CreatorStatusPill label={pill.label} variant={pill.variant} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CreatorWorkspacePageShell>
  );
}
