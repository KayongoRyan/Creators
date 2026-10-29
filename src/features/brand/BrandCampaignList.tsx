"use client";

import Link from "next/link";
import { Card, PageIntro, Tag } from "@/components/workspace/primitives";
import { routes } from "@/config/routes";
import { useBrandStore } from "@/features/brand/store";
import { formatCampaignStatus, formatRwf } from "@/lib/format/money";

export function BrandCampaignList() {
  const { state } = useBrandStore();

  return (
    <>
      <PageIntro
        title="Campaigns"
        subtitle={`${state.brandName} · all live and past briefs`}
      />
      <Card>
        {state.campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`${routes.brand.campaigns}/${campaign.id}`}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(31,30,29,0.15)] py-4 last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-[#141413]">{campaign.title}</p>
              <p className="mt-0.5 text-xs text-[#3d3d3a]">
                {campaign.runPeriod} · {formatRwf(campaign.budgetRwf)} ·{" "}
                {campaign.submitted} submitted
              </p>
            </div>
            <Tag tone={campaign.status === "active" ? "green" : "gray"}>
              {formatCampaignStatus(campaign.status)}
            </Tag>
          </Link>
        ))}
      </Card>
    </>
  );
}
