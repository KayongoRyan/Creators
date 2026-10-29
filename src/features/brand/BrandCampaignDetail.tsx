"use client";

import Link from "next/link";
import {
  Card,
  Meta,
  PageIntro,
  PersonRow,
  ReportLine,
  SectionLabel,
  Tag,
} from "@/components/workspace/primitives";
import { routes } from "@/config/routes";
import { useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

function postStatusTag(status: string) {
  if (status === "approved") return <Tag tone="green">Approved</Tag>;
  if (status === "pending") return <Tag tone="amber">Under review</Tag>;
  if (status === "revision") return <Tag tone="blue">Revision</Tag>;
  return <Tag tone="gray">Not submitted</Tag>;
}

export function BrandCampaignDetail({ campaignId }: { campaignId: string }) {
  const { state } = useBrandStore();
  const campaign = state.campaigns.find((c) => c.id === campaignId);

  if (!campaign) {
    return (
      <>
        <PageIntro title="Campaign not found" subtitle="This brief is not in your demo roster." />
        <Link href={routes.brand.campaigns} className="text-xs text-[#3266ad] hover:underline">
          Back to campaigns
        </Link>
      </>
    );
  }

  return (
    <>
      <PageIntro
        title={campaign.title}
        subtitle={`${campaign.runPeriod} · Budget ${formatRwf(campaign.budgetRwf)}`}
      />
      <SectionLabel>Performance</SectionLabel>
      <Card>
        <ReportLine
          label="Total views (approved posts)"
          value={campaign.performance.totalViews.toLocaleString()}
        />
        <ReportLine
          label="Avg. engagement"
          value={campaign.performance.engagementRate}
        />
        <ReportLine
          label="Creator spend to date"
          value={formatRwf(campaign.performance.spendRwf)}
        />
        <ReportLine
          label="Budget remaining"
          value={formatRwf(
            Math.max(0, campaign.budgetRwf - campaign.performance.spendRwf),
          )}
          strong
        />
      </Card>
      <SectionLabel>Content submitted</SectionLabel>
      <Card>
        {campaign.posts.length === 0 ? (
          <Meta>No post links yet.</Meta>
        ) : (
          campaign.posts.map((post) => (
            <div key={post.id} className="border-b border-[rgba(31,30,29,0.15)] py-3 last:border-0">
              <PersonRow
                initials={post.creatorName.slice(0, 2).toUpperCase()}
                tone="blue"
                name={post.handle}
                handle={`${post.platform} · ${post.followersLabel}`}
                aside={postStatusTag(post.status)}
              />
              {post.postUrl ? (
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block pl-10 text-xs text-[#3266ad] hover:underline"
                >
                  {post.postUrl}
                </a>
              ) : null}
            </div>
          ))
        )}
      </Card>
      <SectionLabel>Campaign brief</SectionLabel>
      <Card>
        <p className="whitespace-pre-line text-xs leading-relaxed text-[#3d3d3a]">
          {campaign.brief}
        </p>
      </Card>
    </>
  );
}
