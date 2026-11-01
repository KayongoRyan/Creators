import { formatCampaignStatus } from "@/lib/format/money";
import { cn } from "@/lib/utils/cn";

export function WorkspaceEmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-black/15 px-4 py-10 text-center text-sm text-neutral-600">
      {message}
    </p>
  );
}

export function WorkspaceStatusPill({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "solid" | "outline" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide",
        variant === "solid" && "bg-neutral-900 text-white",
        variant === "outline" && "border border-black/20 bg-white text-neutral-800",
        variant === "muted" && "bg-neutral-100 text-neutral-600",
        variant === "default" && "bg-neutral-200 text-neutral-900",
      )}
    >
      {label}
    </span>
  );
}

export function assignmentStatusPill(status: string) {
  if (status === "approved") return { label: "Submitted", variant: "solid" as const };
  if (status === "pending") return { label: "Under review", variant: "default" as const };
  if (status === "revision") return { label: "Revision", variant: "outline" as const };
  if (status === "rejected") return { label: "Rejected", variant: "muted" as const };
  if (status === "not_submitted") return { label: "Action needed", variant: "outline" as const };
  return { label: status, variant: "muted" as const };
}

export function applicationStatusPill(status: string) {
  if (status === "rejected") return { label: `Applied · ${status}`, variant: "muted" as const };
  return { label: `Applied · ${status}`, variant: "outline" as const };
}

export function postReviewStatusPill(status: string) {
  if (status === "approved") return { label: "Approved", variant: "solid" as const };
  if (status === "pending") return { label: "Under review", variant: "default" as const };
  if (status === "revision") return { label: "Revision", variant: "outline" as const };
  return { label: "Not submitted", variant: "muted" as const };
}

export function campaignStatusPill(status: string) {
  if (status === "active") {
    return { label: formatCampaignStatus(status), variant: "solid" as const };
  }
  return { label: formatCampaignStatus(status), variant: "muted" as const };
}

export function invoiceStatusPill(status: string) {
  if (status === "paid") return { label: "Paid", variant: "solid" as const };
  return { label: "Pending", variant: "outline" as const };
}

export const workspaceFieldClass =
  "w-full rounded-xl border border-black/15 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-black/40";

export const workspaceFieldErrorClass = cn(workspaceFieldClass, "border-red-500/60");

export const workspacePrimaryButton =
  "rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50";

export const workspaceInlineLink = "font-semibold text-neutral-900 underline underline-offset-4";

export const workspaceSectionLabel =
  "font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500";
