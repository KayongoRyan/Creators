"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";
import {
  WorkspaceStatusPill,
  invoiceStatusPill,
  workspaceFieldClass,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import {
  brandInvoiceBucketMeta,
  groupBrandInvoices,
  invoiceProgressHint,
} from "@/features/brand/invoiceBuckets";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";
import type { BrandInvoice, BrandInvoiceBucket } from "@/types";

type InvoiceFilter = "all" | BrandInvoiceBucket;

function InvoiceCard({
  invoice,
  progressHint,
}: {
  invoice: BrandInvoice;
  progressHint: string | null;
}) {
  const pill = invoiceStatusPill(invoice.status);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <ul className="divide-y divide-black/8">
        {[
          { label: "Creator budget", value: formatRwf(invoice.creatorBudgetRwf) },
          { label: "Platform fee (20%)", value: formatRwf(invoice.feeRwf) },
          { label: "Invoice total", value: formatRwf(invoice.totalRwf), strong: true },
        ].map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5"
          >
            <span className="text-sm text-neutral-600">{row.label}</span>
            <span
              className={
                row.strong
                  ? "text-base font-semibold text-neutral-900"
                  : "text-sm font-medium text-neutral-900"
              }
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/8 bg-neutral-50 px-4 py-3 sm:px-5">
        <div>
          <span className="text-sm text-neutral-600">Status</span>
          {progressHint ? (
            <p className="mt-0.5 text-xs text-neutral-500">{progressHint}</p>
          ) : null}
        </div>
        <WorkspaceStatusPill label={pill.label} variant={pill.variant} />
      </div>
    </div>
  );
}

export function BrandInvoices() {
  const { state } = useBrandStore();
  const groups = useMemo(() => groupBrandInvoices(state), [state]);
  const [filter, setFilter] = useState<InvoiceFilter>("unfinished");

  const campaignMap = useMemo(
    () => new Map(state.campaigns.map((c) => [c.id, c])),
    [state.campaigns],
  );

  const counts = useMemo(() => {
    const map: Record<BrandInvoiceBucket, number> = {
      unfinished: 0,
      new: 0,
      closed: 0,
    };
    for (const g of groups) {
      map[g.bucket] = g.items.length;
    }
    return map;
  }, [groups]);

  useEffect(() => {
    if (filter === "all") return;
    if (counts[filter] === 0) {
      const fallback: InvoiceFilter =
        counts.unfinished > 0
          ? "unfinished"
          : counts.new > 0
            ? "new"
            : counts.closed > 0
              ? "closed"
              : "all";
      setFilter(fallback);
    }
  }, [counts, filter]);

  const visibleGroups = useMemo(() => {
    if (filter === "all") return groups;
    return groups.filter((g) => g.bucket === filter);
  }, [filter, groups]);

  const filterDescription =
    filter === "all"
      ? "All invoices, grouped from unfinished → new → paid."
      : brandInvoiceBucketMeta[filter].description;

  const totalInvoices = state.invoices.length;

  const bucketSelect = (
    <div className="w-full min-w-[12rem] max-w-xs sm:min-w-[14rem]">
      <label htmlFor="invoice-bucket-filter" className={workspaceSectionLabel}>
        Show
      </label>
      <select
        id="invoice-bucket-filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value as InvoiceFilter)}
        className={`${workspaceFieldClass} mt-2 font-medium`}
      >
        <option value="all">All campaigns ({totalInvoices})</option>
        <option value="unfinished">Unfinished ({counts.unfinished})</option>
        <option value="new">New ({counts.new})</option>
        <option value="closed">Paid & closed ({counts.closed})</option>
      </select>
    </div>
  );

  return (
    <WorkspacePageShell
      eyebrow="Finance"
      title="Invoices"
      subtitle={`${state.brandName} · ${state.companyLine}`}
      topRight={bucketSelect}
    >
      {totalInvoices === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-10 text-center text-sm text-neutral-600">
          No invoices in the demo yet.
        </p>
      ) : (
        <>
          <p className="text-sm leading-6 text-neutral-600 sm:max-w-xl">{filterDescription}</p>

          {visibleGroups.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/15 px-4 py-10 text-center text-sm text-neutral-600">
              Nothing in this list yet. Pick another option from the dropdown.
            </p>
          ) : (
            <div className="space-y-10">
              {visibleGroups.map((group) => (
                <section key={group.bucket} aria-labelledby={`invoices-${group.bucket}`}>
                  {filter === "all" ? (
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <h2
                          id={`invoices-${group.bucket}`}
                          className="text-base font-semibold tracking-tight text-neutral-900"
                        >
                          {group.title}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-600">{group.description}</p>
                      </div>
                      <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold tabular-nums text-neutral-700">
                        {group.items.length}
                      </span>
                    </div>
                  ) : null}

                  <ol className="relative space-y-6 border-l border-black/10 pl-5 sm:pl-6">
                    {group.items.map((invoice, index) => {
                      const campaign = invoice.campaignId
                        ? campaignMap.get(invoice.campaignId)
                        : undefined;
                      const progressHint = invoiceProgressHint(invoice, campaign);

                      return (
                        <li key={invoice.id} className="relative">
                          <span
                            className="absolute -left-[1.35rem] top-1.5 flex size-5 items-center justify-center rounded-full border border-black/15 bg-white text-[10px] font-semibold text-neutral-600 sm:-left-6"
                            aria-hidden
                          >
                            {index + 1}
                          </span>
                          <p className={`mb-3 ${workspaceSectionLabel}`}>{invoice.label}</p>
                          <InvoiceCard invoice={invoice} progressHint={progressHint} />
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </WorkspacePageShell>
  );
}