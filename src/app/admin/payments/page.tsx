import { PageHeader } from "@/components/shared/PageHeader";
import { PaymentTable, getPayments } from "@/features/payments";

export default async function AdminPaymentsPage() {
  const payments = await getPayments();

  return (
    <>
      <PageHeader title="Payments" />
      <PaymentTable payments={payments} />
    </>
  );
}
