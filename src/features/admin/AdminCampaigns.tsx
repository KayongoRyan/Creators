"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useAdminStore } from "@/features/admin/store";
import type { AdminSubmission, CampaignReport } from "@/types";
import {
  centsToRwf,
  formatCampaignStatus,
  formatRwf,
} from "@/lib/format/money";

export function AdminCampaigns() {
  const { state, fundCampaign, snapshotCampaign, loadCampaignReport } = useAdminStore();
  const [viewDrafts, setViewDrafts] = useState<Record<string, Record<string, string>>>({});
  const [reports, setReports] = useState<Record<string, CampaignReport | "loading" | string>>(
    {},
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Campaigns" description="All active and past campaigns" />
      <p className="mb-8 text-sm text-gray-600">
        {state.campaigns.length}{" "}
        {state.campaigns.length === 1 ? "campaign" : "campaigns"}
      </p>

      {state.campaigns.length === 0 ? (
        <EmptyState message="No campaigns yet." />
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {state.campaigns.map((campaign) => {
            const budget = centsToRwf(campaign.budgetCents);
            const fee = Math.round(budget * ((campaign.feePercent ?? 20) / 100));
            return (
              <li key={campaign.id} className="py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold tracking-tight text-gray-900">
                    {campaign.title}
                  </h2>
                  <p className="text-sm font-medium text-gray-500">
                    {formatCampaignStatus(campaign.status)}
                  </p>
                </div>
                <div className="mt-2 space-y-1 text-sm leading-6 text-gray-600">
                  {campaign.campaignType ? (
                    <p>
                      Type: {campaign.campaignType} · Budget: {formatRwf(budget)} · Fee (
                      {campaign.feePercent ?? 20}%): {formatRwf(fee)}
                    </p>
                  ) : null}
                  <p>
                    Creators assigned: {campaign.assignedCreators ?? 0} · Submissions:{" "}
                    {campaign.submissionsReceived ?? 0} received,{" "}
                    {campaign.submissionsApproved ?? 0} approved
                  </p>
                  {campaign.deadline ? <p>Deadline: {campaign.deadline}</p> : null}
                  {campaign.creatorPoolRwf != null ? (
                    <p>
                      Creator pool: {formatRwf(campaign.creatorPoolRwf)} · Remaining:{" "}
                      {formatRwf(campaign.poolRemainingRwf ?? 0)}
                    </p>
                  ) : null}
                  {campaign.status === "draft" && !campaign.fundedAt ? (
                    <p className="text-gray-500">
                      Awaiting brand payment confirmation before going live.
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {campaign.status === "draft" && !campaign.fundedAt ? (
                    <button
                      type="button"
                      onClick={() => fundCampaign(campaign.id)}
                      className="inline-flex min-h-10 items-center rounded-full bg-gray-900 px-4 text-sm font-medium text-white"
                    >
                      Confirm payment
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      setReports((current) => ({ ...current, [campaign.id]: "loading" }));
                      void loadCampaignReport(campaign.id)
                        .then((report) =>
                          setReports((current) => ({ ...current, [campaign.id]: report })),
                        )
                        .catch((reason: unknown) =>
                          setReports((current) => ({
                            ...current,
                            [campaign.id]:
                              reason instanceof Error ? reason.message : "Could not load the report.",
                          })),
                        );
                    }}
                    className="inline-flex min-h-10 items-center rounded-full border border-black/15 px-4 text-sm font-medium"
                  >
                    Report
                  </button>
                </div>
                <CampaignSnapshot
                  submissions={state.submissions.filter(
                    (submission) => submission.campaignId === campaign.id,
                  )}
                  drafts={viewDrafts[campaign.id] ?? {}}
                  onChange={(submissionId, value) =>
                    setViewDrafts((current) => ({
                      ...current,
                      [campaign.id]: { ...current[campaign.id], [submissionId]: value },
                    }))
                  }
                  onSubmit={() => {
                    const drafts = viewDrafts[campaign.id] ?? {};
                    const views = Object.entries(drafts)
                      .map(([submissionId, raw]) => ({
                        submissionId,
                        views: Number(raw),
                      }))
                      .filter((entry) => Number.isFinite(entry.views) && entry.views >= 0);
                    if (views.length === 0) return;
                    snapshotCampaign(campaign.id, views);
                  }}
                />
                <CampaignReportPanel report={reports[campaign.id]} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CampaignSnapshot({
  submissions,
  drafts,
  onChange,
  onSubmit,
}: {
  submissions: AdminSubmission[];
  drafts: Record<string, string>;
  onChange: (submissionId: string, value: string) => void;
  onSubmit: () => void;
}) {
  if (submissions.length === 0) return null;
  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        48h view snapshot
      </p>
      {submissions.map((submission) => (
        <label key={submission.id} className="flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-gray-700">
            {submission.creatorName}
            <span className="text-gray-400"> · {submission.status}</span>
          </span>
          <input
            inputMode="numeric"
            value={drafts[submission.id] ?? ""}
            onChange={(event) => onChange(submission.id, event.target.value)}
            placeholder="Views"
            className="w-28 rounded-md border border-black/15 px-2 py-1.5 text-right"
          />
        </label>
      ))}
      <button
        type="submit"
        className="inline-flex min-h-10 items-center rounded-full border border-black/15 px-4 text-sm font-medium"
      >
        Save snapshot
      </button>
    </form>
  );
}

function CampaignReportPanel({ report }: { report?: CampaignReport | "loading" | string }) {
  if (!report) return null;
  if (report === "loading") {
    return <p className="mt-3 text-sm text-gray-500">Loading report…</p>;
  }
  if (typeof report === "string") {
    return <p className="mt-3 text-sm text-red-600">{report}</p>;
  }
  return (
    <div className="mt-4 rounded-lg border border-black/10 px-4 py-3 text-sm text-gray-700">
      <p>
        Reach {report.totalReach.toLocaleString()} · Payouts {formatRwf(report.totalPayoutRwf)} ·
        Pool left {formatRwf(report.poolRemainingRwf)}
      </p>
      {report.creators.length === 0 ? (
        <p className="mt-2 text-gray-500">No submissions on this campaign.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {report.creators.map((line) => (
            <li key={`${line.creatorName}-${line.postUrl ?? line.status}`}>
              {line.creatorName}: {line.views.toLocaleString()} views · {formatRwf(line.payoutRwf)} ·{" "}
              {line.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}