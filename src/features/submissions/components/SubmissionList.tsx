import type { Submission } from "@/types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";

type SubmissionListProps = {
  submissions: Submission[];
};

export function SubmissionList({ submissions }: SubmissionListProps) {
  if (submissions.length === 0) {
    return <p className="text-sm text-neutral-600">No submissions yet.</p>;
  }

  return (
    <ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
      {submissions.map((submission) => (
        <li
          key={submission.id}
          className="flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-mono text-neutral-600">
            {submission.id.slice(0, 8)}
          </span>
          <SubmissionStatusBadge status={submission.status} />
        </li>
      ))}
    </ul>
  );
}
