"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { routes } from "@/config/routes";
import {
  auditRoleLabel,
  filterAuditEvents,
  mergeAuditTrail,
  type AuditFilter,
} from "@/features/admin/analytics/selectors";
import {
  selectRecentBrandSignups,
  selectRecentCreatorSignups,
  useAdminStore,
} from "@/features/admin/store";
import { isAdminOnlyPortal } from "@/lib/portal/devScope";
import { formatActivityWhen } from "@/lib/format/datetime";
import { workspaceFieldClass, workspaceSectionLabel } from "@/components/workspace/workspacePageUi";
import type { AuditActorRole, AuditEvent } from "@/types";
import { cn } from "@/lib/utils/cn";

type PortalFilter = AuditActorRole | "all";

const portalTabs: { id: PortalFilter; label: string; hint: string }[] = [
  { id: "all", label: "All", hint: "Every portal" },
  { id: "creator", label: "Creators", hint: "Creator workspace (:3003)" },
  { id: "brand", label: "Brands", hint: "Business workspace (:3002)" },
  { id: "guest", label: "Guests", hint: "Visitors & marketing" },
  { id: "admin", label: "Admin", hint: "This console" },
];

function severityClass(severity: AuditEvent["severity"]) {
  if (severity === "critical") return "bg-black text-white";
  if (severity === "warning") return "bg-neutral-200 text-black";
  return "bg-neutral-100 text-neutral-800";
}

export function AdminWebActivity() {
  const { state, liveEvents } = useAdminStore();
  const [portal, setPortal] = useState<PortalFilter>("all");
  const [query, setQuery] = useState("");
  const [hidePageViews, setHidePageViews] = useState(false);

  const trail = useMemo(() => mergeAuditTrail(state, liveEvents), [state, liveEvents]);

  const filter: AuditFilter = useMemo(
    () => ({
      query,
      role: portal,
      severity: "all",
      hidePageViews,
    }),
    [query, portal, hidePageViews],
  );

  const events = useMemo(() => filterAuditEvents(trail, filter).slice(0, 80), [trail, filter]);

  const counts = useMemo(() => {
    const base = { creator: 0, brand: 0, guest: 0, admin: 0 } as Record<
      Exclude<PortalFilter, "all">,
      number
    >;
    for (const event of trail) {
      if (event.actorRole in base) {
        base[event.actorRole as keyof typeof base] += 1;
      }
    }
    return base;
  }, [trail]);

  const devHint = isAdminOnlyPortal();
  const newBrands = useMemo(() => selectRecentBrandSignups(state), [state]);
  const newCreators = useMemo(() => selectRecentCreatorSignups(state), [state]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Web activity"
        description="Live audit of pages and actions from creator and brand portals."
      />

      {devHint ? (
        <p className="mb-6 rounded-lg border border-black/10 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          Admin-only dev on{" "}
          <span className="font-mono text-xs">npm run dev:admin</span> · port{" "}
          <span className="font-mono text-xs">3001</span>. Run{" "}
          <span className="font-mono text-xs">dev:brand</span> and{" "}
          <span className="font-mono text-xs">dev:creator</span> in parallel — activity
          syncs here every few seconds via{" "}
          <span className="font-mono text-xs">.data/platform-events.json</span>.
        </p>
      ) : null}

      {newBrands.length > 0 || newCreators.length > 0 ? (
        <section
          aria-labelledby="new-signups-heading"
          className="mb-8 rounded-lg border border-black/10 bg-white p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="new-signups-heading"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-black"
              >
                New brands & creators
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Signups from brand/creator portals in the last 7 days — auto-synced from web
                activity.
              </p>
            </div>
            <SignupQuickLinks />
          </div>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <NewMemberList
              title="Businesses"
              empty="No new businesses this week."
              items={newBrands.map((b) => ({
                id: b.id,
                primary: b.name,
                secondary: b.contactEmail,
                at: b.joinedAt ?? b.lastActiveAt,
              }))}
            />
            <NewMemberList
              title="Creators"
              empty="No new creators this week."
              items={newCreators.map((c) => ({
                id: c.id,
                primary: c.fullName,
                secondary: c.contactEmail ?? c.niche,
                at: c.appliedAt,
              }))}
            />
          </div>
        </section>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        {portalTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.hint}
            onClick={() => setPortal(tab.id)}
            className={cn(
              "inline-flex min-h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
              portal === tab.id
                ? "border-black bg-black text-white"
                : "border-black/15 bg-white text-black hover:bg-neutral-50",
            )}
          >
            {tab.label}
            {tab.id !== "all" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  portal === tab.id ? "bg-white/20" : "bg-neutral-100",
                )}
              >
                {counts[tab.id as keyof typeof counts]}
              </span>
            ) : (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  portal === tab.id ? "bg-white/20" : "bg-neutral-100",
                )}
              >
                {trail.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:max-w-md">
          <label className={workspaceSectionLabel} htmlFor="activity-search">
            Search
          </label>
          <input
            id="activity-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, route, action…"
            className={workspaceFieldClass}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={hidePageViews}
              onChange={() => setHidePageViews((v) => !v)}
              className="size-4 rounded border-black/20"
            />
            Hide page views
          </label>
        </div>
        <Link
          href={routes.admin.operations}
          className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
        >
          Operations dashboard
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState
          message={
            devHint
              ? "No events yet. Browse /brand on :3002 or /creator on :3003, then watch this feed refresh."
              : "No matching activity in the audit trail."
          }
        />
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap gap-3 py-4 sm:gap-4">
              <time
                dateTime={event.at}
                className="w-28 shrink-0 text-xs tabular-nums text-neutral-500 sm:w-32"
              >
                {formatActivityWhen(event.at)}
              </time>
              <ActivityRow event={event} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-sm text-neutral-500">
        Full charts and exports on{" "}
        <Link href={routes.admin.analytics} className="font-medium text-black underline">
          Analytics
        </Link>
        .
      </p>
    </div>
  );
}

function SignupQuickLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={routes.admin.brands}
        className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
      >
        All businesses
      </Link>
      <Link
        href={routes.admin.creators}
        className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
      >
        Creator queue
      </Link>
    </div>
  );
}

function NewMemberList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: string; primary: string; secondary: string; at?: string }[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
        <p className="mt-2 text-sm text-neutral-600">{empty}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      <ul className="mt-2 divide-y divide-black/10 border-y border-black/10">
        {items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-black">{item.primary}</p>
              <p className="truncate text-neutral-600">{item.secondary}</p>
            </div>
            {item.at ? (
              <time
                dateTime={item.at}
                className="shrink-0 text-xs tabular-nums text-neutral-500"
              >
                {formatActivityWhen(item.at)}
              </time>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityRow({ event }: { event: AuditEvent }) {
  const route = event.source ?? event.href ?? "—";
  return (
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-black">{event.actorName}</span>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-700">
          {auditRoleLabel(event.actorRole)}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            severityClass(event.severity),
          )}
        >
          {event.action.replace(/_/g, " ")}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-700">{event.summary}</p>
      <p className="mt-1 font-mono text-[11px] text-neutral-500">
        {route}
        {event.device ? ` · ${event.device}` : ""}
      </p>
    </div>
  );
}