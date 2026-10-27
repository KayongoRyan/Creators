import { PageHeader } from "@/components/shared/PageHeader";
import { EarningsSummary, getEarnings } from "@/features/earnings";

export default async function CreatorEarningsPage() {
  const earnings = await getEarnings();

  return (
    <>
      <PageHeader title="Earnings" />
      <EarningsSummary
        availableCents={earnings.availableCents}
        pendingCents={earnings.pendingCents}
      />
    </>
  );
}
