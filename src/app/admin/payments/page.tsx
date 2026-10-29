import { PageHeader } from "@/components/shared/PageHeader";

const collected = [
  ["Primus Beer — Campaign #2", "RWF 720,000 paid"],
  ["Iwacu Music — Song clip", "RWF 400,000 paid"],
  ["KCB Rwanda — Product review", "RWF 960,000 pending"],
];

const payouts = [
  ["Marie K. — @mariekigali", "RWF 45,000"],
  ["Jean-Baptiste N. — @jbntwali", "RWF 32,000"],
  ["Amina G. — @aminacreates", "RWF 28,000"],
  ["5 other creators", "RWF 79,000"],
];

export default function AdminPaymentsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Payment tracker"
        description="Collections from brands · Disbursements to creators"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Collected from brands
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {collected.map(([label, value]) => (
          <li
            key={label}
            className="flex items-center justify-between gap-4 py-4 text-sm"
          >
            <span className="text-gray-900">{label}</span>
            <span className="text-gray-600">{value}</span>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Creator payouts due this week
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {payouts.map(([label, value]) => (
          <li
            key={label}
            className="flex items-center justify-between gap-4 py-4 text-sm"
          >
            <span className="text-gray-900">{label}</span>
            <span className="text-gray-600">{value}</span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-4 py-4 text-sm font-semibold text-gray-900">
          <span>Total disbursement</span>
          <span>RWF 184,000</span>
        </li>
      </ul>
    </div>
  );
}