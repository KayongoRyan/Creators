"use client";

import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";
import {
  WorkspaceStatusPill,
  invoiceStatusPill,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

export function BrandInvoices() {
  const { state } = useBrandStore();

  return (
    <WorkspacePageShell
      eyebrow="Finance"
      title="Invoices"
      subtitle={`${state.brandName} · ${state.companyLine}`}
    >
      {state.invoices.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-10 text-center text-sm text-neutral-600">
          No invoices in the demo yet.
        </p>
      ) : (
        <ul className="space-y-6">
          {state.invoices.map((invoice) => {
            const pill = invoiceStatusPill(invoice.status);
            return (
              <li key={invoice.id}>
                <p className={`mb-3 ${workspaceSectionLabel}`}>{invoice.label}</p>
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
                  <div className="flex items-center justify-between border-t border-black/8 bg-neutral-50 px-4 py-3 sm:px-5">
                    <span className="text-sm text-neutral-600">Status</span>
                    <WorkspaceStatusPill label={pill.label} variant={pill.variant} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WorkspacePageShell>
  );
}
