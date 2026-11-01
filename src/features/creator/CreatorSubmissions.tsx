"use client";

import {
  CreatorWorkspacePageShell,
} from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  CreatorEmptyBlock,
  CreatorStatusPill,
  assignmentStatusPill,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { useCreatorStore } from "@/features/creator/store";

export function CreatorSubmissions() {
  const { state } = useCreatorStore();
  const rows = state.assignments.filter((a) => a.postUrl || a.status !== "not_submitted");

  return (
    <CreatorWorkspacePageShell
      eyebrow="Submissions"
      title="Post links"
      subtitle="Everything you have sent for brand review"
    >
      {rows.length === 0 ? (
        <CreatorEmptyBlock message="No submissions yet." />
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const pill = assignmentStatusPill(row.status);
            return (
              <li key={row.id}>
                <div className="rounded-2xl border border-black/10 bg-white px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-medium text-neutral-900">{row.title}</p>
                    <CreatorStatusPill label={pill.label} variant={pill.variant} />
                  </div>
                  {row.postUrl ? (
                    <a
                      href={row.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block truncate text-sm text-neutral-600 underline underline-offset-2 hover:text-neutral-900"
                    >
                      {row.postUrl}
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-neutral-500">Awaiting resubmit after revision.</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CreatorWorkspacePageShell>
  );
}
