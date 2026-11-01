"use client";

import Link from "next/link";
import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";
import {
  WorkspaceEmptyBlock,
  WorkspaceStatusPill,
  campaignStatusPill,
  workspaceInlineLink,
} from "@/components/workspace/workspacePageUi";
import { routes } from "@/config/routes";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

export function BrandCampaignList() {
  const { state } = useBrandStore();

  return (
    <WorkspacePageShell
      eyebrow="Campaigns"
      title="All briefs"
      subtitle={`${state.brandName} · live and past campaigns`}
    >
      {state.campaigns.length === 0 ? (
        <WorkspaceEmptyBlock message="No campaigns in the demo roster yet." />
      ) : (
        <ul className="space-y-2">
          {state.campaigns.map((campaign) => {
            const pill = campaignStatusPill(campaign.status);
            return (
              <li key={campaign.id}>
                <Link
                  href={`${routes.brand.campaigns}/${campaign.id}`}
                  className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-black/25 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900">{campaign.title}</p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {campaign.runPeriod} · {formatRwf(campaign.budgetRwf)} · {campaign.submitted}{" "}
                      submitted
                    </p>
                  </div>
                  <WorkspaceStatusPill label={pill.label} variant={pill.variant} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="text-sm text-neutral-500">
        Need a new brief?{" "}
        <Link href={routes.brand.root} className={workspaceInlineLink}>
          Back to dashboard
        </Link>
      </p>
    </WorkspacePageShell>
  );
}
