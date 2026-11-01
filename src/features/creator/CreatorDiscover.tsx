"use client";

import Link from "next/link";
import { CreatorWorkspacePageShell } from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  CreatorEmptyBlock,
  CreatorStatusPill,
  applicationStatusPill,
  creatorInlineLink,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { routes } from "@/config/routes";
import { applicationForCampaign, useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

function payoutLabel(campaign: { flatPayoutRwf?: number; rpmRwf?: number }) {
  if (campaign.rpmRwf) return `${formatRwf(campaign.rpmRwf)} RPM`;
  if (campaign.flatPayoutRwf) return formatRwf(campaign.flatPayoutRwf);
  return "—";
}

export function CreatorDiscover() {
  const { state } = useCreatorStore();

  return (
    <CreatorWorkspacePageShell
      eyebrow="Discover"
      title="Open campaigns"
      subtitle="Briefs you can apply to right now"
    >
      {state.discover.length === 0 ? (
        <CreatorEmptyBlock message="No open campaigns right now." />
      ) : (
        <ul className="space-y-2">
          {state.discover.map((campaign) => {
            const application = applicationForCampaign(state, campaign.id);
            const pill = application
              ? applicationStatusPill(application.status)
              : campaign.open
                ? { label: `${campaign.spotsLeft} spots left`, variant: "solid" as const }
                : { label: "Closed", variant: "muted" as const };

            return (
              <li key={campaign.id}>
                <article className="rounded-2xl border border-black/10 bg-white px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">{campaign.title}</p>
                      <p className="mt-1 text-sm text-neutral-600">
                        {campaign.brandName} · {campaign.campaignType}
                      </p>
                      <p className="mt-2 text-xs text-neutral-500">
                        Payout {payoutLabel(campaign)} · Deadline {campaign.deadline}
                      </p>
                    </div>
                    <CreatorStatusPill label={pill.label} variant={pill.variant} />
                  </div>
                  <Link
                    href={`${routes.creator.campaigns}/${campaign.id}`}
                    className={`mt-4 inline-block text-sm ${creatorInlineLink}`}
                  >
                    View brief
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </CreatorWorkspacePageShell>
  );
}
