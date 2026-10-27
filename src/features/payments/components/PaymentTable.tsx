import type { Payment } from "@/types";
import { PaymentRow } from "./PaymentRow";

type PaymentTableProps = {
  payments: Payment[];
};

export function PaymentTable({ payments }: PaymentTableProps) {
  if (payments.length === 0) {
    return <p className="text-sm text-neutral-600">No payments yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-200">
      <table className="min-w-full text-left">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-2 font-medium">ID</th>
            <th className="px-4 py-2 font-medium">Amount</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Paid</th>
          </tr>
        </thead>
        <tbody className="px-4">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
