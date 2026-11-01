"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorWorkspacePageShell } from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  CreatorStatusPill,
  creatorFieldClass,
  creatorFieldErrorClass,
  creatorInlineLink,
  creatorPrimaryButton,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/shared/formField";
import { routes } from "@/config/routes";
import { applicationForCampaign, useCreatorStore } from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

export function CreatorCampaignDetail({ campaignId }: { campaignId: string }) {
  const { state, applyToCampaign } = useCreatorStore();
  const campaign = state.discover.find((c) => c.id === campaignId);
  const application = campaign ? applicationForCampaign(state, campaign.id) : undefined;
  const [pitch, setPitch] = useState("");
  const [pitchError, setPitchError] = useState("");
  const [confirmApply, setConfirmApply] = useState(false);

  if (!campaign) {
    return (
      <CreatorWorkspacePageShell eyebrow="Discover" title="Campaign not found">
        <Link href={routes.creator.campaigns} className={`text-sm ${creatorInlineLink}`}>
          Back to discover
        </Link>
      </CreatorWorkspacePageShell>
    );
  }

  const payoutLine = campaign.rpmRwf
    ? `${formatRwf(campaign.rpmRwf)} per 1,000 views (RPM)`
    : campaign.flatPayoutRwf
      ? `${formatRwf(campaign.flatPayoutRwf)} flat fee`
      : "—";

  const onApply = () => {
    if (!pitch.trim()) {
      setPitchError("Add a one-line pitch (why you're a fit).");
      return;
    }
    setPitchError("");
    setConfirmApply(true);
  };

  return (
    <CreatorWorkspacePageShell
      eyebrow="Brief"
      title={campaign.title}
      subtitle={`${campaign.brandName} · ${campaign.campaignType}`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Payout", value: payoutLine },
          { label: "Deadline", value: campaign.deadline },
          {
            label: "Spots",
            value: campaign.open ? `${campaign.spotsLeft} remaining` : "Closed",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-4"
          >
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              {item.label}
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-black/10 bg-white px-4 py-5 sm:px-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Creative direction
        </p>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-700">
          {campaign.brief}
        </p>
      </div>

      {application ? (
        <div className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-5 sm:px-5">
          <CreatorStatusPill label={`Application ${application.status}`} variant="outline" />
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            Submitted {new Date(application.appliedAt).toLocaleDateString()}.
            {application.pitch ? (
              <>
                {" "}
                <span className="font-medium text-neutral-900">Pitch:</span> {application.pitch}
              </>
            ) : null}
          </p>
        </div>
      ) : campaign.open ? (
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-5 sm:px-5">
          <Field id="pitch" label="Your pitch" error={pitchError}>
            <textarea
              id="pitch"
              rows={4}
              className={pitchError ? creatorFieldErrorClass : creatorFieldClass}
              placeholder="Why your audience fits this brief…"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
            />
          </Field>
          <button type="button" onClick={onApply} className={`mt-4 ${creatorPrimaryButton}`}>
            Apply to campaign
          </button>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-black/15 px-4 py-6 text-sm text-neutral-600">
          This campaign is assigned-only. Check My tasks if you&apos;re on the roster.
        </p>
      )}

      <ConfirmDialog
        open={confirmApply}
        title="Submit application?"
        description={`We'll send ${campaign.brandName} your handles and pitch for review.`}
        confirmLabel="Apply"
        onConfirm={() => {
          applyToCampaign(campaign.id, pitch);
          setConfirmApply(false);
        }}
        onCancel={() => setConfirmApply(false)}
      />
    </CreatorWorkspacePageShell>
  );
}
