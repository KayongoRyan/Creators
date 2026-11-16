"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  selectBrandAccounts,
  useAdminStore,
} from "@/features/admin/store";
import { isNewWithinWindow } from "@/lib/admin/registrationIntake";
import { formatActivityWhen } from "@/lib/format/datetime";
import { formatRwf } from "@/lib/format/money";
import type { BrandAccount, BrandAccountStatus } from "@/types";

type PendingStatus = { id: string; status: BrandAccountStatus };

const statusLabel: Record<BrandAccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  pending_payment: "Pending payment",
};

function statusPill(status: BrandAccountStatus) {
  if (status === "active") return "bg-black text-white";
  if (status === "suspended") return "bg-neutral-200 text-black";
  return "bg-neutral-100 text-black ring-1 ring-black/10";
}

export function AdminBrands() {
  const { state, setBrandStatus } = useAdminStore();
  const brands = useMemo(() => {
    const list = selectBrandAccounts(state);
    return [...list].sort((a, b) => {
      const aNew = isNewWithinWindow(a.joinedAt);
      const bNew = isNewWithinWindow(b.joinedAt);
      if (aNew !== bNew) return aNew ? -1 : 1;
      const atA = Date.parse(a.joinedAt ?? a.lastActiveAt);
      const atB = Date.parse(b.joinedAt ?? b.lastActiveAt);
      return atB - atA;
    });
  }, [state]);
  const [pending, setPending] = useState<PendingStatus | null>(null);

  const onConfirm = () => {
    if (!pending) return;
    setBrandStatus(pending.id, pending.status);
    setPending(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Business accounts"
        description="Clients running campaigns — status, spend, and last activity."
      />

      <ul className="divide-y divide-black/10 border-y border-black/10">
        {brands.map((brand) => (
          <BrandRow
            key={brand.id}
            brand={brand}
            onRequestStatus={(status) => setPending({ id: brand.id, status })}
          />
        ))}
      </ul>

      <ConfirmDialog
        open={pending !== null}
        title="Update business status?"
        description={
          pending
            ? `${brands.find((b) => b.id === pending.id)?.name ?? "Account"} will be set to ${statusLabel[pending.status]}.`
            : ""
        }
        confirmLabel="Update"
        onConfirm={onConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}

function BrandRow({
  brand,
  onRequestStatus,
}: {
  brand: BrandAccount;
  onRequestStatus: (status: BrandAccountStatus) => void;
}) {
  const suspended = brand.status === "suspended";

  return (
    <li className="py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold text-black">{brand.name}</h2>
            {isNewWithinWindow(brand.joinedAt) ? (
              <span className="rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
                New
              </span>
            ) : null}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${statusPill(brand.status)}`}
            >
              {statusLabel[brand.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-600">
            {brand.contactName} · {brand.contactEmail}
            {brand.momoPhone ? ` · MoMo ${brand.momoPhone}` : ""}
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            {brand.campaignsRun} campaign{brand.campaignsRun === 1 ? "" : "s"} · Total spent{" "}
            {formatRwf(brand.totalSpentRwf)}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {brand.joinedAt
              ? `Joined ${formatActivityWhen(brand.joinedAt)} · Last activity ${formatActivityWhen(brand.lastActiveAt)}`
              : `Last activity ${formatActivityWhen(brand.lastActiveAt)}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {brand.status === "pending_payment" ? (
            <button
              type="button"
              onClick={() => onRequestStatus("active")}
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Mark active
            </button>
          ) : null}
          {brand.status !== "suspended" ? (
            <button
              type="button"
              onClick={() => onRequestStatus("suspended")}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRequestStatus("active")}
              className="inline-flex min-h-9 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Reactivate
            </button>
          )}
          {brand.status === "active" && !suspended ? (
            <button
              type="button"
              onClick={() => onRequestStatus("pending_payment")}
              className="inline-flex min-h-9 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-black hover:bg-neutral-50"
            >
              Flag payment
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
}
