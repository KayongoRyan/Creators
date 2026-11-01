"use client";

import { useState } from "react";
import { CreatorWorkspacePageShell } from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  CreatorEmptyBlock,
  CreatorStatusPill,
  assignmentStatusPill,
  creatorFieldClass,
  creatorPrimaryButton,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";
import { isValidPostUrl } from "@/lib/validators/url";

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
    <CreatorWorkspacePageShell
      eyebrow="Tasks"
      title="My tasks"
      subtitle="Campaigns you are assigned to deliver"
    >
      {state.assignments.length === 0 ? (
        <CreatorEmptyBlock message="No assigned campaigns yet." />
      ) : (
        <ul className="space-y-4">
          {state.assignments.map((task) => {
            const pill = assignmentStatusPill(task.status);
            const canSubmit = task.status === "not_submitted" || task.status === "revision";

            return (
              <li key={task.id}>
                <article className="rounded-2xl border border-black/10 bg-neutral-50/80 p-4 sm:p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p className="font-medium text-neutral-900">{task.title}</p>
                    <CreatorStatusPill label={pill.label} variant={pill.variant} />
                  </div>

                  <div className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">
                    <p>
                      <span className="font-medium text-neutral-900">Brief:</span> {task.brief}
                    </p>
                    {task.sourceUrl ? (
                      <p>
                        <span className="font-medium text-neutral-900">Source:</span>{" "}
                        <a
                          href={task.sourceUrl}
                          className="underline underline-offset-2"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {task.sourceUrl}
                        </a>
                      </p>
                    ) : null}
                    <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">
                      Payout {formatRwf(task.payoutRwf)} · Deadline {task.deadline}
                    </p>
                  </div>

                  {task.revisionNote ? (
                    <p className="mt-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-neutral-800">
                      <span className="font-medium">Revision:</span> {task.revisionNote}
                    </p>
                  ) : null}

                  {task.postUrl ? (
                    <p className="mt-3 text-sm text-neutral-600">
                      <span className="font-medium text-neutral-900">Submitted:</span>{" "}
                      <a
                        href={task.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-2"
                      >
                        {task.postUrl}
                      </a>
                    </p>
                  ) : canSubmit ? (
                    <form
                      className="mt-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        submit(task.id);
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          value={urls[task.id] ?? ""}
                          onChange={(e) =>
                            setUrls((u) => ({ ...u, [task.id]: e.target.value }))
                          }
                          placeholder="Paste your TikTok or Instagram post URL"
                          className={creatorFieldClass}
                        />
                        <button type="submit" className={creatorPrimaryButton}>
                          Submit
                        </button>
                      </div>
                      {errors[task.id] ? (
                        <p className="mt-1.5 text-xs text-red-600">{errors[task.id]}</p>
                      ) : null}
                    </form>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
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
    </CreatorWorkspacePageShell>
  );
}
