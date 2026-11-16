"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";
import {
  WorkspaceEmptyBlock,
  WorkspaceStatusPill,
  campaignStatusPill,
  workspaceFieldClass,
  workspaceInlineLink,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import {
  brandCampaignBucketMeta,
  countCampaignBuckets,
  filterCampaignsByBucket,
  type BrandCampaignBucket,
} from "@/features/brand/campaignBuckets";
import { routes } from "@/config/routes";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

type CampaignFilter = "all" | BrandCampaignBucket;

function CampaignBucketSelect({
  filter,
  counts,
  total,
  onChange,
}: {
  filter: CampaignFilter;
  counts: Record<BrandCampaignBucket, number>;
  total: number;
  onChange: (value: CampaignFilter) => void;
}) {
  return (
    <div className="w-full min-w-[12rem] max-w-xs sm:min-w-[14rem]">
      <label htmlFor="campaign-bucket-filter" className={workspaceSectionLabel}>
        Show
      </label>
      <select
        id="campaign-bucket-filter"
        value={filter}
        onChange={(e) => onChange(e.target.value as CampaignFilter)}
        className={`${workspaceFieldClass} mt-2 font-medium`}
      >
        <option value="all">All briefs ({total})</option>
        <option value="unfinished">Unfinished ({counts.unfinished})</option>
        <option value="new">New ({counts.new})</option>
        <option value="closed">Completed ({counts.closed})</option>
      </select>
    </div>
  );
}

export function BrandCampaignList() {
  const { state } = useBrandStore();
  const [filter, setFilter] = useState<CampaignFilter>("all");

  const counts = useMemo(() => countCampaignBuckets(state.campaigns), [state.campaigns]);

  useEffect(() => {
    if (filter === "all") return;
    if (counts[filter] === 0) {
      const fallback: CampaignFilter =
        counts.unfinished > 0
          ? "unfinished"
          : counts.new > 0
            ? "new"
            : counts.closed > 0
              ? "closed"
              : "all";
      setFilter(fallback);
    }
  }, [counts, filter]);

  const visible = useMemo(
    () => filterCampaignsByBucket(state.campaigns, filter),
    [filter, state.campaigns],
  );

  const filterHint =
    filter === "all"
      ? "Every live, new, and completed brief for your brand."
      : brandCampaignBucketMeta[filter].description;

  const bucketSelect = (
    <CampaignBucketSelect
      filter={filter}
      counts={counts}
      total={state.campaigns.length}
      onChange={setFilter}
    />
  );

  return (
    <WorkspacePageShell
      eyebrow="Campaigns"
      title="All briefs"
      subtitle={`${state.brandName} · live and past campaigns`}
      topRight={bucketSelect}
    >
      <p className="text-sm text-neutral-600 sm:max-w-xl">{filterHint}</p>

      {state.campaigns.length === 0 ? (
        <WorkspaceEmptyBlock message="No campaigns in the demo roster yet." />
      ) : visible.length === 0 ? (
        <WorkspaceEmptyBlock message="Nothing in this list. Try another option in the dropdown." />
      ) : (
        <ul className="space-y-2">
          {visible.map((campaign) => {
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