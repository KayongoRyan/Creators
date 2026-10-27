import type { Campaign } from "@/types";
import { formatCurrency } from "@/lib/formatters";

type CampaignListProps = {
  campaigns: Campaign[];
};

export function CampaignList({ campaigns }: CampaignListProps) {
  if (campaigns.length === 0) {
    return <p className="text-sm text-neutral-600">No campaigns yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
      {campaigns.map((campaign) => (
        <li
          key={campaign.id}
          className="flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-medium">{campaign.title}</span>
          <span className="text-neutral-600">
            {formatCurrency(campaign.budgetCents)} · {campaign.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
