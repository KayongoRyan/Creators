"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAdminStore } from "@/features/admin/store";
import { PaymentStatusBadge } from "@/features/payments/components/PaymentStatusBadge";
import { formatRwf } from "@/lib/format/money";

export function AdminPayments() {
  const { state, markPayoutPaid } = useAdminStore();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const totalPending = state.payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amountRwf, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Payment tracker"
        description="Creator disbursements for this payout week"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Creator payouts
      </p>
      {state.payouts.length === 0 ? (
        <EmptyState message="No payouts this week." />
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
              {state.payouts.map((row) => (
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
        description="This simulates an MTN MoMo disbursement. You can’t undo it in this demo."
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
