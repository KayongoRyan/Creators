"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, inputClassName, inputErrorClassName } from "@/components/shared/formField";
import { useAdminStore } from "@/features/admin/store";
import { SubmissionStatusBadge } from "@/features/submissions/components/SubmissionStatusBadge";
import type { AdminSubmission } from "@/types";

type PendingAction =
  | { type: "approve"; id: string }
  | { type: "reject"; id: string }
  | { type: "revision"; id: string; note: string };

export function AdminSubmissions() {
  const {
    state,
    approveSubmission,
    rejectSubmission,
    requestRevision,
  } = useAdminStore();
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>(
    {},
  );
  const [revisionErrors, setRevisionErrors] = useState<Record<string, string>>(
    {},
  );

  const confirm = () => {
    if (!pending) return;
    if (pending.type === "approve") approveSubmission(pending.id);
    if (pending.type === "reject") rejectSubmission(pending.id);
    if (pending.type === "revision") requestRevision(pending.id, pending.note);
    setPending(null);
  };

  const openRevisionConfirm = (sub: AdminSubmission) => {
    const note = revisionNotes[sub.id]?.trim() ?? "";
    if (!note) {
      setRevisionErrors((e) => ({
        ...e,
        [sub.id]: "Add a short note for the creator.",
      }));
      return;
    }
    setRevisionErrors((e) => ({ ...e, [sub.id]: "" }));
    setPending({ type: "revision", id: sub.id, note });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Submission review"
        description="Approve content before payouts are released"
      />
      {state.submissions.length === 0 ? (
        <EmptyState message="No submissions to review." />
      ) : (
        <ul className="divide-y divide-black/10 border-y border-black/10">
          {state.submissions.map((sub) => (
            <li key={sub.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {sub.creatorName}{" "}
                    <span className="font-normal text-gray-500">
                      · {sub.handle}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{sub.campaignTitle}</p>
                  {sub.postUrl ? (
                    <a
                      href={sub.postUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm text-emerald-700 hover:underline"
                    >
                      View post
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-gray-400">No URL yet</p>
                  )}
                  {sub.revisionNote ? (
                    <p className="mt-2 text-sm text-sky-800">
                      Revision note: {sub.revisionNote}
                    </p>
                  ) : null}
                </div>
                <SubmissionStatusBadge status={sub.status} />
              </div>
              {sub.status === "pending" || sub.status === "revision" ? (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPending({ type: "approve", id: sub.id })}
                    className="inline-flex min-h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setPending({ type: "reject", id: sub.id })}
                    className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30"
                  >
                    Reject
                  </button>
                  <div className="min-w-[min(100%,20rem)] flex-1">
                    <Field
                      id={`note-${sub.id}`}
                      label="Request revision"
                      error={revisionErrors[sub.id]}
                    >
                      <input
                        id={`note-${sub.id}`}
                        className={
                          revisionErrors[sub.id]
                            ? inputErrorClassName
                            : inputClassName
                        }
                        placeholder="What should they change?"
                        value={revisionNotes[sub.id] ?? ""}
                        onChange={(e) =>
                          setRevisionNotes((n) => ({
                            ...n,
                            [sub.id]: e.target.value,
                          }))
                        }
                      />
                    </Field>
                    <button
                      type="button"
                      onClick={() => openRevisionConfirm(sub)}
                      className="mt-2 inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30"
                    >
                      Send revision request
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.type === "approve"
            ? "Approve submission?"
            : pending?.type === "reject"
              ? "Reject submission?"
              : "Request revision?"
        }
        description={
          pending?.type === "approve"
            ? "This marks the content approved and counts toward payout eligibility."
            : pending?.type === "reject"
              ? "The creator will not be paid for this submission."
              : "The creator will see your note and can resubmit."
        }
        confirmLabel={
          pending?.type === "revision" ? "Send request" : "Confirm"
        }
        destructive={pending?.type === "reject"}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
