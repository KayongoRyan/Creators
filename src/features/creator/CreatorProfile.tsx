"use client";

import { useState } from "react";
import { CreatorWorkspacePageShell } from "@/components/workspace/creator/CreatorWorkspacePageShell";
import {
  creatorFieldClass,
  creatorPrimaryButton,
} from "@/components/workspace/creator/creatorWorkspaceUi";
import { Field } from "@/components/shared/formField";
import { useCreatorStore } from "@/features/creator/store";

export function CreatorProfile() {
  const { state, updateProfile } = useCreatorStore();
  const [saved, setSaved] = useState(false);

  return (
    <CreatorWorkspacePageShell
      eyebrow="Profile"
      title="My profile"
      subtitle="What brands see when you apply"
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
      >
        <Field id="displayName" label="Display name">
          <input
            id="displayName"
            className={creatorFieldClass}
            value={state.profile.displayName}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
          />
        </Field>
        <Field id="tiktok" label="TikTok handle">
          <input
            id="tiktok"
            className={creatorFieldClass}
            value={state.profile.tiktokHandle}
            onChange={(e) => updateProfile({ tiktokHandle: e.target.value })}
          />
        </Field>
        <Field id="instagram" label="Instagram handle">
          <input
            id="instagram"
            className={creatorFieldClass}
            value={state.profile.instagramHandle}
            onChange={(e) => updateProfile({ instagramHandle: e.target.value })}
          />
        </Field>
        <Field id="niche" label="Niche">
          <input
            id="niche"
            className={creatorFieldClass}
            value={state.profile.niche}
            onChange={(e) => updateProfile({ niche: e.target.value })}
          />
        </Field>
        <Field id="momo" label="MoMo number">
          <input
            id="momo"
            className={creatorFieldClass}
            value={state.profile.momo}
            onChange={(e) => updateProfile({ momo: e.target.value })}
          />
        </Field>

        <div className="rounded-2xl border border-black/10 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          <span className="font-medium text-neutral-900">Status:</span> {state.profile.label} ·{" "}
          {state.profile.campaignsCompleted} campaigns completed
        </div>

        <button type="submit" className={creatorPrimaryButton}>
          {saved ? "Saved" : "Save profile"}
        </button>
      </form>
    </CreatorWorkspacePageShell>
  );
}
