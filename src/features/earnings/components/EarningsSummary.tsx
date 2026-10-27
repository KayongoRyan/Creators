import { formatCurrency } from "@/lib/formatters";

type EarningsSummaryProps = {
  availableCents: number;
  pendingCents: number;
};

export function EarningsSummary({
  availableCents,
  pendingCents,
}: EarningsSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Available</p>
        <p className="text-2xl font-semibold">
          {formatCurrency(availableCents)}
        </p>
      </div>
      <div className="rounded-lg border border-neutral-200 p-4">
        <p className="text-sm text-neutral-500">Pending</p>
        <p className="text-2xl font-semibold">{formatCurrency(pendingCents)}</p>
      </div>
    </div>
  );
}
