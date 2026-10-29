import type { SubmissionStatus } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<SubmissionStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
  revision: "bg-sky-100 text-sky-900",
};

type SubmissionStatusBadgeProps = {
  status: SubmissionStatus;
};

export function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
