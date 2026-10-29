"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  Meta,
  PageIntro,
  Tag,
} from "@/components/workspace/primitives";
import { routes } from "@/config/routes";
import { applicationForCampaign, useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

function payoutLabel(campaign: {
  flatPayoutRwf?: number;
  rpmRwf?: number;
}) {
  if (campaign.rpmRwf) return `${formatRwf(campaign.rpmRwf)} RPM`;
  if (campaign.flatPayoutRwf) return formatRwf(campaign.flatPayoutRwf);
  return "—";
}

export function CreatorDiscover() {
  const { state } = useCreatorStore();

  return (
    <>
      <PageIntro title="Discover campaigns" subtitle="Open briefs you can apply to" />
      {state.discover.length === 0 ? (
        <Card>
          <Meta>No open campaigns right now.</Meta>
        </Card>
      ) : (
        state.discover.map((campaign) => {
          const application = applicationForCampaign(state, campaign.id);
          return (
            <Card key={campaign.id}>
              <CardHeader
                title={campaign.title}
                tag={
                  application ? (
                    <Tag tone={application.status === "rejected" ? "red" : "blue"}>
                      Applied · {application.status}
                    </Tag>
                  ) : campaign.open ? (
                    <Tag tone="green">{campaign.spotsLeft} spots left</Tag>
                  ) : (
                    <Tag tone="gray">Closed</Tag>
                  )
                }
              />
              <Meta>
                {campaign.brandName} · {campaign.campaignType}
                <br />
                Payout: {payoutLabel(campaign)} · Deadline {campaign.deadline}
              </Meta>
              <Link
                href={`${routes.creator.campaigns}/${campaign.id}`}
                className="mt-2 inline-block text-xs font-medium text-[#3266ad] hover:underline"
              >
                View brief →
              </Link>
            </Card>
          );
        })
      )}
    </>
  );
}
