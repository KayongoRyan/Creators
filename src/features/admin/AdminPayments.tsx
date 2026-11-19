"use client";

import { useMemo, useState } from "react";
import { AdminListControls } from "@/components/admin/AdminListControls";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminStore } from "@/features/admin/store";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import {
  DEFAULT_LIST_QUERY,
  paginateList,
  type ListQuery,
} from "@/lib/admin/listQuery";
import { formatRwf } from "@/lib/format/money";

export function AdminPayments() {
  const { state, markPayoutPaid } = useAdminStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [query, setQuery] = useState<ListQuery>(DEFAULT_LIST_QUERY);

  const page = useMemo(
    () =>
      paginateList(state.payouts, query, (row, search, status) => {
        if (status !== "all" && row.status !== status) return false;
        if (!search) return true;
        const hay = `${row.creatorName} ${row.handle} ${row.campaignTitle}`.toLowerCase();
        return hay.includes(search);
      }),
    [query, state.payouts],
  );

  const totalPending = state.payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountRwf, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Payment tracker"
        description="Creator payouts for this week"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Creator payouts
      </p>
      <AdminListControls
        query={query}
        onChange={setQuery}
        total={page.total}
        pageCount={page.pageCount}
        searchPlaceholder="Creator, handle, campaign…"
        statusOptions={[
          { value: "all", label: "All" },
          { value: "pending", label: "Pending" },
          { value: "paid", label: "Paid" },
        ]}
      />
      {page.rows.length === 0 ? (
        <EmptyState message="No payouts match these filters." />
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-black/10">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3 pr-4 font-semibold">Creator</th>
                <th className="py-3 pr-4 font-semibold">Campaign</th>
                <th className="py-3 pr-4 font-semibold">Amount</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {page.rows.map((row) => (
                <tr key={row.id}>
                  <td className="py-4 pr-4">
                    <p className="font-medium text-gray-900">{row.creatorName}</p>
                    <p className="text-gray-600">{row.handle}</p>
                  </td>
                  <td className="py-4 pr-4 text-gray-700">{row.campaignTitle}</td>
                  <td className="py-4 pr-4 text-gray-900">
                    {formatRwf(row.amountRwf)}
                  </td>
                  <td className="py-4 pr-4">
                    <PaymentStatusBadge status={row.status} />
                  </td>
                  <td className="py-4">
                    {row.status === "pending" ? (
                      <button
                        type="button"
                        onClick={() => setConfirmId(row.id)}
                        className="inline-flex min-h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
                      >
                        Mark paid
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/10 font-semibold text-gray-900">
                <td className="py-4" colSpan={2}>
                  Total pending
                </td>
                <td className="py-4">{formatRwf(totalPending)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Mark payout as paid?"
        description="Marks this payout as paid in the ledger. You can’t undo it in this demo."
        confirmLabel="Mark paid"
        onConfirm={() => {
          if (confirmId) markPayoutPaid(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  );
}
