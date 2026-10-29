"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  Meta,
  PageIntro,
  Tag,
} from "@/components/workspace/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";
import { isValidPostUrl } from "@/lib/validators/url";

function statusTag(status: string) {
  if (status === "approved") return <Tag tone="green">Submitted ✓</Tag>;
  if (status === "pending") return <Tag tone="amber">Under review</Tag>;
  if (status === "revision") return <Tag tone="blue">Revision needed</Tag>;
  if (status === "rejected") return <Tag tone="red">Rejected</Tag>;
  return <Tag tone="amber">Action needed</Tag>;
}

export function CreatorTasks() {
  const { state, submitAssignment } = useCreatorStore();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const submit = (assignmentId: string) => {
    const url = urls[assignmentId] ?? "";
    if (!isValidPostUrl(url)) {
      setErrors((e) => ({
        ...e,
        [assignmentId]: "Paste a valid TikTok or Instagram post URL.",
      }));
      return;
    }
    setErrors((e) => ({ ...e, [assignmentId]: "" }));
    setConfirmId(assignmentId);
  };

  return (
    <>
      <PageIntro title="My tasks" subtitle="Campaigns you are assigned to" />
      {state.assignments.length === 0 ? (
        <EmptyState message="No assigned campaigns yet." />
      ) : (
        state.assignments.map((task) => (
          <Card key={task.id}>
            <CardHeader title={task.title} tag={statusTag(task.status)} />
            <Meta>
              <strong>What to do:</strong> {task.brief}
              {task.sourceUrl ? (
                <>
                  <br />
                  <strong>Source file:</strong>{" "}
                  <a
                    href={task.sourceUrl}
                    className="text-[#3266ad]"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {task.sourceUrl}
                  </a>
                </>
              ) : null}
              <br />
              <strong>Payout:</strong> {formatRwf(task.payoutRwf)} ·{" "}
              <strong>Deadline:</strong> {task.deadline}
            </Meta>
            {task.revisionNote ? (
              <p className="mt-2 text-xs text-[#3266ad]">
                Revision: {task.revisionNote}
              </p>
            ) : null}
            {task.postUrl ? (
              <p className="mt-3 text-xs text-[#3d3d3a]">
                <strong className="font-medium text-[#141413]">Submitted URL:</strong>{" "}
                <a
                  href={task.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#3266ad]"
                >
                  {task.postUrl}
                </a>
              </p>
            ) : task.status === "not_submitted" || task.status === "revision" ? (
              <form
                className="mt-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(task.id);
                }}
              >
                <div className="flex gap-2">
                  <input
                    value={urls[task.id] ?? ""}
                    onChange={(e) =>
                      setUrls((u) => ({ ...u, [task.id]: e.target.value }))
                    }
                    placeholder="Paste your TikTok/IG post URL here…"
                    className="min-w-0 flex-1 rounded-lg border border-[rgba(31,30,29,0.3)] px-2.5 py-1.5 text-xs outline-none focus:border-[#3266ad]"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#141413] px-3 py-1.5 text-xs text-white"
                  >
                    Submit
                  </button>
                </div>
                {errors[task.id] ? (
                  <p className="mt-1 text-xs text-red-600">{errors[task.id]}</p>
                ) : null}
              </form>
            ) : null}
          </Card>
        ))
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title="Submit post link?"
        description="Ubunifu will review before payout is released."
        confirmLabel="Submit"
        onConfirm={() => {
          if (confirmId) {
            submitAssignment(confirmId, urls[confirmId] ?? "");
          }
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}
