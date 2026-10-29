"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  selectOverviewMetrics,
  selectPendingPayouts,
  useAdminStore,
} from "@/features/admin/store";
import { formatRwf } from "@/lib/format/money";

export function AdminOverview() {
  const { state, markAllDuePayoutsPaid } = useAdminStore();
  const metrics = useMemo(() => selectOverviewMetrics(state), [state]);
  const pendingPayouts = useMemo(() => selectPendingPayouts(state), [state]);
  const [confirmPaid, setConfirmPaid] = useState(false);

  const pendingActions = [
    metrics.pendingApplications > 0
      ? {
          title: "Creator applications",
          status: `${metrics.pendingApplications} pending`,
          body: `${metrics.pendingApplications} new creator${
            metrics.pendingApplications === 1 ? "" : "s"
          } submitted handles for review. Review and accept or reject.`,
          href: routes.admin.creators,
          action: "Review creators",
        }
      : null,
    metrics.pendingSubmissions > 0
      ? {
          title: "Submissions to review",
          status: `${metrics.pendingSubmissions} pending`,
          body: `${metrics.pendingSubmissions} creator submission${
            metrics.pendingSubmissions === 1 ? "" : "s"
          } waiting approval before payout is released.`,
          href: routes.admin.submissions,
          action: "Review submissions",
        }
      : null,
    pendingPayouts.length > 0
      ? {
          title: "Payouts due Friday",
          status: formatRwf(metrics.payoutsDueRwf),
          body: `${pendingPayouts.length} creator${
            pendingPayouts.length === 1 ? "" : "s"
          } have approved submissions. Disburse via MTN MoMo before end of week.`,
          href: routes.admin.payments,
          action: "View payouts",
          payoutCta: true as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    title: string;
    status: string;
    body: string;
    href: string;
    action: string;
    payoutCta?: boolean;
  }>;

  const allPaid = pendingPayouts.length === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Overview" description="Week of May 26, 2026" />
      <section
        aria-label="Platform totals"
        className="mb-10 grid gap-3 sm:grid-cols-3"
      >
        {[
          [String(metrics.activeCampaigns), "Active campaigns"],
          [String(metrics.vettedCreators), "Vetted creators"],
          [formatRwf(metrics.collectedRwf), "Collected this month"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-lg border border-black/10 bg-white p-5"
          >
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              {value}
            </p>
          </div>
        ))}
      </section>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Pending actions
      </p>
      {pendingActions.length === 0 ? (
        <EmptyState message="Nothing pending — you're caught up for this week." />
      ) : (
        <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
          {pendingActions.map((item) => (
            <li
              key={item.title}
              className="flex flex-wrap items-center justify-between gap-4 py-5"
            >
              <div className="max-w-xl">
                <h2 className="font-semibold text-gray-900">
                  {item.title}{" "}
                  <span className="font-medium text-gray-500">
                    · {item.status}
                  </span>
                </h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {item.body}
                </p>
              </div>
              {item.payoutCta ? (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30 hover:bg-white"
                  >
                    {item.action}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmPaid(true)}
                    disabled={allPaid}
                    className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                  >
                    {allPaid ? "Marked as paid" : "Mark as paid"}
                  </button>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30 hover:bg-white"
                >
                  {item.action}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmPaid}
        title="Mark all due payouts as paid?"
        description={`This will mark ${pendingPayouts.length} pending payout${
          pendingPayouts.length === 1 ? "" : "s"
        } (${formatRwf(metrics.payoutsDueRwf)}) as paid via MTN MoMo.`}
        confirmLabel="Mark as paid"
        onConfirm={() => {
          markAllDuePayoutsPaid();
          setConfirmPaid(false);
        }}
        onCancel={() => setConfirmPaid(false)}
      />
    </div>
  );
}
