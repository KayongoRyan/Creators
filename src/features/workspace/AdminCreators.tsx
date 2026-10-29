"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  selectPendingApplications,
  useAdminStore,
} from "@/features/admin/store";
import type { CreatorApplication } from "@/types";

type ConfirmKind = { type: "accept" | "reject"; id: string };

function formatHandle(app: CreatorApplication) {
  return `${app.tiktokHandle} · TikTok ${formatFollowers(app.tiktokFollowers)} · IG ${formatFollowers(app.instagramFollowers)}`;
}

function formatFollowers(n: number) {
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

export function AdminCreators() {
  const { state, verifyCreator, rejectCreator } = useAdminStore();
  const pending = selectPendingApplications(state);
  const [selectedId, setSelectedId] = useState<string | null>(
    pending[0]?.id ?? null,
  );
  const [confirm, setConfirm] = useState<ConfirmKind | null>(null);

  const selected = pending.find((a) => a.id === selectedId) ?? pending[0];

  useEffect(() => {
    if (pending.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !pending.some((a) => a.id === selectedId)) {
      setSelectedId(pending[0].id);
    }
  }, [pending, selectedId]);

  const onConfirm = () => {
    if (!confirm) return;
    if (confirm.type === "accept") verifyCreator(confirm.id);
    else rejectCreator(confirm.id);
    setConfirm(null);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Creator roster"
        description="Vetted creators in the network"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Applications — pending review
      </p>
      {pending.length === 0 ? (
        <EmptyState message="No applications to review." />
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr,min(22rem,100%)]">
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {pending.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(person.id)}
                  className={`flex w-full flex-wrap items-center justify-between gap-4 py-4 text-left ${
                    selected?.id === person.id ? "bg-emerald-50/60" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{person.fullName}</p>
                    <p className="text-sm text-gray-600">{formatHandle(person)}</p>
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                    Review
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <aside className="rounded-lg border border-black/10 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                Verification
              </p>
              <h2 className="mt-2 text-lg font-semibold text-gray-900">
                {selected.fullName}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">TikTok</dt>
                  <dd className="font-medium text-gray-900">
                    {selected.tiktokHandle} · {formatFollowers(selected.tiktokFollowers)}{" "}
                    followers
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Instagram</dt>
                  <dd className="font-medium text-gray-900">
                    {selected.instagramHandle} ·{" "}
                    {formatFollowers(selected.instagramFollowers)} followers
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Niche</dt>
                  <dd className="font-medium text-gray-900">{selected.niche}</dd>
                </div>
              </dl>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({ type: "accept", id: selected.id })
                  }
                  className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirm({ type: "reject", id: selected.id })
                  }
                  className="inline-flex min-h-9 flex-1 items-center justify-center rounded-full border border-black/15 px-4 text-sm font-medium text-gray-900 hover:border-black/30"
                >
                  Reject
                </button>
              </div>
            </aside>
          ) : null}
        </div>
      )}

      <p className="mt-10 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
        Active creators
      </p>
      <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
        {state.verifiedCreators.map((creator) => (
          <li
            key={creator.id}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="font-medium text-gray-900">{creator.displayName}</p>
              <p className="text-sm text-gray-600">{creator.handle}</p>
            </div>
            <p className="text-right text-sm text-gray-600">
              {creator.campaignsCompleted} campaign
              {creator.campaignsCompleted === 1 ? "" : "s"}
              <span className="mt-1 block text-gray-500">{creator.label}</span>
            </p>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.type === "accept" ? "Accept creator?" : "Reject application?"}
        description={
          confirm?.type === "accept"
            ? "They will appear in the active roster and can be assigned to campaigns."
            : "This removes the application from the pending queue."
        }
        confirmLabel={confirm?.type === "accept" ? "Accept" : "Reject"}
        destructive={confirm?.type === "reject"}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
