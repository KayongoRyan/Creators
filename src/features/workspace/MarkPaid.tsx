"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";
import { PageHeader } from "@/components/shared/PageHeader";

const actions = [
  {
    title: "Creator applications",
    status: "4 pending",
    body: "4 new creators submitted handles for review. Review and accept or reject.",
    href: routes.admin.creators,
    action: "Review creators",
  },
  {
    title: "Submissions to review",
    status: "6 pending",
    body: "6 creator submissions waiting approval before payout is released.",
    href: routes.admin.campaigns,
    action: "Review submissions",
  },
] as const;

export function AdminOverview() {
  const [paid, setPaid] = useState(false);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Overview" description="Week of May 26, 2026" />
      <section
        aria-label="Platform totals"
        className="mb-10 grid gap-3 sm:grid-cols-3"
      >
        {[
          ["7", "Active campaigns"],
          ["43", "Vetted creators"],
          ["RWF 1.2M", "Collected this month"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-lg border border-black/10 bg-white p-5"
          >
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">
              {value}
            </p>
          </div>
        ))}
      </section>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Pending actions
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {actions.map((item) => (
          <li
            key={item.title}
            className="flex flex-wrap items-center justify-between gap-4 py-5"
          >
            <div className="max-w-xl">
              <h2 className="font-semibold text-gray-900">
                {item.title}{" "}
                <span className="font-medium text-gray-500">· {item.status}</span>
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">{item.body}</p>
            </div>
            <Link
              href={item.href}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30 hover:bg-white"
            >
              {item.action}
            </Link>
          </li>
        ))}
        <li className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="max-w-xl">
            <h2 className="font-semibold text-gray-900">
              Payouts due Friday{" "}
              <span className="font-medium text-gray-500">· RWF 184,000</span>
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              12 creators have approved submissions. Disburse via MTN MoMo
              before end of week.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaid(true)}
            disabled={paid}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
          >
            {paid ? "Marked as paid" : "Mark as paid"}
          </button>
        </li>
      </ul>
    </div>
  );
}
