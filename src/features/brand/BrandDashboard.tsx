"use client";

import Link from "next/link";
import {
  Card,
  Notice,
  PageIntro,
  PersonRow,
  SectionLabel,
  StatGrid,
  Tag,
} from "@/components/workspace/primitives";
import { routes } from "@/config/routes";
import { selectBrandDashboard, useBrandStore } from "@/features/brand/store";
import { formatRwf } from "@/lib/format/money";

function postStatusTag(status: string) {
  if (status === "approved") return <Tag tone="green">Approved</Tag>;
  if (status === "pending") return <Tag tone="amber">Under review</Tag>;
  if (status === "revision") return <Tag tone="blue">Revision</Tag>;
  return <Tag tone="gray">Not submitted</Tag>;
}

export function BrandDashboard() {
  const { state } = useBrandStore();
  const metrics = selectBrandDashboard(state);
  const featured = state.campaigns.find((c) => c.status === "active");

  return (
    <>
      {featured ? (
        <Notice>
          Campaign &quot;{featured.title}&quot; is live. {featured.submitted} of{" "}
          {featured.assignedCreators} creators have submitted.
        </Notice>
      ) : null}
      <PageIntro
        title={`${state.brandName} dashboard`}
        subtitle={state.companyLine}
      />
      <StatGrid
        items={[
          { value: String(metrics.activeCount), label: "Active campaigns" },
          { value: String(metrics.assigned), label: "Creators assigned" },
          { value: String(metrics.approved), label: "Approved posts" },
        ]}
      />
      <SectionLabel>Active campaigns</SectionLabel>
      <Card>
        {state.campaigns
          .filter((c) => c.status === "active")
          .map((campaign) => (
            <Link
              key={campaign.id}
              href={`${routes.brand.campaigns}/${campaign.id}`}
              className="block border-b border-[rgba(31,30,29,0.15)] py-3 last:border-0 hover:opacity-80"
            >
              <p className="text-sm font-medium text-[#141413]">{campaign.title}</p>
              <p className="mt-0.5 text-xs text-[#3d3d3a]">
                {campaign.runPeriod} · Budget {formatRwf(campaign.budgetRwf)} ·{" "}
                {campaign.approved}/{campaign.submitted} approved
              </p>
            </Link>
          ))}
      </Card>
      {featured ? (
        <>
          <SectionLabel>Latest submissions</SectionLabel>
          <Card>
            {featured.posts.slice(0, 3).map((post) => (
              <PersonRow
                key={post.id}
                initials={post.creatorName.slice(0, 2).toUpperCase()}
                tone="teal"
                name={post.handle}
                handle={`${post.platform} · ${post.followersLabel}${
                  post.views ? ` · ${post.views.toLocaleString()} views` : ""
                }`}
                aside={postStatusTag(post.status)}
              />
            ))}
          </Card>
        </>
      ) : null}
    </>
  );
}
