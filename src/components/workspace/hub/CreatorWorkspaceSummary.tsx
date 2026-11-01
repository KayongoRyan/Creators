"use client";

import Link from "next/link";
import { routes } from "@/config/routes";
import { formatRwf } from "@/lib/format/money";
import type { CreatorAssignment } from "@/types";
import { cn } from "@/lib/utils/cn";

type CreatorWorkspaceSummaryProps = {
  displayName: string;
  approvedRwf: number;
  pendingRwf: number;
  campaignsCompleted: number;
  approvedNotice?: { payoutRwf: number } | null;
  actionTasks: CreatorAssignment[];
};

export function CreatorWorkspaceSummary({
  displayName,
  approvedRwf,
  pendingRwf,
  campaignsCompleted,
  approvedNotice,
  actionTasks,
}: CreatorWorkspaceSummaryProps) {
  const stats = [
    { value: formatRwf(approvedRwf), label: "Approved" },
    { value: formatRwf(pendingRwf), label: "Pending" },
    { value: String(campaignsCompleted), label: "Campaigns done" },
  ];

  return (
    <section className="px-5 sm:px-8">
      <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white">
        <div className="border-b border-black/8 bg-neutral-950 px-6 py-8 text-white sm:px-8">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
            Your workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {displayName.split(" ")[0]}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-white/65">
            Earnings, tasks, and submissions — everything tied to your creator account.
          </p>
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          {approvedNotice ? (
            <div
              className="flex gap-3 rounded-2xl border border-black/10 bg-neutral-50 px-4 py-4 sm:items-center sm:px-5"
              role="status"
            >
              <span
                className="grid size-10 shrink-0 place-items-center rounded-full bg-neutral-900 text-sm text-white"
                aria-hidden
              >
                ✓
              </span>
              <p className="text-sm leading-6 text-neutral-800">
                Your Primus Beer submission was approved!{" "}
                <span className="font-semibold text-neutral-900">
                  {formatRwf(approvedNotice.payoutRwf)}
                </span>{" "}
                will be sent to your MoMo by Friday.
              </p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-5 sm:px-5"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-[1.65rem]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Needs action
              </p>
              <Link
                href={routes.creator.tasks}
                className="text-xs font-semibold text-neutral-900 underline underline-offset-4"
              >
                All tasks
              </Link>
            </div>

            {actionTasks.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-neutral-600">
                All assigned tasks are submitted.{" "}
                <Link href={routes.creator.campaigns} className="font-semibold text-neutral-900">
                  Browse open campaigns
                </Link>
              </p>
            ) : (
              <ul className="space-y-2">
                {actionTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={routes.creator.tasks}
                      className="group flex flex-col gap-3 rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-black/25 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 group-hover:underline">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Deadline {task.deadline} · Payout {formatRwf(task.payoutRwf)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          task.status === "revision"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-200 text-neutral-900",
                        )}
                      >
                        {task.status === "revision" ? "Revision" : "Action needed"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
