"use client";

import Link from "next/link";
import { WorkspacePageShell } from "@/components/workspace/WorkspacePageShell";
import {
  WorkspaceEmptyBlock,
  WorkspaceStatusPill,
  postReviewStatusPill,
  workspaceInlineLink,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import { routes } from "@/config/routes";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

export function BrandCampaignDetail({ campaignId }: { campaignId: string }) {
  const { state } = useBrandStore();
  const campaign = state.campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <WorkspacePageShell eyebrow="Campaigns" title="Campaign not found" subtitle="Not in your demo roster">
        <Link href={routes.brand.campaigns} className={`text-sm ${workspaceInlineLink}`}>
          Back to campaigns
        </Link>
      </WorkspacePageShell>
    );
  }

  const remaining = Math.max(0, campaign.budgetRwf - campaign.performance.spendRwf);

  return (
    <WorkspacePageShell
      eyebrow="Campaign"
      title={campaign.title}
      subtitle={`${campaign.runPeriod} · Budget ${formatRwf(campaign.budgetRwf)}`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total views", value: campaign.performance.totalViews.toLocaleString() },
          { label: "Engagement", value: campaign.performance.engagementRate },
          { label: "Spend to date", value: formatRwf(campaign.performance.spendRwf) },
          { label: "Budget left", value: formatRwf(remaining) },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div>
        <p className={`mb-3 ${workspaceSectionLabel}`}>Content submitted</p>
        {campaign.posts.length === 0 ? (
          <WorkspaceEmptyBlock message="No post links yet." />
        ) : (
          <ul className="space-y-2">
            {campaign.posts.map((post) => {
              const pill = postReviewStatusPill(post.status);
              return (
                <li
                  key={post.id}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-4 sm:px-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">{post.handle}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {post.creatorName} · {post.platform} · {post.followersLabel}
                      </p>
                    </div>
                    <WorkspaceStatusPill label={pill.label} variant={pill.variant} />
                  </div>
                  {post.postUrl ? (
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block truncate text-sm text-neutral-600 underline underline-offset-2"
                    >
                      {post.postUrl}
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white px-4 py-5 sm:px-5">
        <p className={workspaceSectionLabel}>Campaign brief</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-700">
          {campaign.brief}
        </p>
      </div>
    </WorkspacePageShell>
  );
}
