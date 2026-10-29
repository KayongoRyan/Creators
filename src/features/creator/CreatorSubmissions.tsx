"use client";

import {
  Card,
  Meta,
  PageIntro,
  Tag,
} from "@/components/workspace/primitives";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCreatorStore } from "@/features/creator/store";

function statusTag(status: string) {
  if (status === "approved") return <Tag tone="green">Approved</Tag>;
  if (status === "pending") return <Tag tone="amber">Under review</Tag>;
  if (status === "revision") return <Tag tone="blue">Revision</Tag>;
  if (status === "rejected") return <Tag tone="red">Rejected</Tag>;
  return <Tag tone="gray">Draft</Tag>;
}

export function CreatorSubmissions() {
  const { state } = useCreatorStore();
  const rows = state.assignments.filter((a) => a.postUrl || a.status !== "not_submitted");

  return (
    <>
      <PageIntro title="Submissions" subtitle="Post links sent for review" />
      {rows.length === 0 ? (
        <EmptyState message="No submissions yet." />
      ) : (
        rows.map((row) => (
          <Card key={row.id}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-[#141413]">{row.title}</p>
              {statusTag(row.status)}
            </div>
            {row.postUrl ? (
              <Meta>
                <a
                  href={row.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3266ad]"
                >
                  {row.postUrl}
                </a>
              </Meta>
            ) : (
              <Meta>Awaiting resubmit after revision.</Meta>
            )}
          </Card>
        ))
      )}
    </>
  );
}
