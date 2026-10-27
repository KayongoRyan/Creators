type BrandSummaryProps = {
  name: string;
  activeCampaigns: number;
};

export function BrandSummary({ name, activeCampaigns }: BrandSummaryProps) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-sm text-neutral-500">Brand</p>
      <p className="text-lg font-medium">{name}</p>
      <p className="mt-2 text-sm text-neutral-600">
        {activeCampaigns} active campaign{activeCampaigns === 1 ? "" : "s"}
      </p>
    </div>
  );
}
