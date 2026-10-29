"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  Meta,
  PageIntro,
  Tag,
} from "@/components/workspace/primitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field, inputClassName, inputErrorClassName } from "@/components/shared/formField";
import { routes } from "@/config/routes";
import {
  applicationForCampaign,
  useCreatorStore,
} from "@/features/creator/store";
import { formatRwf } from "@/lib/format/money";

export function CreatorCampaignDetail({ campaignId }: { campaignId: string }) {
  const { state, applyToCampaign } = useCreatorStore();
  const campaign = state.discover.find((c) => c.id === campaignId);
  const application = campaign
    ? applicationForCampaign(state, campaign.id)
    : undefined;
  const [pitch, setPitch] = useState("");
  const [pitchError, setPitchError] = useState("");
  const [confirmApply, setConfirmApply] = useState(false);

  if (!campaign) {
    return (
      <>
        <PageIntro title="Campaign not found" />
        <Link href={routes.creator.campaigns} className="text-xs text-[#3266ad]">
          Back to discover
        </Link>
      </>
    );
  }

  const payoutLine = campaign.rpmRwf
    ? `${formatRwf(campaign.rpmRwf)} per 1,000 views (RPM)`
    : campaign.flatPayoutRwf
      ? `${formatRwf(campaign.flatPayoutRwf)} flat fee`
      : "—";

  const onApply = () => {
    if (!pitch.trim()) {
      setPitchError("Add a one-line pitch (why you’re a fit).");
      return;
    }
    setPitchError("");
    setConfirmApply(true);
  };

  return (
    <>
      <PageIntro
        title={campaign.title}
        subtitle={`${campaign.brandName} · ${campaign.campaignType}`}
      />
      <Card>
        <Meta>
          <strong>Payout:</strong> {payoutLine}
          <br />
          <strong>Deadline:</strong> {campaign.deadline}
          <br />
          <strong>Spots:</strong>{" "}
          {campaign.open ? `${campaign.spotsLeft} remaining` : "Closed to new creators"}
        </Meta>
      </Card>
      <Card>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#73726c]">
          Brief
        </p>
        <p className="whitespace-pre-line text-xs leading-relaxed text-[#3d3d3a]">
          {campaign.brief}
        </p>
      </Card>

      {application ? (
        <Card>
          <Tag tone="blue">Application {application.status}</Tag>
          <p className="mt-2 text-xs leading-relaxed text-[#3d3d3a]">
            Submitted {new Date(application.appliedAt).toLocaleDateString()}.
            {application.pitch ? (
              <>
                <br />
                <strong className="font-medium text-[#141413]">Pitch:</strong>{" "}
                {application.pitch}
              </>
            ) : null}
          </p>
        </Card>
      ) : campaign.open ? (
        <Card>
          <Field id="pitch" label="Your pitch" error={pitchError}>
            <textarea
              id="pitch"
              rows={3}
              className={pitchError ? inputErrorClassName : inputClassName}
              placeholder="Why your audience fits this brief…"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
            />
          </Field>
          <button
            type="button"
            onClick={onApply}
            className="mt-3 rounded-lg bg-[#141413] px-4 py-2 text-xs font-medium text-white"
          >
            Apply to campaign
          </button>
        </Card>
      ) : (
        <Card>
          <Meta>This campaign is assigned-only. Check My tasks if you&apos;re on the roster.</Meta>
        </Card>
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
    </>
  );
}
