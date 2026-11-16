"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { routes } from "@/config/routes";
import {
  selectActivityFeed,
  selectOverviewMetrics,
  selectPendingPayouts,
  useAdminStore,
} from "@/features/admin/store";
import { selectAnalyticsSummary } from "@/features/admin/analytics/selectors";
import { formatActivityWhen } from "@/lib/format/datetime";
import { formatRwf } from "@/lib/format/money";
import type { AdminActivityKind } from "@/types";

const activityTone: Record<AdminActivityKind, string> = {
  creator_application: "bg-black text-white",
  creator_verified: "bg-neutral-800 text-white",
  creator_rejected: "bg-neutral-200 text-black",
  creator_suspended: "bg-neutral-300 text-black",
  creator_reactivated: "bg-neutral-800 text-white",
  submission_pending: "bg-neutral-100 text-black",
  submission_approved: "bg-black text-white",
  submission_rejected: "bg-neutral-200 text-black",
  submission_revision: "bg-neutral-100 text-black",
  campaign_created: "bg-neutral-800 text-white",
  payout_paid: "bg-black text-white",
  brand_payment: "bg-neutral-800 text-white",
  brand_status: "bg-neutral-100 text-black",
};

function activityLabel(kind: AdminActivityKind) {
  return kind.replace(/_/g, " ");
}

export function AdminDashboard() {
  const { state, markAllDuePayoutsPaid } = useAdminStore();
  const metrics = useMemo(() => selectOverviewMetrics(state), [state]);
  const pendingPayouts = useMemo(() => selectPendingPayouts(state), [state]);
  const activity = useMemo(() => selectActivityFeed(state, 14), [state]);
  const pulse = useMemo(() => selectAnalyticsSummary(state, 7), [state]);
  const [confirmPaid, setConfirmPaid] = useState(false);

  const pendingActions = [
    metrics.pendingApplications > 0
      ? {
          title: "Creator applications",
          status: `${metrics.pendingApplications} pending`,
          body: "Review handles and niches before creators join campaigns.",
          href: routes.admin.creators,
          action: "Review creators",
        }
      : null,
    metrics.pendingSubmissions > 0
      ? {
          title: "Submissions to review",
          status: `${metrics.pendingSubmissions} pending`,
          body: "Approve or request revisions before payouts release.",
          href: routes.admin.submissions,
          action: "Review submissions",
        }
      : null,
    pendingPayouts.length > 0
      ? {
          title: "Payouts due",
          status: formatRwf(metrics.payoutsDueRwf),
          body: `${pendingPayouts.length} creator${
            pendingPayouts.length === 1 ? "" : "s"
          } awaiting MoMo disbursement.`,
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

  const kpis = [
    { value: String(metrics.activeBrands), label: "Active businesses" },
    { value: String(metrics.vettedCreators), label: "Vetted creators" },
    { value: String(metrics.activeCampaigns), label: "Live campaigns" },
    { value: formatRwf(metrics.collectedRwf), label: "Collected (paid invoices)" },
    {
      value: String(metrics.pendingApplications + metrics.pendingSubmissions),
      label: "Items in review queue",
    },
    { value: formatRwf(metrics.payoutsDueRwf), label: "Payouts outstanding" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Control center"
        description="Monitor creators and businesses, track platform activity, and clear the review queue."
      />

      <section
        aria-labelledby="pulse-heading"
        className="mb-8 rounded-lg border border-black/10 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="pulse-heading"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
            >
              Platform pulse · last 7 days
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Traffic, growth and money moving through the platform.
            </p>
          </div>
          <Link
            href={routes.admin.analytics}
            className="inline-flex min-h-9 items-center rounded-full bg-black px-4 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Open full analytics
          </Link>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-neutral-500">Visitors</dt>
            <dd className="mt-1 text-xl font-semibold text-black">
              {pulse.current.visitors.toLocaleString("en-US")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Sign-ups</dt>
            <dd className="mt-1 text-xl font-semibold text-black">
              {pulse.current.signups.toLocaleString("en-US")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Submissions</dt>
            <dd className="mt-1 text-xl font-semibold text-black">
              {pulse.current.submissions.toLocaleString("en-US")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-500">Collected</dt>
            <dd className="mt-1 text-xl font-semibold text-black">
              {formatRwf(pulse.current.collectionsRwf)}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-label="Platform totals" className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {kpis.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-lg border border-black/10 bg-white p-4 sm:p-5"
          >
            <p className="text-xs font-medium text-neutral-600 sm:text-sm">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
              {value}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="activity-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="activity-heading"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
            >
              Activity feed
            </h2>
            <p className="text-xs text-neutral-500">Latest across creators & businesses</p>
          </div>
          {activity.length === 0 ? (
            <EmptyState message="No activity recorded yet." />
          ) : (
            <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
              {activity.map((item) => (
                <li key={item.id} className="py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-black">{item.actorLabel}</p>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{item.summary}</p>
                      <p className="mt-2 text-xs text-neutral-500">
                        {formatActivityWhen(item.at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${activityTone[item.kind]}`}
                    >
                      {activityLabel(item.kind)}
                    </span>
                  </div>
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="mt-2 inline-block text-sm font-medium text-black underline decoration-1 underline-offset-4"
                    >
                      Open
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-8">
          <section aria-labelledby="creators-snapshot">
            <h2
              id="creators-snapshot"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
            >
              Creators
            </h2>
            <div className="mt-4 rounded-lg border border-black/10 bg-white p-5">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-neutral-500">Roster</dt>
                  <dd className="text-xl font-semibold text-black">{metrics.vettedCreators}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Applications</dt>
                  <dd className="text-xl font-semibold text-black">
                    {metrics.pendingApplications}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Suspended</dt>
                  <dd className="text-xl font-semibold text-black">
                    {metrics.suspendedCreators}
                  </dd>
                </div>
              </dl>
              <Link
                href={routes.admin.creators}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
              >
                Manage creators
              </Link>
            </div>
          </section>

          <section aria-labelledby="brands-snapshot">
            <h2
              id="brands-snapshot"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
            >
              Businesses
            </h2>
            <div className="mt-4 rounded-lg border border-black/10 bg-white p-5">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-neutral-500">Accounts</dt>
                  <dd className="text-xl font-semibold text-black">{metrics.totalBrands}</dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Active</dt>
                  <dd className="text-xl font-semibold text-black">{metrics.activeBrands}</dd>
                </div>
              </dl>
              <ul className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
                {state.brandAccounts.slice(0, 3).map((b) => (
                  <li key={b.id} className="flex justify-between gap-2">
                    <span className="truncate font-medium text-black">{b.name}</span>
                    <span className="shrink-0 text-neutral-500">{b.status.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={routes.admin.brands}
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
              >
                Manage businesses
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="mt-10" aria-labelledby="pending-heading">
        <h2
          id="pending-heading"
          className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
        >
          Pending actions
        </h2>
        {pendingActions.length === 0 ? (
          <EmptyState message="Nothing pending — queue is clear." />
        ) : (
          <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
            {pendingActions.map((item) => (
              <li
                key={item.title}
                className="flex flex-wrap items-center justify-between gap-4 py-5"
              >
                <div className="max-w-xl">
                  <h3 className="font-semibold text-black">
                    {item.title}{" "}
                    <span className="font-medium text-neutral-500">· {item.status}</span>
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{item.body}</p>
                </div>
                {item.payoutCta ? (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={item.href}
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
                    >
                      {item.action}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setConfirmPaid(true)}
                      className="inline-flex min-h-10 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      Mark all paid
                    </button>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
                  >
                    {item.action}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

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
