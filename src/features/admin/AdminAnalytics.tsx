"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { routes } from "@/config/routes";
import { useAdminStore } from "@/features/admin/store";
import {
  ActivityTrendChart,
  DeviceChart,
  FunnelChart,
  RevenueTrendChart,
  SignupTrendChart,
  SourceChart,
  TrafficTrendChart,
} from "@/features/admin/analytics/Charts";
import {
  analyticsToCsv,
  auditRoleLabel,
  auditToCsv,
  filterAuditEvents,
  mergeAuditTrail,
  selectAnalyticsSummary,
  type AnalyticsRange,
  type DailyTotals,
} from "@/features/admin/analytics/selectors";
import { formatActivityWhen } from "@/lib/format/datetime";
import { formatRwf } from "@/lib/format/money";
import type {
  AuditActorRole,
  AuditEvent,
  AuditSeverity,
} from "@/types";

const ranges: AnalyticsRange[] = [7, 30, 90];

const roleOptions: Array<{ value: AuditActorRole | "all"; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "creator", label: "Creators" },
  { value: "brand", label: "Brands" },
  { value: "admin", label: "Admins" },
  { value: "guest", label: "Guests" },
  { value: "system", label: "System" },
];

const severityOptions: Array<{ value: AuditSeverity | "all"; label: string }> = [
  { value: "all", label: "All severities" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
];

const roleTone: Record<AuditActorRole, string> = {
  admin: "bg-black text-white",
  brand: "bg-neutral-800 text-white",
  creator: "bg-neutral-100 text-black ring-1 ring-black/10",
  guest: "bg-white text-neutral-600 ring-1 ring-black/10",
  system: "bg-neutral-200 text-neutral-700",
};

const severityTone: Record<AuditSeverity, string> = {
  info: "bg-neutral-300",
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  critical: "bg-red-600",
};

function actionLabel(action: string) {
  return action.replace(/_/g, " ");
}

function formatDelta(value: number | null) {
  if (value === null) return { label: "no prior data", tone: "text-neutral-500" };
  if (Math.abs(value) < 0.05) return { label: "flat", tone: "text-neutral-500" };
  const direction = value > 0 ? "+" : "";
  return {
    label: `${direction}${value.toFixed(1)}%`,
    tone: value > 0 ? "text-emerald-700" : "text-red-600",
  };
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminAnalytics() {
  const { state, liveEvents } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<AnalyticsRange>(30);
  const [auditQuery, setAuditQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<AuditActorRole | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "all">(
    "all",
  );
  const [hidePageViews, setHidePageViews] = useState(true);
  const [auditLimit, setAuditLimit] = useState(25);

  useEffect(() => {
    setMounted(true);
  }, []);

  const summary = useMemo(
    () => selectAnalyticsSummary(state, range),
    [state, range],
  );
  const trail = useMemo(
    () => mergeAuditTrail(state, liveEvents),
    [state, liveEvents],
  );
  const filteredTrail = useMemo(
    () =>
      filterAuditEvents(trail, {
        query: auditQuery,
        role: roleFilter,
        severity: severityFilter,
        hidePageViews,
      }),
    [trail, auditQuery, roleFilter, severityFilter, hidePageViews],
  );

  const sources = useMemo(
    () =>
      state.analytics.trafficSources.map((source) => ({
        label: source.label,
        value: Math.round((summary.current.visitors * source.share) / 100),
      })),
    [state.analytics.trafficSources, summary],
  );

  const topPages = useMemo(
    () =>
      state.analytics.topPages.map((page) => ({
        ...page,
        views: Math.round((summary.current.pageViews * page.share) / 100),
      })),
    [state.analytics.topPages, summary],
  );

  const liveToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return liveEvents.filter((event) => event.at.slice(0, 10) === today).length;
  }, [liveEvents]);

  const netRwf =
    summary.current.collectionsRwf - summary.current.payoutsRwf;

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Platform analytics"
          description="Every action, every metric — traffic, revenue, operations and platform health."
        />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-black/10 bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Platform analytics"
        description="Every action, every metric — traffic, revenue, operations and platform health."
      />
      <div className="-mt-3 mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-900">
          <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
          Live · {liveToday} action{liveToday === 1 ? "" : "s"} today
        </span>
        <div
          role="group"
          aria-label="Date range"
          className="inline-flex rounded-full border border-black/10 bg-white p-1"
        >
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              aria-pressed={range === option}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                range === option
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {option}d
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              `creators-analytics-${range}d-${new Date().toISOString().slice(0, 10)}.csv`,
              analyticsToCsv(summary),
            )
          }
          className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-xs font-medium text-black hover:bg-neutral-50"
        >
          Export analytics
        </button>
      </div>

      <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Visitors"
          value={summary.current.visitors.toLocaleString("en-US")}
          delta={summary.deltas.visitors}
          hint={`${Math.round(summary.current.visitors / range).toLocaleString("en-US")} / day`}
        />
        <KpiCard
          label="Page views"
          value={summary.current.pageViews.toLocaleString("en-US")}
          delta={summary.deltas.pageViews}
          hint={`${(summary.current.pageViews / Math.max(1, summary.current.visitors)).toFixed(1)} per visit`}
        />
        <KpiCard
          label="Sign-ups"
          value={summary.current.signups.toLocaleString("en-US")}
          delta={summary.deltas.signups}
          hint={`${((summary.current.signups / Math.max(1, summary.current.visitors)) * 100).toFixed(1)}% of visitors`}
        />
        <KpiCard
          label="Avg daily active"
          value={Math.round(summary.current.activeUsers / range).toLocaleString(
            "en-US",
          )}
          delta={summary.deltas.activeUsers}
          hint="Unique active users / day"
        />
        <KpiCard
          label="Campaigns created"
          value={summary.current.campaignsCreated.toLocaleString("en-US")}
          delta={summary.deltas.campaignsCreated}
          hint={`${summary.operations.activeCampaigns} live now`}
        />
        <KpiCard
          label="Campaign applications"
          value={summary.current.campaignApplications.toLocaleString("en-US")}
          delta={summary.deltas.campaignApplications}
          hint="Creators applying to briefs"
        />
        <KpiCard
          label="Submissions"
          value={summary.current.submissions.toLocaleString("en-US")}
          delta={summary.deltas.submissions}
          hint={`${summary.operations.approvalRate}% approval rate`}
        />
        <KpiCard
          label="Creator applications"
          value={summary.current.creatorApplications.toLocaleString("en-US")}
          delta={summary.deltas.creatorApplications}
          hint={`${summary.operations.pendingApplications} awaiting review`}
        />
      </section>

      <section
        aria-label="Revenue and review health"
        className="mt-8 grid gap-3 lg:grid-cols-3"
      >
        <div className="rounded-lg border border-black/10 bg-white p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-black">
              Revenue · {range} days
            </h2>
            <span className="text-xs text-neutral-500">Collections vs creator payouts</span>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            <div>
              <dt className="text-xs text-neutral-500">Collections</dt>
              <dd className="mt-1 text-lg font-semibold text-black sm:text-xl">
                {formatRwf(summary.current.collectionsRwf)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Creator payouts</dt>
              <dd className="mt-1 text-lg font-semibold text-black sm:text-xl">
                {formatRwf(summary.current.payoutsRwf)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-500">Net position</dt>
              <dd
                className={`mt-1 text-lg font-semibold sm:text-xl ${
                  netRwf >= 0 ? "text-emerald-700" : "text-red-600"
                }`}
              >
                {formatRwf(netRwf)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-neutral-500">
            {summary.operations.pendingPayouts} payout
            {summary.operations.pendingPayouts === 1 ? "" : "s"} still due ·{" "}
            {formatRwf(summary.operations.payoutsDueRwf)} outstanding
          </p>
        </div>

        <div className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-black">
            Review health
          </h2>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-black">
            {summary.operations.approvalRate}%
          </p>
          <p className="text-xs text-neutral-500">submissions approved</p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-600">Avg review time</dt>
              <dd className="font-medium text-black">
                {summary.operations.reviewAvgHours}h
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-600">Target</dt>
              <dd className="font-medium text-black">
                {summary.operations.reviewTargetHours}h
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-600">Within SLA</dt>
              <dd className="font-medium text-black">
                {summary.operations.reviewWithinSlaPercent}%
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-neutral-600">Oldest pending</dt>
              <dd
                className={`font-medium ${
                  summary.operations.oldestPendingHours > 24
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {summary.operations.oldestPendingHours}h
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="traffic-heading">
        <SectionHeading id="traffic-heading" title="Traffic & acquisition" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Visitors & page views" hint="Daily traffic">
            <TrafficTrendChart data={summary.daily} />
          </ChartCard>
          <ChartCard title="Devices" hint="Share of sessions">
            <DeviceChart data={state.analytics.devices} />
          </ChartCard>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Sign-ups & active users" hint="Daily audience">
            <SignupTrendChart data={summary.daily} />
          </ChartCard>
          <ChartCard title="Where visitors come from" hint="Acquisition channels">
            <SourceChart data={sources} />
          </ChartCard>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="growth-heading">
        <SectionHeading id="growth-heading" title="Campaign & creator activity" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Campaigns, applications & submissions" hint="Daily volume">
            <ActivityTrendChart data={summary.daily} />
          </ChartCard>
          <ChartCard title="Conversion funnel" hint={`Last ${range} days`}>
            <FunnelChart summary={summary} />
          </ChartCard>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <ChartCard title="Revenue vs payouts" hint="RWF per day">
            <RevenueTrendChart data={summary.daily} />
          </ChartCard>
          <ChartCard title="Top pages" hint="By traffic share">
            <ul className="divide-y divide-black/10">
              {topPages.map((page) => (
                <li
                  key={page.path}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span className="truncate font-medium text-black">
                    {page.path}
                  </span>
                  <span className="shrink-0 text-xs text-neutral-500">
                    {page.views.toLocaleString("en-US")} views · {page.avgSeconds}s
                  </span>
                </li>
              ))}
            </ul>
          </ChartCard>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="ops-heading">
        <SectionHeading
          id="ops-heading"
          title="Operations & platform health"
          action={{ href: routes.admin.submissions, label: "Open review queue" }}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
          <OpsCard
            label="Creator applications"
            value={String(summary.operations.pendingApplications)}
            hint="Awaiting verification"
            href={routes.admin.creators}
            urgent={summary.operations.pendingApplications > 0}
          />
          <OpsCard
            label="Submissions to review"
            value={String(summary.operations.pendingSubmissions)}
            hint="Pending approval"
            href={routes.admin.submissions}
            urgent={summary.operations.pendingSubmissions > 5}
          />
          <OpsCard
            label="Payouts due"
            value={`${summary.operations.pendingPayouts}`}
            hint={formatRwf(summary.operations.payoutsDueRwf)}
            href={routes.admin.payments}
            urgent={summary.operations.pendingPayouts > 0}
          />
          <OpsCard
            label="Overdue campaigns"
            value={String(summary.operations.overdueCampaigns)}
            hint="Past deadline, still live"
            href={routes.admin.campaigns}
            urgent={summary.operations.overdueCampaigns > 0}
          />
          <OpsCard
            label="Stalled campaigns"
            value={String(summary.operations.stalledCampaigns)}
            hint="Assigned creators, no submissions"
            href={routes.admin.campaigns}
            urgent={summary.operations.stalledCampaigns > 0}
          />
          <OpsCard
            label="At-risk accounts"
            value={String(
              summary.operations.brandsPendingPayment +
                summary.operations.suspendedCreators,
            )}
            hint={`${summary.operations.brandsPendingPayment} brands · ${summary.operations.suspendedCreators} creators`}
            href={routes.admin.brands}
            urgent={
              summary.operations.brandsPendingPayment +
                summary.operations.suspendedCreators >
              0
            }
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-black">Top creators</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Earned and pending across all campaigns
            </p>
            <ul className="mt-4 divide-y divide-black/10">
              {summary.topCreators.map((creator) => (
                <li key={creator.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                      {creator.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {creator.handle} · {creator.approvedCount}/{creator.submissionCount} approved
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium text-black">
                      {formatRwf(creator.earnedRwf)}
                    </p>
                    {creator.pendingRwf > 0 ? (
                      <p className="text-xs text-amber-700">
                        {formatRwf(creator.pendingRwf)} pending
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-black">Top businesses</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Total spend and campaign volume
            </p>
            <ul className="mt-4 divide-y divide-black/10">
              {summary.topBrands.map((brand) => (
                <li key={brand.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black">
                      {brand.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {brand.campaignsRun} campaign{brand.campaignsRun === 1 ? "" : "s"} ·{" "}
                      {brand.status.replace("_", " ")}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-black">
                    {formatRwf(brand.totalSpentRwf)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="campaigns-heading">
        <SectionHeading
          id="campaigns-heading"
          title="Campaign performance"
          action={{ href: routes.admin.campaigns, label: "Manage campaigns" }}
        />
        <div className="mt-4 overflow-x-auto rounded-lg border border-black/10 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deadline</th>
                <th className="px-4 py-3 text-right font-medium">Assigned</th>
                <th className="px-4 py-3 text-right font-medium">Received</th>
                <th className="px-4 py-3 text-right font-medium">Approved</th>
                <th className="px-4 py-3 text-right font-medium">Fill</th>
                <th className="px-4 py-3 text-right font-medium">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {summary.campaigns.map((campaign) => (
                <tr key={campaign.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{campaign.title}</p>
                    <p className="text-xs text-neutral-500">{campaign.brandName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-black">
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={campaign.overdue ? "text-red-600" : "text-neutral-600"}>
                      {campaign.deadline ?? "—"}
                      {campaign.overdue ? " · overdue" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{campaign.assignedCreators}</td>
                  <td className="px-4 py-3 text-right">{campaign.submissionsReceived}</td>
                  <td className="px-4 py-3 text-right">{campaign.submissionsApproved}</td>
                  <td className="px-4 py-3 text-right">{campaign.fillRate}%</td>
                  <td className="px-4 py-3 text-right">{formatRwf(campaign.budgetRwf)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="audit-heading">
        <SectionHeading
          id="audit-heading"
          title="Every action on the web"
          hint={`${trail.length.toLocaleString("en-US")} events recorded`}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={auditQuery}
            onChange={(event) => {
              setAuditQuery(event.target.value);
              setAuditLimit(25);
            }}
            placeholder="Search actor, action, campaign…"
            aria-label="Search activity"
            className="min-h-9 w-full rounded-full border border-black/15 bg-white px-4 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none sm:w-64"
          />
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as AuditActorRole | "all");
              setAuditLimit(25);
            }}
            aria-label="Filter by role"
            className="min-h-9 rounded-full border border-black/15 bg-white px-3 text-sm text-black focus:border-black focus:outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={severityFilter}
            onChange={(event) => {
              setSeverityFilter(event.target.value as AuditSeverity | "all");
              setAuditLimit(25);
            }}
            aria-label="Filter by severity"
            className="min-h-9 rounded-full border border-black/15 bg-white px-3 text-sm text-black focus:border-black focus:outline-none"
          >
            {severityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={hidePageViews}
              onChange={(event) => setHidePageViews(event.target.checked)}
              className="size-4 rounded border-black/20"
            />
            Hide page views
          </label>
          <button
            type="button"
            onClick={() =>
              downloadCsv(
                `creators-activity-${new Date().toISOString().slice(0, 10)}.csv`,
                auditToCsv(filteredTrail),
              )
            }
            className="ml-auto inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-xs font-medium text-black hover:bg-neutral-50"
          >
            Export activity
          </button>
        </div>

        {filteredTrail.length === 0 ? (
          <EmptyState message="No activity matches these filters." />
        ) : (
          <>
            <div className="mt-4 overflow-x-auto rounded-lg border border-black/10">
              <table className="w-full min-w-[900px] table-fixed text-left text-sm">
                <colgroup>
                  <col className="w-[132px]" />
                  <col className="w-[188px]" />
                  <col className="w-[158px]" />
                  <col />
                  <col className="w-[168px]" />
                </colgroup>
                <thead className="border-b border-black/10 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Detail</th>
                    <th className="px-4 py-3 font-medium">Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 bg-white">
                  {filteredTrail.slice(0, auditLimit).map((event) => (
                    <AuditRow key={event.id} event={event} />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
              <p>
                Showing {Math.min(auditLimit, filteredTrail.length).toLocaleString("en-US")} of{" "}
                {filteredTrail.length.toLocaleString("en-US")} matching events
              </p>
              {auditLimit < filteredTrail.length ? (
                <button
                  type="button"
                  onClick={() => setAuditLimit((limit) => limit + 25)}
                  className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 font-medium text-black hover:bg-neutral-50"
                >
                  Load 25 more
                </button>
              ) : null}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function SectionHeading({
  id,
  title,
  hint,
  action,
}: {
  id: string;
  title: string;
  hint?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id={id}
          className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
        >
          {title}
        </h2>
        {hint ? <p className="mt-1 text-xs text-neutral-500">{hint}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="text-sm font-medium text-black underline decoration-1 underline-offset-4"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

function ChartCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-black/10 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        <p className="text-xs text-neutral-500">{hint}</p>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta: number | null;
  hint: string;
}) {
  const change = formatDelta(delta);
  return (
    <div className="rounded-lg border border-black/10 bg-white p-4 sm:p-5">
      <p className="text-xs font-medium text-neutral-600 sm:text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs">
        <span className={`font-medium ${change.tone}`}>{change.label}</span>
        <span className="text-neutral-500">{hint}</span>
      </p>
    </div>
  );
}

function OpsCard({
  label,
  value,
  hint,
  href,
  urgent,
}: {
  label: string;
  value: string;
  hint: string;
  href: string;
  urgent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-lg border bg-white p-4 transition-colors hover:bg-neutral-50 ${
        urgent ? "border-amber-300" : "border-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-neutral-600 sm:text-sm">{label}</p>
        {urgent ? (
          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-amber-500" aria-label="Needs attention" />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </Link>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  return (
    <tr className="align-top">
      <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-600">
        {formatActivityWhen(event.at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${roleTone[event.actorRole]}`}
          >
            {auditRoleLabel(event.actorRole)}
          </span>
          <span className="max-w-[140px] truncate text-sm font-medium text-black">
            {event.actorName}
          </span>
        </div>
        {event.ip ? (
          <p className="mt-1 text-[11px] text-neutral-400">{event.ip}</p>
        ) : null}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 shrink-0 rounded-full ${severityTone[event.severity]}`}
            aria-hidden
          />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-700">
            {actionLabel(event.action)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-neutral-700">
        {event.summary}
        {event.targetLabel && !event.summary.includes(event.targetLabel) ? (
          <span className="mt-0.5 block text-xs text-neutral-500">
            {event.targetLabel}
          </span>
        ) : null}
      </td>
      <td className="px-4 py-3 text-xs text-neutral-500">
        {event.source ? (
          event.href ? (
            <Link
              href={event.href}
              className="underline decoration-1 underline-offset-2 hover:text-black"
            >
              {event.source}
            </Link>
          ) : (
            event.source
          )
        ) : (
          "—"
        )}
        <span className="mt-0.5 block capitalize text-[11px] text-neutral-400">
          {event.device ?? "—"}
        </span>
      </td>
    </tr>
  );
}

export type { DailyTotals };
