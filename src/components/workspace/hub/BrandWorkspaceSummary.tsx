"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import {
  WorkspaceStatusPill,
  postReviewStatusPill,
  workspaceInlineLink,
  workspaceSectionLabel,
} from "@/components/workspace/workspacePageUi";
import { formatRwf } from "@/lib/format/money";
import type { BrandCampaignView, BrandPostLink } from "@/types";

type BrandWorkspaceSummaryProps = {
  brandName: string;
  activeCount: number;
  assignedCreators: number;
  approvedPosts: number;
  liveNotice?: { title: string; submitted: number; assignedCreators: number } | null;
  activeCampaigns: BrandCampaignView[];
  latestPosts: BrandPostLink[];
};

export function BrandWorkspaceSummary({
  brandName,
  activeCount,
  assignedCreators,
  approvedPosts,
  liveNotice,
  activeCampaigns,
  latestPosts,
}: BrandWorkspaceSummaryProps) {
  const stats = [
    { value: String(activeCount), label: "Active campaigns" },
    { value: String(assignedCreators), label: "Creators assigned" },
    { value: String(approvedPosts), label: "Approved posts" },
  ];

  return (
    <section className="px-5 sm:px-8">
      <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white">
        <div className="border-b border-black/8 bg-neutral-950 px-6 py-8 text-white sm:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Your workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{brandName}</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
            Campaigns, submissions, and spend — your business command center.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {liveNotice ? (
            <div
              className="flex gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-4 sm:items-center sm:px-5"
              role="status"
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-900 text-sm text-white"
                aria-hidden
              >
                ●
              </span>
              <p className="text-sm leading-6 text-neutral-800">
                Campaign &quot;{liveNotice.title}&quot; is live. {liveNotice.submitted} of{" "}
                {liveNotice.assignedCreators} creators have submitted.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-5 sm:px-5"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.65rem]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className={workspaceSectionLabel}>Active campaigns</p>
              <Link href={routes.brand.campaigns} className={`text-xs ${workspaceInlineLink}`}>
                All campaigns
              </Link>
            </div>
            {activeCampaigns.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-neutral-600">
                No active campaigns. Open Campaigns to review your roster.
              </p>
            ) : (
              <ul className="space-y-2">
                {activeCampaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <Link
                      href={`${routes.brand.campaigns}/${campaign.id}`}
                      className="block rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-black/25 sm:px-5"
                    >
                      <p className="font-medium text-neutral-900">{campaign.title}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {campaign.runPeriod} · Budget {formatRwf(campaign.budgetRwf)} ·{" "}
                        {campaign.approved}/{campaign.submitted} approved
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {latestPosts.length > 0 ? (
            <div>
              <p className={`mb-3 ${workspaceSectionLabel}`}>Latest submissions</p>
              <ul className="space-y-2">
                {latestPosts.map((post) => {
                  const pill = postReviewStatusPill(post.status);
                  return (
                    <li
                      key={post.id}
                      className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900">{post.handle}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {post.platform} · {post.followersLabel}
                          {post.views ? ` · ${post.views.toLocaleString()} views` : ""}
                        </p>
                      </div>
                      <WorkspaceStatusPill label={pill.label} variant={pill.variant} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
