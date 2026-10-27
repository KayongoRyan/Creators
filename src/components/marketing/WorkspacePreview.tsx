"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  {
    id: "campaigns",
    label: "Campaigns",
    kicker: "Open brief",
    title: "Spring lookbook",
    detail: "Fashion · 6 stills and one short cut",
    rows: [
      { label: "Status", value: "Open for applications" },
      { label: "Applications", value: "12 waiting on review" },
      { label: "Submissions", value: "4 in review" },
    ],
  },
  {
    id: "applications",
    label: "Applications",
    kicker: "Creator queue",
    title: "Who applied",
    detail: "Each application sits on the campaign, not in an inbox.",
    rows: [
      { label: "Amina K.", value: "Fashion stills · portfolio attached" },
      { label: "Leo M.", value: "Short-form · pending" },
      { label: "Nora V.", value: "Lookbook · shortlisted" },
    ],
  },
  {
    id: "submissions",
    label: "Submissions",
    kicker: "Work returned",
    title: "In review",
    detail: "The cut and the stills come back on the same brief.",
    rows: [
      { label: "Look 01–06", value: "Pending" },
      { label: "Cut, 15s", value: "Approved" },
      { label: "Alt stills", value: "Sent back" },
    ],
  },
] as const;

export function WorkspacePreview() {
  const [active, setActive] = useState<(typeof tabs)[number]["id"]>("campaigns");
  const view = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
      <div className="grid min-h-[440px] md:grid-cols-[232px_1fr]">
        <aside className="flex bg-[#171717] text-white">
          <div className="w-2 shrink-0 bg-gradient-to-b from-[#65FBAA] via-[#31F49C] to-[#00EC97]" />
          <div className="flex flex-1 flex-col p-4">
            <p className="px-3 pb-3 text-xs font-medium tracking-wide text-white/45">
              Workspace
            </p>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-left text-sm",
                    active === tab.id
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        <div className="bg-[#f7f7f7] p-5 sm:p-7">
          <p className="text-sm text-neutral-500">{view.kicker}</p>
          <h2 className="mt-1 text-2xl font-medium tracking-tight">{view.title}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">
            {view.detail}
          </p>
          <ul className="mt-6 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-white">
            {view.rows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <span className="text-sm font-medium">{row.label}</span>
                <span className="text-right text-sm text-neutral-500">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
