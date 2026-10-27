import type { Payment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/formatters";

type PaymentRowProps = {
  payment: Payment;
};

export function PaymentRow({ payment }: PaymentRowProps) {
  return (
    <tr className="border-b border-neutral-100 text-sm">
      <td className="py-3 pr-4">{payment.id.slice(0, 8)}</td>
      <td className="py-3 pr-4">{formatCurrency(payment.amountCents)}</td>
      <td className="py-3 pr-4 capitalize">{payment.status}</td>
      <td className="py-3 text-neutral-600">
        {payment.paidAt ? formatDate(payment.paidAt) : "—"}
      </td>
    </tr>
  );
}
