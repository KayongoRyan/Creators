"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";

const pending = [
  {
    id: "ruth",
    name: "Ruth Nkusi",
    handle: "@ruthnkusi_rw · TikTok 41K · IG 8K",
  },
  {
    id: "david",
    name: "David Olivier",
    handle: "@davidolivier · TikTok 6K · IG 3K",
  },
];

const active = [
  ["Marie K.", "@mariekigali · TikTok 28K", "4 campaigns", "Reliable"],
  ["Jean-Baptiste N.", "@jbntwali · TikTok 12K", "2 campaigns", "New"],
  ["Amina G.", "@aminacreates · IG 9K", "1 campaign", "New"],
] as const;

export function AdminCreators() {
  const [decisions, setDecisions] = useState<
    Record<string, "accepted" | "rejected">
  >({});

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Creator roster"
        description="Vetted creators in the network"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Applications — pending review
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {pending.map((person) => {
          const decision = decisions[person.id];
          return (
            <li
              key={person.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div>
                <p className="font-medium text-gray-900">{person.name}</p>
                <p className="text-sm text-gray-600">{person.handle}</p>
              </div>
              {decision ? (
                <p className="text-sm font-medium text-gray-700">
                  {decision === "accepted" ? "Accepted" : "Rejected"}
                </p>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDecisions((current) => ({
                        ...current,
                        [person.id]: "accepted",
                      }))
                    }
                    className="inline-flex min-h-9 items-center rounded-full bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisions((current) => ({
                        ...current,
                        [person.id]: "rejected",
                      }))
                    }
                    className="inline-flex min-h-9 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30"
                  >
                    Reject
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Active creators
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {active.map(([name, handle, campaigns, status]) => (
          <li
            key={name}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="font-medium text-gray-900">{name}</p>
              <p className="text-sm text-gray-600">{handle}</p>
            </div>
            <p className="text-right text-sm text-gray-600">
              {campaigns}
              <span className="mt-1 block text-gray-500">{status}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
